import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { api } from '../lib/api';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Product, ScanResult } from '../types/product';

export function useScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [currentBarcode, setCurrentBarcode] = useState<string>('');
  const [scanHistory, setScanHistory] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const { canUseFeature, incrementUsage, getRemainingUsage } = useSubscription();

  // Query for product by barcode
  const {
    data: product,
    isLoading: isLoadingProduct,
    error: productError,
  } = useQuery({
    queryKey: ['product', 'barcode', currentBarcode],
    queryFn: async () => {
      if (!currentBarcode) return null;
      
      try {
        const response = await api.get(`/api/products/barcode/${currentBarcode}`);
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null; // Product not found
        }
        throw error;
      }
    },
    enabled: !!currentBarcode,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation for creating new product
  const createProductMutation = useMutation({
    mutationFn: async (productData: Partial<Product>) => {
      const response = await api.post('/api/products', productData);
      return response.data;
    },
    onSuccess: (newProduct) => {
      queryClient.setQueryData(['product', 'barcode', newProduct.barcode], newProduct);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('New product added to database');
    },
    onError: (error: any) => {
      console.error('Failed to create product:', error);
      toast.error('Failed to add product to database');
    },
  });

  // Mutation for updating product
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Product> & { id: string }) => {
      const response = await api.put(`/api/products/${id}`, updates);
      return response.data;
    },
    onSuccess: (updatedProduct) => {
      queryClient.setQueryData(['product', updatedProduct.id], updatedProduct);
      queryClient.setQueryData(['product', 'barcode', updatedProduct.barcode], updatedProduct);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully');
    },
    onError: (error: any) => {
      console.error('Failed to update product:', error);
      toast.error('Failed to update product');
    },
  });

  const startScanning = useCallback(() => {
    setIsScanning(true);
  }, []);

  const stopScanning = useCallback(() => {
    setIsScanning(false);
  }, []);

  const handleBarcodeDetected = useCallback(async (barcode: string) => {
    console.log('Barcode detected:', barcode);
    
    // Check usage limits
    if (!canUseFeature('scan')) {
      const remaining = getRemainingUsage('scan');
      toast.error(`Scan limit reached. You have ${remaining} scans remaining this month. Upgrade to Premium for unlimited scans.`);
      setIsScanning(false);
      return;
    }
    
    // Validate barcode format (basic validation)
    if (!/^\d{8,14}$/.test(barcode)) {
      toast.error('Invalid barcode format. Please try again.');
      return;
    }

    try {
      // Increment usage
      await incrementUsage('scan');
      
      setCurrentBarcode(barcode);
      setScanHistory(prev => {
        const newHistory = [barcode, ...prev.filter(b => b !== barcode)];
        return newHistory.slice(0, 10); // Keep last 10 scans
      });
      
      const remaining = getRemainingUsage('scan');
      if (remaining !== 'unlimited' && remaining <= 1) {
        toast.success(`Barcode scanned! ${remaining} scans remaining this month.`);
      } else {
        toast.success(`Barcode scanned: ${barcode}`);
      }
      
      setIsScanning(false);
    } catch (error) {
      toast.error('Scan limit reached. Please upgrade your plan.');
      setIsScanning(false);
    }
  }, [canUseFeature, incrementUsage, getRemainingUsage]);

  const clearCurrentScan = useCallback(() => {
    setCurrentBarcode('');
  }, []);

  const rescanBarcode = useCallback((barcode: string) => {
    setCurrentBarcode(barcode);
    queryClient.invalidateQueries({ queryKey: ['product', 'barcode', barcode] });
  }, [queryClient]);

  const addProductManually = useCallback(async (productData: Omit<Product, 'id'>) => {
    try {
      await createProductMutation.mutateAsync(productData);
    } catch (error) {
      console.error('Failed to add product manually:', error);
      throw error;
    }
  }, [createProductMutation]);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    try {
      await updateProductMutation.mutateAsync({ id, ...updates });
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  }, [updateProductMutation]);

  const getScanResult = useCallback((): ScanResult | null => {
    if (!currentBarcode) return null;
    
    return {
      barcode: currentBarcode,
      product: product || undefined,
      isNewProduct: !product,
    };
  }, [currentBarcode, product]);

  return {
    // State
    isScanning,
    currentBarcode,
    scanHistory,
    product,
    isLoadingProduct,
    productError,
    
    // Actions
    startScanning,
    stopScanning,
    handleBarcodeDetected,
    clearCurrentScan,
    rescanBarcode,
    addProductManually,
    updateProduct,
    getScanResult,
    
    // Mutation states
    isCreatingProduct: createProductMutation.isPending,
    isUpdatingProduct: updateProductMutation.isPending,
  };
}