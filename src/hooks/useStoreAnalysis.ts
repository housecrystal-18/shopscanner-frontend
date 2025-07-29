import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { storeAnalyzer, ProductAnalysis } from '../services/storeAnalyzer';
import { api } from '../lib/api';
import { useSubscription } from '../contexts/SubscriptionContext';

interface StoreAnalysisHistory {
  id: string;
  url: string;
  analysis: ProductAnalysis;
  timestamp: string;
  productId?: string;
}

export function useStoreAnalysis() {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [analysisHistory, setAnalysisHistory] = useState<StoreAnalysisHistory[]>([]);
  const { canUseFeature, incrementUsage, getRemainingUsage } = useSubscription();

  // Mutation for analyzing store URL
  const analyzeStoreMutation = useMutation({
    mutationFn: async ({ url, productData }: { url: string; productData?: any }) => {
      // Validate URL
      try {
        new URL(url);
      } catch {
        throw new Error('Invalid URL format');
      }

      // Perform local analysis
      const analysis = await storeAnalyzer.analyzeStoreUrl(url, productData);
      
      // Optionally save to backend
      try {
        await api.post('/api/store-analysis', {
          url,
          analysis,
          productData
        });
      } catch (error) {
        console.warn('Failed to save analysis to backend:', error);
        // Continue with local analysis even if backend fails
      }

      return { url, analysis };
    },
    onSuccess: ({ url, analysis }) => {
      const historyEntry: StoreAnalysisHistory = {
        id: Date.now().toString(),
        url,
        analysis,
        timestamp: new Date().toISOString(),
      };
      
      setAnalysisHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // Keep last 10
      toast.success('Store analysis completed');
    },
    onError: (error: any) => {
      console.error('Store analysis failed:', error);
      toast.error(error.message || 'Failed to analyze store');
    },
  });

  // Query for analysis history from backend
  const { data: backendHistory } = useQuery({
    queryKey: ['store-analysis-history'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/store-analysis/history');
        return response.data;
      } catch (error) {
        console.warn('Failed to fetch analysis history:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const analyzeStore = useCallback(async (url: string, productData?: any) => {
    // Check usage limits
    if (!canUseFeature('storeAnalysis')) {
      const remaining = getRemainingUsage('storeAnalysis');
      toast.error(`Store analysis limit reached. You have ${remaining} analyses remaining this month. Upgrade to Premium for unlimited analyses.`);
      throw new Error('Usage limit reached');
    }

    try {
      await incrementUsage('storeAnalysis');
      setCurrentUrl(url);
      return analyzeStoreMutation.mutateAsync({ url, productData });
    } catch (error) {
      toast.error('Analysis limit reached. Please upgrade your plan.');
      throw error;
    }
  }, [analyzeStoreMutation, canUseFeature, incrementUsage, getRemainingUsage]);

  const clearCurrentAnalysis = useCallback(() => {
    setCurrentUrl('');
  }, []);

  const deleteAnalysisFromHistory = useCallback((id: string) => {
    setAnalysisHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  const reanalyzeFromHistory = useCallback((historyItem: StoreAnalysisHistory) => {
    return analyzeStore(historyItem.url);
  }, [analyzeStore]);

  const getAuthenticityInsights = useCallback((analysis: ProductAnalysis) => {
    const insights = [];

    // Product type insights
    switch (analysis.productType) {
      case 'handmade':
        insights.push({
          type: 'positive',
          message: 'Likely authentic handmade product',
          score: 85
        });
        break;
      case 'mass_produced':
        insights.push({
          type: 'neutral',
          message: 'Standard retail product',
          score: 70
        });
        break;
      case 'dropshipped':
        insights.push({
          type: 'warning',
          message: 'Dropshipped product - verify quality',
          score: 40
        });
        break;
      case 'print_on_demand':
        insights.push({
          type: 'neutral',
          message: 'Made-to-order product',
          score: 65
        });
        break;
    }

    // Risk level insights
    switch (analysis.riskFactors.level) {
      case 'low':
        insights.push({
          type: 'positive',
          message: 'Low risk purchase',
          score: 90
        });
        break;
      case 'medium':
        insights.push({
          type: 'warning',
          message: 'Moderate caution advised',
          score: 60
        });
        break;
      case 'high':
        insights.push({
          type: 'negative',
          message: 'High risk - careful consideration needed',
          score: 30
        });
        break;
    }

    // Price insights
    switch (analysis.priceAnalysis.marketPosition) {
      case 'below_market':
        insights.push({
          type: 'warning',
          message: 'Price significantly below market - verify authenticity',
          score: 40
        });
        break;
      case 'market_average':
        insights.push({
          type: 'positive',
          message: 'Competitive market pricing',
          score: 80
        });
        break;
      case 'above_market':
        insights.push({
          type: 'neutral',
          message: 'Premium pricing',
          score: 70
        });
        break;
      case 'premium':
        insights.push({
          type: 'neutral',
          message: 'Luxury/premium product pricing',
          score: 75
        });
        break;
    }

    return insights;
  }, []);

  const generateRecommendations = useCallback((analysis: ProductAnalysis) => {
    const recommendations = [];

    if (analysis.authenticityScore < 50) {
      recommendations.push('Consider purchasing from a more established seller');
      recommendations.push('Look for additional product reviews and ratings');
      recommendations.push('Verify return/refund policies before purchasing');
    }

    if (analysis.productType === 'dropshipped') {
      recommendations.push('Expect longer shipping times');
      recommendations.push('Check if similar products are available locally');
      recommendations.push('Verify seller communication responsiveness');
    }

    if (analysis.riskFactors.level === 'high') {
      recommendations.push('Use secure payment methods');
      recommendations.push('Document the transaction details');
      recommendations.push('Consider alternative suppliers');
    }

    if (analysis.priceAnalysis.marketPosition === 'below_market') {
      recommendations.push('Verify product authenticity before purchase');
      recommendations.push('Check for hidden fees or shipping costs');
      recommendations.push('Compare with other sellers');
    }

    return recommendations;
  }, []);

  return {
    // State
    currentUrl,
    analysisHistory: backendHistory || analysisHistory,
    currentAnalysis: analysisHistory[0]?.analysis,
    
    // Loading states
    isAnalyzing: analyzeStoreMutation.isPending,
    
    // Actions
    analyzeStore,
    clearCurrentAnalysis,
    deleteAnalysisFromHistory,
    reanalyzeFromHistory,
    
    // Utilities
    getAuthenticityInsights,
    generateRecommendations,
  };
}