// Vercel serverless function for AI product analysis
import { ImageAnnotatorClient } from '@google-cloud/vision';

// Initialize Google Cloud Vision client
const vision = new ImageAnnotatorClient({
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    project_id: process.env.GOOGLE_CLOUD_PROJECT_ID,
  },
});

// UPC Database API configuration
const UPC_API_KEY = process.env.UPC_DATABASE_API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, url, userLocation } = req.body;

    if (!image && !url) {
      return res.status(400).json({ error: 'Image or URL required' });
    }

    let analysisResults = {
      authenticity_score: 0,
      risk_level: 'unknown',
      detected_issues: [],
      price_analysis: {},
      recommendations: [],
      confidence: 0,
      processing_time: Date.now()
    };

    // Step 1: Extract text from image using Google Vision
    if (image) {
      const textAnalysis = await analyzeImageText(image);
      analysisResults = { ...analysisResults, ...textAnalysis };
    }

    // Step 2: Analyze URL if provided
    if (url) {
      const urlAnalysis = await analyzeProductUrl(url);
      analysisResults = { ...analysisResults, ...urlAnalysis };
    }

    // Step 3: Get product information from barcode/UPC
    if (analysisResults.detected_barcode) {
      const productInfo = await getProductInfo(analysisResults.detected_barcode);
      analysisResults.product_info = productInfo;
    }

    // Step 4: Calculate final authenticity score
    analysisResults.authenticity_score = calculateAuthenticityScore(analysisResults);
    analysisResults.risk_level = getRiskLevel(analysisResults.authenticity_score);
    analysisResults.confidence = calculateConfidence(analysisResults);
    analysisResults.processing_time = Date.now() - analysisResults.processing_time;

    // Step 5: Generate recommendations
    analysisResults.recommendations = generateRecommendations(analysisResults);

    res.status(200).json(analysisResults);

  } catch (error) {
    console.error('AI Analysis Error:', error);
    res.status(500).json({ 
      error: 'Analysis failed', 
      message: error.message,
      authenticity_score: 50, // Fallback score
      risk_level: 'unknown',
      confidence: 0.1
    });
  }
}

// Analyze image text using Google Cloud Vision
async function analyzeImageText(imageBase64) {
  try {
    const imageBuffer = Buffer.from(imageBase64.split(',')[1], 'base64');
    
    const [result] = await vision.textDetection({
      image: { content: imageBuffer }
    });

    const detections = result.textAnnotations;
    const extractedText = detections?.[0]?.description || '';

    // Analyze the extracted text
    const textAnalysis = {
      extracted_text: extractedText,
      detected_issues: [],
      text_quality_score: 0
    };

    // Check for common authenticity indicators
    textAnalysis.text_quality_score = analyzeTextQuality(extractedText);
    textAnalysis.detected_issues = detectTextIssues(extractedText);
    textAnalysis.detected_barcode = extractBarcode(extractedText);
    textAnalysis.detected_brand = detectBrand(extractedText);
    textAnalysis.detected_model = detectModel(extractedText);

    return textAnalysis;

  } catch (error) {
    console.error('Vision API Error:', error);
    return {
      extracted_text: '',
      detected_issues: ['Failed to process image'],
      text_quality_score: 0
    };
  }
}

// Analyze product URL for authenticity indicators
async function analyzeProductUrl(url) {
  try {
    const urlAnalysis = {
      store_reputation: 0,
      url_risk_factors: [],
      detected_store: '',
      price_information: null
    };

    const domain = new URL(url).hostname.toLowerCase();
    urlAnalysis.detected_store = domain;

    // Store reputation scoring
    const storeReputations = {
      'amazon.com': 95,
      'apple.com': 100,
      'bestbuy.com': 90,
      'walmart.com': 85,
      'target.com': 85,
      'ebay.com': 70,
      'etsy.com': 60,
      'aliexpress.com': 30,
      'wish.com': 20,
      'dhgate.com': 25
    };

    urlAnalysis.store_reputation = storeReputations[domain] || 50;

    // Check for suspicious URL patterns
    if (domain.includes('replica') || domain.includes('fake') || domain.includes('copy')) {
      urlAnalysis.url_risk_factors.push('Suspicious domain name');
    }

    if (url.includes('?') && url.split('?')[1].length > 100) {
      urlAnalysis.url_risk_factors.push('Suspicious URL parameters');
    }

    return urlAnalysis;

  } catch (error) {
    return {
      store_reputation: 50,
      url_risk_factors: ['Invalid URL'],
      detected_store: 'unknown'
    };
  }
}

// Get product information from UPC Database
async function getProductInfo(barcode) {
  try {
    if (!UPC_API_KEY) {
      return { error: 'UPC API not configured' };
    }

    const response = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Shop Scan Pro'
      }
    });

    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const product = data.items[0];
      return {
        name: product.title,
        brand: product.brand,
        category: product.category,
        official_images: product.images || [],
        msrp: product.msrp,
        description: product.description
      };
    }

    return { error: 'Product not found in database' };

  } catch (error) {
    console.error('UPC API Error:', error);
    return { error: 'Failed to fetch product information' };
  }
}

