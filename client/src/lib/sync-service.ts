/**
 * Sync Service - Automatic synchronization with Background Sync API
 * Handles offline actions and syncs them when connection is restored
 */

import { OfflineQueue, type QueueAction, type ActionType } from './offline-queue';

// Type declaration for Background Sync API (declaration merging)
declare global {
  interface SyncManager {
    register(tag: string): Promise<void>;
    getTags(): Promise<string[]>;
  }

  interface ServiceWorkerRegistration {
    readonly sync: SyncManager;
  }
}

const MAX_RETRY_COUNT = 3;

/**
 * Throw error if response is not ok
 * Local helper function to avoid circular dependency with queryClient
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Check if user is online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Determine action type based on endpoint and method
 * Maps API endpoints to offline action types for proper queue management
 */
function getActionType(endpoint: string, method: string): ActionType {
  // Vote endpoints
  if (endpoint.includes('/api/votes')) return 'VOTE_IDEA';
  
  // Event subscription endpoints
  if (endpoint.includes('/api/inscriptions')) return 'SUBSCRIBE_EVENT';
  if (endpoint.includes('/api/events') && endpoint.includes('/subscribe')) return 'SUBSCRIBE_EVENT';
  
  // Event unsubscription endpoints
  if (endpoint.includes('/api/unsubscriptions')) return 'UNSUBSCRIBE_EVENT';
  if (endpoint.includes('/api/events') && endpoint.includes('/unsubscribe')) return 'UNSUBSCRIBE_EVENT';
  
  // Comment endpoints (both /api/comments and nested like /api/ideas/*/comments)
  if (endpoint.includes('/comments')) return 'COMMENT';
  
  // Default to VOTE_IDEA for other mutations
  return 'VOTE_IDEA';
}

/**
 * Generate mocked response data based on action type
 * This ensures the UI receives data in the expected format when actions are queued offline
 */
function generateMockedData(actionType: ActionType, endpoint: string, requestData?: unknown): any {
  const timestamp = Date.now();
  const pendingId = `pending-${timestamp}`;
  
  switch (actionType) {
    case 'VOTE_IDEA':
      // Mocked vote response - matches backend format
      return {
        id: pendingId,
        ideaId: (requestData as any)?.ideaId,
        voterName: (requestData as any)?.voterName,
        voterEmail: (requestData as any)?.voterEmail,
        votedAt: new Date().toISOString(),
      };
    
    case 'SUBSCRIBE_EVENT':
      // Mocked inscription response - matches backend format
      return {
        id: pendingId,
        eventId: (requestData as any)?.eventId,
        name: (requestData as any)?.name,
        email: (requestData as any)?.email,
        company: (requestData as any)?.company,
        phone: (requestData as any)?.phone,
        registeredAt: new Date().toISOString(),
      };
    
    case 'UNSUBSCRIBE_EVENT':
      // Mocked unsubscription response - matches backend format
      return {
        id: pendingId,
        eventId: (requestData as any)?.eventId,
        name: (requestData as any)?.name,
        email: (requestData as any)?.email,
        unsubscribedAt: new Date().toISOString(),
      };
    
    case 'COMMENT':
      // Mocked comment response - matches backend format
      return {
        id: pendingId,
        content: (requestData as any)?.content,
        authorName: (requestData as any)?.authorName,
        authorEmail: (requestData as any)?.authorEmail,
        createdAt: new Date().toISOString(),
      };
    
    default:
      // Generic mocked response
      return {
        id: pendingId,
        ...(typeof requestData === 'object' && requestData !== null ? requestData : {}),
      };
  }
}

/**
 * Register background sync with Service Worker
 */
async function registerBackgroundSync(): Promise<void> {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-queue');
      console.log('[SyncService] Background sync registered successfully');
    } catch (error) {
      console.error('[SyncService] Failed to register background sync:', error);
    }
  } else {
    console.warn('[SyncService] Background Sync API not supported');
  }
}

/**
 * Wrap API request with offline support
 * Intercepts requests when offline and queues them for later sync
 */
