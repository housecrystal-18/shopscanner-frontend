interface ProductAnalysis {
  productType: 'handmade' | 'mass_produced' | 'dropshipped' | 'print_on_demand';
  authenticityScore: number; // 0-100
  confidence: number; // 0-100
  indicators: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
  storeMetadata: {
    platform: string;
    storeName: string;
    storeAge?: string;
    sellerRating?: number;
    totalSales?: number;
    location?: string;
  };
  priceAnalysis: {
    competitiveScore: number; // 0-100
    marketPosition: 'below_market' | 'market_average' | 'above_market' | 'premium';
    similarProductsFound: number;
  };
  riskFactors: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
  };
}

interface StorePatterns {
  [key: string]: {
    platform: string;
    indicators: {
      handmade: string[];
      mass_produced: string[];
      dropshipped: string[];
      print_on_demand: string[];
    };
    trustFactors: string[];
    riskFactors: string[];
  };
}

class StoreAnalyzer {
  private storePatterns: StorePatterns = {
    'etsy.com': {
      platform: 'Etsy',
      indicators: {
        handmade: [
          'handmade', 'handcrafted', 'artisan', 'custom made', 'one of a kind',
          'hand painted', 'hand sewn', 'hand carved', 'artist made', 'unique'
        ],
        mass_produced: [
          'bulk', 'wholesale', 'factory made', 'imported', 'mass production'
        ],
        dropshipped: [
          'ships from china', 'aliexpress', '10-30 days', 'overseas shipping',
          'international seller'
        ],
        print_on_demand: [
          'printed to order', 'custom print', 'personalized', 'print on demand',
          'design printed', 'made to order print'
        ]
      },
      trustFactors: [
        'established shop', 'verified seller', 'high reviews', 'quick response',
        'detailed photos', 'shop policies', 'return policy'
      ],
      riskFactors: [
        'new seller', 'no reviews', 'stock photos', 'unrealistic prices',
        'no shop policies', 'poor english'
      ]
    },
    'amazon.com': {
      platform: 'Amazon',
      indicators: {
        handmade: [
          'amazon handmade', 'artisan', 'handcrafted', 'custom made',
          'made by hand', 'artist created'
        ],
        mass_produced: [
          'brand name', 'manufacturer', 'bulk pack', 'wholesale',
          'factory sealed', 'retail packaging'
        ],
        dropshipped: [
          'fulfilled by merchant', 'ships from overseas', 'long delivery',
          'international shipping', 'china shipping'
        ],
        print_on_demand: [
          'custom print', 'personalized', 'print to order',
          'design service', 'made to order'
        ]
      },
      trustFactors: [
        'amazon choice', 'prime eligible', 'high ratings', 'many reviews',
        'amazon fulfilled', 'established brand'
      ],
      riskFactors: [
        'no brand name', 'few reviews', 'new seller', 'unrealistic claims',
        'poor images', 'suspicious pricing'
      ]
    },
    'shopify.com': {
      platform: 'Shopify Store',
      indicators: {
        handmade: [
          'artisan', 'handmade', 'craft', 'custom', 'bespoke',
          'hand finished', 'artist made'
        ],
        mass_produced: [
          'brand', 'manufacturer', 'wholesale', 'retail',
          'factory direct', 'bulk order'
        ],
        dropshipped: [
          'aliexpress', 'overseas', 'dropship', '2-4 weeks delivery',
          'international supplier', 'import'
        ],
        print_on_demand: [
          'print on demand', 'custom design', 'personalized',
          'made to order', 'printed fresh'
        ]
      },
      trustFactors: [
        'established domain', 'ssl certificate', 'clear policies',
        'contact information', 'professional design'
      ],
      riskFactors: [
        'new domain', 'no contact info', 'suspicious payment methods',
        'no return policy', 'poor website design'
      ]
    },
    'ebay.com': {
      platform: 'eBay',
      indicators: {
        handmade: [
          'handmade', 'ooak', 'artisan', 'craft', 'custom made',
          'hand painted', 'artist created'
        ],
        mass_produced: [
          'new with tags', 'retail', 'brand new', 'factory sealed',
          'wholesale lot', 'bulk'
        ],
        dropshipped: [
          'dropship', 'no handling time', 'overseas seller',
          'long shipping', 'international'
        ],
        print_on_demand: [
          'custom print', 'personalized', 'print to order',
          'design service'
        ]
      },
      trustFactors: [
        'top rated seller', 'high feedback', 'established account',
        'detailed photos', 'clear description'
      ],
      riskFactors: [
        'new seller', 'low feedback', 'stock photos',
        'vague description', 'unrealistic pricing'
      ]
    }
  };

