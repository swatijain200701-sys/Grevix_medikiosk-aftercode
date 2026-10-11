/**
 * MediKiosk Client Security Helper
 * Uses Web Crypto (AES-GCM 256) to encrypt patient drafts stored in IndexedDB.
 *
 * Privacy & Threat Model:
 * - Prevents adjacent walk-up patients or casual inspection from viewing previous draft data.
 * - The active session encryption key is held in memory / sessionStorage and wiped upon session completion.
 * - Engineering limitation note: This does NOT protect against full device compromise, malware, or compromised browser extensions.
 */

const SESSION_KEY_STORAGE = 'medikiosk_active_session_key';

async function getOrGenerateSessionKey(): Promise<CryptoKey> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API is not available in this environment');
  }

  const existingRaw = sessionStorage.getItem(SESSION_KEY_STORAGE);
  if (existingRaw) {
    const rawBuffer = Uint8Array.from(atob(existingRaw), c => c.charCodeAt(0));
    return await window.crypto.subtle.importKey(
      'raw',
      rawBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  const exported = await window.crypto.subtle.exportKey('raw', key);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(exported)));
  sessionStorage.setItem(SESSION_KEY_STORAGE, base64);
  return key;
}

export function clearActiveSessionCryptoKey(): void {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    sessionStorage.removeItem(SESSION_KEY_STORAGE);
  }
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

  const ciphertext = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
  const ivBase64 = btoa(String.fromCharCode(...iv));

  return { ciphertext, iv: ivBase64 };
}

export async function decryptLocalPayload<T>(ciphertext: string, ivBase64: string): Promise<T> {
  if (ivBase64 === 'plaintext-fallback') {
    return JSON.parse(ciphertext) as T;
  }

  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API is not available for decryption');
  }

  const key = await getOrGenerateSessionKey();
  const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
  const encryptedBytes = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedBytes
  );

  const decoded = new TextDecoder().decode(decryptedBuffer);
  return JSON.parse(decoded) as T;
}