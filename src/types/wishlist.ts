import { Product } from './product';

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product?: Product;
  addedAt: string;
  notes?: string;
  priceWhenAdded?: number;
  priceAlertEnabled?: boolean;
  targetPrice?: number;
  tags?: string[];
  priority: 'low' | 'medium' | 'high';
  category?: string;
}

export interface WishlistCollection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  items: WishlistItem[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  itemCount: number;
}

export interface WishlistStats {
  totalItems: number;
  totalValue: number;
  averagePrice: number;
  priceDrops: number;
  recentlyAdded: number;
  collections: number;
  categoryCounts: Record<string, number>;
  priorityCounts: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface WishlistFilters {
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  priceRange?: {
    min: number;
    max: number;
  };
  hasNotes?: boolean;
  hasPriceAlert?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
  availability?: 'available' | 'unavailable' | 'on_sale';
}

export interface WishlistSort {
  field: 'name' | 'price' | 'addedAt' | 'priority' | 'category';
  direction: 'asc' | 'desc';
}

export interface WishlistItemUpdate {
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
  targetPrice?: number;
  priceAlertEnabled?: boolean;
  tags?: string[];
}

export interface PriceDropAlert {
  id: string;
  productId: string;
  productName: string;
  oldPrice: number;
  newPrice: number;
  priceDropPercentage: number;
  detectedAt: string;
  isRead: boolean;
}