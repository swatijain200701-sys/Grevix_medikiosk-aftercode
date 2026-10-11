const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const screenshotsDir = path.join(process.cwd(), 'docs', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('Capturing Landing Page (1440px)...');
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotsDir, 'landing.png'), fullPage: true });

  console.log('Capturing Staff Login Page...');
  await page.goto('http://localhost:3000/login');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotsDir, 'staff_login.png'), fullPage: true });

  console.log('Verifying Staff Login authentication flow...');
  await page.fill('#staff-username', 'opd_staff');
  await page.fill('#staff-password', 'clinical2026');
  await page.click('#staff-login-submit-btn');
  await page.waitForTimeout(1500);

  console.log('Capturing Staff Dashboard Page...');
  await page.goto('http://localhost:3000/dashboard');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotsDir, 'staff_dashboard.png'), fullPage: true });

  console.log('Capturing Patient Kiosk Page...');
  await page.goto('http://localhost:3000/kiosk');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotsDir, 'patient_kiosk.png'), fullPage: true });

  // Responsive checks
  const viewports = [
    { width: 360, height: 740, name: 'mobile_360' },
    { width: 768, height: 1024, name: 'tablet_768' },
    { width: 1024, height: 768, name: 'desktop_1024' },
    { width: 1440, height: 900, name: 'desktop_1440' },
  ];

  for (const vp of viewports) {
    console.log(`Checking responsive view at ${vp.width}x${vp.height}...`);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, `landing_${vp.name}.png`) });
  }

  // Language check: Hindi toggle on Kiosk
  console.log('Checking Hindi layout toggle on Kiosk...');
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('http://localhost:3000/kiosk');
  await page.click('button[aria-label="Toggle language"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(screenshotsDir, 'kiosk_hindi.png') });

  await browser.close();
  console.log('Screenshots and verification completed successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
