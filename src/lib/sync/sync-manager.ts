import { getPendingQueue, getDecryptedQueuePayload, markQueueItemInFlight, markQueueItemSynced, markQueueItemFailed } from '@/lib/db/client-db';
import { SyncPayload, SyncResponse, SyncResponseSchema } from '@/lib/types/schema';

export type SyncState = 'idle' | 'checking' | 'syncing' | 'synced' | 'offline' | 'error';

export interface SyncStats {
  lastSyncAttemptAt: string | null;
  lastSuccessfulSyncAt: string | null;
  isOnline: boolean;
  isServerReachable: boolean;
  pendingCount: number;
  lastError: string | null;
  reconnectLatencyMs: number | null;
}

type SyncListener = (state: SyncState, stats: SyncStats) => void;

class SyncManager {
  private isDraining = false;
  private listeners: Set<SyncListener> = new Set();
  private healthCheckInterval: any = null;
  private backoffDelayMs = 2000;
  private maxBackoffDelayMs = 30000;
  private disconnectStartTime: number | null = null;
  private reconnectStartTime: number | null = null;

  public stats: SyncStats = {
    lastSyncAttemptAt: null,
    lastSuccessfulSyncAt: null,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isServerReachable: true,
    pendingCount: 0,
    lastError: null,
    reconnectLatencyMs: null,
  };

  public currentState: SyncState = 'idle';

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkOnline());
      window.addEventListener('offline', () => this.handleNetworkOffline());
      window.addEventListener('focus', () => this.triggerSync('window_focus'));
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.triggerSync('visibility_visible');
        }
      });
      this.startHealthMonitoring();
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.currentState, { ...this.stats });
    return () => this.listeners.delete(listener);
  }

  private notify(state: SyncState): void {
    this.currentState = state;
    for (const listener of this.listeners) {
      listener(state, { ...this.stats });
    }
  }

  public handleNetworkOffline(): void {
    this.stats.isOnline = false;
    this.stats.isServerReachable = false;
    this.disconnectStartTime = Date.now();
    this.reconnectStartTime = null;
    this.notify('offline');
  }

  public async handleNetworkOnline(): Promise<void> {
    this.stats.isOnline = true;
    this.reconnectStartTime = Date.now();
    await this.triggerSync('network_online_event');
  }

  public async checkServerReachability(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch('/api/health', {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const reachable = res.ok;
      this.stats.isServerReachable = reachable;
      return reachable;
    } catch {
      this.stats.isServerReachable = false;
      return false;
    }
  }

  private startHealthMonitoring(): void {
    if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);
    this.healthCheckInterval = setInterval(async () => {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        const wasReachable = this.stats.isServerReachable;
        const reachable = await this.checkServerReachability();
        if (!wasReachable && reachable) {
          this.triggerSync('healthcheck_restored');
        }
      }
    }, 10000);
  }

  public async triggerSync(triggerReason: string = 'manual'): Promise<{ syncedCount: number; errors: number }> {
    if (this.isDraining) {
      return { syncedCount: 0, errors: 0 };
    }

    const pending = await getPendingQueue();
    this.stats.pendingCount = pending.length;

    if (pending.length === 0) {
      this.notify(this.stats.isServerReachable ? 'idle' : 'offline');
      return { syncedCount: 0, errors: 0 };
    }

    this.isDraining = true;
    this.notify('checking');

    const reachable = await this.checkServerReachability();
    if (!reachable) {
      this.isDraining = false;
      this.notify('offline');
      return { syncedCount: 0, errors: 1 };
    }

    this.notify('syncing');
    this.stats.lastSyncAttemptAt = new Date().toISOString();

    let syncedCount = 0;
    let errors = 0;

    for (const item of pending) {
      try {
        await markQueueItemInFlight(item.idempotencyKey);
        // Decrypt payload from encrypted rest state
        const payload: SyncPayload = await getDecryptedQueuePayload(item);

        const res = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error(`Server returned ${res.status}: ${res.statusText}`);
        }

        const data: SyncResponse = await res.json();
        SyncResponseSchema.parse(data);

        await markQueueItemSynced(item.idempotencyKey);
        syncedCount++;

        if (this.reconnectStartTime) {
          this.stats.reconnectLatencyMs = Date.now() - this.reconnectStartTime;
        }

        this.backoffDelayMs = 2000;
        this.stats.lastSuccessfulSyncAt = new Date().toISOString();
      } catch (err: any) {
        errors++;
        this.stats.lastError = err.message;
        await markQueueItemFailed(item.idempotencyKey, err.message);
        this.backoffDelayMs = Math.min(this.backoffDelayMs * 2, this.maxBackoffDelayMs);
      }
    }

    const remaining = await getPendingQueue();
    this.stats.pendingCount = remaining.length;
    this.isDraining = false;

    if (errors > 0 && remaining.length > 0) {
      this.notify('error');
    } else {
      this.notify('synced');
      setTimeout(() => {
        if (this.currentState === 'synced') {
          this.notify('idle');
        }
      }, 4000);
    }

    return { syncedCount, errors };
  }
}

export const syncManager = new SyncManager();