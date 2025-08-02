// Price Tracking Service - Real historical price data storage and retrieval
export interface PriceDataPoint {
  id: string;
  productId: string; // ASIN, eBay item ID, etc.
  productName: string;
  price: number;
  originalPrice?: number;
  store: string;
  url: string;
  timestamp: number;
  availability: 'in_stock' | 'out_of_stock' | 'limited' | 'unknown';
  seller?: string;
  confidence: number;
}

export interface PriceHistoryResult {
  productId: string;
  productName: string;
  currentPrice: number;
  lowestPrice: number;
  highestPrice: number;
  pricePoints: PriceDataPoint[];
  priceChange24h?: number;
  priceChange7d?: number;
  priceChange30d?: number;
  bestStore?: string;
  lastUpdated: number;
}

export interface PriceAlert {
  id: string;
  productId: string;
  userId?: string;
  targetPrice: number;
  currentPrice: number;
  email?: string;
  enabled: boolean;
  created: number;
  triggered?: number;
}

class PriceTrackingService {
  private dbName = 'ShopScanProDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDatabase();
  }

  private async initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Failed to open price tracking database');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('Price tracking database initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Price history store
        if (!db.objectStoreNames.contains('priceHistory')) {
          const priceStore = db.createObjectStore('priceHistory', { keyPath: 'id' });
          priceStore.createIndex('productId', 'productId', { unique: false });
          priceStore.createIndex('timestamp', 'timestamp', { unique: false });
          priceStore.createIndex('store', 'store', { unique: false });
          priceStore.createIndex('price', 'price', { unique: false });
        }

        // Price alerts store
        if (!db.objectStoreNames.contains('priceAlerts')) {
          const alertStore = db.createObjectStore('priceAlerts', { keyPath: 'id' });
          alertStore.createIndex('productId', 'productId', { unique: false });
          alertStore.createIndex('enabled', 'enabled', { unique: false });
        }

        console.log('Price tracking database schema created');
      };
    });
  }

  // Save a new price data point
  async savePriceData(data: Omit<PriceDataPoint, 'id'>): Promise<string> {
    if (!this.db) {
      await this.initDatabase();
    }

    const id = `${data.productId}_${data.store}_${Date.now()}`;
    const pricePoint: PriceDataPoint = {
      ...data,
      id,
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['priceHistory'], 'readwrite');
      const store = transaction.objectStore('priceHistory');
      const request = store.add(pricePoint);

      request.onsuccess = () => {
        console.log(`Saved price data for ${data.productName}: ${data.price} at ${data.store}`);
        resolve(id);
      };

      request.onerror = () => {
        console.error('Failed to save price data:', request.error);
        reject(request.error);
      };
    });
  }

  // Get price history for a product
  async getPriceHistory(productId: string, days = 30): Promise<PriceHistoryResult | null> {
    if (!this.db) {
      await this.initDatabase();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['priceHistory'], 'readonly');
      const store = transaction.objectStore('priceHistory');
      const index = store.index('productId');
      const request = index.getAll(productId);

      request.onsuccess = () => {
        const allData = request.result as PriceDataPoint[];
        
        if (allData.length === 0) {
          resolve(null);
          return;
        }

        // Filter by date range
        const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
        const recentData = allData.filter(point => point.timestamp >= cutoffTime);
        
        if (recentData.length === 0) {
          resolve(null);
          return;
        }

        // Sort by timestamp
        const sortedData = recentData.sort((a, b) => a.timestamp - b.timestamp);
        
        // Calculate statistics
        const prices = sortedData.map(d => d.price);
        const currentPrice = sortedData[sortedData.length - 1].price;
        const lowestPrice = Math.min(...prices);
        const highestPrice = Math.max(...prices);
        
        // Calculate price changes
        const priceChange24h = this.calculatePriceChange(sortedData, 1);
        const priceChange7d = this.calculatePriceChange(sortedData, 7);
        const priceChange30d = this.calculatePriceChange(sortedData, 30);
        
        // Find best store (lowest recent price)
        const recentPrices = sortedData.slice(-10); // Last 10 data points
        const bestStore = recentPrices.reduce((best, current) => 
          current.price < best.price ? current : best
        ).store;

        const result: PriceHistoryResult = {
          productId,
          productName: sortedData[0].productName,
          currentPrice,
          lowestPrice,
          highestPrice,
          pricePoints: sortedData,
          priceChange24h,
          priceChange7d,
          priceChange30d,
          bestStore,
          lastUpdated: sortedData[sortedData.length - 1].timestamp
        };

        resolve(result);
      };

      request.onerror = () => {
        console.error('Failed to get price history:', request.error);
        reject(request.error);
      };
    });
  }

  private calculatePriceChange(data: PriceDataPoint[], days: number): number | undefined {
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    const oldData = data.filter(point => point.timestamp <= cutoffTime);
    
    if (oldData.length === 0) return undefined;
    
    const oldPrice = oldData[oldData.length - 1].price;
    const currentPrice = data[data.length - 1].price;
    
    return ((currentPrice - oldPrice) / oldPrice) * 100;
  }

  // Get all tracked products
  async getTrackedProducts(): Promise<string[]> {
    if (!this.db) {
      await this.initDatabase();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['priceHistory'], 'readonly');
      const store = transaction.objectStore('priceHistory');
      const request = store.getAll();

      request.onsuccess = () => {
        const allData = request.result as PriceDataPoint[];
        const uniqueProducts = [...new Set(allData.map(d => d.productId))];
        resolve(uniqueProducts);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Create price alert
  async createPriceAlert(productId: string, targetPrice: number, email?: string): Promise<string> {
    if (!this.db) {
      await this.initDatabase();
    }

    const alertId = `alert_${productId}_${Date.now()}`;
    const alert: PriceAlert = {
      id: alertId,
      productId,
      targetPrice,
      currentPrice: 0, // Will be updated when checking
      email,
      enabled: true,
      created: Date.now()
    };

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['priceAlerts'], 'readwrite');
      const store = transaction.objectStore('priceAlerts');
      const request = store.add(alert);

      request.onsuccess = () => {
        console.log(`Price alert created for ${productId} at $${targetPrice}`);
        resolve(alertId);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Check for price alerts
  async checkPriceAlerts(): Promise<PriceAlert[]> {
    if (!this.db) {
      await this.initDatabase();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['priceAlerts'], 'readonly');
      const store = transaction.objectStore('priceAlerts');
      const index = store.index('enabled');
      const request = index.getAll(IDBKeyRange.only(true));

      request.onsuccess = async () => {
        const alerts = request.result as PriceAlert[];
        const triggeredAlerts: PriceAlert[] = [];

        for (const alert of alerts) {
          try {
            const history = await this.getPriceHistory(alert.productId, 1);
            if (history && history.currentPrice <= alert.targetPrice) {
              triggeredAlerts.push({
                ...alert,
                currentPrice: history.currentPrice,
                triggered: Date.now()
              });
            }
          } catch (error) {
            console.error(`Error checking alert for ${alert.productId}:`, error);
          }
        }

        resolve(triggeredAlerts);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Get price comparison across stores
  async getPriceComparison(productId: string): Promise<{ store: string; price: number; timestamp: number }[]> {
    const history = await this.getPriceHistory(productId, 7); // Last 7 days
    if (!history) return [];

    // Group by store and get latest price for each
    const storeLatestPrices = new Map<string, { price: number; timestamp: number }>();
    
    history.pricePoints.forEach(point => {
      const existing = storeLatestPrices.get(point.store);
      if (!existing || point.timestamp > existing.timestamp) {
        storeLatestPrices.set(point.store, { price: point.price, timestamp: point.timestamp });
      }
    });

    return Array.from(storeLatestPrices.entries()).map(([store, data]) => ({
      store,
      price: data.price,
      timestamp: data.timestamp
    })).sort((a, b) => a.price - b.price);
  }

  // Clear old data (older than specified days)
  async cleanupOldData(olderThanDays = 365): Promise<number> {
    if (!this.db) {
      await this.initDatabase();
    }

    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['priceHistory'], 'readwrite');
      const store = transaction.objectStore('priceHistory');
      const index = store.index('timestamp');
      const request = index.openCursor(IDBKeyRange.upperBound(cutoffTime));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          console.log(`Cleaned up ${deletedCount} old price records`);
          resolve(deletedCount);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}

export const priceTrackingService = new PriceTrackingService();