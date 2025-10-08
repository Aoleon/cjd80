/**
 * Offline Queue System using IndexedDB
 * Stores user actions when offline for later synchronization
 */

export type ActionType = 'VOTE_IDEA' | 'SUBSCRIBE_EVENT' | 'UNSUBSCRIBE_EVENT' | 'COMMENT';
export type ActionStatus = 'pending' | 'syncing' | 'failed';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface QueueAction {
  id?: string;
  type: ActionType;
  endpoint: string;
  method: HttpMethod;
  data?: any;
  timestamp: number;
  status: ActionStatus;
  retryCount: number;
}

const DB_NAME = 'cjd-offline-queue';
const DB_VERSION = 1;
const STORE_NAME = 'actions';

/**
 * OfflineQueue class - Singleton pattern
 * Manages offline actions using IndexedDB
 */
export class OfflineQueue {
  private static instance: OfflineQueue | null = null;
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance of OfflineQueue
   */
  public static getInstance(): OfflineQueue {
    if (!OfflineQueue.instance) {
      OfflineQueue.instance = new OfflineQueue();
    }
    return OfflineQueue.instance;
  }

  /**
   * Initialize IndexedDB
   * Creates database and object store with indexes
   */
  public async init(): Promise<void> {
    // Return existing initialization if in progress
    if (this.initPromise) {
      return this.initPromise;
    }

    // Return immediately if already initialized
    if (this.db) {
      return Promise.resolve();
    }

    this.initPromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        const error = new Error('IndexedDB not supported in this browser');
        console.error('[OfflineQueue]', error.message);
        reject(error);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        const error = new Error(`Failed to open IndexedDB: ${request.error?.message}`);
        console.error('[OfflineQueue]', error);
        reject(error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[OfflineQueue] Database initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: false
          });

          // Create indexes for efficient querying
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
          objectStore.createIndex('status', 'status', { unique: false });
          objectStore.createIndex('type', 'type', { unique: false });

