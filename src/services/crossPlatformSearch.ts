interface ProductMatch {
  platform: string;
  url: string;
  title: string;
  price: number;
  currency: string;
  imageUrl?: string;
  seller: string;
  sellerRating?: number;
  shippingCost?: number;
  availability: 'in_stock' | 'out_of_stock' | 'limited' | 'preorder';
  matchConfidence: number; // 0-100% how confident this is the same product
  priceRank: 'lowest' | 'competitive' | 'average' | 'high' | 'suspicious';
  lastUpdated: string;
  features?: string[];
  reviews?: {
    count: number;
    averageRating: number;
  };
}

interface CrossPlatformAnalysis {
  originalProduct: {
    url: string;
    title: string;
    price?: number;
    platform: string;
  };
  matches: ProductMatch[];
  priceAnalysis: {
    lowestPrice: number;
    highestPrice: number;
    averagePrice: number;
    priceSpread: number;
    suspiciouslyLowCount: number;
    suspiciouslyHighCount: number;
  };
  authenticityFlags: {
    identicalImages: string[]; // URLs with same product images
    similarTitles: string[]; // Products with very similar titles
    priceOutliers: string[]; // Products with suspicious pricing
    dropshipIndicators: string[]; // Likely dropshipped versions
  };
  recommendations: {
    bestValue: ProductMatch | null;
    mostTrusted: ProductMatch | null;
    fastest: ProductMatch | null;
    warnings: string[];
  };
  totalMatches: number;
  searchConfidence: number; // How confident we are in the search results
}

interface SearchQuery {
  productName: string;
  barcode?: string;
  category?: string;
  brand?: string;
  model?: string;
  imageUrl?: string;
  originalPrice?: number;
  features?: string[];
}

class CrossPlatformSearchService {
  private platforms = [
    {
      name: 'Amazon',
      domains: ['amazon.com', 'amazon.co.uk', 'amazon.de', 'amazon.fr'],
      searchEndpoint: '/api/search/amazon',
      trustScore: 95,
    },
    {
      name: 'eBay', 
      domains: ['ebay.com', 'ebay.co.uk', 'ebay.de'],
      searchEndpoint: '/api/search/ebay',
      trustScore: 80,
    },
    {
      name: 'Etsy',
      domains: ['etsy.com'],
      searchEndpoint: '/api/search/etsy',
      trustScore: 85,
    },
    {
      name: 'AliExpress',
      domains: ['aliexpress.com'],
      searchEndpoint: '/api/search/aliexpress',
      trustScore: 60,
    },
    {
      name: 'Walmart',
      domains: ['walmart.com'],
      searchEndpoint: '/api/search/walmart',
      trustScore: 90,
    },
    {
      name: 'Target',
      domains: ['target.com'],
      searchEndpoint: '/api/search/target',
      trustScore: 90,
    },
  ];

