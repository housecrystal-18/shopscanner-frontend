export interface Product {
  id: string;
  name: string;
  barcode: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  averagePrice?: number;
  priceHistory?: Array<{
    price: number;
    source: string;
    timestamp: string;
  }>;
  stores?: Array<{
    name: string;
    price: number;
    url?: string;
    inStock: boolean;
    lastUpdated: string;
  }>;
  authenticity?: {
    score: number;
    factors: string[];
    verified: boolean;
  };
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ScanResult {
  barcode: string;
  product?: Product;
  isNewProduct: boolean;
}

export interface ProductFilter {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  inStock?: boolean;
  verified?: boolean;
  tags?: string[];
}

export interface ProductSort {
  field: 'name' | 'price' | 'category' | 'createdAt' | 'authenticity';
  direction: 'asc' | 'desc';
}

export interface ProductSearchParams {
  query?: string;
  filters?: ProductFilter;
  sort?: ProductSort;
  page?: number;
  limit?: number;
}

export interface ProductSearchResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}