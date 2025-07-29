import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useSubscription } from '../contexts/SubscriptionContext';
import { PriceComparisonData, PriceAlert, PriceTrend, PriceComparisonFilters, PriceComparisonSort } from '../types/priceComparison';
import { toast } from 'react-hot-toast';

export function usePriceComparison(productId?: string) {
  const [filters, setFilters] = useState<PriceComparisonFilters>({});
  const [sort, setSort] = useState<PriceComparisonSort>({ field: 'price', direction: 'asc' });
  const queryClient = useQueryClient();
  const { canUseFeature, incrementUsage, getRemainingUsage } = useSubscription();

  // Get price comparison data for a specific product
  const {
    data: priceComparison,
    isLoading: isLoadingComparison,
    error: comparisonError,
    refetch: refetchComparison,
  } = useQuery({
    queryKey: ['price-comparison', productId, filters, sort],
    queryFn: async (): Promise<PriceComparisonData> => {
      if (!productId) throw new Error('Product ID is required');
      
      // Check usage limits
      if (!canUseFeature('crossPlatformSearch')) {
        const remaining = getRemainingUsage('crossPlatformSearch');
        throw new Error(`Price comparison limit reached. You have ${remaining} comparisons remaining this month.`);
      }

      try {
        await incrementUsage('crossPlatformSearch');
        
        const response = await api.get(`/api/products/${productId}/price-comparison`, {
          params: { ...filters, sort: `${sort.field}:${sort.direction}` },
        });
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 429) {
          throw new Error('Price comparison limit reached. Please upgrade your plan.');
        }
        throw error;
      }
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get price trend data
  const {
    data: priceTrend,
    isLoading: isLoadingTrend,
  } = useQuery({
    queryKey: ['price-trend', productId],
    queryFn: async (): Promise<PriceTrend[]> => {
      if (!productId) throw new Error('Product ID is required');
      
      const response = await api.get(`/api/products/${productId}/price-trend`);
      return response.data;
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Get user's price alerts for this product
  const {
    data: priceAlerts,
    isLoading: isLoadingAlerts,
  } = useQuery({
    queryKey: ['price-alerts', productId],
    queryFn: async (): Promise<PriceAlert[]> => {
      if (!productId) return [];
      
      const response = await api.get(`/api/price-alerts`, {
        params: { productId },
      });
      return response.data;
    },
    enabled: !!productId,
  });

  // Create price alert mutation
  const createAlertMutation = useMutation({
    mutationFn: async (alertData: { productId: string; targetPrice: number; storeName?: string }) => {
      const response = await api.post('/api/price-alerts', alertData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-alerts', productId] });
      toast.success('Price alert created successfully!');
    },
    onError: (error: any) => {
      console.error('Failed to create price alert:', error);
      toast.error('Failed to create price alert');
    },
  });

  // Delete price alert mutation
  const deleteAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      await api.delete(`/api/price-alerts/${alertId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-alerts', productId] });
      toast.success('Price alert deleted');
    },
    onError: (error: any) => {
      console.error('Failed to delete price alert:', error);
      toast.error('Failed to delete price alert');
    },
  });

  // Update filters
  const updateFilters = useCallback((newFilters: PriceComparisonFilters) => {
    setFilters(newFilters);
  }, []);

  // Update sort
  const updateSort = useCallback((newSort: PriceComparisonSort) => {
    setSort(newSort);
  }, []);

  // Create price alert
  const createPriceAlert = useCallback(async (targetPrice: number, storeName?: string) => {
    if (!productId) {
      toast.error('Product ID is required');
      return;
    }

    try {
      await createAlertMutation.mutateAsync({
        productId,
        targetPrice,
        storeName,
      });
    } catch (error) {
      console.error('Failed to create price alert:', error);
      throw error;
    }
  }, [productId, createAlertMutation]);

  // Delete price alert
  const deletePriceAlert = useCallback(async (alertId: string) => {
    try {
      await deleteAlertMutation.mutateAsync(alertId);
    } catch (error) {
      console.error('Failed to delete price alert:', error);
      throw error;
    }
  }, [deleteAlertMutation]);

  // Get best deal information
  const bestDeal = priceComparison?.stores.reduce((best, store) => {
    if (!store.inStock) return best;
    
    const totalCost = store.price + (store.shipping?.free ? 0 : store.shipping?.cost || 0);
    const bestTotalCost = best.price + (best.shipping?.free ? 0 : best.shipping?.cost || 0);
    
    return totalCost < bestTotalCost ? store : best;
  }, priceComparison?.stores[0]);

  // Calculate potential savings
  const potentialSavings = priceComparison && bestDeal ? {
    amount: priceComparison.averagePrice - bestDeal.price,
    percentage: ((priceComparison.averagePrice - bestDeal.price) / priceComparison.averagePrice) * 100,
    storeName: bestDeal.name,
  } : null;

  return {
    // Data
    priceComparison,
    priceTrend,
    priceAlerts: priceAlerts || [],
    bestDeal,
    potentialSavings,
    
    // Loading states
    isLoadingComparison,
    isLoadingTrend,
    isLoadingAlerts,
    
    // Error states
    comparisonError,
    
    // Filter and sort
    filters,
    sort,
    updateFilters,
    updateSort,
    
    // Actions
    createPriceAlert,
    deletePriceAlert,
    refetchComparison,
    
    // Mutation states
    isCreatingAlert: createAlertMutation.isPending,
    isDeletingAlert: deleteAlertMutation.isPending,
    
    // Usage info
    canUsePriceComparison: canUseFeature('crossPlatformSearch'),
    remainingComparisons: getRemainingUsage('crossPlatformSearch'),
  };
}