  async searchAcrossPlatforms(originalUrl: string, searchQuery: SearchQuery): Promise<CrossPlatformAnalysis> {
    try {
      console.log('Starting cross-platform search for:', searchQuery);
      
      // Extract platform from original URL
      const originalPlatform = this.extractPlatform(originalUrl);
      
      // Perform parallel searches across platforms
      const searchPromises = this.platforms
        .filter(platform => platform.name !== originalPlatform) // Exclude original platform
        .map(platform => this.searchPlatform(platform, searchQuery));
      
      const searchResults = await Promise.allSettled(searchPromises);
      
      // Combine results from all platforms
      const allMatches: ProductMatch[] = [];
      searchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          allMatches.push(...result.value);
        } else {
          console.warn(`Search failed for ${this.platforms[index].name}:`, result);
        }
      });
      
      // Analyze and rank results
      const analysis = await this.analyzeResults(originalUrl, searchQuery, allMatches);
      
      return analysis;
      
    } catch (error) {
      console.error('Cross-platform search failed:', error);
      throw new Error('Failed to search across platforms');
    }
  }

  private async searchPlatform(platform: any, query: SearchQuery): Promise<ProductMatch[]> {
    // In a real implementation, this would call actual platform APIs
    // For now, simulate realistic search results
    
    const mockResults = await this.generateMockResults(platform, query);
    return mockResults;
  }

  private async generateMockResults(platform: any, query: SearchQuery): Promise<ProductMatch[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    const basePrice = query.originalPrice || 29.99;
    const results: ProductMatch[] = [];
    
    // Generate 1-5 mock results per platform
    const numResults = Math.floor(Math.random() * 5) + 1;
    
    for (let i = 0; i < numResults; i++) {
      const priceVariation = (Math.random() - 0.5) * 0.4; // ±20% price variation
      const price = basePrice * (1 + priceVariation);
      
      // Add some realistic pricing patterns
      let priceRank: ProductMatch['priceRank'] = 'competitive';
      if (price < basePrice * 0.7) priceRank = 'suspicious';
      else if (price < basePrice * 0.85) priceRank = 'lowest';
      else if (price > basePrice * 1.3) priceRank = 'high';
      else if (price > basePrice * 1.15) priceRank = 'average';
      
      // Calculate match confidence based on platform and price similarity
      let matchConfidence = 70 + Math.random() * 25; // Base 70-95%
      if (platform.name === 'AliExpress' && priceRank === 'suspicious') {
        matchConfidence -= 20; // Lower confidence for suspiciously cheap AliExpress items
      }
      
      results.push({
        platform: platform.name,
        url: `https://${platform.domains[0]}/product/${i + 1}`,
        title: this.generateVariedTitle(query.productName, platform.name),
        price: Math.round(price * 100) / 100,
        currency: 'USD',
        imageUrl: `https://example.com/image${i + 1}.jpg`,
        seller: this.generateSellerName(platform.name),
        sellerRating: Math.random() > 0.3 ? Math.round((3.5 + Math.random() * 1.5) * 10) / 10 : undefined,
        availability: Math.random() > 0.2 ? 'in_stock' : 'limited',
        matchConfidence: Math.round(matchConfidence),
        priceRank,
        lastUpdated: new Date().toISOString(),
        reviews: Math.random() > 0.3 ? {
          count: Math.floor(Math.random() * 500) + 10,
          averageRating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
        } : undefined,
      });
    }
    
    return results;
  }

  private generateVariedTitle(originalTitle: string, platform: string): string {
    const variations = [
      originalTitle,
      originalTitle.replace(/\b\w+\b/g, (word) => Math.random() > 0.8 ? word.toUpperCase() : word),
      originalTitle + ' - ' + platform + ' Exclusive',
      originalTitle.split(' ').reverse().join(' '),
      originalTitle + ' (Premium Quality)',
    ];
    
    return variations[Math.floor(Math.random() * variations.length)];
  }

  private generateSellerName(platform: string): string {
    const sellerNames = {
      Amazon: ['Amazon', 'TechStore Plus', 'Global Electronics', 'Prime Seller'],
      eBay: ['PowerSeller123', 'ElectronicsWorld', 'TechDeals4U', 'RetailMaster'],
      Etsy: ['HandmadeCreations', 'ArtisanCrafts', 'UniqueFinds', 'CreativeMakers'],
      AliExpress: ['Tech Direct Store', 'Global Supplier', 'Electronics Plaza', 'Direct Factory'],
      Walmart: ['Walmart', 'Third Party Seller', 'Electronics Depot'],
      Target: ['Target', 'Tech Solutions', 'Digital Store'],
    };
    
    const names = sellerNames[platform as keyof typeof sellerNames] || ['Generic Store'];
    return names[Math.floor(Math.random() * names.length)];
  }

  private async analyzeResults(originalUrl: string, query: SearchQuery, matches: ProductMatch[]): Promise<CrossPlatformAnalysis> {
    // Calculate price analysis
    const prices = matches.map(m => m.price);
    const priceAnalysis = {
      lowestPrice: Math.min(...prices, query.originalPrice || Infinity),
      highestPrice: Math.max(...prices, query.originalPrice || 0),
      averagePrice: prices.reduce((a, b) => a + b, 0) / prices.length || 0,
      priceSpread: Math.max(...prices) - Math.min(...prices),
      suspiciouslyLowCount: matches.filter(m => m.priceRank === 'suspicious').length,
      suspiciouslyHighCount: matches.filter(m => m.priceRank === 'high').length,
    };
    
    // Detect authenticity flags
    const authenticityFlags = {
      identicalImages: this.findIdenticalImages(matches),
      similarTitles: this.findSimilarTitles(matches, query.productName),
      priceOutliers: matches.filter(m => m.priceRank === 'suspicious').map(m => m.url),
      dropshipIndicators: matches.filter(m => 
        m.platform === 'AliExpress' || 
        (m.price < priceAnalysis.averagePrice * 0.6)
      ).map(m => m.url),
    };
    
    // Generate recommendations
    const recommendations = {
      bestValue: this.findBestValue(matches),
      mostTrusted: this.findMostTrusted(matches),
      fastest: this.findFastest(matches),
      warnings: this.generateWarnings(matches, authenticityFlags),
    };
    
    return {
      originalProduct: {
        url: originalUrl,
        title: query.productName,
        price: query.originalPrice,
        platform: this.extractPlatform(originalUrl),
      },
      matches: matches.sort((a, b) => b.matchConfidence - a.matchConfidence),
      priceAnalysis,
      authenticityFlags,
      recommendations,
      totalMatches: matches.length,
      searchConfidence: this.calculateSearchConfidence(matches, query),
    };
  }

  private findIdenticalImages(matches: ProductMatch[]): string[] {
    // In a real implementation, this would use image similarity detection
    const imageGroups: { [key: string]: string[] } = {};
    
    matches.forEach(match => {
      if (match.imageUrl) {
        const imageHash = match.imageUrl.split('/').pop() || '';
        if (!imageGroups[imageHash]) imageGroups[imageHash] = [];
        imageGroups[imageHash].push(match.url);
      }
    });
    
    // Return URLs that share identical images
    return Object.values(imageGroups)
      .filter(group => group.length > 1)
      .flat();
  }

  private findSimilarTitles(matches: ProductMatch[], originalTitle: string): string[] {
    return matches
      .filter(match => {
        const similarity = this.calculateTitleSimilarity(match.title, originalTitle);
        return similarity > 0.8; // 80% similarity threshold
      })
      .map(match => match.url);
  }

  private calculateTitleSimilarity(title1: string, title2: string): number {
    const words1 = title1.toLowerCase().split(/\s+/);
    const words2 = title2.toLowerCase().split(/\s+/);
    const commonWords = words1.filter(word => words2.includes(word));
    
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  private findBestValue(matches: ProductMatch[]): ProductMatch | null {
    if (matches.length === 0) return null;
    
    // Score based on price, trust, and match confidence
    return matches.reduce((best, current) => {
      const bestScore = (best.matchConfidence * 0.4) + 
                       (this.getPlatformTrust(best.platform) * 0.3) +
                       ((100 - this.getPriceRank(best.priceRank)) * 0.3);
      
      const currentScore = (current.matchConfidence * 0.4) + 
                          (this.getPlatformTrust(current.platform) * 0.3) +
                          ((100 - this.getPriceRank(current.priceRank)) * 0.3);
      
      return currentScore > bestScore ? current : best;
    });
  }

  private findMostTrusted(matches: ProductMatch[]): ProductMatch | null {
    if (matches.length === 0) return null;
    
    return matches.reduce((most, current) => {
      const mostTrust = this.getPlatformTrust(most.platform) + (most.sellerRating || 0) * 10;
      const currentTrust = this.getPlatformTrust(current.platform) + (current.sellerRating || 0) * 10;
      
      return currentTrust > mostTrust ? current : most;
    });
  }

  private findFastest(matches: ProductMatch[]): ProductMatch | null {
    // In a real implementation, this would consider shipping times
    // For now, prioritize Amazon Prime and domestic sellers
    return matches.find(m => m.platform === 'Amazon') || 
           matches.find(m => m.platform === 'Walmart') ||
           matches[0] || null;
  }

  private generateWarnings(matches: ProductMatch[], flags: any): string[] {
    const warnings: string[] = [];
    
    if (flags.suspiciouslyLowCount > 0) {
      warnings.push(`${flags.suspiciouslyLowCount} products found with suspiciously low prices`);
    }
    
    if (flags.dropshipIndicators.length > 2) {
      warnings.push('Multiple dropshipped versions detected - quality may vary');
    }
    
    if (flags.identicalImages.length > 1) {
      warnings.push('Identical product images found across platforms - possible counterfeit risk');
    }
    
    const lowConfidenceMatches = matches.filter(m => m.matchConfidence < 70).length;
    if (lowConfidenceMatches > matches.length * 0.5) {
      warnings.push('Many low-confidence matches found - verify product details carefully');
    }
    
    return warnings;
  }

  private getPlatformTrust(platform: string): number {
    const platformData = this.platforms.find(p => p.name === platform);
    return platformData?.trustScore || 50;
  }

  private getPriceRank(rank: ProductMatch['priceRank']): number {
    const rankings = {
      suspicious: 90,
      high: 80,
      average: 50,
      competitive: 20,
      lowest: 10,
    };
    return rankings[rank] || 50;
  }

  private calculateSearchConfidence(matches: ProductMatch[], query: SearchQuery): number {
    if (matches.length === 0) return 0;
    
    const avgMatchConfidence = matches.reduce((sum, m) => sum + m.matchConfidence, 0) / matches.length;
    const platformDiversity = new Set(matches.map(m => m.platform)).size;
    const hasHighConfidenceMatches = matches.some(m => m.matchConfidence > 85);
    
    let confidence = avgMatchConfidence * 0.6;
    confidence += platformDiversity * 5; // Bonus for platform diversity
    confidence += hasHighConfidenceMatches ? 15 : 0; // Bonus for high confidence matches
    
    return Math.min(100, Math.round(confidence));
  }

  private extractPlatform(url: string): string {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      const platform = this.platforms.find(p => 
        p.domains.some(domain => hostname.includes(domain))
      );
      return platform?.name || 'Unknown';
    } catch {
      return 'Unknown';
    }
  }

  // Public method to get platform suggestions for manual search
  getSupportedPlatforms(): string[] {
    return this.platforms.map(p => p.name);
  }

  // Public method to analyze a single product for cross-platform presence
  async analyzeProductPresence(productData: any): Promise<{ 
    likelyOrigin: string;
    distributionPattern: string;
    authenticityRisk: 'low' | 'medium' | 'high';
    recommendations: string[];
  }> {
    // Analyze distribution patterns to determine likely origin and authenticity
    const platforms = productData.stores?.map((store: any) => this.extractPlatform(store.url)) || [];
    const uniquePlatforms = new Set(platforms);
    
    let likelyOrigin = 'Unknown';
    let distributionPattern = 'Limited';
    let authenticityRisk: 'low' | 'medium' | 'high' = 'low';
    const recommendations: string[] = [];
    
    if (uniquePlatforms.has('AliExpress') && uniquePlatforms.size > 3) {
      likelyOrigin = 'Mass Production/Dropship';
      distributionPattern = 'Wide Distribution';
      authenticityRisk = 'medium';
      recommendations.push('Verify product quality before purchase');
      recommendations.push('Check for original manufacturer');
    } else if (uniquePlatforms.has('Etsy') && uniquePlatforms.size === 1) {
      likelyOrigin = 'Handmade/Artisan';
      distributionPattern = 'Exclusive';
      authenticityRisk = 'low';
      recommendations.push('Authentic handmade product likely');
    } else if (uniquePlatforms.has('Amazon') && uniquePlatforms.has('Walmart')) {
      likelyOrigin = 'Retail/Brand';
      distributionPattern = 'Standard Retail';
      authenticityRisk = 'low';
      recommendations.push('Legitimate retail product');
    }
    
    return {
      likelyOrigin,
      distributionPattern,
      authenticityRisk,
      recommendations,
    };
  }
}

export const crossPlatformSearch = new CrossPlatformSearchService();
export type { CrossPlatformAnalysis, ProductMatch, SearchQuery };