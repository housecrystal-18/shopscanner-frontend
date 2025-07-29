import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { useOfflineStorage } from '../../hooks/useOfflineStorage';

export function OfflineIndicator() {
  const { isOffline, getSyncQueue, getStorageInfo } = useOfflineStorage();
  const [syncQueueCount, setSyncQueueCount] = useState(0);
  const [storageInfo, setStorageInfo] = useState({ products: 0, wishlist: 0, syncQueue: 0 });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const updateInfo = async () => {
      const [queue, storage] = await Promise.all([
        getSyncQueue(),
        getStorageInfo()
      ]);
      
      setSyncQueueCount(queue.length);
      setStorageInfo(storage);
    };

    updateInfo();
    
    // Update every 30 seconds
    const interval = setInterval(updateInfo, 30000);
    return () => clearInterval(interval);
  }, [getSyncQueue, getStorageInfo, isOffline]);

  if (!isOffline && syncQueueCount === 0) {
    return null; // Don't show indicator when online and no pending syncs
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`relative rounded-lg shadow-lg border-2 transition-all duration-300 cursor-pointer ${
          isOffline
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-yellow-50 border-yellow-200 text-yellow-800'
        }`}
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center space-x-2 px-3 py-2">
          {isOffline ? (
            <WifiOff className="h-4 w-4" />
          ) : syncQueueCount > 0 ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Wifi className="h-4 w-4" />
          )}
          
          <span className="text-sm font-medium">
            {isOffline ? 'Offline' : syncQueueCount > 0 ? 'Syncing...' : 'Online'}
          </span>
          
          {syncQueueCount > 0 && (
            <span className="bg-white text-xs px-2 py-1 rounded-full font-medium">
              {syncQueueCount}
            </span>
          )}
        </div>

        {/* Details dropdown */}
        {showDetails && (
          <div className={`absolute top-full right-0 mt-2 w-80 rounded-lg shadow-xl border bg-white p-4 z-10`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Connection Status</h3>
                <div className={`flex items-center space-x-1 text-sm ${
                  isOffline ? 'text-red-600' : 'text-green-600'
                }`}>
                  {isOffline ? <WifiOff className="h-3 w-3" /> : <Wifi className="h-3 w-3" />}
                  <span>{isOffline ? 'Offline' : 'Online'}</span>
                </div>
              </div>

              {isOffline && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-red-800">
                      <p className="font-medium mb-1">You're currently offline</p>
                      <p>Changes will be synced when connection is restored.</p>
                    </div>
                  </div>
                </div>
              )}

              {syncQueueCount > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <RefreshCw className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">
                        {syncQueueCount} item{syncQueueCount !== 1 ? 's' : ''} pending sync
                      </p>
                      <p>Your changes will be saved automatically.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Cached Data</h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-lg font-semibold text-gray-900">
                      {storageInfo.products}
                    </div>
                    <div className="text-xs text-gray-600">Products</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-lg font-semibold text-gray-900">
                      {storageInfo.wishlist}
                    </div>
                    <div className="text-xs text-gray-600">Wishlist</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-lg font-semibold text-gray-900">
                      {storageInfo.syncQueue}
                    </div>
                    <div className="text-xs text-gray-600">Pending</div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
                {isOffline ? (
                  'Working offline with cached data'
                ) : (
                  'Connected and syncing'
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {showDetails && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowDetails(false)}
        />
      )}
    </div>
  );
}