          console.log('[OfflineQueue] Object store and indexes created');
        }
      };
    });

    await this.initPromise;
    this.initPromise = null;
  }

  /**
   * Generate unique ID for action
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Ensure database is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.db) {
      await this.init();
    }
  }

  /**
   * Add action to the queue
   */
  public async addAction(action: Omit<QueueAction, 'id' | 'timestamp' | 'status' | 'retryCount'>): Promise<string> {
    await this.ensureInitialized();

    const queueAction: QueueAction = {
      ...action,
      id: this.generateId(),
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0
    };

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(queueAction);

      request.onsuccess = () => {
        console.log('[OfflineQueue] Action added:', queueAction.type, queueAction.id);
        resolve(queueAction.id!);
      };

      request.onerror = () => {
        const error = new Error(`Failed to add action: ${request.error?.message}`);
        console.error('[OfflineQueue]', error);
        reject(error);
      };
    });
  }

  /**
   * Get all actions from the queue
   */
  public async getAll(): Promise<QueueAction[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const actions = request.result as QueueAction[];
        console.log('[OfflineQueue] Retrieved actions:', actions.length);
        resolve(actions);
      };

      request.onerror = () => {
        const error = new Error(`Failed to get actions: ${request.error?.message}`);
        console.error('[OfflineQueue]', error);
        reject(error);
      };
    });
  }

  /**
   * Get actions by status
   */
  public async getByStatus(status: ActionStatus): Promise<QueueAction[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('status');
      const request = index.getAll(status);

      request.onsuccess = () => {
        resolve(request.result as QueueAction[]);
      };

      request.onerror = () => {
        const error = new Error(`Failed to get actions by status: ${request.error?.message}`);
        console.error('[OfflineQueue]', error);
        reject(error);
      };
    });
  }

  /**
   * Remove action from the queue
   */
  public async remove(id: string): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('[OfflineQueue] Action removed:', id);
        resolve();
      };

      request.onerror = () => {
        const error = new Error(`Failed to remove action: ${request.error?.message}`);
        console.error('[OfflineQueue]', error);
        reject(error);
      };
    });
  }

  /**
   * Clear all actions from the queue
   */
  public async clear(): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('[OfflineQueue] All actions cleared');
        resolve();
      };

      request.onerror = () => {
        const error = new Error(`Failed to clear actions: ${request.error?.message}`);
        console.error('[OfflineQueue]', error);
        reject(error);
      };
    });
  }

  /**
   * Get count of actions in the queue
   */
  public async getCount(): Promise<number> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.count();

      request.onsuccess = () => {
        console.log('[OfflineQueue] Action count:', request.result);
        resolve(request.result);
      };

      request.onerror = () => {
        const error = new Error(`Failed to get count: ${request.error?.message}`);
        console.error('[OfflineQueue]', error);
        reject(error);
      };
    });
  }

  /**
   * Mark action as syncing
   */
  public async markAsSyncing(id: string): Promise<void> {
    await this.updateActionStatus(id, 'syncing');
  }

  /**
   * Mark action as failed and increment retry count
   */
  public async markAsFailed(id: string): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const action = getRequest.result as QueueAction;
        if (!action) {
          reject(new Error(`Action not found: ${id}`));
          return;
        }

        action.status = 'failed';
        action.retryCount += 1;

        const updateRequest = store.put(action);

        updateRequest.onsuccess = () => {
          console.log('[OfflineQueue] Action marked as failed:', id, `(retry ${action.retryCount})`);
          resolve();
        };

        updateRequest.onerror = () => {
          const error = new Error(`Failed to update action: ${updateRequest.error?.message}`);
          console.error('[OfflineQueue]', error);
          reject(error);
        };
      };

      getRequest.onerror = () => {
        const error = new Error(`Failed to get action: ${getRequest.error?.message}`);
        console.error('[OfflineQueue]', error);
        reject(error);
      };
    });
  }

  /**
   * Update action status with optional retry count
   * Public method for external use (e.g., sync service)
   */
  public async updateStatus(id: string, status: ActionStatus, retryCount?: number): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const action = getRequest.result as QueueAction;
        if (!action) {
          reject(new Error(`Action not found: ${id}`));
          return;
        }

        action.status = status;
        if (retryCount !== undefined) {
          action.retryCount = retryCount;
        }

        const updateRequest = store.put(action);

        updateRequest.onsuccess = () => {
          console.log('[OfflineQueue] Action status updated:', id, status, retryCount !== undefined ? `(retry ${retryCount})` : '');
          resolve();
        };

        updateRequest.onerror = () => {
          const error = new Error(`Failed to update action: ${updateRequest.error?.message}`);
          console.error('[OfflineQueue]', error);
          reject(error);
        };
      };

      getRequest.onerror = () => {
        const error = new Error(`Failed to get action: ${getRequest.error?.message}`);
        console.error('[OfflineQueue]', error);
        reject(error);
      };
    });
  }

  /**
   * Update action status
   */
  private async updateActionStatus(id: string, status: ActionStatus): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const action = getRequest.result as QueueAction;
        if (!action) {
          reject(new Error(`Action not found: ${id}`));
          return;
        }

        action.status = status;

        const updateRequest = store.put(action);

        updateRequest.onsuccess = () => {
          console.log('[OfflineQueue] Action status updated:', id, status);
          resolve();
        };

        updateRequest.onerror = () => {
          const error = new Error(`Failed to update action: ${updateRequest.error?.message}`);
          console.error('[OfflineQueue]', error);
          reject(error);
        };
      };

      getRequest.onerror = () => {
        const error = new Error(`Failed to get action: ${getRequest.error?.message}`);
        console.error('[OfflineQueue]', error);
        reject(error);
      };
    });
  }

  /**
   * Get action by ID
   */
  public async getById(id: string): Promise<QueueAction | null> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        const error = new Error(`Failed to get action: ${request.error?.message}`);
        console.error('[OfflineQueue]', error);
        reject(error);
      };
    });
  }

  /**
   * Close database connection
   */
  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('[OfflineQueue] Database connection closed');
    }
  }
}

// Export singleton instance for easy access
export const offlineQueue = OfflineQueue.getInstance();
