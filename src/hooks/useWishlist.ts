import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  WishlistItem, 
  WishlistCollection, 
  WishlistStats, 
  WishlistFilters, 
  WishlistSort,
  WishlistItemUpdate,
  PriceDropAlert
} from '../types/wishlist';
import { toast } from 'react-hot-toast';

export function useWishlist() {
  const [filters, setFilters] = useState<WishlistFilters>({});
  const [sort, setSort] = useState<WishlistSort>({ field: 'addedAt', direction: 'desc' });
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();

  // Get user's wishlist items
  const {
    data: wishlistItems,
    isLoading: isLoadingItems,
    error: itemsError,
  } = useQuery({
    queryKey: ['wishlist', 'items', filters, sort, selectedCollection],
    queryFn: async (): Promise<WishlistItem[]> => {
      const params = {
        ...filters,
        sort: `${sort.field}:${sort.direction}`,
        collectionId: selectedCollection,
      };
      
      const response = await api.get('/api/wishlist/items', { params });
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get user's wishlist collections
  const {
    data: collections,
    isLoading: isLoadingCollections,
  } = useQuery({
    queryKey: ['wishlist', 'collections'],
    queryFn: async (): Promise<WishlistCollection[]> => {
      const response = await api.get('/api/wishlist/collections');
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Get wishlist statistics
  const {
    data: stats,
    isLoading: isLoadingStats,
  } = useQuery({
    queryKey: ['wishlist', 'stats'],
    queryFn: async (): Promise<WishlistStats> => {
      const response = await api.get('/api/wishlist/stats');
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  // Get price drop alerts
  const {
    data: priceDrops,
    isLoading: isLoadingPriceDrops,
  } = useQuery({
    queryKey: ['wishlist', 'price-drops'],
    queryFn: async (): Promise<PriceDropAlert[]> => {
      const response = await api.get('/api/wishlist/price-drops');
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Add item to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: async (data: { 
      productId: string; 
      collectionId?: string; 
      notes?: string; 
      priority?: 'low' | 'medium' | 'high';
      targetPrice?: number;
    }) => {
      const response = await api.post('/api/wishlist/items', data);
      return response.data;
    },
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Added to wishlist!');
    },
    onError: (error: any) => {
      console.error('Failed to add to wishlist:', error);
      if (error.response?.status === 409) {
        toast.error('Item already in wishlist');
      } else {
        toast.error('Failed to add to wishlist');
      }
    },
  });

  // Remove item from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await api.delete(`/api/wishlist/items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Removed from wishlist');
    },
    onError: (error: any) => {
      console.error('Failed to remove from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    },
  });

  // Update wishlist item mutation
  const updateWishlistItemMutation = useMutation({
    mutationFn: async ({ itemId, updates }: { itemId: string; updates: WishlistItemUpdate }) => {
      const response = await api.put(`/api/wishlist/items/${itemId}`, updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Wishlist item updated');
    },
    onError: (error: any) => {
      console.error('Failed to update wishlist item:', error);
      toast.error('Failed to update wishlist item');
    },
  });

  // Create collection mutation
  const createCollectionMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string; isPublic?: boolean }) => {
      const response = await api.post('/api/wishlist/collections', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', 'collections'] });
      toast.success('Collection created!');
    },
    onError: (error: any) => {
      console.error('Failed to create collection:', error);
      toast.error('Failed to create collection');
    },
  });

  // Delete collection mutation
  const deleteCollectionMutation = useMutation({
    mutationFn: async (collectionId: string) => {
      await api.delete(`/api/wishlist/collections/${collectionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Collection deleted');
    },
    onError: (error: any) => {
      console.error('Failed to delete collection:', error);
      toast.error('Failed to delete collection');
    },
  });

  // Mark price drop as read mutation
  const markPriceDropReadMutation = useMutation({
    mutationFn: async (alertId: string) => {
      await api.put(`/api/wishlist/price-drops/${alertId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', 'price-drops'] });
    },
    onError: (error: any) => {
      console.error('Failed to mark price drop as read:', error);
    },
  });

  // Helper functions
  const addToWishlist = useCallback(async (
    productId: string, 
    options?: { 
      collectionId?: string; 
      notes?: string; 
      priority?: 'low' | 'medium' | 'high';
      targetPrice?: number;
    }
  ) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to your wishlist');
      return;
    }

    try {
      await addToWishlistMutation.mutateAsync({
        productId,
        ...options,
      });
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      throw error;
    }
  }, [isAuthenticated, addToWishlistMutation]);

  const removeFromWishlist = useCallback(async (itemId: string) => {
    try {
      await removeFromWishlistMutation.mutateAsync(itemId);
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      throw error;
    }
  }, [removeFromWishlistMutation]);

  const updateWishlistItem = useCallback(async (itemId: string, updates: WishlistItemUpdate) => {
    try {
      await updateWishlistItemMutation.mutateAsync({ itemId, updates });
    } catch (error) {
      console.error('Failed to update wishlist item:', error);
      throw error;
    }
  }, [updateWishlistItemMutation]);

  const createCollection = useCallback(async (name: string, description?: string, isPublic = false) => {
    try {
      await createCollectionMutation.mutateAsync({ name, description, isPublic });
    } catch (error) {
      console.error('Failed to create collection:', error);
      throw error;
    }
  }, [createCollectionMutation]);

  const deleteCollection = useCallback(async (collectionId: string) => {
    try {
      await deleteCollectionMutation.mutateAsync(collectionId);
    } catch (error) {
      console.error('Failed to delete collection:', error);
      throw error;
    }
  }, [deleteCollectionMutation]);

  const isInWishlist = useCallback((productId: string): boolean => {
    return wishlistItems?.some(item => item.productId === productId) || false;
  }, [wishlistItems]);

  const getWishlistItem = useCallback((productId: string): WishlistItem | undefined => {
    return wishlistItems?.find(item => item.productId === productId);
  }, [wishlistItems]);

  const markPriceDropAsRead = useCallback(async (alertId: string) => {
    try {
      await markPriceDropReadMutation.mutateAsync(alertId);
    } catch (error) {
      console.error('Failed to mark price drop as read:', error);
    }
  }, [markPriceDropReadMutation]);

  // Filter and sort functions
  const updateFilters = useCallback((newFilters: WishlistFilters) => {
    setFilters(newFilters);
  }, []);

  const updateSort = useCallback((newSort: WishlistSort) => {
    setSort(newSort);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    // Data
    wishlistItems: wishlistItems || [],
    collections: collections || [],
    stats,
    priceDrops: priceDrops || [],
    
    // Loading states
    isLoadingItems,
    isLoadingCollections,
    isLoadingStats,
    isLoadingPriceDrops,
    
    // Error states
    itemsError,
    
    // Filter and sort
    filters,
    sort,
    selectedCollection,
    setSelectedCollection,
    updateFilters,
    updateSort,
    clearFilters,
    
    // Actions
    addToWishlist,
    removeFromWishlist,
    updateWishlistItem,
    createCollection,
    deleteCollection,
    markPriceDropAsRead,
    
    // Helper functions
    isInWishlist,
    getWishlistItem,
    
    // Mutation states
    isAddingToWishlist: addToWishlistMutation.isPending,
    isRemovingFromWishlist: removeFromWishlistMutation.isPending,
    isUpdatingItem: updateWishlistItemMutation.isPending,
    isCreatingCollection: createCollectionMutation.isPending,
    isDeletingCollection: deleteCollectionMutation.isPending,
    
    // Authentication
    isAuthenticated,
  };
}