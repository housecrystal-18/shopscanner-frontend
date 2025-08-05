export interface Product {
  id: string;
  name: string;
  description: string;
  brand?: string;
  category: string;
  subcategory?: string;
  
  // Product identifiers
  barcode?: string;
  upc?: string;
  sku?: string;
  
  // Pricing information
  price: {
    current: number;
    original?: number;
    currency: string;
    lastUpdated: string;
  };
  
  // Price history for trends
  priceHistory?: Array<{
    date: string;
    price: number;
    store?: string;
  }>;
  
  // Images
  images: Array<{
    url: string;
    alt?: string;
    isPrimary: boolean;
  }>;
  
  // Availability across stores
  availability: {
    inStock: boolean;
    quantity: number;
    status: 'in_stock' | 'out_of_stock' | 'limited' | 'discontinued';
  };
  
  // Store availability
  storeAvailability?: Array<{
    storeName: string;
    storeUrl?: string;
    price: number;
    inStock: boolean;
    lastChecked: string;
  }>;
  
  // Seller information
  seller: {
    userId?: string;
    businessName?: string;
    reputation?: {
      score: number;
      reviewCount: number;
    };
    contactInfo: {
      email: string;
      phone?: string;
    };
  };
  
  // Authenticity scoring system
  authenticity: {
    score: number; // 0-100
    verified: boolean;
    productType: 'authentic' | 'counterfeit' | 'unknown';
    flags: Array<{
      type: 'price_too_low' | 'suspicious_seller' | 'poor_quality' | 'missing_info';
      severity: 'low' | 'medium' | 'high';
      description: string;
    }>;
    lastVerified?: string;
    verificationSource?: string;
  };
  
  // Ratings and reviews
  ratings: {
    average: number;
    count: number;
    breakdown?: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  };
  
  // Metadata
  views: number;
  isActive: boolean;
  featured: boolean;
  tags: string[];
  specifications?: Array<{
    name: string;
    value: string;
  }>;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface ScanResult {
  barcode: string;
  product?: Product;
  isNewProduct: boolean;
}

// Product filtering interfaces
export interface ProductFilter {
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  minAuthenticityScore?: number;
  verified?: boolean;
  productType?: 'authentic' | 'counterfeit' | 'unknown';
  tags?: string[];
  stores?: string[];
}

// Product sorting options
export interface ProductSort {
  field: 'name' | 'price' | 'category' | 'createdAt' | 'authenticity' | 'ratings' | 'views';
  order: 'asc' | 'desc';
}

// Search parameters
export interface ProductSearchParams {
  query?: string;
  filters?: ProductFilter;
  sort?: ProductSort;
  page?: number;
  limit?: number;
}

// Search results with pagination
export interface ProductSearchResult {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    availableCategories: Array<{ name: string; count: number }>;
    availableBrands: Array<{ name: string; count: number }>;
    priceRange: { min: number; max: number };
    availableStores: Array<{ name: string; count: number }>;
  };
  searchMetadata: {
    query?: string;
    resultsFound: number;
    searchTime: number;
    suggestions?: string[];
  };
}

// Price trend indicators
export type PriceTrend = 'up' | 'down' | 'stable';

export interface PriceTrendData {
  trend: PriceTrend;
  changePercent: number;
  changeAmount: number;
  period: '24h' | '7d' | '30d';
}

// Product categories
export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  subcategories?: ProductSubcategory[];
  productCount: number;
  iconName?: string;
}

export interface ProductSubcategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  productCount: number;
}

// Store information
export interface Store {
  id: string;
  name: string;
  url: string;
  logo?: string;
  trustScore: number;
  isVerified: boolean;
  productCount: number;
}

// Product comparison interface
export interface ProductComparison {
  products: Product[];
  comparisonFields: Array<{
    field: keyof Product;
    label: string;
    type: 'text' | 'number' | 'boolean' | 'rating';
  }>;
}

// Usage tracking for search features
export interface SearchUsage {
  searchesUsed: number;
  searchLimit: number;
  resetDate: string;
  plan: 'free' | 'premium' | 'annual';
}

// Product alert for wishlist/notifications
export interface ProductAlert {
  id: string;
  productId: string;
  userId: string;
  alertType: 'price_drop' | 'back_in_stock' | 'authenticity_update';
  targetValue?: number; // For price alerts
  isActive: boolean;
  createdAt: string;
  lastTriggered?: string;
}