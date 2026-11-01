import { openDB, IDBPDatabase } from 'idb';
import { CrdtWalRecord } from '../../types';

const DB_NAME = 'CampusNotify_Editor_CRDT_DB';
const STORE_NAME = 'wal_keystrokes';
const DB_VERSION = 1;

class CrdtWalManager {
  private dbPromise: Promise<IDBPDatabase> | null = null;
  private debounceTimer: any = null;
  private debounceDelayMs: number = 100; // 100ms debounce buffer per specification

  constructor() {
    this.initDb();
  }

  private initDb() {
    if (typeof window === 'undefined') return;
    this.dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'practicalId' });
          store.createIndex('by_student', 'studentId');
          store.createIndex('by_timestamp', 'timestamp');
        }
      },
    });
  }

  // Quick SHA-256 checksum for integrity check
  private async calculateChecksum(text: string): Promise<string> {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(text);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    // Fallback simple fast hash
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }
    return hash.toString(16);
  }

  public recordKeystroke(
    record: Omit<CrdtWalRecord, 'checksum' | 'timestamp'>,
    onSynced?: (record: CrdtWalRecord) => void
  ) {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(async () => {
      let checksum = '';
      try {
        checksum = await this.calculateChecksum(record.content);
      } catch (err) {
        console.warn('[CrdtWalManager] Checksum calculation warning:', err);
      }

      const walRecord: CrdtWalRecord = {
        ...record,
        timestamp: Date.now(),
        checksum,
      };

      // 1. Primary IndexedDB write in isolated try/catch
      try {
        if (this.dbPromise) {
          const db = await this.dbPromise;
          await db.put(STORE_NAME, walRecord);
        }
      } catch (err) {
        console.warn('[CrdtWalManager] IndexedDB write failed (quota/transaction error):', err);
      }

      // 2. Decoupled localStorage backup mirror in independent try/catch
      try {
        localStorage.setItem(
          `cnms_wal_${record.practicalId}`,
          JSON.stringify(walRecord)
        );
      } catch (err) {
        console.warn('[CrdtWalManager] localStorage mirror write failed:', err);
      }

      if (onSynced) {
        onSynced(walRecord);
      }
    }, this.debounceDelayMs);
  }

  public async restoreFromWal(practicalId: string): Promise<CrdtWalRecord | null> {
    // 1. Primary restore from IndexedDB
    try {
      if (this.dbPromise) {
        const db = await this.dbPromise;
        const record = await db.get(STORE_NAME, practicalId);
        if (record) return record;
      }
    } catch (err) {
      console.warn('[CrdtWalManager] IndexedDB restore failed, falling back to localStorage mirror:', err);
    }

    // 2. Decoupled fallback restore from localStorage mirror
    try {
      const raw = localStorage.getItem(`cnms_wal_${practicalId}`);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('[CrdtWalManager] localStorage fallback restore failed:', err);
    }

    return null;
  }

  public async clearWal(practicalId: string): Promise<void> {
    try {
      if (this.dbPromise) {
        const db = await this.dbPromise;
        await db.delete(STORE_NAME, practicalId);
      }
    } catch (err) {
      console.warn('[CrdtWalManager] IndexedDB clear failed:', err);
    }

    try {
      localStorage.removeItem(`cnms_wal_${practicalId}`);
    } catch (err) {
      console.warn('[CrdtWalManager] localStorage clear failed:', err);
    }
  }
}

export const crdtWalManager = new CrdtWalManager();
export default crdtWalManager;
