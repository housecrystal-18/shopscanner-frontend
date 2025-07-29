import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types/product';
import { WishlistItem } from '../types/wishlist';

interface OfflineStorageData {
  products: Record<string, Product>;
  wishlistItems: Record<string, WishlistItem>;
  priceComparisons: Record<string, any>;
  lastSync: string;
}

const DB_NAME = 'shop-scanner-offline';
const DB_VERSION = 1;
const STORES = {
  PRODUCTS: 'products',
  WISHLIST: 'wishlist',
  PRICE_COMPARISONS: 'price-comparisons',
  SYNC_QUEUE: 'sync-queue'
};

export function useOfflineStorage() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize IndexedDB
  useEffect(() => {
    const initDB = async () => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => {
          console.error('Failed to open IndexedDB');
        };
        
        request.onupgradeneeded = (event) => {
          const database = (event.target as IDBOpenDBRequest).result;
          
          // Create object stores
          if (!database.objectStoreNames.contains(STORES.PRODUCTS)) {
            const productStore = database.createObjectStore(STORES.PRODUCTS, { keyPath: 'id' });
            productStore.createIndex('barcode', 'barcode', { unique: false });
            productStore.createIndex('category', 'category', { unique: false });
          }
          
          if (!database.objectStoreNames.contains(STORES.WISHLIST)) {
            const wishlistStore = database.createObjectStore(STORES.WISHLIST, { keyPath: 'id' });
            wishlistStore.createIndex('userId', 'userId', { unique: false });
            wishlistStore.createIndex('productId', 'productId', { unique: false });
          }
          
          if (!database.objectStoreNames.contains(STORES.PRICE_COMPARISONS)) {
            database.createObjectStore(STORES.PRICE_COMPARISONS, { keyPath: 'id' });
          }
          
          if (!database.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
            const syncStore = database.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
            syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          }
        };
        
        request.onsuccess = (event) => {
          const database = (event.target as IDBOpenDBRequest).result;
          setDb(database);
          setIsInitialized(true);
          console.log('IndexedDB initialized successfully');
        };
      } catch (error) {
        console.error('Error initializing IndexedDB:', error);
      }
    };

    initDB();
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Product storage functions
  const cacheProduct = useCallback(async (product: Product): Promise<void> => {
    if (!db) return;

    try {
      const transaction = db.transaction([STORES.PRODUCTS], 'readwrite');
      const store = transaction.objectStore(STORES.PRODUCTS);
      
      // Add timestamp for cache management
      const productWithTimestamp = {
        ...product,
        cachedAt: new Date().toISOString()
      };
      
      await store.put(productWithTimestamp);
      console.log('Product cached:', product.id);
    } catch (error) {
      console.error('Error caching product:', error);
    }
  }, [db]);

  const getCachedProduct = useCallback(async (productId: string): Promise<Product | null> => {
    if (!db) return null;

    try {
      const transaction = db.transaction([STORES.PRODUCTS], 'readonly');
      const store = transaction.objectStore(STORES.PRODUCTS);
      
      return new Promise((resolve) => {
        const request = store.get(productId);
        request.onsuccess = () => {
          resolve(request.result || null);
        };
        request.onerror = () => {
          resolve(null);
        };
      });
    } catch (error) {
      console.error('Error getting cached product:', error);
      return null;
    }
  }, [db]);

  const getCachedProducts = useCallback(async (limit: number = 50): Promise<Product[]> => {
    if (!db) return [];

    try {
      const transaction = db.transaction([STORES.PRODUCTS], 'readonly');
      const store = transaction.objectStore(STORES.PRODUCTS);
      
      return new Promise((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const products = request.result || [];
          // Sort by most recently cached and limit results
          const sortedProducts = products
            .sort((a, b) => new Date(b.cachedAt || '').getTime() - new Date(a.cachedAt || '').getTime())
            .slice(0, limit);
          resolve(sortedProducts);
        };
        request.onerror = () => {
          resolve([]);
        };
      });
    } catch (error) {
      console.error('Error getting cached products:', error);
      return [];
    }
  }, [db]);

  // Wishlist storage functions
  const cacheWishlistItem = useCallback(async (item: WishlistItem): Promise<void> => {
    if (!db) return;

    try {
      const transaction = db.transaction([STORES.WISHLIST], 'readwrite');
      const store = transaction.objectStore(STORES.WISHLIST);
      
      const itemWithTimestamp = {
        ...item,
        cachedAt: new Date().toISOString()
      };
      
      await store.put(itemWithTimestamp);
      console.log('Wishlist item cached:', item.id);
    } catch (error) {
      console.error('Error caching wishlist item:', error);
    }
  }, [db]);

  const getCachedWishlistItems = useCallback(async (userId: string): Promise<WishlistItem[]> => {
    if (!db) return [];

    try {
      const transaction = db.transaction([STORES.WISHLIST], 'readonly');
      const store = transaction.objectStore(STORES.WISHLIST);
      const index = store.index('userId');
      
      return new Promise((resolve) => {
        const request = index.getAll(userId);
        request.onsuccess = () => {
          resolve(request.result || []);
        };
        request.onerror = () => {
          resolve([]);
        };
      });
    } catch (error) {
      console.error('Error getting cached wishlist items:', error);
      return [];
    }
  }, [db]);

  // Sync queue functions
  const addToSyncQueue = useCallback(async (action: {
    type: 'wishlist_add' | 'wishlist_remove' | 'wishlist_update' | 'price_alert';
    data: any;
    endpoint: string;
    method: string;
  }): Promise<void> => {
    if (!db) return;

    try {
      const transaction = db.transaction([STORES.SYNC_QUEUE], 'readwrite');
      const store = transaction.objectStore(STORES.SYNC_QUEUE);
      
      const queueItem = {
        ...action,
        timestamp: new Date().toISOString(),
        retries: 0
      };
      
      await store.add(queueItem);
      console.log('Added to sync queue:', action.type);
    } catch (error) {
      console.error('Error adding to sync queue:', error);
    }
  }, [db]);

  const getSyncQueue = useCallback(async (): Promise<any[]> => {
    if (!db) return [];

    try {
      const transaction = db.transaction([STORES.SYNC_QUEUE], 'readonly');
      const store = transaction.objectStore(STORES.SYNC_QUEUE);
      
      return new Promise((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => {
          resolve(request.result || []);
        };
        request.onerror = () => {
          resolve([]);
        };
      });
    } catch (error) {
      console.error('Error getting sync queue:', error);
      return [];
    }
  }, [db]);

  const clearSyncQueue = useCallback(async (): Promise<void> => {
    if (!db) return;

    try {
      const transaction = db.transaction([STORES.SYNC_QUEUE], 'readwrite');
      const store = transaction.objectStore(STORES.SYNC_QUEUE);
      await store.clear();
      console.log('Sync queue cleared');
    } catch (error) {
      console.error('Error clearing sync queue:', error);
    }
  }, [db]);

  // Search cached products
  const searchCachedProducts = useCallback(async (query: string): Promise<Product[]> => {
    if (!db || !query.trim()) return [];

    try {
      const products = await getCachedProducts(100);
      const searchTerm = query.toLowerCase();
      
      return products.filter(product => 
        product.name?.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm) ||
        product.category?.toLowerCase().includes(searchTerm) ||
        product.barcode?.includes(query) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    } catch (error) {
      console.error('Error searching cached products:', error);
      return [];
    }
  }, [db, getCachedProducts]);

  // Cache management
  const cleanupOldCache = useCallback(async (): Promise<void> => {
    if (!db) return;

    try {
      const transaction = db.transaction([STORES.PRODUCTS], 'readwrite');
      const store = transaction.objectStore(STORES.PRODUCTS);
      
      // Remove items older than 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const request = store.getAll();
      request.onsuccess = () => {
        const products = request.result || [];
        products.forEach(product => {
          const cachedAt = new Date(product.cachedAt || '');
          if (cachedAt < sevenDaysAgo) {
            store.delete(product.id);
          }
        });
      };
    } catch (error) {
      console.error('Error cleaning up cache:', error);
    }
  }, [db]);

  // Storage info
  const getStorageInfo = useCallback(async () => {
    if (!db) return { products: 0, wishlist: 0, syncQueue: 0 };

    try {
      const [products, wishlist, syncQueue] = await Promise.all([
        new Promise<number>((resolve) => {
          const transaction = db.transaction([STORES.PRODUCTS], 'readonly');
          const request = transaction.objectStore(STORES.PRODUCTS).count();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => resolve(0);
        }),
        new Promise<number>((resolve) => {
          const transaction = db.transaction([STORES.WISHLIST], 'readonly');
          const request = transaction.objectStore(STORES.WISHLIST).count();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => resolve(0);
        }),
        new Promise<number>((resolve) => {
          const transaction = db.transaction([STORES.SYNC_QUEUE], 'readonly');
          const request = transaction.objectStore(STORES.SYNC_QUEUE).count();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => resolve(0);
        })
      ]);

      return { products, wishlist, syncQueue };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { products: 0, wishlist: 0, syncQueue: 0 };
    }
  }, [db]);

  return {
    isOffline,
    isInitialized,
    
    // Product functions
    cacheProduct,
    getCachedProduct,
    getCachedProducts,
    searchCachedProducts,
    
    // Wishlist functions
    cacheWishlistItem,
    getCachedWishlistItems,
    
    // Sync functions
    addToSyncQueue,
    getSyncQueue,
    clearSyncQueue,
    
    // Utility functions
    cleanupOldCache,
    getStorageInfo
  };
}