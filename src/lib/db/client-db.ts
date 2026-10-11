import Dexie, { Table } from 'dexie';
import { PatientCaseSnapshot, SyncPayload } from '@/lib/types/schema';
import { 
  encryptLocalPayload, 
  decryptLocalPayload, 
  encryptQueuePayload, 
  decryptQueuePayload, 
  clearActiveSessionCryptoKey 
} from '@/lib/security/crypto';

export interface LocalCaseRecord {
  caseId: string;
  revision: number;
  idempotencyKey: string;
  status: string;
  lastLocalEditAt: string;
  lastPatientConfirmedAt: string;
  createdAt: string;
  requiresReconfirmation: boolean;
  ciphertext: string;
  iv: string;
}

export interface PendingQueueItem {
  idempotencyKey: string;
  caseId: string;
  revision: number;
  encryptedPayload: string; // Encrypted at rest via AES-GCM 256 DeviceQueueKey
  iv: string;
  retryCount: number;
  lastAttemptAt: string | null;
  status: 'pending' | 'in_flight' | 'failed' | 'synced';
  createdAt: string;
  errorMessage?: string;
}

export interface MediaBlobRecord {
  id: string;
  caseId: string;
  blobType: 'document' | 'audio';
  encryptedDataUrl: string; // Encrypted at rest
  iv: string;
  mimeType: string;
  createdAt: string;
}

export const FRESHNESS_POLICIES = {
  RECONFIRMATION_WINDOW_MS: 30 * 60 * 1000, // 30 minutes
  CACHE_EXPIRY_MS: 24 * 60 * 60 * 1000,      // 24 hours
};

export class MediKioskDatabase extends Dexie {
  cases!: Table<LocalCaseRecord, string>;
  pendingSyncQueue!: Table<PendingQueueItem, string>;
  mediaBlobs!: Table<MediaBlobRecord, string>;

  constructor() {
    super('MediKioskLocalDB');
    this.version(2).stores({
      cases: 'caseId, revision, idempotencyKey, status, lastLocalEditAt, lastPatientConfirmedAt, createdAt',
      pendingSyncQueue: 'idempotencyKey, caseId, revision, status, createdAt',
      mediaBlobs: 'id, caseId, blobType, createdAt',
    });
  }
}

export const db = new MediKioskDatabase();

const ACTIVE_CASE_KEY = 'medikiosk_active_case_id';

export function getActiveCaseId(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(ACTIVE_CASE_KEY);
}

export function setActiveCaseId(caseId: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(ACTIVE_CASE_KEY, caseId);
  }
}

/**
 * Safe shared-kiosk session completion:
 * - Wipes active case ID from sessionStorage so next patient cannot resume or see previous draft.
 * - Destroys active session crypto key in sessionStorage.
 * - Leaves pendingSyncQueue intact (encrypted at rest with DeviceQueueKey) so background sync can drain.
 */
export async function clearActiveSession(): Promise<void> {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(ACTIVE_CASE_KEY);
    clearActiveSessionCryptoKey();
  }
}

/**
 * Saves patient case in client IndexedDB with Web Crypto encryption (SessionKey).
 * Enforces 30-minute reconfirmation policy.
 */
export async function saveLocalCase(snapshot: PatientCaseSnapshot): Promise<void> {
  const now = Date.now();
  const confirmedAt = new Date(snapshot.lastPatientConfirmedAt).getTime();
  const isStale = snapshot.status === 'completed_locally' && (now - confirmedAt > FRESHNESS_POLICIES.RECONFIRMATION_WINDOW_MS);

  const snapshotToSave: PatientCaseSnapshot = {
    ...snapshot,
    requiresReconfirmation: isStale || snapshot.requiresReconfirmation,
  };

  const { ciphertext, iv } = await encryptLocalPayload(snapshotToSave);

  const record: LocalCaseRecord = {
    caseId: snapshot.caseId,
    revision: snapshot.revision,
    idempotencyKey: snapshot.idempotencyKey,
    status: snapshot.status,
    lastLocalEditAt: snapshot.lastLocalEditAt,
    lastPatientConfirmedAt: snapshot.lastPatientConfirmedAt,
    createdAt: snapshot.createdAt,
    requiresReconfirmation: snapshotToSave.requiresReconfirmation,
    ciphertext,
    iv,
  };

  await db.cases.put(record);
  setActiveCaseId(snapshot.caseId);
}

export async function getLocalCase(caseId: string): Promise<PatientCaseSnapshot | null> {
  const record = await db.cases.get(caseId);
  if (!record) return null;

  // Check 24-hour cache expiry
  const age = Date.now() - new Date(record.createdAt).getTime();
  if (age > FRESHNESS_POLICIES.CACHE_EXPIRY_MS) {
    await db.cases.delete(caseId);
    return null;
  }

  const snapshot = await decryptLocalPayload<PatientCaseSnapshot>(record.ciphertext, record.iv);

  // Check 30-minute reconfirmation policy
  const confirmedAge = Date.now() - new Date(snapshot.lastPatientConfirmedAt).getTime();
  if (snapshot.status === 'completed_locally' && confirmedAge > FRESHNESS_POLICIES.RECONFIRMATION_WINDOW_MS) {
    snapshot.requiresReconfirmation = true;
  }

  return snapshot;
}

/**
 * Enqueues intake payload encrypted at rest using DeviceQueueKey
 */
export async function enqueueSync(payload: SyncPayload): Promise<void> {
  const { ciphertext, iv } = await encryptQueuePayload(payload);

  const queueItem: PendingQueueItem = {
    idempotencyKey: payload.idempotencyKey,
    caseId: payload.caseId,
    revision: payload.revision,
    encryptedPayload: ciphertext,
    iv,
    retryCount: 0,
    lastAttemptAt: null,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  await db.pendingSyncQueue.put(queueItem);
}

export async function getPendingQueue(): Promise<PendingQueueItem[]> {
  return await db.pendingSyncQueue
    .where('status')
    .anyOf(['pending', 'failed'])
    .sortBy('createdAt');
}

/**
 * Decrypts a queued item payload for transmission
 */
export async function getDecryptedQueuePayload(item: PendingQueueItem): Promise<SyncPayload> {
  return await decryptQueuePayload<SyncPayload>(item.encryptedPayload, item.iv);
}

export async function markQueueItemInFlight(idempotencyKey: string): Promise<void> {
  await db.pendingSyncQueue.update(idempotencyKey, {
    status: 'in_flight',
    lastAttemptAt: new Date().toISOString(),
  });
}

export async function markQueueItemSynced(idempotencyKey: string): Promise<void> {
  await db.pendingSyncQueue.update(idempotencyKey, {
    status: 'synced',
    lastAttemptAt: new Date().toISOString(),
  });
}

export async function markQueueItemFailed(idempotencyKey: string, error: string): Promise<void> {
  const item = await db.pendingSyncQueue.get(idempotencyKey);
  const currentRetries = item ? item.retryCount + 1 : 1;

  await db.pendingSyncQueue.update(idempotencyKey, {
    status: 'failed',
    retryCount: currentRetries,
    lastAttemptAt: new Date().toISOString(),
    errorMessage: error,
  });
}

export async function purgeExpiredLocalData(): Promise<number> {
  const cutoff = Date.now() - FRESHNESS_POLICIES.CACHE_EXPIRY_MS;
  const expired = await db.cases
    .filter(c => new Date(c.createdAt).getTime() < cutoff)
    .toArray();

  const ids = expired.map(e => e.caseId);
  await db.cases.bulkDelete(ids);
  return ids.length;
}