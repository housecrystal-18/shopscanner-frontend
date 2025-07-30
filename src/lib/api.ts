import axios, { AxiosResponse } from 'axios';
import { config } from '../config/environment';
import { mockApi } from '../services/mockApi';

const API_BASE_URL = config.apiBaseUrl;

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user-data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  type: 'consumer' | 'business';
  plan?: 'free' | 'premium' | 'annual';
  businessName?: string;
  businessUrl?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  brand?: string;
  category: string;
  subcategory?: string;
  barcode?: string;
  upc?: string;
  sku?: string;
  price: {
    current: number;
    original?: number;
    currency: string;
  };
  images: Array<{
    url: string;
    alt?: string;
    isPrimary: boolean;
  }>;
  availability: {
    inStock: boolean;
    quantity: number;
    status: 'in_stock' | 'out_of_stock' | 'limited' | 'discontinued';
  };
  seller: {
    userId: User;
    businessName?: string;
    contactInfo: {
      email: string;
      phone?: string;
    };
  };
  ratings: {
    average: number;
    count: number;
  };
  views: number;
  isActive: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Wishlist {
  _id: string;
  name: string;
  description?: string;
  items: Array<{
    product: Product;
    addedAt: string;
    targetPrice?: number;
    notes?: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  isPublic: boolean;
  isDefault: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PriceComparison {
  product: {
    id: string;
    name: string;
    currentPrice: number;
    currency: string;
  };
  comparisons: Array<{
    retailer: string;
    title: string;
    price: number;
    currency: string;
    url?: string;
    image?: string;
    availability: string;
    confidence: number;
  }>;
  bestPrice?: number;
  savings: number;
  savingsPercentage: number;
  searchedRetailers: number;
  timestamp: string;
}

export interface BarcodeResult {
  barcode: string;
  alternativeBarcodes: string[];
  confidence: number;
  productInfo?: {
    name: string;
    brand?: string;
    category?: string;
    description?: string;
    images?: Array<{ url: string; isPrimary: boolean }>;
    barcodes?: Array<{ type: string; value: string }>;
    sources: string[];
  };
  existingProduct?: Product;
  sources: number;
}

// Auth API
export const authAPI = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    type: 'consumer' | 'business';
    businessName?: string;
  }): Promise<AxiosResponse<{ success: boolean; token: string; user: User }>> =>
    config.mockApi ? Promise.resolve({ data: mockApi.auth.register(data) } as any) : api.post('/api/auth/register', data),

  login: (data: {
    email: string;
    password: string;
  }): Promise<AxiosResponse<{ success: boolean; token: string; user: User }>> =>
    config.mockApi ? Promise.resolve({ data: mockApi.auth.login(data.email, data.password) } as any) : api.post('/api/auth/login', data),

  me: (): Promise<AxiosResponse<{ success: boolean; user: User }>> =>
    api.get('/api/auth/me'),
};

// Products API
export const productsAPI = {
  getProducts: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    subcategory?: string;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    inStock?: boolean;
    featured?: boolean;
  }): Promise<AxiosResponse<{ success: boolean; data: Product[]; pagination: any }>> =>
    config.mockApi ? Promise.resolve({ data: mockApi.products.list(params) } as any) : api.get('/api/products', { params }),

  getProduct: (id: string): Promise<AxiosResponse<{ success: boolean; data: Product }>> =>
    config.mockApi ? Promise.resolve({ data: mockApi.products.getById(id) } as any) : api.get(`/api/products/${id}`),

  createProduct: (data: Partial<Product>): Promise<AxiosResponse<{ success: boolean; data: Product }>> =>
    api.post('/api/products', data),

  updateProduct: (id: string, data: Partial<Product>): Promise<AxiosResponse<{ success: boolean; data: Product }>> =>
    api.put(`/api/products/${id}`, data),

  deleteProduct: (id: string): Promise<AxiosResponse<{ success: boolean }>> =>
    api.delete(`/api/products/${id}`),

  getMyProducts: (params?: {
    page?: number;
    limit?: number;
    status?: 'all' | 'active' | 'inactive';
  }): Promise<AxiosResponse<{ success: boolean; data: Product[]; pagination: any }>> =>
    api.get('/api/products/seller/mine', { params }),

  getCategories: (): Promise<AxiosResponse<{ success: boolean; data: Array<{ name: string; count: number }> }>> =>
    api.get('/api/products/meta/categories'),

  findByBarcode: (code: string): Promise<AxiosResponse<{ success: boolean; data: Product }>> =>
    api.get(`/api/products/barcode/${code}`),
};