export async function wrapApiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // If online, make normal request
  if (isOnline()) {
    console.log('[SyncService] Online - making direct request to:', url);
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
    await throwIfResNotOk(res);
    return res;
  }

  // Check if this is a mutation (POST/PUT/DELETE)
  const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase());
  
  if (!isMutation) {
    // For GET requests when offline, try to proceed (will fail naturally)
    console.log('[SyncService] Offline - attempting GET request:', url);
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
    await throwIfResNotOk(res);
    return res;
  }

  // Offline mutation - queue the action
  console.log('[SyncService] Offline - queuing mutation:', { method, url });
  
  try {
    const queue = OfflineQueue.getInstance();
    await queue.init();
    
    const actionType = getActionType(url, method);
    
    // Add action to queue
    const actionId = await queue.addAction({
      type: actionType,
      endpoint: url,
      method: method.toUpperCase() as 'POST' | 'PUT' | 'DELETE',
      data,
    });
    
    console.log('[SyncService] Action queued with ID:', actionId);
    
    // WARNING: Action has been queued for later synchronization
    console.warn(
      `⚠️ [SyncService] Action queued for offline sync!\n` +
      `   Type: ${actionType}\n` +
      `   Endpoint: ${url}\n` +
      `   Action ID: ${actionId}\n` +
      `   The action will be synchronized when connection is restored.`
    );
    
    // Register background sync
    await registerBackgroundSync();
    
    // Generate mocked data that matches backend response format
    const mockedData = generateMockedData(actionType, url, data);
    
    /**
     * MOCKED RESPONSE FORMAT:
     * This response simulates a successful mutation while offline.
     * - status: 202 (Accepted) indicates the action is queued
     * - queued: true flag allows UI to detect offline state
     * - data: Contains mocked fields matching backend response format
     * 
     * The UI can use this to update optimistically while waiting for sync.
     */
    const mockResponse = new Response(
      JSON.stringify({ 
        success: true, 
        queued: true,
        message: 'Action enregistrée - sera synchronisée quand la connexion reviendra',
        actionId,
        data: mockedData
      }),
      {
        status: 202, // Accepted - indicates queued for processing
        statusText: 'Accepted - Queued for sync',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    return mockResponse;
  } catch (error) {
    console.error('[SyncService] Failed to queue action:', error);
    // If queueing fails, try the request anyway (will likely fail but maintains expected behavior)
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
    await throwIfResNotOk(res);
    return res;
  }
}

/**
 * Sync all queued actions
 * Returns count of successful and failed syncs
 */
export async function syncQueuedActions(): Promise<{ synced: number; failed: number }> {
  console.log('[SyncService] Starting sync of queued actions...');
  
  const queue = OfflineQueue.getInstance();
  await queue.init();
  
  // Get all pending actions
  const pendingActions = await queue.getByStatus('pending');
  
  if (pendingActions.length === 0) {
    console.log('[SyncService] No pending actions to sync');
    return { synced: 0, failed: 0 };
  }
  
  console.log(`[SyncService] Found ${pendingActions.length} pending actions to sync`);
  
  let syncedCount = 0;
  let failedCount = 0;
  
  for (const action of pendingActions) {
    try {
      // Mark as syncing
      await queue.updateStatus(action.id!, 'syncing');
      console.log(`[SyncService] Syncing action ${action.id}:`, action.type);
      
      // Make the actual API request
      const response = await fetch(action.endpoint, {
        method: action.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: action.data ? JSON.stringify(action.data) : undefined,
        credentials: 'include',
      });
      
      if (response.ok) {
        // Success - remove from queue
        await queue.remove(action.id!);
        syncedCount++;
        console.log(`[SyncService] ✓ Successfully synced action ${action.id}`);
      } else {
        // Failed - increment retry count
        const newRetryCount = (action.retryCount || 0) + 1;
        
        if (newRetryCount >= MAX_RETRY_COUNT) {
          // Max retries reached - mark as failed
          await queue.updateStatus(action.id!, 'failed', newRetryCount);
          failedCount++;
          console.error(`[SyncService] ✗ Action ${action.id} failed after ${newRetryCount} attempts`);
        } else {
          // Mark back as pending for next sync attempt
          await queue.updateStatus(action.id!, 'pending', newRetryCount);
          console.warn(`[SyncService] ⚠ Action ${action.id} failed (attempt ${newRetryCount}/${MAX_RETRY_COUNT})`);
        }
      }
    } catch (error) {
      // Network or other error - increment retry count
      const newRetryCount = (action.retryCount || 0) + 1;
      
      if (newRetryCount >= MAX_RETRY_COUNT) {
        await queue.updateStatus(action.id!, 'failed', newRetryCount);
        failedCount++;
        console.error(`[SyncService] ✗ Action ${action.id} error after ${newRetryCount} attempts:`, error);
      } else {
        await queue.updateStatus(action.id!, 'pending', newRetryCount);
        console.warn(`[SyncService] ⚠ Action ${action.id} error (attempt ${newRetryCount}/${MAX_RETRY_COUNT}):`, error);
      }
    }
  }
  
  console.log(`[SyncService] Sync complete: ${syncedCount} synced, ${failedCount} failed`);
  return { synced: syncedCount, failed: failedCount };
}

/**
 * Initialize sync service with online event listener
 * Automatically syncs queued actions when connection is restored
 */
export function initSyncService(): void {
  // Listen for online event
  window.addEventListener('online', async () => {
    console.log('[SyncService] Connection restored - triggering sync...');
    
    try {
      const result = await syncQueuedActions();
      
      if (result.synced > 0) {
        // Notify user of successful sync
        console.log(`[SyncService] Successfully synchronized ${result.synced} action(s)`);
        
        // Dispatch custom event for UI to show notification
        window.dispatchEvent(new CustomEvent('sync-complete', {
          detail: { synced: result.synced, failed: result.failed }
        }));
      }
      
      if (result.failed > 0) {
        console.error(`[SyncService] Failed to sync ${result.failed} action(s)`);
        
        // Dispatch custom event for UI to show error
        window.dispatchEvent(new CustomEvent('sync-failed', {
          detail: { failed: result.failed }
        }));
      }
    } catch (error) {
      console.error('[SyncService] Error during sync:', error);
    }
  });
  
  console.log('[SyncService] Initialized - listening for online events');
}
