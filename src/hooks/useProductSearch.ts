import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { productsAPI } from '../lib/api';
import { 
  ProductSearchParams, 
  ProductSearchResult, 
  ProductFilter, 
  ProductSort,
  SearchUsage 
} from '../types/product';
import toast from 'react-hot-toast';

// Custom hook for debouncing values
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const defaultSearchParams: ProductSearchParams = {
  query: '',
  page: 1,
  limit: 20,
  sort: { field: 'name', order: 'asc' },
  filters: {}
};

export function useProductSearch() {
  const { isAuthenticated, user } = useAuth();
  const { canUseFeature, incrementUsage, getRemainingUsage, subscription } = useSubscription();
  
  const [searchParams, setSearchParams] = useState<ProductSearchParams>(defaultSearchParams);
  
  // Debounce search query to avoid too many API calls
  const debouncedQuery = useDebounce(searchParams.query || '', 300);
  
  // Usage tracking state
  const [usage, setUsage] = useState<SearchUsage | null>(null);

  // Create stable search parameters for React Query
  const stableSearchParams = useMemo(() => ({
    ...searchParams,
    query: debouncedQuery,
  }), [searchParams, debouncedQuery]);

  // Check if user can perform search based on subscription limits
  const canSearch = useMemo(() => {
    if (!isAuthenticated) return true; // Public searches allowed
    return canUseFeature('crossPlatformSearch');
  }, [isAuthenticated, canUseFeature]);

  const remainingSearches = useMemo(() => {
    if (!isAuthenticated) return Infinity;
    return getRemainingUsage('crossPlatformSearch');
  }, [isAuthenticated, getRemainingUsage]);

  // React Query for product search
  const {
    data: searchResult,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['productSearchEnhanced', stableSearchParams],
    queryFn: async (): Promise<ProductSearchResult> => {
      // Check search limits before making request
      if (isAuthenticated && !canSearch) {
        throw new Error('Search limit exceeded. Please upgrade your plan to continue searching.');
      }
      
      try {
        const response = await productsAPI.getProducts({
          search: stableSearchParams.query,
          page: stableSearchParams.page,
          limit: stableSearchParams.limit,
          category: stableSearchParams.filters?.category,
          subcategory: stableSearchParams.filters?.subcategory,
          brand: stableSearchParams.filters?.brand,
          minPrice: stableSearchParams.filters?.minPrice,
          maxPrice: stableSearchParams.filters?.maxPrice,
          inStock: stableSearchParams.filters?.inStock,
          featured: stableSearchParams.filters?.featured,
          sortBy: stableSearchParams.sort?.field,
          sortOrder: stableSearchParams.sort?.order,
        });
        
        // Track usage if user is authenticated and query is not empty
        if (isAuthenticated && stableSearchParams.query) {
          await incrementUsage('crossPlatformSearch');
          
          // Update local usage state
          setUsage(prev => prev ? {
            ...prev,
            searchesUsed: prev.searchesUsed + 1
          } : null);
        }
        
        // Transform API response to match our interface
        const result: ProductSearchResult = {
          products: response.data.data || [],
          pagination: {
            page: response.data.pagination?.page || 1,
            limit: response.data.pagination?.limit || 20,
            total: response.data.pagination?.total || 0,
            totalPages: response.data.pagination?.totalPages || 0,
            hasNext: response.data.pagination?.hasNext || false,
            hasPrev: response.data.pagination?.hasPrev || false,
          },
          filters: {
            availableCategories: response.data.filters?.categories || [],
            availableBrands: response.data.filters?.brands || [],
            priceRange: response.data.filters?.priceRange || { min: 0, max: 1000 },
            availableStores: response.data.filters?.stores || [],
          },
          searchMetadata: {
            query: stableSearchParams.query,
            resultsFound: response.data.pagination?.total || 0,
            searchTime: Date.now(),
            suggestions: response.data.suggestions || [],
          }
        };
        
        return result;
      } catch (error: any) {
        console.error('Product search error:', error);
        
        if (error.message.includes('limit exceeded')) {
          toast.error('Search limit reached. Upgrade your plan to continue searching.');
        }
        
        throw error;
      }
    },
    enabled: stableSearchParams.query !== '' || Object.keys(stableSearchParams.filters || {}).length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('limit exceeded')) return false;
      return failureCount < 2;
    },
  });

  // Update search query
  const setQuery = useCallback((query: string) => {
    setSearchParams(prev => ({
      ...prev,
      query,
      page: 1, // Reset to first page on new search
    }));
  }, []);

  // Update filters
  const setFilters = useCallback((filters: ProductFilter) => {
    setSearchParams(prev => ({
      ...prev,
      filters,
      page: 1, // Reset to first page on filter change
    }));
  }, []);

  // Update sorting
  const setSort = useCallback((sort: ProductSort) => {
    setSearchParams(prev => ({
      ...prev,
      sort,
      page: 1, // Reset to first page on sort change
    }));
  }, []);

  // Update page
  const setPage = useCallback((page: number) => {
    setSearchParams(prev => ({
      ...prev,
      page,
    }));
  }, []);

  // Clear all filters and search
  const clearSearch = useCallback(() => {
    setSearchParams(defaultSearchParams);
  }, []);

  // Get popular/recent products (for initial page load)
  const {
    data: popularProducts,
    isLoading: isLoadingPopular,
  } = useQuery({
    queryKey: ['products', 'popular'],
    queryFn: async () => {
      const response = await api.get('/api/products/popular');
      return response.data;
    },
    enabled: !searchParams.query && !searchParams.filters,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Get categories for filter dropdown
  const {
    data: categories,
  } = useQuery({
    queryKey: ['products', 'categories'],
    queryFn: async () => {
      const response = await api.get('/api/products/categories');
      return response.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });


  // Load initial usage data
  useEffect(() => {
    if (isAuthenticated && subscription) {
      const plan = user?.plan || 'free';
      const limits = {
        free: 10,
        premium: 100,
        annual: 1000
      };
      
      setUsage({
        searchesUsed: subscription.usage?.crossPlatformSearch || 0,
        searchLimit: limits[plan],
        resetDate: subscription.currentPeriodEnd || '',
        plan
      });
    }
  }, [isAuthenticated, subscription, user]);

  // Helper computed values 
  const hasResults = Boolean(searchResult?.products?.length || popularProducts?.length);
  const isEmpty = !isLoading && !hasResults && !isLoadingPopular;
  const totalResults = searchResult?.pagination?.total || 0;
  const isSearchActive = Boolean(searchParams.query || Object.keys(searchParams.filters || {}).length > 0);

  return {
    // Search state
    searchParams,
    searchResult,
    isLoading,
    isError,
    error: error as Error | null,
    
    // Search functions
    setQuery,
    setFilters,
    setSort,
    setPage,
    clearSearch,
    refetch,
    
    // Results and data
    products: searchResult?.products || popularProducts || [],
    popularProducts,
    categories: categories || [],
    
    // Usage tracking
    usage,
    canSearch,
    remainingSearches,
    
    // Helper computed values
    hasResults,
    isEmpty,
    totalResults,
    isSearchActive,
    
    // Additional states
    query: searchParams.query || '',
    filters: searchParams.filters,
    sort: searchParams.sort,
    page: searchParams.page || 1,
  };
}