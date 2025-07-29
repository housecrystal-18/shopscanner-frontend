import { useEffect, useCallback } from 'react';
import { useOfflineStorage } from './useOfflineStorage';
import { api } from '../lib/api';

export function useOfflineSync() {
  const { isOffline, getSyncQueue, clearSyncQueue, addToSyncQueue } = useOfflineStorage();

  // Process sync queue when coming back online
  const processSyncQueue = useCallback(async () => {
    if (isOffline) return;

    try {
      const queue = await getSyncQueue();
      
      if (queue.length === 0) return;

      console.log(`Processing ${queue.length} queued actions`);
      
      const results = await Promise.allSettled(
        queue.map(async (item) => {
          try {
            const response = await api.request({
              method: item.method,
              url: item.endpoint,
              data: item.data
            });
            
            return { id: item.id, success: true, response };
          } catch (error) {
            console.error(`Failed to sync item ${item.id}:`, error);
            return { id: item.id, success: false, error };
          }
        })
      );

      // Clear successfully synced items
      const successfulSyncs = results
        .filter(result => result.status === 'fulfilled' && result.value.success)
        .length;

      if (successfulSyncs > 0) {
        console.log(`Successfully synced ${successfulSyncs} items`);
        // In a real implementation, you'd selectively remove successful items
        // For now, we'll clear the entire queue if all items succeeded
        const allSucceeded = results.every(
          result => result.status === 'fulfilled' && result.value.success
        );
        
        if (allSucceeded) {
          await clearSyncQueue();
        }
      }

      return {
        total: queue.length,
        successful: successfulSyncs,
        failed: queue.length - successfulSyncs
      };
    } catch (error) {
      console.error('Error processing sync queue:', error);
      return null;
    }
  }, [isOffline, getSyncQueue, clearSyncQueue]);

  // Queue offline actions
  const queueOfflineAction = useCallback(async (
    type: 'wishlist_add' | 'wishlist_remove' | 'wishlist_update' | 'price_alert',
    data: any,
    endpoint: string,
    method: 'POST' | 'PUT' | 'DELETE' = 'POST'
  ) => {
    if (!isOffline) {
      // If online, execute immediately
      try {
        return await api.request({
          method,
          url: endpoint,
          data
        });
      } catch (error) {
        // If online request fails, queue it for later
        await addToSyncQueue({ type, data, endpoint, method });
        throw error;
      }
    }

    // If offline, queue the action
    await addToSyncQueue({ type, data, endpoint, method });
    return { queued: true };
  }, [isOffline, addToSyncQueue]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (!isOffline) {
      // Small delay to ensure connection is stable
      const timer = setTimeout(() => {
        processSyncQueue();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isOffline, processSyncQueue]);

  // Background sync using service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        if (!isOffline && 'sync' in registration) {
          // Request background sync for queued items
          (registration as any).sync.register('wishlist-sync').catch(() => {
            // Background sync not supported or failed
            console.log('Background sync registration failed');
          });
        }
      });
    }
  }, [isOffline]);

  return {
    processSyncQueue,
    queueOfflineAction
  };
}