interface ShopifyConfig {
  clientId: string;
  clientSecret: string;
  accessToken?: string;
  apiVersion: string;
}

interface ShopifyProduct {
  id: string;
  title: string;
  description: string;
  vendor: string;
  product_type: string;
  created_at: string;
  images: ShopifyImage[];
  variants: ShopifyVariant[];
}

interface ShopifyImage {
  id: string;
  src: string;
  alt?: string;
}

interface ShopifyVariant {
  id: string;
  title: string;
  price: string;
  compare_at_price?: string;
  inventory_quantity?: number;
}

interface ShopifyShop {
  id: string;
  name: string;
  email: string;
  domain: string;
  created_at: string;
  plan_name: string;
  country_name: string;
  currency: string;
}

interface ShopifyAnalysis {
  storeHealth: 'excellent' | 'good' | 'moderate' | 'poor';
  dropshipLikelihood: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
  authenticity: {
    score: number; // 0-100
    indicators: {
      positive: string[];
      negative: string[];
      neutral: string[];
    };
  };
  businessModel: {
    type: 'brand_owned' | 'dropshipping' | 'print_on_demand' | 'mixed' | 'reseller';
    confidence: number; // 0-100
    reasoning: string[];
  };
  qualityMetrics: {
    professionalism: number; // 0-100
    productCuration: number; // 0-100
    customerService: number; // 0-100
  };
  educationalInsights: {
    storeType: string;
    recommendations: string[];
    redFlags: string[];
    positiveSignals: string[];
  };
}

class ShopifyApiService {
  private config: ShopifyConfig;
  private rateLimiter: { lastCall: number; callsPerSecond: number };

  constructor() {
    this.config = {
      clientId: process.env.REACT_APP_SHOPIFY_CLIENT_ID || '',
      clientSecret: process.env.REACT_APP_SHOPIFY_CLIENT_SECRET || '',
      apiVersion: '2024-01'
    };
    
    this.rateLimiter = {
      lastCall: 0,
      callsPerSecond: 2 // Conservative rate limiting
    };
  }

  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.rateLimiter.lastCall;
    const minInterval = 1000 / this.rateLimiter.callsPerSecond;
    
