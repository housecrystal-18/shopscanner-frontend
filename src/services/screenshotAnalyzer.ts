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
    printOnDemand: number;
    authentic: number;
    giftBox?: number;
    mixedSourcing?: number;
  };
  indicators: string[];
  educationalInsights: string[];
  riskLevel: 'low' | 'medium' | 'high';
  productType?: 'single' | 'gift-box' | 'bundle';
}

// Comprehensive Pattern Database for Educational Analysis
const DROPSHIP_PATTERNS = [
  // Shipping indicators
  'ships from china', 'ships from asia', 'international shipping', 'overseas warehouse',
  'processing time 2-4 weeks', 'processing time 3-5 weeks', 'allow 2-3 weeks processing',
  'estimated delivery 15-30 days', 'delivery 20-45 days', '15-25 business days',
  'ships from guangzhou', 'ships from shenzhen', 'ships from yiwu',
  
  // Business model indicators
  'warehouse direct', 'factory outlet', 'bulk wholesale', 'supplier direct',
  'no brand packaging', 'opp bag packaging', 'generic packaging',
  'dropshipping', 'drop ship', 'fulfilled by merchant',
  
  // Pricing patterns
  'buy 2 get 1 free', 'bulk discount available', 'wholesale pricing',
  'minimum order quantity', 'moq:', 'order in bulk',
  
  // Generic product descriptions
  'universal fit', 'one size fits all', 'compatible with most',
  'unbranded', 'no logo', 'generic brand',
  
  // Platform-specific indicators
  'aliexpress standard shipping', 'cainiao tracking', 'yanwen tracking',
  'epacket delivery', 'china post tracking'
];

const HANDMADE_INDICATORS = [
  // Creation process
  'made to order', 'handmade', 'hand made', 'handcrafted', 'hand crafted',
  'custom', 'customized', 'personalized', 'bespoke', 'artisan made',
  'hand painted', 'hand carved', 'hand stitched', 'hand sewn',
  'hand forged', 'hand blown', 'hand thrown', 'hand turned',
  
  // Production scale
  'small batch', 'limited edition', 'one of a kind', 'ooak',
  'made in small quantities', 'limited run', 'artisan crafted',
  'studio made', 'workshop created',
  
  // Techniques
  'laser engraved', 'laser cut', 'wood burned', 'pyrography',
  'sublimated', 'heat pressed', 'screen printed by hand',
  'embroidered', 'crocheted', 'knitted', 'quilted',
  'pottery wheel', 'kiln fired', 'glazed by hand',
  
  // Artist/maker identity
  'artist signature', 'maker mark', 'signed piece',
  'local artist', 'independent maker', 'family business',
  'home studio', 'cottage industry',
  
  // Process documentation
  'work in progress photos', 'making process', 'behind the scenes',
  'from sketch to finish', 'creation story'
];

const MASS_PRODUCTION_INDICATORS = [
  // Inventory scale
  'in stock: 999+', 'in stock: 9999+', 'unlimited stock',
  'sold 10,000+', 'sold 50,000+', 'sold 100,000+',
  'over 1 million sold', 'bestseller #1', '#1 choice',
  
  // Marketing language
  'trending now', 'viral product', 'as seen on tv',
  'limited time offer', 'flash sale', 'today only',
  'while supplies last', 'hurry, almost sold out',
  
  // Scale indicators
  'factory direct', 'manufacturer direct', 'wholesale available',
  'bulk orders accepted', 'corporate pricing',
  'volume discounts', 'quantity breaks',
  
  // Distribution
  'available in stores', 'retail distribution',
  'multiple SKUs', 'various colors available',
  'size chart included', 'standard sizing',
  
  // Brand markers
  'official licensed', 'authorized retailer',
  'brand warranty', 'manufacturer warranty',
  'model number', 'part number', 'sku:'
];

