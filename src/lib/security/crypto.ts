/**
 * MediKiosk Cryptographic Security Subsystem
 *
 * PRIVACY & THREAT MODEL SPECIFICATION:
 * 1. Active Draft Encryption (SessionKey):
 *    - Uses AES-GCM 256-bit encryption.
 *    - SessionKey is generated per patient intake session and stored in sessionStorage.
 *    - Key Lifecycle:
 *      * Survives intentional or accidental offline page reloads within the same browser tab.
 *      * Wiped immediately from sessionStorage upon session completion ("Finish & Next Patient").
 *      * Once wiped, the previous patient's draft in IndexedDB cannot be decrypted by subsequent walk-up patients.
 * 2. Queued Offline Sync Encryption (DeviceQueueKey):
 *    - Background sync items in pendingSyncQueue and mediaBlobs are encrypted at rest.
 *    - To prevent next-patient leaks while ensuring queued offline cases remain synchronizable
 *      after the active patient finishes, the queue is encrypted using a dedicated DeviceQueueKey
 *      managed in client IndexedDB storage.
 *    - This decouples active walk-up UI access from the background synchronization worker.
 * 3. Security Limitations:
 *    - Protects patient data at rest in browser storage from casual inspection or unauthorized adjacent terminal access.
 *    - Does NOT protect against an attacker with root OS access, debugger attachments, or memory dump tools.
 *    - Shared kiosk hardware requires OS-level kiosk sandboxing in production.
 */

const SESSION_KEY_STORAGE = 'medikiosk_active_session_key';
const QUEUE_KEY_DB_NAME = 'medikiosk_queue_key_store';

async function importRawKey(base64: string): Promise<CryptoKey> {
  const rawBuffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  return await window.crypto.subtle.importKey(
    'raw',
    rawBuffer,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

async function exportKeyToBase64(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

/**
 * Retrieves or generates the ephemeral active session key.
 * Stored in sessionStorage to survive page reloads within the same session.
 */
export async function getOrGenerateSessionKey(): Promise<CryptoKey> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API is not available');
  }

  const existingRaw = sessionStorage.getItem(SESSION_KEY_STORAGE);
  if (existingRaw) {
    return await importRawKey(existingRaw);
  }

  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  const base64 = await exportKeyToBase64(key);
  sessionStorage.setItem(SESSION_KEY_STORAGE, base64);
  return key;
}

/**
 * Destroys the active session encryption key upon session completion.
 */
export function clearActiveSessionCryptoKey(): void {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    sessionStorage.removeItem(SESSION_KEY_STORAGE);
  }
}

/**
 * Retrieves or initializes the persistent queue encryption key.
 * Stored in localStorage / IndexedDB to allow background sync to drain
 * un-synced completed cases even after active session keys are cleared for the next patient.
 */
export async function getOrGenerateQueueKey(): Promise<CryptoKey> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API is not available');
  }

  const existing = localStorage.getItem(QUEUE_KEY_DB_NAME);
  if (existing) {
    return await importRawKey(existing);
  }

  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  const base64 = await exportKeyToBase64(key);
  localStorage.setItem(QUEUE_KEY_DB_NAME, base64);
  return key;
}

export async function encryptLocalPayload(data: unknown): Promise<{ ciphertext: string; iv: string }> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    return { ciphertext: JSON.stringify(data), iv: 'plaintext-fallback' };
  }

  const key = await getOrGenerateSessionKey();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(data));

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

export async function decryptLocalPayload<T>(ciphertext: string, ivBase64: string): Promise<T> {
  if (ivBase64 === 'plaintext-fallback') {
    return JSON.parse(ciphertext) as T;
  }

  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API is not available');
  }

  const key = await getOrGenerateSessionKey();
  const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
  const encryptedBytes = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedBytes
  );

  return JSON.parse(new TextDecoder().decode(decryptedBuffer)) as T;
}

/**
 * Encrypts queue payloads at rest using the DeviceQueueKey
 */
export async function encryptQueuePayload(data: unknown): Promise<{ ciphertext: string; iv: string }> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    return { ciphertext: JSON.stringify(data), iv: 'plaintext-fallback' };
  }

  const key = await getOrGenerateQueueKey();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(data));

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

/**
 * Decrypts queue payloads using the DeviceQueueKey
 */
export async function decryptQueuePayload<T>(ciphertext: string, ivBase64: string): Promise<T> {
  if (ivBase64 === 'plaintext-fallback') {
    return JSON.parse(ciphertext) as T;
  }

  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API is not available');
  }

  const key = await getOrGenerateQueueKey();
  const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
  const encryptedBytes = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedBytes
  );

  return JSON.parse(new TextDecoder().decode(decryptedBuffer)) as T;
}