// Analyze text quality for authenticity indicators
function analyzeTextQuality(text) {
  if (!text) return 0;

  let score = 100;
  
  // Check for spelling errors (basic implementation)
  const commonMisspellings = [
    'gurantee', 'guarntee', 'garantee', // guarantee
    'orignal', 'origional', // original
    'authetic', 'autentic', 'authentc', // authentic
    'quallity', 'qualitty', // quality
  ];

  commonMisspellings.forEach(misspelling => {
    if (text.toLowerCase().includes(misspelling)) {
      score -= 20;
    }
  });

  // Check for suspicious patterns
  if (text.toLowerCase().includes('aaa quality')) score -= 15;
  if (text.toLowerCase().includes('replica')) score -= 30;
  if (text.toLowerCase().includes('1:1 copy')) score -= 40;
  if (text.toLowerCase().includes('same as original')) score -= 25;

  // Check for legitimate indicators
  if (text.toLowerCase().includes('warranty')) score += 10;
  if (text.toLowerCase().includes('serial number')) score += 15;
  if (text.toLowerCase().includes('model number')) score += 10;

  return Math.max(0, Math.min(100, score));
}

// Detect text-based issues
function detectTextIssues(text) {
  const issues = [];
  
  if (!text || text.length < 10) {
    issues.push('Insufficient text detected');
    return issues;
  }

  const lowerText = text.toLowerCase();

  // Spelling/grammar issues
  const misspellings = ['gurantee', 'orignal', 'authetic', 'quallity'];
  misspellings.forEach(word => {
    if (lowerText.includes(word)) {
      issues.push('Spelling errors detected');
    }
  });

  // Suspicious phrases
  const suspiciousPhrases = ['aaa quality', 'replica', '1:1 copy', 'same as original'];
  suspiciousPhrases.forEach(phrase => {
    if (lowerText.includes(phrase)) {
      issues.push(`Suspicious phrase: "${phrase}"`);
    }
  });

  // Missing expected elements
  if (!lowerText.includes('serial') && !lowerText.includes('model')) {
    issues.push('Missing product identification numbers');
  }

  return issues;
}

// Extract barcode/UPC from text
function extractBarcode(text) {
  // Look for UPC/EAN patterns
  const barcodePattern = /\b\d{12,13}\b/g;
  const matches = text.match(barcodePattern);
  return matches ? matches[0] : null;
}

// Detect brand from text
function detectBrand(text) {
  const commonBrands = [
    'apple', 'samsung', 'nike', 'adidas', 'gucci', 'louis vuitton',
    'rolex', 'omega', 'sony', 'microsoft', 'google', 'amazon'
  ];
  
  const lowerText = text.toLowerCase();
  return commonBrands.find(brand => lowerText.includes(brand)) || null;
}

// Detect model from text
function detectModel(text) {
  // Look for model patterns (letters + numbers)
  const modelPattern = /\b[A-Z]{1,3}[-\s]?\d{2,4}[A-Z]?\b/g;
  const matches = text.match(modelPattern);
  return matches ? matches[0] : null;
}

// Calculate overall authenticity score
function calculateAuthenticityScore(results) {
  let score = 100;
  let factors = 0;

  // Text quality (30% weight)
  if (results.text_quality_score !== undefined) {
    score = (score * factors + results.text_quality_score * 0.3) / (factors + 0.3);
    factors += 0.3;
  }

  // Store reputation (40% weight)
  if (results.store_reputation !== undefined) {
    score = (score * factors + results.store_reputation * 0.4) / (factors + 0.4);
    factors += 0.4;
  }

  // Issue penalties (30% weight)
  const issueCount = results.detected_issues?.length || 0;
  const issuePenalty = Math.min(issueCount * 15, 60); // Max 60 point penalty
  score = (score * factors + (100 - issuePenalty) * 0.3) / (factors + 0.3);

  return Math.round(Math.max(0, Math.min(100, score)));
}

// Get risk level based on score
function getRiskLevel(score) {
  if (score >= 80) return 'low';
  if (score >= 60) return 'medium';
  if (score >= 40) return 'high';
  return 'very_high';
}

// Calculate confidence score
function calculateConfidence(results) {
  let confidence = 0.5; // Base confidence

  // Increase confidence based on available data
  if (results.extracted_text?.length > 50) confidence += 0.2;
  if (results.detected_barcode) confidence += 0.2;
  if (results.product_info && !results.product_info.error) confidence += 0.3;
  if (results.detected_brand) confidence += 0.1;

  // Decrease confidence for issues
  const issueCount = results.detected_issues?.length || 0;
  confidence = Math.max(0.1, confidence - (issueCount * 0.05));

  return Math.round(confidence * 100) / 100;
}

// Generate recommendations based on analysis
function generateRecommendations(results) {
  const recommendations = [];
  const score = results.authenticity_score;

  if (score < 40) {
    recommendations.push('⚠️ High risk of counterfeit - avoid this product');
    recommendations.push('🔍 Verify through official brand channels');
    recommendations.push('💰 Price may be too good to be true');
  } else if (score < 60) {
    recommendations.push('⚡ Exercise caution with this product');
    recommendations.push('🏪 Consider purchasing from verified retailers');
    recommendations.push('📞 Contact brand directly to verify authenticity');
  } else if (score < 80) {
    recommendations.push('✅ Likely authentic but verify before purchase');
    recommendations.push('🔒 Check seller reviews and return policy');
  } else {
    recommendations.push('✅ High confidence this product is authentic');
    recommendations.push('💚 Safe to proceed with purchase');
  }

  // Store-specific recommendations
  if (results.store_reputation < 60) {
    recommendations.push('🏪 Consider alternative retailers with better reputation');
  }

  // Price-based recommendations
  if (results.price_analysis?.below_market) {
    recommendations.push('💰 Price significantly below market - verify authenticity');
  }

  return recommendations;
}