import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { crossPlatformSearch, CrossPlatformAnalysis, SearchQuery } from '../services/crossPlatformSearch';
import { useSubscription } from '../contexts/SubscriptionContext';

interface SearchHistory {
  id: string;
  query: SearchQuery;
  originalUrl: string;
  analysis: CrossPlatformAnalysis;
  timestamp: string;
}

export function useCrossPlatformSearch() {
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<CrossPlatformAnalysis | null>(null);
  const { canUseFeature, incrementUsage, getRemainingUsage } = useSubscription();

  // Mutation for cross-platform search
  const searchMutation = useMutation({
    mutationFn: async ({ 
      originalUrl, 
      productName, 
      productData 
    }: { 
      originalUrl: string; 
      productName: string; 
      productData?: any;
    }) => {
      const searchQuery: SearchQuery = {
        productName,
        barcode: productData?.barcode,
        category: productData?.category,
        brand: productData?.brand,
        originalPrice: productData?.averagePrice,
        features: productData?.features,
      };

      console.log('Starting cross-platform search...', { originalUrl, searchQuery });
      
      const analysis = await crossPlatformSearch.searchAcrossPlatforms(originalUrl, searchQuery);
      
      // Save to history
      const historyEntry: SearchHistory = {
        id: Date.now().toString(),
        query: searchQuery,
        originalUrl,
        analysis,
        timestamp: new Date().toISOString(),
      };
      
      setSearchHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // Keep last 10
      setCurrentAnalysis(analysis);
      
      return analysis;
    },
    onSuccess: (analysis) => {
      const message = `Found ${analysis.totalMatches} matches across ${new Set(analysis.matches.map(m => m.platform)).size} platforms`;
      toast.success(message);
    },
    onError: (error: any) => {
      console.error('Cross-platform search failed:', error);
      toast.error('Failed to search across platforms');
    },
  });

  // Mutation for analyzing product presence
  const analyzePresenceMutation = useMutation({
    mutationFn: async (productData: any) => {
      return await crossPlatformSearch.analyzeProductPresence(productData);
    },
    onSuccess: (analysis) => {
      toast.success(`Product origin: ${analysis.likelyOrigin}`);
    },
    onError: (error: any) => {
      console.error('Product presence analysis failed:', error);
      toast.error('Failed to analyze product presence');
    },
  });

  const searchAcrossPlatforms = useCallback(async (
    originalUrl: string,
    productName: string,
    productData?: any
  ) => {
    // Check usage limits
    if (!canUseFeature('crossPlatformSearch')) {
      const remaining = getRemainingUsage('crossPlatformSearch');
      toast.error(`Cross-platform search limit reached. You have ${remaining} searches remaining this month. Upgrade to Premium for unlimited searches.`);
      throw new Error('Usage limit reached');
    }

    try {
      await incrementUsage('crossPlatformSearch');
      return searchMutation.mutateAsync({ originalUrl, productName, productData });
    } catch (error) {
      toast.error('Search limit reached. Please upgrade your plan.');
      throw error;
    }
  }, [searchMutation, canUseFeature, incrementUsage, getRemainingUsage]);

  const analyzeProductPresence = useCallback(async (productData: any) => {
    return analyzePresenceMutation.mutateAsync(productData);
  }, [analyzePresenceMutation]);

  const clearCurrentAnalysis = useCallback(() => {
    setCurrentAnalysis(null);
  }, []);

  const loadFromHistory = useCallback((historyItem: SearchHistory) => {
    setCurrentAnalysis(historyItem.analysis);
  }, []);

  const deleteFromHistory = useCallback((id: string) => {
    setSearchHistory(prev => prev.filter(item => item.id !== id));
    if (currentAnalysis && searchHistory.find(item => item.id === id)) {
      setCurrentAnalysis(null);
    }
  }, [currentAnalysis, searchHistory]);

  // Helper functions for analysis insights
  const getPriceInsights = useCallback((analysis: CrossPlatformAnalysis | null) => {
    if (!analysis) return [];

    const insights = [];
    const { priceAnalysis, originalProduct } = analysis;
    
    if (originalProduct.price) {
      const savings = originalProduct.price - priceAnalysis.lowestPrice;
      if (savings > 0) {
        insights.push({
          type: 'positive',
          message: `Save $${savings.toFixed(2)} by choosing the lowest price option`,
          value: savings,
        });
      }
      
      const premiumCost = priceAnalysis.highestPrice - originalProduct.price;
      if (premiumCost > originalProduct.price * 0.5) {
        insights.push({
          type: 'warning',
          message: `Some platforms charge $${premiumCost.toFixed(2)} more for the same product`,
          value: premiumCost,
        });
      }
    }

    if (priceAnalysis.suspiciouslyLowCount > 0) {
      insights.push({
        type: 'warning',
        message: `${priceAnalysis.suspiciouslyLowCount} suspiciously low-priced options found`,
        value: priceAnalysis.suspiciouslyLowCount,
      });
    }

    const priceSpreadPercentage = (priceAnalysis.priceSpread / priceAnalysis.averagePrice) * 100;
    if (priceSpreadPercentage > 50) {
      insights.push({
        type: 'info',
        message: `Large price variation detected (${priceSpreadPercentage.toFixed(0)}% spread)`,
        value: priceSpreadPercentage,
      });
    }

    return insights;
  }, []);

  const getAuthenticityInsights = useCallback((analysis: CrossPlatformAnalysis | null) => {
    if (!analysis) return [];

    const insights = [];
    const { authenticityFlags, matches } = analysis;

    if (authenticityFlags.identicalImages.length > 1) {
      insights.push({
        type: 'warning',
        message: 'Identical product images found across platforms',
        risk: 'medium',
        details: `${authenticityFlags.identicalImages.length} platforms using same images`,
      });
    }

    if (authenticityFlags.dropshipIndicators.length > 0) {
      insights.push({
        type: 'info',
        message: 'Dropshipped versions detected',
        risk: 'low',
        details: `${authenticityFlags.dropshipIndicators.length} likely dropship sources`,
      });
    }

    const lowConfidenceCount = matches.filter(m => m.matchConfidence < 70).length;
    if (lowConfidenceCount > matches.length * 0.4) {
      insights.push({
        type: 'warning',
        message: 'Many uncertain product matches',
        risk: 'medium',
        details: `${lowConfidenceCount} matches with low confidence`,
      });
    }

    const platformDiversity = new Set(matches.map(m => m.platform)).size;
    if (platformDiversity >= 4) {
      insights.push({
        type: 'positive',
        message: 'Product widely available across platforms',
        risk: 'low',
        details: `Found on ${platformDiversity} different platforms`,
      });
    } else if (platformDiversity === 1) {
      insights.push({
        type: 'info',
        message: 'Product only found on one platform',
        risk: 'medium',
        details: 'Limited availability may indicate exclusivity or scarcity',
      });
    }

    return insights;
  }, []);

  const getTopRecommendations = useCallback((analysis: CrossPlatformAnalysis | null) => {
    if (!analysis || analysis.matches.length === 0) return [];

    const recommendations = [];

    if (analysis.recommendations.bestValue) {
      recommendations.push({
        type: 'best_value',
        title: 'Best Value Option',
        product: analysis.recommendations.bestValue,
        reason: 'Optimal balance of price, trust, and match confidence',
      });
    }

    if (analysis.recommendations.mostTrusted) {
      recommendations.push({
        type: 'most_trusted',
        title: 'Most Trusted Seller',
        product: analysis.recommendations.mostTrusted,
        reason: 'Highest platform trust and seller rating',
      });
    }

    if (analysis.recommendations.fastest) {
      recommendations.push({
        type: 'fastest',
        title: 'Fastest Delivery',
        product: analysis.recommendations.fastest,
        reason: 'Likely fastest shipping and delivery',
      });
    }

    // Add lowest price option if different from best value
    const lowestPriceMatch = analysis.matches.reduce((lowest, current) => 
      current.price < lowest.price ? current : lowest
    );
    
    if (lowestPriceMatch && lowestPriceMatch.url !== analysis.recommendations.bestValue?.url) {
      recommendations.push({
        type: 'lowest_price',
        title: 'Lowest Price',
        product: lowestPriceMatch,
        reason: `Save $${(analysis.priceAnalysis.averagePrice - lowestPriceMatch.price).toFixed(2)} vs average`,
      });
    }

    return recommendations.slice(0, 4); // Return top 4 recommendations
  }, []);

  const getSimilarityWarnings = useCallback((analysis: CrossPlatformAnalysis | null) => {
    if (!analysis) return [];

    const warnings = [];

    // Check for potential counterfeits
    const suspiciousMatches = analysis.matches.filter(m => 
      m.priceRank === 'suspicious' && m.matchConfidence > 80
    );
    
    if (suspiciousMatches.length > 0) {
      warnings.push({
        type: 'counterfeit_risk',
        severity: 'high',
        message: 'Potential counterfeit products detected',
        details: `${suspiciousMatches.length} products with suspiciously low prices but high similarity`,
        affectedUrls: suspiciousMatches.map(m => m.url),
      });
    }

    // Check for price manipulation
    const priceRange = analysis.priceAnalysis.highestPrice - analysis.priceAnalysis.lowestPrice;
    if (priceRange > analysis.priceAnalysis.averagePrice) {
      warnings.push({
        type: 'price_manipulation',
        severity: 'medium',
        message: 'Unusual price variations detected',
        details: `Price range of $${priceRange.toFixed(2)} suggests possible price manipulation`,
      });
    }

    // Check for clone products
    const titleSimilarityThreshold = 0.9;
    const potentialClones = analysis.matches.filter(m => {
      const titleWords = m.title.toLowerCase().split(/\s+/);
      const originalWords = analysis.originalProduct.title.toLowerCase().split(/\s+/);
      const similarity = titleWords.filter(word => originalWords.includes(word)).length / Math.max(titleWords.length, originalWords.length);
      return similarity > titleSimilarityThreshold && m.platform === 'AliExpress';
    });

    if (potentialClones.length > 0) {
      warnings.push({
        type: 'clone_products',
        severity: 'medium',
        message: 'Potential clone products found',
        details: `${potentialClones.length} products with very similar names on international platforms`,
        affectedUrls: potentialClones.map(m => m.url),
      });
    }

    return warnings;
  }, []);

  return {
    // State
    currentAnalysis,
    searchHistory,
    isSearching: searchMutation.isPending,
    isAnalyzingPresence: analyzePresenceMutation.isPending,
    
    // Actions
    searchAcrossPlatforms,
    analyzeProductPresence,
    clearCurrentAnalysis,
    loadFromHistory,
    deleteFromHistory,
    
    // Analysis helpers
    getPriceInsights,
    getAuthenticityInsights,
    getTopRecommendations,
    getSimilarityWarnings,
    
    // Utilities
    getSupportedPlatforms: () => crossPlatformSearch.getSupportedPlatforms(),
  };
}