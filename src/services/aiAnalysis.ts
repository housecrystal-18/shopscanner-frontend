// AI Analysis Service - Connects to real Google Cloud Vision API
export interface AIAnalysisRequest {
  image?: string; // Base64 encoded image
  url?: string;   // Product URL
  userLocation?: string;
}

export interface AIAnalysisResult {
  authenticity_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'very_high' | 'unknown';
  detected_issues: string[];
  price_analysis: {
    below_market?: boolean;
    market_price?: number;
    savings?: number;
  };
  recommendations: string[];
  confidence: number;
  processing_time: number;
  
  // Detailed analysis data
  extracted_text?: string;
  text_quality_score?: number;
  detected_barcode?: string;
  detected_brand?: string;
  detected_model?: string;
  store_reputation?: number;
  detected_store?: string;
  url_risk_factors?: string[];
  product_info?: {
    name?: string;
    brand?: string;
    category?: string;
    official_images?: string[];
    msrp?: number;
    description?: string;
    error?: string;
  };
}

class AIAnalysisService {
  private apiUrl: string;
  private isProduction: boolean;

  constructor() {
    this.apiUrl = import.meta.env.VITE_API_BASE_URL || '';
    this.isProduction = import.meta.env.NODE_ENV === 'production';
  }

  async analyzeProduct(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
    try {
      // In development, use mock data unless AI is specifically enabled
      if (!this.isProduction && !import.meta.env.VITE_ENABLE_AI) {
        return this.getMockAnalysis(request);
      }

      // Make API call to our backend
      const response = await fetch('/api/analyze-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      return this.processAnalysisResult(result);

    } catch (error) {
      console.error('AI Analysis failed:', error);
      
      // Fallback to mock data with error indication
      const mockResult = this.getMockAnalysis(request);
      mockResult.detected_issues.push('AI analysis temporarily unavailable - showing demo data');
      mockResult.confidence = Math.min(mockResult.confidence, 0.3);
      
      return mockResult;
    }
  }

  private processAnalysisResult(rawResult: any): AIAnalysisResult {
    // Ensure all required fields are present with defaults
    return {
      authenticity_score: rawResult.authenticity_score || 50,
      risk_level: rawResult.risk_level || 'unknown',
      detected_issues: rawResult.detected_issues || [],
      price_analysis: rawResult.price_analysis || {},
      recommendations: rawResult.recommendations || ['Unable to generate recommendations'],
      confidence: rawResult.confidence || 0.5,
      processing_time: rawResult.processing_time || 0,
      
      // Optional detailed fields
      extracted_text: rawResult.extracted_text,
      text_quality_score: rawResult.text_quality_score,
      detected_barcode: rawResult.detected_barcode,
      detected_brand: rawResult.detected_brand,
      detected_model: rawResult.detected_model,
      store_reputation: rawResult.store_reputation,
      detected_store: rawResult.detected_store,
      url_risk_factors: rawResult.url_risk_factors,
      product_info: rawResult.product_info,
    };
  }

  private getMockAnalysis(request: AIAnalysisRequest): AIAnalysisResult {
    // Enhanced mock data based on URL analysis (from previous implementation)
    const url = request.url;
    let mockData = this.getIntelligentMockData(url);

    // Add some randomization to make it feel more realistic
    const score = Math.floor(Math.random() * 40) + 60; // 60-100
    const storeReputation = this.calculateStoreReputation(url);
    
    return {
      authenticity_score: score,
      risk_level: score >= 80 ? 'low' : score >= 60 ? 'medium' : 'high',
      detected_issues: score < 70 ? ['Suspicious pricing detected', 'Text quality concerns'] : [],
      price_analysis: {
        below_market: Math.random() > 0.7,
        market_price: mockData.price ? parseFloat(mockData.price.replace('$', '')) * 1.2 : undefined,
        savings: Math.random() > 0.5 ? Math.floor(Math.random() * 50) + 10 : 0,
      },
      recommendations: this.generateMockRecommendations(score),
      confidence: Math.random() * 0.4 + 0.6, // 0.6-1.0
      processing_time: Math.floor(Math.random() * 1000) + 500, // 500-1500ms
      
      store_reputation: storeReputation,
      detected_store: this.extractDomain(url),
      product_info: mockData,
    };
  }

  private getIntelligentMockData(url?: string) {
    if (!url) {
      return {
        name: 'Unknown Product',
        brand: 'Unknown Brand',
        price: '$29.99',
        category: 'General'
      };
    }

    const urlLower = url.toLowerCase();
    const domain = this.extractDomain(url);

    // Intelligent product detection based on URL
    if (domain === 'etsy.com') {
      if (urlLower.includes('necklace') || urlLower.includes('jewelry')) {
        return { name: 'Handmade Silver Necklace', brand: 'Artisan Crafted', price: '$45.99', category: 'Jewelry' };
      }
      return { name: 'Handcrafted Item', brand: 'Etsy Seller', price: '$25.99', category: 'Handmade' };
    }

    if (domain === 'amazon.com') {
      if (urlLower.includes('iphone') || urlLower.includes('apple')) {
        return { name: 'iPhone 15 Pro', brand: 'Apple', price: '$999.99', category: 'Electronics' };
      }
      if (urlLower.includes('nike') || urlLower.includes('shoe')) {
        return { name: 'Nike Air Max 270', brand: 'Nike', price: '$130.00', category: 'Footwear' };
      }
    }

    if (domain === 'ebay.com') {
      if (urlLower.includes('watch') || urlLower.includes('rolex')) {
        return { name: 'Luxury Watch', brand: 'Various', price: '$2,499.99', category: 'Watches' };
      }
    }

    // Default based on common keywords
    if (urlLower.includes('phone') || urlLower.includes('iphone')) {
      return { name: 'Smartphone', brand: 'Apple', price: '$799.99', category: 'Electronics' };
    }
    if (urlLower.includes('nike') || urlLower.includes('adidas')) {
      return { name: 'Athletic Shoes', brand: 'Nike', price: '$120.00', category: 'Footwear' };
    }
    if (urlLower.includes('bag') || urlLower.includes('purse')) {
      return { name: 'Designer Handbag', brand: 'Designer', price: '$299.99', category: 'Fashion' };
    }

    return {
      name: 'Product Item',
      brand: 'Various',
      price: '$49.99',
      category: 'General'
    };
  }

  private calculateStoreReputation(url?: string): number {
    if (!url) return 50;

    const domain = this.extractDomain(url);
    const storeReputations: { [key: string]: number } = {
      'amazon.com': 95,
      'apple.com': 100,
      'bestbuy.com': 90,
      'walmart.com': 85,
      'target.com': 85,
      'ebay.com': 70,
      'etsy.com': 65,
      'aliexpress.com': 30,
      'wish.com': 20,
      'dhgate.com': 25,
    };

    return storeReputations[domain] || 50;
  }

  private extractDomain(url?: string): string {
    if (!url) return 'unknown';
    try {
      return new URL(url).hostname.toLowerCase().replace('www.', '');
    } catch {
      return 'unknown';
    }
  }

  private generateMockRecommendations(score: number): string[] {
    if (score >= 80) {
      return [
        '✅ High confidence this product is authentic',
        '💚 Safe to proceed with purchase',
        '🔒 Verify seller reviews before buying'
      ];
    } else if (score >= 60) {
      return [
        '⚡ Exercise caution with this product',
        '🏪 Consider purchasing from verified retailers',
        '📞 Contact brand directly to verify authenticity'
      ];
    } else {
      return [
        '⚠️ High risk of counterfeit - avoid this product',
        '🔍 Verify through official brand channels',
        '💰 Price may be too good to be true'
      ];
    }
  }

  // Image processing helper (for future use)
  async processImage(imageFile: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });
  }

  // Check if AI is enabled and working
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch('/api/analyze-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://example.com' }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const aiAnalysisService = new AIAnalysisService();