const PRINT_ON_DEMAND_INDICATORS = [
  // POD platforms
  'printed when ordered', 'made when you order',
  'print on demand', 'custom printed', 'personalized printing',
  
  // Fulfillment
  'printful', 'printify', 'gooten', 'printed mint',
  'teespring', 'redbubble', 'society6', 'zazzle',
  
  // Product types
  't-shirt printing', 'mug printing', 'poster printing',
  'canvas printing', 'phone case printing',
  'customizable design', 'add your text',
  
  // Process indicators
  'high quality printing', 'dtg printing', 'sublimation printing',
  'vinyl printing', 'heat transfer', 'digital printing'
];

const QUALITY_CONCERNS = [
  // Material warnings
  'may contain lead', 'not food safe', 'decorative only',
  'not for children under 3', 'choking hazard',
  'flammable material', 'hand wash only',
  
  // Disclaimer language
  'color may vary', 'actual color may differ',
  'monitor differences', 'lighting effects',
  'minor imperfections', 'slight variations normal',
  
  // Generic quality
  'economy grade', 'budget option', 'basic quality',
  'entry level', 'standard grade', 'commercial grade'
];

const GIFT_BOX_PATTERNS = [
  // Gift box specific
  'gift box', 'gift set', 'gift basket', 'care package',
  'curated box', 'subscription box', 'mystery box',
  'gift bundle', 'gift hamper', 'gift collection',
  
  // Mixed product indicators
  'includes:', 'contents:', 'this set contains',
  'assorted items', 'variety pack', 'combo pack',
  
  // Personalization options
  'personalized gift', 'custom message', 'gift message',
  'add personal touch', 'customizable box',
  
  // Common gift box items
  'candle included', 'bath products', 'spa set',
  'self care kit', 'pamper set', 'wellness box',
  
  // Packaging descriptions
  'beautifully packaged', 'ready to gift', 'gift ready',
  'ribbon included', 'decorative box', 'reusable box'
];

const MIXED_PRODUCT_INDICATORS = [
  // Items commonly mass-produced in gift boxes
  'glass jar', 'metal tin', 'ceramic mug', 'wooden box',
  'hair clip', 'hair tie', 'matches', 'lighter',
  'tea light', 'votive candle', 'bath salt', 'soap bar',
  
  // Mixed sourcing indicators
  'sourced from', 'assembled by', 'curated by',
  'hand-picked items', 'specially selected',
  
  // Partial handmade indicators
  'some items handmade', 'includes handmade',
  'features artisan', 'mix of handmade and',
  'partially handcrafted'
];

