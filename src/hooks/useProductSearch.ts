import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { ProductSearchParams, ProductSearchResult, ProductFilter, ProductSort } from '../types/product';
import { useSubscription } from '../contexts/SubscriptionContext';
import { toast } from 'react-hot-toast';

export function useProductSearch() {
  const [searchParams, setSearchParams] = useState<ProductSearchParams>({
    query: '',
    page: 1,
    limit: 12,
  });
  const { canUseFeature, incrementUsage, getRemainingUsage } = useSubscription();

  // Search products query
  const {
    data: searchResult,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['products', 'search', searchParams],
    queryFn: async (): Promise<ProductSearchResult> => {
      // Check usage limits for search (using crossPlatformSearch feature)
      if (!canUseFeature('crossPlatformSearch')) {
        const remaining = getRemainingUsage('crossPlatformSearch');
        throw new Error(`Search limit reached. You have ${remaining} searches remaining this month.`);
      }

      try {
        // Increment usage
        await incrementUsage('crossPlatformSearch');

        const response = await api.get('/api/products/search', {
          params: searchParams,
        });
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 429) {
          throw new Error('Search limit reached. Please upgrade your plan.');
        }
        throw error;
      }
    },
    enabled: !!searchParams.query || Object.keys(searchParams.filters || {}).length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
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
    setSearchParams({
      query: '',
      page: 1,
      limit: 12,
    });
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

  // Memoized results
  const products = useMemo(() => {
    if (searchResult) return searchResult.products;
    if (popularProducts) return popularProducts;
    return [];
  }, [searchResult, popularProducts]);

  const hasResults = products.length > 0;
  const isSearchActive = !!(searchParams.query || searchParams.filters);

  return {
    // Search state
    searchParams,
    query: searchParams.query || '',
    filters: searchParams.filters,
    sort: searchParams.sort,
    page: searchParams.page || 1,
    
    // Results
    products,
    searchResult,
    popularProducts,
    categories: categories || [],
    hasResults,
    isSearchActive,
    
    // Loading states
    isLoading: isLoading || isLoadingPopular,
    error,
    
    // Actions
    setQuery,
    setFilters,
    setSort,
    setPage,
    clearSearch,
    refetch,
    
    // Usage info
    canSearch: canUseFeature('crossPlatformSearch'),
    remainingSearches: getRemainingUsage('crossPlatformSearch'),
  };
}