    if (timeSinceLastCall < minInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, minInterval - timeSinceLastCall)
      );
    }
    
    this.rateLimiter.lastCall = Date.now();
  }

  private extractShopDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      let domain = urlObj.hostname;
      
      // Handle myshopify.com subdomains
      if (domain.endsWith('.myshopify.com')) {
        return domain;
      }
      
      // Handle custom domains
      return domain.replace('www.', '');
    } catch (error) {
      throw new Error('Invalid Shopify store URL provided');
    }
  }

  private async makeShopifyRequest(
    shopDomain: string, 
    endpoint: string, 
    accessToken?: string
  ): Promise<any> {
    await this.waitForRateLimit();
    
    const baseUrl = `https://${shopDomain}`;
    const apiUrl = `${baseUrl}/admin/api/${this.config.apiVersion}/${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Shop Scan Pro Educational Platform/1.0'
    };
    
    if (accessToken) {
      headers['X-Shopify-Access-Token'] = accessToken;
    }
    
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Shopify API request failed:', error);
      throw error;
    }
  }

  // Use Storefront API for public store information
  private async getPublicStoreInfo(shopDomain: string): Promise<any> {
    await this.waitForRateLimit();
    
    const storefrontQuery = `
      query getStoreInfo {
        shop {
          name
          description
          primaryDomain {
            host
          }
          paymentSettings {
            acceptedCardBrands
          }
        }
        products(first: 50) {
          edges {
            node {
              id
              title
              description
              vendor
              productType
              createdAt
              images(first: 5) {
                edges {
                  node {
                    originalSrc
                    altText
                  }
                }
              }
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    price
                    compareAtPrice
                    inventoryQuantity
                  }
                }
              }
            }
          }
        }
      }
    `;

    try {
      const response = await fetch(`https://${shopDomain}/api/${this.config.apiVersion}/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ query: storefrontQuery })
      });

      if (!response.ok) {
        throw new Error(`Storefront API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
      }
      
      return data.data;
    } catch (error) {
      console.error('Storefront API request failed:', error);
      
      // Fallback to basic analysis without API data
      return this.createFallbackStoreData(shopDomain);
    }
  }

  private createFallbackStoreData(shopDomain: string): any {
    return {
      shop: {
        name: shopDomain,
        description: '',
        primaryDomain: { host: shopDomain }
      },
      products: { edges: [] }
    };
  }

  async analyzeShopifyStore(storeUrl: string): Promise<ShopifyAnalysis> {
    try {
      const shopDomain = this.extractShopDomain(storeUrl);
      
      // Get public store information
      const storeData = await this.getPublicStoreInfo(shopDomain);
      
      // Analyze the store data
      const analysis = await this.performStoreAnalysis(storeData, shopDomain);
      
      return analysis;
    } catch (error) {
      console.error('Shopify store analysis failed:', error);
      
      // Return educational fallback analysis
      return this.createFallbackAnalysis(error as Error);
    }
  }

  private async performStoreAnalysis(storeData: any, shopDomain: string): Promise<ShopifyAnalysis> {
    const shop = storeData.shop;
    const products = storeData.products?.edges || [];
    
    // Analyze products for patterns
    const productAnalysis = this.analyzeProducts(products);
    
    // Analyze store characteristics
    const storeCharacteristics = this.analyzeStoreCharacteristics(shop, shopDomain);
    
    // Calculate overall assessment
    const overallAssessment = this.calculateOverallAssessment(
      productAnalysis,
      storeCharacteristics
    );
    
    return {
      storeHealth: overallAssessment.health,
      dropshipLikelihood: overallAssessment.dropshipLikelihood,
      authenticity: {
        score: overallAssessment.authenticityScore,
        indicators: overallAssessment.indicators
      },
      businessModel: {
        type: overallAssessment.businessModelType,
        confidence: overallAssessment.businessModelConfidence,
        reasoning: overallAssessment.reasoning
      },
      qualityMetrics: {
        professionalism: overallAssessment.professionalism,
        productCuration: overallAssessment.productCuration,
        customerService: overallAssessment.customerService
      },
      educationalInsights: {
        storeType: this.determineStoreType(overallAssessment),
        recommendations: this.generateRecommendations(overallAssessment),
        redFlags: this.identifyRedFlags(overallAssessment),
        positiveSignals: this.identifyPositiveSignals(overallAssessment)
      }
    };
  }

  private analyzeProducts(products: any[]): any {
    const productCount = products.length;
    const vendors = new Set<string>();
    const productTypes = new Set<string>();
    const descriptions: string[] = [];
    const prices: number[] = [];
    
    // Analyze each product
    products.forEach(productEdge => {
      const product = productEdge.node;
      
      vendors.add(product.vendor || 'Unknown');
      productTypes.add(product.productType || 'Unknown');
      descriptions.push(product.description || '');
      
      // Analyze variants for pricing
      product.variants?.edges?.forEach((variantEdge: any) => {
        const variant = variantEdge.node;
        if (variant.price) {
          prices.push(parseFloat(variant.price));
        }
      });
    });
    
    return {
      productCount,
      uniqueVendors: vendors.size,
      uniqueProductTypes: productTypes.size,
      vendors: Array.from(vendors),
      productTypes: Array.from(productTypes),
      descriptions,
      prices,
      averagePrice: prices.length > 0 ? prices.reduce((a, b) => a + b) / prices.length : 0
    };
  }

  private analyzeStoreCharacteristics(shop: any, domain: string): any {
    const characteristics = {
      hasCustomDomain: !domain.includes('.myshopify.com'),
      storeName: shop.name || domain,
      hasDescription: Boolean(shop.description && shop.description.length > 0),
      domainAge: 'unknown', // Would need external service to determine
      isVerified: Boolean(shop.email)
    };
    
    return characteristics;
  }

  private calculateOverallAssessment(productAnalysis: any, storeCharacteristics: any): any {
    let authenticityScore = 50; // Base score
    const indicators = { positive: [] as string[], negative: [] as string[], neutral: [] as string[] };
    const reasoning: string[] = [];
    
    // Analyze vendor diversity
    if (productAnalysis.uniqueVendors === 1 && productAnalysis.vendors[0] === 'Unknown') {
      authenticityScore -= 15;
      indicators.negative.push('No vendor information provided for products');
      reasoning.push('Lack of vendor transparency may indicate dropshipping');
    } else if (productAnalysis.uniqueVendors > 10) {
      authenticityScore -= 10;
      indicators.negative.push('Very high vendor diversity suggests reseller model');
      reasoning.push('Many different vendors unusual for authentic brand stores');
    } else if (productAnalysis.uniqueVendors <= 3) {
      authenticityScore += 10;
      indicators.positive.push('Consistent vendor information');
      reasoning.push('Limited vendor diversity suggests curated or owned inventory');
    }
    
    // Analyze store professionalism
    if (storeCharacteristics.hasCustomDomain) {
      authenticityScore += 15;
      indicators.positive.push('Professional custom domain');
      reasoning.push('Custom domain indicates business investment and legitimacy');
    } else {
      authenticityScore -= 5;
      indicators.neutral.push('Using default Shopify subdomain');
      reasoning.push('Default subdomain may indicate newer or less established business');
    }
    
    if (storeCharacteristics.hasDescription) {
      authenticityScore += 10;
      indicators.positive.push('Store has detailed description');
    } else {
      authenticityScore -= 5;
      indicators.negative.push('Missing store description');
    }
    
    // Analyze product diversity
    if (productAnalysis.productCount < 5) {
      indicators.neutral.push('Limited product selection');
      reasoning.push('Small product catalog may indicate specialized focus or new business');
    } else if (productAnalysis.productCount > 100) {
      authenticityScore -= 5;
      indicators.neutral.push('Very large product catalog');
      reasoning.push('Large catalogs may indicate dropshipping or reseller operations');
    }
    
    // Determine business model
    let businessModelType: 'brand_owned' | 'dropshipping' | 'print_on_demand' | 'mixed' | 'reseller' = 'mixed';
    let businessModelConfidence = 60;
    
    if (productAnalysis.uniqueVendors === 1 && storeCharacteristics.hasCustomDomain) {
      businessModelType = 'brand_owned';
      businessModelConfidence = 80;
      reasoning.push('Single vendor with professional setup suggests brand-owned operation');
    } else if (productAnalysis.uniqueVendors > 20) {
      businessModelType = 'reseller';
      businessModelConfidence = 75;
      reasoning.push('Many vendors suggests reseller or marketplace model');
    }
    
    // Calculate quality metrics
    const professionalism = Math.min(100, Math.max(0, 
      50 + 
      (storeCharacteristics.hasCustomDomain ? 25 : 0) +
      (storeCharacteristics.hasDescription ? 15 : 0) +
      (storeCharacteristics.isVerified ? 10 : 0)
    ));
    
    const productCuration = Math.min(100, Math.max(0,
      60 + 
      (productAnalysis.uniqueProductTypes <= 5 ? 20 : -10) +
      (productAnalysis.productCount >= 10 && productAnalysis.productCount <= 50 ? 15 : -5)
    ));
    
    const customerService = Math.min(100, Math.max(0,
      50 + 
      (storeCharacteristics.isVerified ? 20 : 0) +
      (storeCharacteristics.hasDescription ? 15 : 0) +
      15 // Shopify provides good baseline customer service tools
    ));
    
    // Determine overall health and dropship likelihood
    const overallScore = (authenticityScore + professionalism + productCuration + customerService) / 4;
    
    const health = overallScore > 80 ? 'excellent' :
                   overallScore > 65 ? 'good' :
                   overallScore > 45 ? 'moderate' : 'poor';
    
    const dropshipLikelihood = authenticityScore > 70 ? 'very_low' :
                               authenticityScore > 55 ? 'low' :
                               authenticityScore > 40 ? 'moderate' :
                               authenticityScore > 25 ? 'high' : 'very_high';
    
    return {
      health,
      dropshipLikelihood,
      authenticityScore: Math.min(100, Math.max(0, authenticityScore)),
      indicators,
      businessModelType,
      businessModelConfidence,
      reasoning,
      professionalism,
      productCuration,
      customerService
    };
  }

  private determineStoreType(assessment: any): string {
    if (assessment.businessModelType === 'brand_owned') {
      return 'Professional Brand Store';
    } else if (assessment.businessModelType === 'dropshipping') {
      return 'Dropshipping Operation';
    } else if (assessment.businessModelType === 'reseller') {
      return 'Multi-Vendor Reseller';
    } else if (assessment.businessModelType === 'print_on_demand') {
      return 'Print-on-Demand Store';
    } else {
      return 'Mixed Business Model';
    }
  }

  private generateRecommendations(assessment: any): string[] {
    const recommendations: string[] = [];
    
    if (assessment.professionalism < 70) {
      recommendations.push('Look for stores with custom domains and professional presentation');
    }
    
    if (assessment.dropshipLikelihood === 'high' || assessment.dropshipLikelihood === 'very_high') {
      recommendations.push('Consider longer shipping times and potential quality variations');
      recommendations.push('Check return policies carefully before purchasing');
    }
    
    if (assessment.businessModelType === 'brand_owned') {
      recommendations.push('This appears to be a legitimate brand store with direct inventory');
    }
    
    recommendations.push('Always verify seller policies and read recent customer reviews');
    
    return recommendations;
  }

  private identifyRedFlags(assessment: any): string[] {
    const redFlags: string[] = [];
    
    assessment.indicators.negative.forEach((indicator: string) => {
      redFlags.push(indicator);
    });
    
    if (assessment.authenticityScore < 40) {
      redFlags.push('Low overall authenticity score');
    }
    
    if (assessment.dropshipLikelihood === 'very_high') {
      redFlags.push('High likelihood of dropshipping operation');
    }
    
    return redFlags;
  }

  private identifyPositiveSignals(assessment: any): string[] {
    const positiveSignals: string[] = [];
    
    assessment.indicators.positive.forEach((indicator: string) => {
      positiveSignals.push(indicator);
    });
    
    if (assessment.authenticityScore > 70) {
      positiveSignals.push('High authenticity score indicates trustworthy operation');
    }
    
    if (assessment.businessModelType === 'brand_owned') {
      positiveSignals.push('Appears to be authentic brand-owned store');
    }
    
    return positiveSignals;
  }

  private createFallbackAnalysis(error: Error): ShopifyAnalysis {
    return {
      storeHealth: 'moderate',
      dropshipLikelihood: 'moderate',
      authenticity: {
        score: 50,
        indicators: {
          positive: [],
          negative: ['Unable to access store data for analysis'],
          neutral: ['Analysis based on limited information']
        }
      },
      businessModel: {
        type: 'mixed',
        confidence: 30,
        reasoning: ['Limited data available for comprehensive analysis']
      },
      qualityMetrics: {
        professionalism: 50,
        productCuration: 50,
        customerService: 50
      },
      educationalInsights: {
        storeType: 'Unable to Determine',
        recommendations: [
          'Store analysis limited due to access restrictions',
          'Manually review store policies and customer feedback',
          'Look for standard e-commerce trust indicators'
        ],
        redFlags: ['Unable to perform comprehensive analysis'],
        positiveSignals: []
      }
    };
  }
}

export const shopifyApiService = new ShopifyApiService();
export type { ShopifyAnalysis, ShopifyProduct, ShopifyShop };