const AUTHENTIC_BRAND_INDICATORS = [
  // Official channels
  'authorized dealer', 'official retailer', 'brand authorized',
  'factory authorized', 'certified dealer',
  
  // Authentication
  'authenticity guaranteed', 'genuine product',
  'original packaging', 'factory sealed',
  'hologram sticker', 'security tag',
  
  // Warranty/support
  'manufacturer warranty', 'official warranty',
  'customer service included', 'technical support',
  'repair service available'
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
    printOnDemand: 0,
    authentic: 50, // Start neutral
    giftBox: 0,
    mixedSourcing: 0
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
      patterns.dropshipping += 12;
      patterns.authentic -= 8;
      indicators.push(`Educational observation: Dropshipping pattern detected - "${pattern}"`);
    }
  });

  // Analyze for handmade indicators
  HANDMADE_INDICATORS.forEach(indicator => {
    if (allText.includes(indicator)) {
      patterns.handmade += 15;
      patterns.authentic += 8;
      indicators.push(`Educational observation: Handmade craftsmanship indicator - "${indicator}"`);
    }
  });

  // Analyze for mass production
  MASS_PRODUCTION_INDICATORS.forEach(indicator => {
    if (allText.includes(indicator)) {
      patterns.massProduced += 10;
      patterns.authentic -= 3;
      indicators.push(`Educational observation: Mass production indicator - "${indicator}"`);
    }
  });

  // Analyze for print-on-demand patterns
  PRINT_ON_DEMAND_INDICATORS.forEach(indicator => {
    if (allText.includes(indicator)) {
      patterns.printOnDemand += 18;
      patterns.authentic -= 5;
      indicators.push(`Educational observation: Print-on-demand pattern - "${indicator}"`);
    }
  });

  // Analyze for quality concerns
  QUALITY_CONCERNS.forEach(concern => {
    if (allText.includes(concern)) {
      patterns.authentic -= 8;
      indicators.push(`Educational observation: Quality consideration noted - "${concern}"`);
    }
  });

  // Analyze for authentic brand indicators
  AUTHENTIC_BRAND_INDICATORS.forEach(indicator => {
    if (allText.includes(indicator)) {
      patterns.authentic += 15;
      patterns.dropshipping -= 5;
      patterns.printOnDemand -= 5;
      indicators.push(`Educational observation: Authenticity indicator - "${indicator}"`);
    }
  });

  // Analyze for gift box patterns
  let giftBoxCount = 0;
  GIFT_BOX_PATTERNS.forEach(pattern => {
    if (allText.includes(pattern)) {
      patterns.giftBox += 20;
      giftBoxCount++;
      indicators.push(`Educational observation: Gift box indicator - "${pattern}"`);
    }
  });

  // Analyze for mixed product indicators
  MIXED_PRODUCT_INDICATORS.forEach(indicator => {
    if (allText.includes(indicator)) {
      patterns.mixedSourcing += 15;
      patterns.massProduced += 5;
      indicators.push(`Educational observation: Mixed sourcing indicator - "${indicator}"`);
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

  // Determine risk level with comprehensive analysis
  let riskLevel: 'low' | 'medium' | 'high' = 'medium';
  if (patterns.authentic > 60 && patterns.handmade > 30) {
    riskLevel = 'low';
  } else if (patterns.dropshipping > 50 || patterns.printOnDemand > 60 || (patterns.massProduced > 70 && patterns.authentic < 40)) {
    riskLevel = 'high';
  }

  // Add comprehensive educational insights based on analysis
  if (patterns.dropshipping > 30) {
    educationalInsights.push('Educational insight: This product shows patterns commonly associated with dropshipping operations - consider longer shipping times and potential quality variations');
  }
  
  if (patterns.printOnDemand > 40) {
    educationalInsights.push('Educational insight: Print-on-demand patterns detected - these products are typically made after ordering, which can affect delivery time and quality consistency');
  }
  
  if (patterns.massProduced > 40) {
    educationalInsights.push('Educational insight: This listing appears similar to known mass-produced products - compare across multiple platforms for price verification');
  }
  
  if (patterns.handmade > 40) {
    educationalInsights.push('Educational insight: Several handmade craftsmanship indicators were detected - look for maker stories, process photos, and creation details to verify authenticity');
  }
  
  if (patterns.authentic > 60) {
    educationalInsights.push('Educational insight: Multiple authenticity indicators found - this suggests a legitimate product from an established source');
  }
  
  // Provide shopping guidance based on patterns
  if (patterns.dropshipping > 50 && patterns.printOnDemand > 30) {
    educationalInsights.push('Shopping tip: Mixed fulfillment patterns detected - verify seller location, shipping policies, and return procedures before purchasing');
  }
  
  if (patterns.handmade > 50 && patterns.massProduced > 30) {
    educationalInsights.push('Shopping tip: Conflicting production indicators found - request additional details about the making process to clarify the product origin');
  }

  // Gift box specific insights
  if (patterns.giftBox > 30) {
    educationalInsights.push('Educational insight: Gift box detected - These often contain a mix of mass-produced items (candles, clips, matches) with potentially handmade elements (custom packaging, personalized items)');
    
    if (patterns.mixedSourcing > 40) {
      educationalInsights.push('Shopping tip: Mixed sourcing gift box - Ask the seller which items are handmade vs sourced. Request specifics about customization options');
    }
    
    if (giftBoxCount > 2) {
      educationalInsights.push('Analysis note: Multiple gift box indicators found - Consider that individual items may have different origins. Look for "assembled by" vs "made by" language');
    }
  }

  // Determine product type
  let productType: 'single' | 'gift-box' | 'bundle' = 'single';
  if (patterns.giftBox > 30) {
    productType = 'gift-box';
  } else if (patterns.mixedSourcing > 30 || allText.includes('bundle') || allText.includes('set of')) {
    productType = 'bundle';
  }

  return {
    confidence,
    patterns,
    indicators,
    educationalInsights,
    riskLevel,
    productType
  };
};