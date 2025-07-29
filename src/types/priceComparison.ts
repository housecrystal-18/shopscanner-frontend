export interface PriceAlert {
  id: string;
  productId: string;
  userId: string;
  targetPrice: number;
  currentPrice: number;
  storeName: string;
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
}

export interface PriceHistory {
  price: number;
  source: string;
  timestamp: string;
  url?: string;
  availability: 'in_stock' | 'out_of_stock' | 'limited_stock';
}

export interface StoreComparison {
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  discountPercentage?: number;
  url?: string;
  inStock: boolean;
  shipping?: {
    cost: number;
    estimatedDays: number;
    free: boolean;
  };
  rating?: number;
  reviewCount?: number;
  lastUpdated: string;
  trustScore?: number;
}

export interface PriceComparisonData {
  productId: string;
  productName: string;
  imageUrl?: string;
  category: string;
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  stores: StoreComparison[];
  priceHistory: PriceHistory[];
  lastUpdated: string;
  alertsCount: number;
  savings?: {
    amount: number;
    percentage: number;
    bestStore: string;
  };
}

export interface PriceTrend {
  period: '24h' | '7d' | '30d' | '90d';
  trend: 'up' | 'down' | 'stable';
  changeAmount: number;
  changePercentage: number;
  data: Array<{
    date: string;
    price: number;
    source: string;
  }>;
}

export interface PriceComparisonFilters {
  category?: string;
  maxPrice?: number;
  minPrice?: number;
  inStockOnly?: boolean;
  hasDiscount?: boolean;
  freeShipping?: boolean;
  minRating?: number;
  stores?: string[];
}

export interface PriceComparisonSort {
  field: 'price' | 'discount' | 'rating' | 'name' | 'lastUpdated';
  direction: 'asc' | 'desc';
}