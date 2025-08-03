// import { analyzeProductWithAI } from './aiProductAnalyzer';

export interface UserSubmittedData {
  url?: string;
  screenshot?: File | Blob;
  productTitle?: string;
  productPrice?: string;
  productDescription?: string;
  productImages?: File[];
  sellerName?: string;
}

export interface ScreenshotAnalysisResult {
  confidence: number;
  patterns: {
    dropshipping: number;
    massProduced: number;
    handmade: number;
    authentic: number;
  };
  indicators: string[];
  educationalInsights: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

// Pattern database (to be expanded)
const DROPSHIP_PATTERNS = [
  'ships from china',
  'processing time 2-4 weeks',
  'estimated delivery 15-30 days',
  'warehouse direct',
  'factory outlet',
  'bulk wholesale'
];

const HANDMADE_INDICATORS = [
  'made to order',
  'custom',
  'personalized',
  'handcrafted',
  'artisan',
  'small batch',
  'limited edition',
  'bespoke'
];

const MASS_PRODUCTION_INDICATORS = [
  'in stock: 999+',
  'sold 10,000+',
  'bestseller #1',
  'trending now',
  'limited time offer',
  'flash sale'
];

export const analyzeScreenshot = async (imageFile: File | Blob): Promise<string> => {
  // Convert image to base64 for AI analysis
  const base64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(imageFile);
  });

  // Use AI to extract text from screenshot (temporarily mock)
  // const aiAnalysis = await analyzeProductWithAI('', base64);
  // return aiAnalysis.analysis || '';
  
  // For now, return mock text extraction
  return 'Product analysis from screenshot - mock implementation';
};

export const analyzeUserSubmission = async (
  data: UserSubmittedData
): Promise<ScreenshotAnalysisResult> => {
  let extractedText = '';
  let patterns = {
    dropshipping: 0,
    massProduced: 0,
    handmade: 0,
    authentic: 50 // Start neutral
  };
  const indicators: string[] = [];
  const educationalInsights: string[] = [];

  // Extract text from screenshot if provided
  if (data.screenshot) {
    try {
      extractedText = await analyzeScreenshot(data.screenshot);
    } catch (error) {
      console.error('Screenshot analysis failed:', error);
    }
  }

  // Combine all text data
  const allText = [
    extractedText,
    data.productTitle,
    data.productPrice,
    data.productDescription,
    data.sellerName
  ].filter(Boolean).join(' ').toLowerCase();

  // Analyze for dropshipping patterns
  DROPSHIP_PATTERNS.forEach(pattern => {
    if (allText.includes(pattern)) {
      patterns.dropshipping += 15;
      patterns.authentic -= 10;
      indicators.push(`Found dropshipping indicator: "${pattern}"`);
    }
  });

  // Analyze for handmade indicators
  HANDMADE_INDICATORS.forEach(indicator => {
    if (allText.includes(indicator)) {
      patterns.handmade += 10;
      patterns.authentic += 5;
      indicators.push(`Handmade indicator detected: "${indicator}"`);
    }
  });

  // Analyze for mass production
  MASS_PRODUCTION_INDICATORS.forEach(indicator => {
    if (allText.includes(indicator)) {
      patterns.massProduced += 12;
      patterns.authentic -= 5;
      indicators.push(`Mass production pattern: "${indicator}"`);
    }
  });

  // Price analysis
  if (data.productPrice) {
    const price = parseFloat(data.productPrice.replace(/[^0-9.]/g, ''));
    if (price < 10) {
      patterns.dropshipping += 10;
      educationalInsights.push('Very low prices often indicate mass production or dropshipping');
    } else if (price > 50 && patterns.handmade > 30) {
      patterns.authentic += 10;
      educationalInsights.push('Higher prices combined with handmade indicators suggest authentic craftsmanship');
    }
  }

  // URL analysis (educational only)
  if (data.url) {
    if (data.url.includes('etsy.com')) {
      educationalInsights.push('Etsy hosts both genuine handmade items and resellers - look for shop reviews and creation process photos');
    } else if (data.url.includes('amazon.com')) {
      educationalInsights.push('Amazon marketplace includes many third-party sellers - check fulfillment method and seller information');
    }
  }

  // Normalize scores
  const totalScore = Math.max(
    patterns.dropshipping + patterns.massProduced + patterns.handmade + patterns.authentic,
    1
  );
  
  Object.keys(patterns).forEach(key => {
    patterns[key as keyof typeof patterns] = Math.round((patterns[key as keyof typeof patterns] / totalScore) * 100);
  });

  // Calculate confidence
  const confidence = Math.min(
    Math.round((indicators.length * 10) + (extractedText.length > 100 ? 20 : 0)),
    95
  );

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' = 'medium';
  if (patterns.authentic > 60) riskLevel = 'low';
  else if (patterns.dropshipping > 50 || patterns.massProduced > 50) riskLevel = 'high';

  // Add educational insights based on analysis
  if (patterns.dropshipping > 40) {
    educationalInsights.push('This product shows patterns commonly associated with dropshipping operations');
  }
  if (patterns.handmade > 40) {
    educationalInsights.push('Several handmade indicators were detected - consider verifying with seller photos of their creation process');
  }

  return {
    confidence,
    patterns,
    indicators,
    educationalInsights,
    riskLevel
  };
};