  async analyzeStoreUrl(url: string, productData?: any): Promise<ProductAnalysis> {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');
      
      // Get store pattern or use generic analysis
      const storePattern = this.storePatterns[domain] || this.getGenericPattern(domain);
      
      // Fetch and analyze page content
      const pageContent = await this.fetchPageContent(url);
      
      // Analyze product type
      const productType = this.determineProductType(pageContent, storePattern);
      
      // Calculate authenticity score
      const authenticityScore = this.calculateAuthenticityScore(
        pageContent, 
        storePattern, 
        productType,
        productData
      );
      
      // Analyze indicators
      const indicators = this.analyzeIndicators(pageContent, storePattern);
      
      // Extract store metadata
      const storeMetadata = this.extractStoreMetadata(pageContent, storePattern);
      
      // Analyze pricing
      const priceAnalysis = this.analyzePricing(pageContent, productData);
      
      // Assess risk factors
      const riskFactors = this.assessRiskFactors(pageContent, storePattern, authenticityScore);
      
      return {
        productType,
        authenticityScore,
        confidence: this.calculateConfidence(pageContent, storePattern),
        indicators,
        storeMetadata,
        priceAnalysis,
        riskFactors
      };
      
    } catch (error) {
      console.error('Store analysis error:', error);
      throw new Error('Failed to analyze store URL');
    }
  }

  private async fetchPageContent(url: string): Promise<string> {
    // In a real implementation, this would fetch the page content
    // For now, we'll simulate with URL analysis
    return `Mock content for ${url}`;
  }

  private getGenericPattern(domain: string) {
    return {
      platform: 'Unknown Store',
      indicators: {
        handmade: ['handmade', 'artisan', 'craft', 'custom'],
        mass_produced: ['brand', 'wholesale', 'retail', 'factory'],
        dropshipped: ['dropship', 'overseas', 'china', 'aliexpress'],
        print_on_demand: ['print on demand', 'custom print', 'personalized']
      },
      trustFactors: ['ssl', 'contact', 'policies', 'reviews'],
      riskFactors: ['new domain', 'no contact', 'suspicious pricing']
    };
  }

  private determineProductType(
    content: string, 
    pattern: any
  ): 'handmade' | 'mass_produced' | 'dropshipped' | 'print_on_demand' {
    const contentLower = content.toLowerCase();
    const scores = {
      handmade: 0,
      mass_produced: 0,
      dropshipped: 0,
      print_on_demand: 0
    };

    // Score each category based on keyword matches
    Object.entries(pattern.indicators).forEach(([type, keywords]) => {
      if (Array.isArray(keywords)) {
        keywords.forEach((keyword: string) => {
          if (contentLower.includes(keyword.toLowerCase())) {
            scores[type as keyof typeof scores] += 1;
          }
        });
      }
    });

    // Return the highest scoring type
    return Object.entries(scores).reduce((a, b) => 
      scores[a[0] as keyof typeof scores] > scores[b[0] as keyof typeof scores] ? a : b
    )[0] as keyof typeof scores;
  }

  private calculateAuthenticityScore(
    content: string,
    pattern: any,
    productType: string,
    productData?: any
  ): number {
    let score = 50; // Base score
    const contentLower = content.toLowerCase();

    // Positive indicators
    pattern.trustFactors.forEach((factor: string) => {
      if (contentLower.includes(factor.toLowerCase())) {
        score += 8;
      }
    });

    // Negative indicators
    pattern.riskFactors.forEach((factor: string) => {
      if (contentLower.includes(factor.toLowerCase())) {
        score -= 12;
      }
    });

    // Product type specific adjustments
    switch (productType) {
      case 'handmade':
        score += 15; // Generally more authentic
        break;
      case 'mass_produced':
        score += 10; // Usually legitimate
        break;
      case 'dropshipped':
        score -= 20; // Higher risk
        break;
      case 'print_on_demand':
        score += 5; // Moderate authenticity
        break;
    }

    // Platform adjustments
    if (pattern.platform === 'Amazon' || pattern.platform === 'eBay') {
      score += 10; // Established platforms
    } else if (pattern.platform === 'Etsy') {
      score += 15; // Higher trust for handmade
    }

    return Math.max(0, Math.min(100, score));
  }

  private analyzeIndicators(content: string, pattern: any) {
    const contentLower = content.toLowerCase();
    const indicators = {
      positive: [] as string[],
      negative: [] as string[],
      neutral: [] as string[]
    };

    pattern.trustFactors.forEach((factor: string) => {
      if (contentLower.includes(factor.toLowerCase())) {
        indicators.positive.push(`Trust factor: ${factor}`);
      }
    });

    pattern.riskFactors.forEach((factor: string) => {
      if (contentLower.includes(factor.toLowerCase())) {
        indicators.negative.push(`Risk factor: ${factor}`);
      }
    });

    return indicators;
  }

  private extractStoreMetadata(content: string, pattern: any) {
    return {
      platform: pattern.platform,
      storeName: 'Store Name', // Would extract from content
      storeAge: 'Unknown',
      sellerRating: undefined,
      totalSales: undefined,
      location: 'Unknown'
    };
  }

  private analyzePricing(content: string, productData?: any) {
    return {
      competitiveScore: 75, // Would calculate based on market data
      marketPosition: 'market_average' as const,
      similarProductsFound: 0
    };
  }

  private assessRiskFactors(content: string, pattern: any, authenticityScore: number) {
    const riskLevel = authenticityScore > 70 ? 'low' : 
                     authenticityScore > 40 ? 'medium' : 'high';
    
    const factors: string[] = [];
    if (authenticityScore < 50) {
      factors.push('Low authenticity score');
    }
    if (content.toLowerCase().includes('too good to be true')) {
      factors.push('Unrealistic pricing');
    }

    return {
      level: riskLevel as 'low' | 'medium' | 'high',
      factors
    };
  }

  private calculateConfidence(content: string, pattern: any): number {
    // Base confidence on available data and pattern matches
    let confidence = 60;
    
    if (pattern.platform !== 'Unknown Store') {
      confidence += 20;
    }
    
    if (content.length > 100) {
      confidence += 20;
    }
    
    return Math.min(100, confidence);
  }
}

export const storeAnalyzer = new StoreAnalyzer();
export type { ProductAnalysis };