import { api } from '../lib/api';

export interface AnalysisResult {
  analysisId: string;
  timestamp: string;
  userId: string;
}

export interface AuthenticityAnalysis extends AnalysisResult {
  authenticityScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
  visualAnalysis: {
    logoQuality: string;
    materialConsistency: string;
    colorAccuracy: string;
    craftsmanshipScore: number;
  };
  redFlags: string[];
  positiveIndicators: string[];
  recommendations: string[];
  dashboard: {
    overview: {
      authenticityScore: number;
      riskLevel: string;
      confidence: number;
      analysisDate: string;
    };
    riskGauges: Record<string, any>;
    comparisonCharts: Record<string, any>;
    flaggedFeatures: string[];
  };
}

export interface ScreenshotAnalysis extends AnalysisResult {
  products: Array<{
    name: string;
    brand?: string;
    price?: string;
    confidence: number;
    category?: string;
    location?: string;
  }>;
  context: string;
  confidence: number;
  analysisType: 'screenshot';
}

export interface URLAnalysis extends AnalysisResult {
  title: string;
  price: string;
  description: string;
  images: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
  brand: string;
  availability: string;
  reviews: {
    rating: number;
    count: number;
  };
  sourceUrl: string;
  aiEnhanced: boolean;
  category?: string;
  keyFeatures?: string[];
  authenticity?: any;
}

export interface QRAnalysis extends AnalysisResult {
  type: 'product_url' | 'barcode' | 'generic' | 'none';
  qrContent: string;
  confidence: number;
  productData?: URLAnalysis;
  barcode?: string;
  message?: string;
}

export interface PriceIntelligence extends AnalysisResult {
  recommendation: 'BUY' | 'WAIT' | 'AVOID';
  marketPosition: string;
  trendAnalysis: string;
  bestTimeToBuy: string;
  fairPriceRange: {
    min: number;
    max: number;
  };
  dealQuality: number;
  charts: {
    historicalTrend: Array<{
      date: string;
      price: number;
      retailer: string;
      index: number;
    }>;
    competitorComparison: Array<{
      retailer: string;
      price: number;
      availability: string;
    }>;
    priceDistribution: {
      min: number;
      max: number;
      current: number;
      average: number;
    };
  };
}

export interface SellerCredibility extends AnalysisResult {
  credibilityScore: {
    overall: number;
    factors: {
      accountAge: number;
      reputation: number;
      experienceLevel: number;
      productHistory: number;
    };
  };
  trustLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  riskFactors: Array<{
    factor: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
  recommendations: string[];
  visualData: {
    credibilityGauge: {
      score: number;
      color: string;
    };
    factorBreakdown: Array<{
      factor: string;
      score: number;
      weight: number;
    }>;
    riskTimeline: Array<{
      factor: string;
      severity: string;
      description: string;
      date: string;
    }>;
  };
}

export interface VerificationGuide extends AnalysisResult {
  category: string;
  quickChecks: string[];
  detailedSteps: string[];
  commonCounterfeits: string[];
  trustedSources: string[];
  interactiveElements: {
    checklistItems: Array<{
      id: string;
      text: string;
      completed: boolean;
      importance: 'high' | 'medium' | 'low';
    }>;
    progressTracker: {
      totalSteps: number;
      completedSteps: number;
      currentStep: number;
    };
    riskAssessment: {
      lowRisk: boolean;
      mediumRisk: boolean;
      highRisk: boolean;
    };
  };
  educationalContent: {
    tips: string[];
    commonMistakes: string[];
  };
}

class AIAnalysisService {
  async analyzeProductAuthenticity(
    imageFile: File,
    productData?: {
      productName?: string;
      brand?: string;
      category?: string;
      price?: number;
    }
  ): Promise<AuthenticityAnalysis> {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    if (productData?.productName) formData.append('productName', productData.productName);
    if (productData?.brand) formData.append('brand', productData.brand);
    if (productData?.category) formData.append('category', productData.category);
    if (productData?.price) formData.append('price', productData.price.toString());

    const response = await api.post('/ai-analysis/authenticity', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  }

  async analyzeScreenshot(
    imageFile: File,
    options?: {
      focusArea?: string;
      extractPrices?: boolean;
    }
  ): Promise<ScreenshotAnalysis> {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    if (options?.focusArea) formData.append('focusArea', options.focusArea);
    if (options?.extractPrices) formData.append('extractPrices', 'true');

    const response = await api.post('/ai-analysis/screenshot', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  }

  async analyzeProductFromURL(
    url: string,
    enhanceWithAI: boolean = true
  ): Promise<URLAnalysis> {
    const response = await api.post('/ai-analysis/url', {
      url,
      enhanceWithAI,
    });

    return response.data.data;
  }

  async analyzeQRCode(imageFile: File): Promise<QRAnalysis> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post('/ai-analysis/qr-code', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  }

  async generatePriceIntelligence(
    productId: string,
    currentPrice?: number,
    priceHistory?: Array<{
      date: string;
      price: number;
      retailer: string;
    }>
  ): Promise<PriceIntelligence> {
    const response = await api.post('/ai-analysis/price-intelligence', {
      productId,
      currentPrice,
      priceHistory,
    });

    return response.data.data;
  }

  async analyzeSellerCredibility(
    sellerId: string,
    sellerData?: {
      accountAge?: number;
      averageRating?: number;
      reviewCount?: number;
    },
    productHistory?: Array<{
      rating: number;
      date: string;
    }>
  ): Promise<SellerCredibility> {
    const response = await api.post('/ai-analysis/seller-credibility', {
      sellerId,
      sellerData,
      productHistory,
    });

    return response.data.data;
  }

  async getVerificationGuide(
    category: string,
    productName?: string
  ): Promise<VerificationGuide> {
    const params = new URLSearchParams();
    params.append('category', category);
    if (productName) params.append('productName', productName);

    const response = await api.get(`/ai-analysis/verification-guide?${params}`);
    return response.data.data;
  }

  async getAuthenticityDashboard(analysisId: string): Promise<any> {
    const response = await api.get(`/ai-analysis/dashboard/${analysisId}`);
    return response.data.data;
  }
}

export const aiAnalysisService = new AIAnalysisService();