// Upload API
export const uploadAPI = {
  uploadImages: (files: FileList, alt?: string): Promise<AxiosResponse<{ success: boolean; data: any[] }>> => {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('images', file);
    });
    if (alt) formData.append('alt', alt);

    return api.post('/api/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadBarcodeImage: (file: File): Promise<AxiosResponse<{ success: boolean; data: any }>> => {
    const formData = new FormData();
    formData.append('barcode', file);

    return api.post('/api/upload/barcode', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteImage: (filename: string): Promise<AxiosResponse<{ success: boolean }>> =>
    api.delete(`/api/upload/images/${filename}`),
};

// Barcode API
export const barcodeAPI = {
  scanBarcode: (imageUrl: string): Promise<AxiosResponse<{ success: boolean; data: BarcodeResult }>> =>
    api.post('/api/barcode/scan', { imageUrl }),

  lookupBarcode: (code: string): Promise<AxiosResponse<{ success: boolean; data: BarcodeResult }>> =>
    api.get(`/api/barcode/lookup/${code}`),

  createProductFromBarcode: (data: {
    barcode: string;
    productInfo?: any;
    customData?: any;
    priceInfo?: any;
  }): Promise<AxiosResponse<{ success: boolean; data: Product }>> =>
    api.post('/api/barcode/create-product', data),

  validateBarcode: (code: string): Promise<AxiosResponse<{ success: boolean; data: any }>> =>
    api.get(`/api/barcode/validate/${code}`),

  getScanHistory: (params?: {
    page?: number;
    limit?: number;
  }): Promise<AxiosResponse<{ success: boolean; data: any[] }>> =>
    api.get('/api/barcode/history', { params }),
};

// Price Comparison API
export const priceComparisonAPI = {
  compareProductPrices: (
    productId: string,
    options?: {
      includeRetailers?: string[];
      maxResults?: number;
      timeout?: number;
    }
  ): Promise<AxiosResponse<{ success: boolean; data: PriceComparison }>> =>
    api.post(`/api/price-comparison/compare/${productId}`, options),

  getPriceHistory: (
    productId: string,
    days = 30
  ): Promise<AxiosResponse<{ success: boolean; data: any }>> =>
    api.get(`/api/price-comparison/history/${productId}`, { params: { days } }),

  setPriceAlert: (data: {
    productId: string;
    targetPrice: number;
    alertType?: 'below' | 'above' | 'exact';
    email?: boolean;
    push?: boolean;
  }): Promise<AxiosResponse<{ success: boolean; data: any }>> =>
    api.post('/api/price-comparison/alert', data),

  getTrendingPrices: (params?: {
    category?: string;
    trendType?: 'increasing' | 'decreasing' | 'volatile';
    limit?: number;
    days?: number;
  }): Promise<AxiosResponse<{ success: boolean; data: any[] }>> =>
    api.get('/api/price-comparison/trending', { params }),

  getDeals: (params?: {
    category?: string;
    minSavings?: number;
    limit?: number;
  }): Promise<AxiosResponse<{ success: boolean; data: any[] }>> =>
    api.get('/api/price-comparison/deals', { params }),

  updateProductPrice: (
    productId: string,
    newPrice: number,
    source = 'manual'
  ): Promise<AxiosResponse<{ success: boolean; data: any }>> =>
    api.post(`/api/price-comparison/update-price/${productId}`, { newPrice, source }),
};

// Wishlist API
export const wishlistAPI = {
  getWishlists: (includeItems = true): Promise<AxiosResponse<{ success: boolean; data: Wishlist[] }>> =>
    api.get('/api/wishlist', { params: { includeItems } }),

  getWishlist: (id: string): Promise<AxiosResponse<{ success: boolean; data: Wishlist }>> =>
    api.get(`/api/wishlist/${id}`),

  createWishlist: (data: {
    name: string;
    description?: string;
    isPublic?: boolean;
    tags?: string[];
  }): Promise<AxiosResponse<{ success: boolean; data: Wishlist }>> =>
    api.post('/api/wishlist', data),

  updateWishlist: (
    id: string,
    data: {
      name?: string;
      description?: string;
      isPublic?: boolean;
      tags?: string[];
    }
  ): Promise<AxiosResponse<{ success: boolean; data: Wishlist }>> =>
    api.put(`/api/wishlist/${id}`, data),

  deleteWishlist: (id: string): Promise<AxiosResponse<{ success: boolean }>> =>
    api.delete(`/api/wishlist/${id}`),

  addToWishlist: (
    wishlistId: string,
    data: {
      productId: string;
      targetPrice?: number;
      notes?: string;
      priority?: 'low' | 'medium' | 'high';
    }
  ): Promise<AxiosResponse<{ success: boolean; data: any }>> =>
    api.post(`/api/wishlist/${wishlistId}/items`, data),

  removeFromWishlist: (
    wishlistId: string,
    productId: string
  ): Promise<AxiosResponse<{ success: boolean; data: any }>> =>
    api.delete(`/api/wishlist/${wishlistId}/items/${productId}`),

  quickAddToFavorites: (data: {
    productId: string;
    targetPrice?: number;
    notes?: string;
  }): Promise<AxiosResponse<{ success: boolean; data: any }>> =>
    api.post('/api/wishlist/quick-add', data),
};

// System API
export const systemAPI = {
  getHealth: (): Promise<AxiosResponse<{ status: string; service: string; version: string; timestamp: string }>> =>
    api.get('/health'),

  getDatabaseStatus: (): Promise<AxiosResponse<{ success: boolean; message: string; state: number }>> =>
    api.get('/api/database/test'),
};