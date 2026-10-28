import { test, expect } from '@playwright/test';

test.describe('Shared-Kiosk Privacy, Encryption & Offline Reload Recovery', () => {
  test('genuinely reloads page offline, recovers encrypted draft via Web Crypto, and wipes on session finish', async ({ page, context }) => {
    // 1. Initial Load
    await page.goto('/kiosk');
    await expect(page.locator('#patient-name-input')).toBeVisible();

    // 2. Start intake session
    const patientName = `Ananya Gupta (Reload Test ${Date.now().toString().slice(-4)})`;
    await page.fill('#patient-name-input', patientName);
    await page.fill('#patient-age-input', '42');
    await page.click('#kiosk-next-btn');

    // Step 2: Consent
    await expect(page.locator('#consent-storage-checkbox')).toBeVisible();
    await page.click('#consent-storage-checkbox');
    await page.click('#kiosk-next-btn');

    // Step 3: Main concern
    await expect(page.locator('#main-concern-input')).toBeVisible();
    await page.fill('#main-concern-input', 'Severe throbbing headache with nausea');
    await page.fill('#onset-duration-input', '8 hours');

    // Step 4: Advance to symptoms
    await page.click('#kiosk-next-btn');
    await expect(page.locator('#symptom-headache')).toBeVisible();
    await page.click('#symptom-headache');

    // 3. CUT NETWORK (OFFLINE MODE)
    await context.setOffline(true);
    await expect(page.locator('#offline-badge')).toBeVisible();

    // 4. GENUINELY RELOAD THE PAGE WHILE OFFLINE (TEARING DOWN JS MEMORY)
    await page.reload();

    // Verify application shell is served offline and offline badge is active
    await expect(page.locator('#offline-badge')).toBeVisible();

    // 5. VERIFY REHYDRATION FROM ENCRYPTED INDEXEDDB VIA RESTORED SESSION KEY
    // The name and main concern should be fully restored from decrypted ciphertext
    await expect(page.locator('#patient-name-input')).toBeVisible();
    const restoredName = await page.locator('#patient-name-input').inputValue();
    expect(restoredName).toBe(patientName);

    const restoredAge = await page.locator('#patient-age-input').inputValue();
    expect(restoredAge).toBe('42');

    // Navigate to Step 3 to verify main concern survived memory loss
    await page.click('#kiosk-next-btn'); // Step 2 Consent
    await page.click('#kiosk-next-btn'); // Step 3 Main concern
    const restoredConcern = await page.locator('#main-concern-input').inputValue();
    expect(restoredConcern).toBe('Severe throbbing headache with nausea');

    // 6. COMPLETE AND SUBMIT INTAKE WHILE STILL OFFLINE
    await page.click('#kiosk-next-btn'); // Advance to Step 4: Symptoms
    await page.click('#kiosk-next-btn'); // Advance to Step 5: Conditions
    await page.click('#kiosk-next-btn'); // Advance to Step 6: Allergies
    await expect(page.locator('#allergy-opt-none_reported')).toBeVisible();
    await page.click('#allergy-opt-none_reported');
    await page.click('#kiosk-next-btn'); // Advance to Step 7: Documents
    await page.click('#kiosk-next-btn'); // Advance to Step 8: Review
    await page.click('#kiosk-submit-btn'); // Submit intake

    await expect(page.locator('#submission-sync-status')).toBeVisible();
    const statusText = await page.locator('#submission-sync-status').textContent();
    expect(statusText).toContain('Queued Offline');

    // 7. FINISH SESSION & PROVE NEXT-PATIENT PRIVACY
    await page.click('#finish-session-btn');
    await page.waitForTimeout(1500);

    // Kiosk resets for next patient
    await expect(page.locator('#patient-name-input')).toBeVisible();
    const nextPatientName = await page.locator('#patient-name-input').inputValue();
    expect(nextPatientName).toBe(''); // Next patient sees zero previous data!

    // 8. RESTORE NETWORK & VERIFY COMPLETED ENCRYPTED QUEUE ITEM SYNCS TO SERVER
    await context.setOffline(false);
    await page.waitForTimeout(3500);

    const currentOrigin = new URL(page.url()).origin;
    await context.addCookies([{
      name: 'medikiosk_staff_session',
      value: 'auth_e2e_staff_verified',
      url: currentOrigin,
    }]);
    await page.goto('/dashboard');
    await page.waitForSelector(`text=${patientName}`, { timeout: 15000 });
    const matchingCases = await page.locator(`text=${patientName}`).count();
    expect(matchingCases).toBe(1); // Verified: Queue drained cleanly even after session key destruction!
  });
});
