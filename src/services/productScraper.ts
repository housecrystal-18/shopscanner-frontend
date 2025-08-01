// Product Scraper Service - Extracts real product data from retailer websites
export interface ScrapedProduct {
  name: string;
  brand: string;
  price: string;
  originalPrice?: string;
  availability: 'in_stock' | 'out_of_stock' | 'limited' | 'unknown';
  rating?: number;
  reviewCount?: number;
  images: string[];
  description: string;
  seller: string;
  sellerRating?: number;
  category: string;
  features: string[];
  specifications: { [key: string]: string };
  lastUpdated: number;
  source: 'amazon' | 'ebay' | 'etsy' | 'other';
  confidence: number; // How confident we are in the data accuracy
}

export interface ScrapingResult {
  success: boolean;
  product?: ScrapedProduct;
  error?: string;
  rateLimited?: boolean;
  blocked?: boolean;
}

class ProductScraperService {
  private rateLimiter = new Map<string, number>();
  private proxyList: string[] = [];
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15'
  ];

  constructor() {
    // Initialize with some basic configuration
    this.setupRateLimiting();
  }

  private setupRateLimiting() {
    // Rate limiting: max 1 request per 2 seconds per domain
    setInterval(() => {
      this.rateLimiter.clear();
    }, 300000); // Clear every 5 minutes
  }

  private canMakeRequest(domain: string): boolean {
    const lastRequest = this.rateLimiter.get(domain);
    const now = Date.now();
    
    if (!lastRequest) {
      this.rateLimiter.set(domain, now);
      return true;
    }
    
    // Require 2 seconds between requests to same domain
    if (now - lastRequest < 2000) {
      return false;
    }
    
    this.rateLimiter.set(domain, now);
    return true;
  }

  private getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname.toLowerCase().replace('www.', '');
    } catch {
      return 'unknown';
    }
  }

  private async makeRequest(url: string, retries = 3): Promise<string> {
    const domain = this.extractDomain(url);
    
    if (!this.canMakeRequest(domain)) {
      throw new Error('Rate limited - please wait before making another request');
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch('/api/scrape-product', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url,
            userAgent: this.getRandomUserAgent(),
            timeout: 15000,
            attempt
          }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('Rate limited by server');
          }
          if (response.status === 403) {
            throw new Error('Access blocked by website');
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data.html;

      } catch (error) {
        console.warn(`Scraping attempt ${attempt}/${retries} failed:`, error);
        
        if (attempt === retries) {
          throw error;
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }

    throw new Error('All scraping attempts failed');
  }

  async scrapeProduct(url: string): Promise<ScrapingResult> {
    try {
      const domain = this.extractDomain(url);
      
      // Route to appropriate scraper based on domain
      switch (domain) {
        case 'amazon.com':
          return await this.scrapeAmazon(url);
        case 'ebay.com':
          return await this.scrapeEbay(url);
        case 'etsy.com':
          return await this.scrapeEtsy(url);
        default:
          return await this.scrapeGeneric(url);
      }
    } catch (error) {
      console.error('Product scraping failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown scraping error',
        rateLimited: error instanceof Error && error.message.includes('Rate limited'),
        blocked: error instanceof Error && error.message.includes('blocked')
      };
    }
  }

  private async scrapeAmazon(url: string): Promise<ScrapingResult> {
    try {
      const html = await this.makeRequest(url);
      
      console.log(`Amazon HTML received: ${html.length} characters`);
      
      // Amazon scraping logic - extract data from HTML
      const product: ScrapedProduct = {
        name: this.extractAmazonTitle(html),
        brand: this.extractAmazonBrand(html),
        price: this.extractAmazonPrice(html),
        originalPrice: this.extractAmazonOriginalPrice(html),
        availability: this.extractAmazonAvailability(html),
        rating: this.extractAmazonRating(html),
        reviewCount: this.extractAmazonReviewCount(html),
        images: this.extractAmazonImages(html),
        description: this.extractAmazonDescription(html),
        seller: this.extractAmazonSeller(html),
        sellerRating: this.extractAmazonSellerRating(html),
        category: this.extractAmazonCategory(html),
        features: this.extractAmazonFeatures(html),
        specifications: this.extractAmazonSpecs(html),
        lastUpdated: Date.now(),
        source: 'amazon',
        confidence: this.calculateConfidence(html, 'amazon')
      };

      return {
        success: true,
        product
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Amazon scraping failed'
      };
    }
  }

  private extractAmazonTitle(html: string): string {
    // Multiple approaches to find Amazon product title
    
    // Method 1: Direct ID selector
    let match = html.match(/<span[^>]*id=['"]productTitle['"][^>]*>([^<]+)<\/span>/i);
    if (match) {
      return this.cleanText(match[1]);
    }

    // Method 2: Look for productTitle in any element
    match = html.match(/id=['"]productTitle['"][^>]*>([^<]+)</i);
    if (match) {
      return this.cleanText(match[1]);
    }

    // Method 3: Meta og:title tag
    match = html.match(/<meta[^>]*property=['"]og:title['"][^>]*content=['"]([^'"]+)['"][^>]*>/i);
    if (match) {
      return this.cleanText(match[1]);
    }

    // Method 4: Look for title in JSON-LD structured data
    match = html.match(/"name"\s*:\s*"([^"]+)"/i);
    if (match) {
      return this.cleanText(match[1]);
    }

    // Method 5: Page title extraction (remove Amazon.com part)
    match = html.match(/<title>([^<]+)<\/title>/i);
    if (match) {
      const title = this.cleanText(match[1]);
      // Remove common Amazon suffixes
      const cleanTitle = title
        .replace(/\s*-\s*Amazon\.com.*$/i, '')
        .replace(/\s*\|\s*Amazon\.com.*$/i, '')
        .replace(/\s*:\s*Amazon\.com.*$/i, '');
      if (cleanTitle.length > 10) {
        return cleanTitle;
      }
    }

    console.warn('Could not extract Amazon product title');
    return 'Unknown Product';
  }

  private extractAmazonOriginalPrice(html: string): string | undefined {
    // Look for crossed-out prices or "was" prices
    const originalPriceSelectors = [
      '.a-price.a-text-price .a-offscreen',
      '.a-price-was .a-offscreen', 
      '[data-a-strike="true"]',
      '.a-text-strike'
    ];

    for (const selector of originalPriceSelectors) {
      const regex = new RegExp(`class=['"]?[^'"]*${selector.replace('.', '')}[^'"]*['"]?[^>]*>([^<]+)<`, 'i');
      const match = html.match(regex);
      if (match) {
        const price = this.cleanText(match[1]);
        if (price.match(/[\d,]+/)) {
          return '$' + price.replace(/[^\d.,]/g, '');
        }
      }
    }

    return undefined;
  }

  private extractAmazonPrice(html: string): string {
    // Method 1: Look for a-price a-offscreen (most reliable)
    let match = html.match(/<span[^>]*class=['"][^'"]*a-price[^'"]*a-offscreen[^'"]*['"][^>]*>([^<]+)<\/span>/i);
    if (match) {
      const price = this.cleanText(match[1]);
      if (price.includes('$') && price.match(/[\d]/)) {
        return price;
      }
    }

    // Method 2: Look for any a-offscreen price
    match = html.match(/<span[^>]*class=['"][^'"]*a-offscreen[^'"]*['"][^>]*>\$?([^<]+)<\/span>/i);
    if (match) {
      const price = this.cleanText(match[1]);
      if (price.match(/[\d,]+/)) {
        return '$' + price.replace(/[^\d.,]/g, '');
      }
    }

    // Method 3: Look for price in JSON data
    match = html.match(/"price"\s*:\s*"?\$?([^,"]+)"?/i);
    if (match) {
      const price = this.cleanText(match[1]);
      if (price.match(/[\d,]+/)) {
        return '$' + price.replace(/[^\d.,]/g, '');
      }
    }

    // Method 4: Look for priceblock price
    match = html.match(/<span[^>]*class=['"][^'"]*priceblock[^'"]*['"][^>]*>\$?([^<]+)<\/span>/i);
    if (match) {
      const price = this.cleanText(match[1]);
      if (price.match(/[\d,]+/)) {
        return '$' + price.replace(/[^\d.,]/g, '');
      }
    }

    // Method 5: Generic price pattern search
    const pricePatterns = [
      /\$[\d,]+\.?\d{0,2}/g,
      /[\d,]+\.?\d{0,2}\s*USD/gi,
      /Price:\s*\$?[\d,]+\.?\d{0,2}/gi
    ];

    for (const pattern of pricePatterns) {
      const prices = html.match(pattern);
      if (prices && prices.length > 0) {
        // Find the most reasonable price (not too small, not too large)
        const validPrices = prices
          .map(p => parseFloat(p.replace(/[^\d.]/g, '')))
          .filter(p => p > 1 && p < 10000)
          .sort((a, b) => a - b);
        
        if (validPrices.length > 0) {
          return '$' + validPrices[0].toFixed(2);
        }
      }
    }

    console.warn('Could not extract Amazon price');
    return '$0.00';
  }

  private extractAmazonBrand(html: string): string {
    // Look for brand information
    const brandMatch = html.match(/by\s+<a[^>]*>([^<]+)<\/a>/i) ||
                      html.match(/"brand":\s*"([^"]+)"/i) ||
                      html.match(/Brand:\s*([^<\n]+)/i);
    
    if (brandMatch) {
      return this.cleanText(brandMatch[1]);
    }
    
    return 'Unknown Brand';
  }

  private extractAmazonAvailability(html: string): 'in_stock' | 'out_of_stock' | 'limited' | 'unknown' {
    const htmlLower = html.toLowerCase();
    
    if (htmlLower.includes('in stock') || htmlLower.includes('available')) {
      return 'in_stock';
    }
    if (htmlLower.includes('out of stock') || htmlLower.includes('unavailable')) {
      return 'out_of_stock';
    }
    if (htmlLower.includes('limited') || htmlLower.includes('few left')) {
      return 'limited';
    }
    
    return 'unknown';
  }

  private extractAmazonRating(html: string): number | undefined {
    const ratingMatch = html.match(/(\d+\.?\d*)\s*out of 5 stars/i) ||
                       html.match(/"ratingValue":\s*"?(\d+\.?\d*)"?/i);
    
    if (ratingMatch) {
      return parseFloat(ratingMatch[1]);
    }
    
    return undefined;
  }

  private extractAmazonReviewCount(html: string): number | undefined {
    const reviewMatch = html.match(/(\d+(?:,\d+)*)\s*(?:customer )?reviews?/i) ||
                       html.match(/"reviewCount":\s*"?(\d+(?:,\d+)*)"?/i);
    
    if (reviewMatch) {
      return parseInt(reviewMatch[1].replace(/,/g, ''));
    }
    
    return undefined;
  }

  private extractAmazonImages(html: string): string[] {
    const images: string[] = [];
    
    // Look for product images
    const imageMatches = html.match(/https:\/\/[^"'\s]*\.(?:jpg|jpeg|png|webp)[^"'\s]*/gi);
    if (imageMatches) {
      // Filter for product images (Amazon specific patterns)
      const productImages = imageMatches.filter(img => 
        img.includes('images-amazon.com') && 
        !img.includes('nav-logo') &&
        !img.includes('icon')
      );
      images.push(...productImages.slice(0, 5)); // Limit to 5 images
    }
    
    return images;
  }

  private extractAmazonDescription(html: string): string {
    // Look for product description
    const descMatch = html.match(/<div[^>]*(?:id|class)=['"][^'"]*(?:description|detail)[^'"]*['"][^>]*>([^<]+)/i);
    if (descMatch) {
      return this.cleanText(descMatch[1]);
    }
    
    return 'No description available';
  }

  private extractAmazonSeller(html: string): string {
    const sellerMatch = html.match(/sold by\s*<[^>]*>([^<]+)</i) ||
                       html.match(/"seller":\s*"([^"]+)"/i);
    
    if (sellerMatch) {
      return this.cleanText(sellerMatch[1]);
    }
    
    return 'Amazon';
  }

  private extractAmazonSellerRating(html: string): number | undefined {
    const sellerRatingMatch = html.match(/seller rating[^0-9]*(\d+)%/i);
    if (sellerRatingMatch) {
      return parseInt(sellerRatingMatch[1]);
    }
    
    return undefined;
  }

  private extractAmazonCategory(html: string): string {
    const categoryMatch = html.match(/"category":\s*"([^"]+)"/i) ||
                         html.match(/in\s+([^<]+)\s*</i);
    
    if (categoryMatch) {
      return this.cleanText(categoryMatch[1]);
    }
    
    return 'General';
  }

  private extractAmazonFeatures(html: string): string[] {
    const features: string[] = [];
    
    // Look for bullet points or feature lists
    const featureMatches = html.match(/<li[^>]*>([^<]+)<\/li>/gi);
    if (featureMatches) {
      features.push(...featureMatches.map(match => 
        this.cleanText(match.replace(/<[^>]*>/g, ''))
      ).slice(0, 10));
    }
    
    return features;
  }

  private extractAmazonSpecs(html: string): { [key: string]: string } {
    const specs: { [key: string]: string } = {};
    
    // Look for specification tables
    const specMatches = html.match(/<tr[^>]*>[\s\S]*?<td[^>]*>([^<]+)<\/td>[\s\S]*?<td[^>]*>([^<]+)<\/td>[\s\S]*?<\/tr>/gi);
    if (specMatches) {
      specMatches.forEach(match => {
        const cells = match.match(/<td[^>]*>([^<]+)<\/td>/gi);
        if (cells && cells.length >= 2) {
          const key = this.cleanText(cells[0].replace(/<[^>]*>/g, ''));
          const value = this.cleanText(cells[1].replace(/<[^>]*>/g, ''));
          specs[key] = value;
        }
      });
    }
    
    return specs;
  }

  private calculateConfidence(html: string, source: string): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on data quality
    if (html.includes('productTitle') || html.includes('product-title')) confidence += 0.2;
    if (html.includes('a-price')) confidence += 0.2;
    if (html.includes('reviews')) confidence += 0.1;
    if (html.includes('in stock')) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  // Placeholder methods for other platforms
  private async scrapeEbay(url: string): Promise<ScrapingResult> {
    // eBay scraping implementation
    return { success: false, error: 'eBay scraping not implemented yet' };
  }

  private async scrapeEtsy(url: string): Promise<ScrapingResult> {
    // Etsy scraping implementation  
    return { success: false, error: 'Etsy scraping not implemented yet' };
  }

  private async scrapeGeneric(url: string): Promise<ScrapingResult> {
    // Generic scraping for unknown sites
    return { success: false, error: 'Generic scraping not implemented yet' };
  }

  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  // Cache management
  private cache = new Map<string, { data: ScrapedProduct; timestamp: number }>();
  private readonly CACHE_DURATION = 300000; // 5 minutes

  getCachedProduct(url: string): ScrapedProduct | null {
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  setCachedProduct(url: string, product: ScrapedProduct): void {
    this.cache.set(url, { data: product, timestamp: Date.now() });
    
    // Cleanup old cache entries
    if (this.cache.size > 1000) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      entries.slice(0, 500).forEach(([key]) => this.cache.delete(key));
    }
  }
}

export const productScraperService = new ProductScraperService();