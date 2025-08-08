// Vercel serverless function for AI product analysis
// Path: /api/analyze-product.js

import { ImageAnnotatorClient } from '@google-cloud/vision';

// Helpers
function cleanPrivateKey(pk) {
  if (!pk) return pk;
  // Handle escaped newlines and accidental quotes from env UIs
  let key = pk.replace(/\\n/g, '\n');
  if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1);
  if (key.startsWith("'") && key.endsWith("'")) key = key.slice(1, -1);
  return key;
}

// Initialize Google Cloud Vision client
const vision = new ImageAnnotatorClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: cleanPrivateKey(process.env.GOOGLE_CLOUD_PRIVATE_KEY),
  },
});

// UPC Database API configuration
const UPC_API_KEY = process.env.UPC_DATABASE_API_KEY;

// Allow large JSON bodies for base64 images
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, url, userLocation } = req.body || {};

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
      processing_time: Date.now(),
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

    return res.status(200).json(analysisResults);
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return res.status(500).json({
      error: 'Analysis failed',
      message: error?.message || 'Unknown error',
      authenticity_score: 50, // Fallback score
      risk_level: 'unknown',
      confidence: 0.1,
    });
  }
}

// Analyze image text using Google Cloud Vision
async function analyzeImageText(imageBase64) {
  try {
    // Support data URLs or raw base64
    const commaIdx = imageBase64.indexOf(',');
    const base64Payload = commaIdx >= 0 ? imageBase64.slice(commaIdx + 1) : imageBase64;
    const imageBuffer = Buffer.from(base64Payload, 'base64');

    const [result] = await vision.textDetection({
      image: { content: imageBuffer },
    });

    const detections = result?.textAnnotations || [];
    const extractedText = detections[0]?.description || '';

    const textAnalysis = {
      extracted_text: extractedText,
      detected_issues: [],
      text_quality_score: 0,
    };

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
      text_quality_score: 0,
    };
  }
}

// Analyze product URL for authenticity indicators
async function analyzeProductUrl(rawUrl) {
  try {
    const urlAnalysis = {
      store_reputation: 0,
      url_risk_factors: [],
      detected_store: '',
      price_information: null,
    };

    let domain = 'unknown';
    try {
      const parsed = new URL(rawUrl);
      domain = parsed.hostname.toLowerCase();
    } catch {
      urlAnalysis.url_risk_factors.push('Invalid URL');
      urlAnalysis.store_reputation = 50;
      urlAnalysis.detected_store = 'unknown';
      return urlAnalysis;
    }

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
      'dhgate.com': 25,
      // Common subdomains should map cleanly
      'www.amazon.com': 95,
      'www.ebay.com': 70,
      'www.etsy.com': 60,
    };

    urlAnalysis.store_reputation = storeReputations[domain] ?? 50;

    // Check for suspicious URL patterns
    const lowerDomain = domain.toLowerCase();
    if (lowerDomain.includes('replica') || lowerDomain.includes('fake') || lowerDomain.includes('copy')) {
      urlAnalysis.url_risk_factors.push('Suspicious domain name');
    }

    if (rawUrl.includes('?')) {
      const query = rawUrl.split('?')[1] || '';
      if (query.length > 100) {
        urlAnalysis.url_risk_factors.push('Suspicious URL parameters');
      }
    }

    return urlAnalysis;
  } catch {
    return {
      store_reputation: 50,
      url_risk_factors: ['URL analysis error'],
      detected_store: 'unknown',
    };
  }
}

// Get product information from UPC Database
async function getProductInfo(barcode) {
  try {
    // Use paid endpoint if key is present, fall back to trial
    const hasKey = Boolean(UPC_API_KEY);
    const url = hasKey
      ? `https://api.upcitemdb.com/prod/v1/lookup?upc=${encodeURIComponent(barcode)}`
      : `https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(barcode)}`;

    // Basic timeout so the function does not hang
    const ac = new AbortController();
    const timeout = setTimeout(() => ac.abort(), 6000);

    const headers = {
      Accept: 'application/json',
      'User-Agent': 'Shop Scanner Now',
    };
    if (hasKey) headers.key = UPC_API_KEY;

    const response = await fetch(url, { headers, signal: ac.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      return { error: `UPC API HTTP ${response.status}` };
    }

    const data = await response.json();

    if (Array.isArray(data?.items) && data.items.length > 0) {
      const product = data.items[0];
      return {
        name: product.title,
        brand: product.brand,
        category: product.category,
        official_images: product.images || [],
        msrp: product.msrp,
        description: product.description,
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
    'gurantee',
    'guarntee',
    'garantee', // guarantee
    'orignal',
    'origional', // original
    'authetic',
    'autentic',
    'authentc', // authentic
    'quallity',
    'qualitty', // quality
  ];

  const lt = text.toLowerCase();
  for (const misspelling of commonMisspellings) {
    if (lt.includes(misspelling)) score -= 20;
  }

  // Suspicious patterns
  if (lt.includes('aaa quality')) score -= 15;
  if (lt.includes('replica')) score -= 30;
  if (lt.includes('1:1 copy')) score -= 40;
  if (lt.includes('same as original')) score -= 25;

  // Legitimate indicators
  if (lt.includes('warranty')) score += 10;
  if (lt.includes('serial number')) score += 15;
  if (lt.includes('model number')) score += 10;

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

  // Spelling or grammar
  const misspellings = ['gurantee', 'orignal', 'authetic', 'quallity'];
  for (const word of misspellings) {
    if (lowerText.includes(word)) {
      issues.push('Spelling errors detected');
      break;
    }
  }

  // Suspicious phrases
  const suspiciousPhrases = ['aaa quality', 'replica', '1:1 copy', 'same as original'];
  for (const phrase of suspiciousPhrases) {
    if (lowerText.includes(phrase)) {
      issues.push(`Suspicious phrase: "${phrase}"`);
    }
  }

  // Missing expected elements
  if (!lowerText.includes('serial') && !lowerText.includes('model')) {
    issues.push('Missing product identification numbers');
  }

  return issues;
}

// Extract barcode or UPC from text
function extractBarcode(text) {
  if (!text) return null;
  // Match 12 to 13 digit sequences that look like UPC/EAN
  const barcodePattern = /(^|[^\d])(\d{12,13})(?!\d)/g;
  const matches = [];
  let m;
  while ((m = barcodePattern.exec(text)) !== null) {
    matches.push(m[2]);
  }
  return matches.length ? matches[0] : null;
}

// Detect brand from text
function detectBrand(text) {
  if (!text) return null;
  const commonBrands = [
    'apple',
    'samsung',
    'nike',
    'adidas',
    'gucci',
    'louis vuitton',
    'rolex',
    'omega',
    'sony',
    'microsoft',
    'google',
    'amazon',
  ];

  const lowerText
