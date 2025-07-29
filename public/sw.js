const CACHE_NAME = 'shop-scanner-v1';
const OFFLINE_URL = '/offline.html';

// Core app files to cache immediately
const CORE_CACHE_FILES = [
  '/',
  '/offline.html',
  '/manifest.json',
  // Icons will be cached when requested
];

// API endpoints that can be cached
const CACHEABLE_API_PATTERNS = [
  /^\/api\/products\/\w+$/,  // Product details
  /^\/api\/products\?/,      // Product searches (with params)
];

// Install event - cache core files
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching core files');
        return cache.addAll(CORE_CACHE_FILES);
      })
      .then(() => {
        console.log('[SW] Core files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache core files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Old caches cleaned up');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle different types of requests with appropriate strategies
  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Strategy 1: Navigation requests (pages)
    if (request.mode === 'navigate') {
      return await handleNavigationRequest(request);
    }
    
    // Strategy 2: API requests
    if (url.pathname.startsWith('/api/')) {
      return await handleApiRequest(request);
    }
    
    // Strategy 3: Static assets (JS, CSS, images)
    if (isStaticAsset(url.pathname)) {
      return await handleStaticAssetRequest(request);
    }
    
    // Strategy 4: Everything else - network first
    return await handleNetworkFirstRequest(request);
    
  } catch (error) {
    console.error('[SW] Error handling request:', error);
    return await handleOfflineRequest(request);
  }
}

// Navigation request handler - Network first with offline fallback
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful navigation responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Navigation request failed, trying cache');
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    return caches.match(OFFLINE_URL);
  }
}

// API request handler - Network first with selective caching
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful GET requests for certain endpoints
    if (networkResponse.ok && shouldCacheApiResponse(url.pathname)) {
      const cache = await caches.open(CACHE_NAME);
      // Set a shorter TTL for API responses
      const responseToCache = networkResponse.clone();
      cache.put(request, responseToCache);
      
      // Clean up old API cache entries periodically
      cleanupApiCache();
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] API request failed, trying cache');
    
    // For certain endpoints, return cached data if available
    if (shouldReturnCachedApiResponse(url.pathname)) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        // Add a header to indicate this is cached data
        const response = cachedResponse.clone();
        response.headers.set('X-Served-By', 'ServiceWorker-Cache');
        return response;
      }
    }
    
    throw error;
  }
}

// Static asset handler - Cache first
async function handleStaticAssetRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Update cache in the background
    updateCacheInBackground(request);
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Static asset request failed:', error);
    throw error;
  }
}

// Network first handler for other requests
async function handleNetworkFirstRequest(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Offline fallback handler
async function handleOfflineRequest(request) {
  if (request.mode === 'navigate') {
    return caches.match(OFFLINE_URL);
  }
  
  // For other requests, return a simple offline response
  return new Response(
    JSON.stringify({ 
      error: 'Offline',
      message: 'This feature is not available offline'
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Helper functions
function isStaticAsset(pathname) {
  return /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/i.test(pathname);
}

function shouldCacheApiResponse(pathname) {
  return CACHEABLE_API_PATTERNS.some(pattern => pattern.test(pathname));
}

function shouldReturnCachedApiResponse(pathname) {
  // Return cached data for product details and search results
  return /^\/api\/products/.test(pathname);
}

function updateCacheInBackground(request) {
  // Update cache without blocking the response
  fetch(request)
    .then(response => {
      if (response.ok) {
        caches.open(CACHE_NAME)
          .then(cache => cache.put(request, response));
      }
    })
    .catch(() => {
      // Ignore background update failures
    });
}

function cleanupApiCache() {
  // Periodically clean up old API cache entries
  caches.open(CACHE_NAME)
    .then(cache => {
      cache.keys()
        .then(requests => {
          const apiRequests = requests.filter(req => 
            new URL(req.url).pathname.startsWith('/api/')
          );
          
          // Keep only the most recent 100 API responses
          if (apiRequests.length > 100) {
            const oldRequests = apiRequests.slice(0, apiRequests.length - 100);
            oldRequests.forEach(req => cache.delete(req));
          }
        });
    })
    .catch(() => {
      // Ignore cleanup failures
    });
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);
  
  if (event.tag === 'wishlist-sync') {
    event.waitUntil(syncWishlistChanges());
  } else if (event.tag === 'price-alert-sync') {
    event.waitUntil(syncPriceAlerts());
  }
});

async function syncWishlistChanges() {
  try {
    // Get pending wishlist changes from IndexedDB
    const pendingChanges = await getPendingWishlistChanges();
    
    for (const change of pendingChanges) {
      try {
        await fetch('/api/wishlist/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(change)
        });
        
        // Remove from pending queue on success
        await removePendingWishlistChange(change.id);
      } catch (error) {
        console.error('[SW] Failed to sync wishlist change:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

async function syncPriceAlerts() {
  try {
    // Sync price alert preferences
    const pendingAlerts = await getPendingPriceAlerts();
    
    for (const alert of pendingAlerts) {
      try {
        await fetch('/api/price-alerts/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alert)
        });
        
        await removePendingPriceAlert(alert.id);
      } catch (error) {
        console.error('[SW] Failed to sync price alert:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Price alert sync failed:', error);
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received');
  
  if (!event.data) {
    return;
  }
  
  try {
    const data = event.data.json();
    
    event.waitUntil(
      showNotification(data)
    );
  } catch (error) {
    console.error('[SW] Failed to process push notification:', error);
  }
});

async function showNotification(data) {
  const { type, title, body, icon, badge, tag, url, actions } = data;
  
  const options = {
    body,
    icon: icon || '/icons/icon-192x192.png',
    badge: badge || '/icons/icon-72x72.png',
    tag,
    requireInteraction: type === 'price-alert',
    actions: actions || [],
    data: { url }
  };
  
  // Customize based on notification type
  if (type === 'price-alert') {
    options.vibrate = [200, 100, 200];
    options.actions = [
      {
        action: 'view',
        title: 'View Product',
        icon: '/icons/view-action.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss-action.png'
      }
    ];
  }
  
  return self.registration.showNotification(title, options);
}

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click event');
  
  event.notification.close();
  
  const { action } = event;
  const { url } = event.notification.data || {};
  
  if (action === 'dismiss') {
    return;
  }
  
  // Default action or 'view' action
  const targetUrl = url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Try to focus existing window
        for (const client of clientList) {
          if (client.url.includes(targetUrl) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if no existing window found
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// IndexedDB helper functions (simplified implementation)
async function getPendingWishlistChanges() {
  // This would connect to IndexedDB to get pending changes
  return [];
}

async function removePendingWishlistChange(id) {
  // Remove from IndexedDB
}

async function getPendingPriceAlerts() {
  return [];
}

async function removePendingPriceAlert(id) {
  // Remove from IndexedDB
}

console.log('[SW] Service Worker script loaded');