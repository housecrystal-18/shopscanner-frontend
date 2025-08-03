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
  source: 'amazon' | 'ebay' | 'etsy' | 'walmart' | 'target' | 'bestbuy' | 'facebook_marketplace' | 'mercari' | 'depop' | 'poshmark' | 'aliexpress' | 'shopify' | 'other';
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
        case 'walmart.com':
          return await this.scrapeWalmart(url);
        case 'target.com':
          return await this.scrapeTarget(url);
        case 'bestbuy.com':
          return await this.scrapeBestBuy(url);
        case 'facebook.com':
        case 'marketplace.facebook.com':
          return await this.scrapeFacebookMarketplace(url);
        case 'mercari.com':
          return await this.scrapeMercari(url);
        case 'depop.com':
          return await this.scrapeDepop(url);
        case 'poshmark.com':
          return await this.scrapePoshmark(url);
        case 'aliexpress.com':
          return await this.scrapeAliExpress(url);
        default:
          // Check if it's a Shopify store
          if (await this.isShopifyStore(url)) {
            return await this.scrapeShopify(url);
          }
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
    
    if (source === 'amazon') {
      // Amazon-specific confidence indicators
      if (html.includes('productTitle') || html.includes('product-title')) confidence += 0.2;
      if (html.includes('a-price')) confidence += 0.2;
      if (html.includes('reviews')) confidence += 0.1;
      if (html.includes('in stock')) confidence += 0.1;
    } else if (source === 'ebay') {
      // eBay-specific confidence indicators
      if (html.includes('x-title-label-lbl') || html.includes('item-title')) confidence += 0.2;
      if (html.includes('currentPrice') || html.includes('price')) confidence += 0.2;
      if (html.includes('seller') || html.includes('feedback')) confidence += 0.1;
      if (html.includes('buy it now') || html.includes('auction')) confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0);
  }

  // eBay scraping implementation
  private async scrapeEbay(url: string): Promise<ScrapingResult> {
    try {
      const html = await this.makeRequest(url);
      
      console.log(`eBay HTML received: ${html.length} characters`);
      
      // eBay scraping logic - extract data from HTML
      const product: ScrapedProduct = {
        name: this.extractEbayTitle(html),
        brand: this.extractEbayBrand(html),
        price: this.extractEbayPrice(html),
        originalPrice: this.extractEbayOriginalPrice(html),
        availability: this.extractEbayAvailability(html),
        rating: this.extractEbayRating(html),
        reviewCount: this.extractEbayReviewCount(html),
        images: this.extractEbayImages(html),
        description: this.extractEbayDescription(html),
        seller: this.extractEbaySeller(html),
        sellerRating: this.extractEbaySellerRating(html),
        category: this.extractEbayCategory(html),
        features: this.extractEbayFeatures(html),
        specifications: this.extractEbaySpecs(html),
        lastUpdated: Date.now(),
        source: 'ebay',
        confidence: this.calculateConfidence(html, 'ebay')
      };

      return {
        success: true,
        product
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'eBay scraping failed'
      };
    }
  }

  private async scrapeEtsy(url: string): Promise<ScrapingResult> {
    try {
      const html = await this.makeRequest(url);
      console.log(`Etsy HTML received: ${html.length} characters`);
      
      const product: ScrapedProduct = {
        name: this.extractEtsyTitle(html),
        brand: this.extractEtsyShop(html),
        price: this.extractEtsyPrice(html),
        originalPrice: this.extractEtsyOriginalPrice(html),
        availability: this.extractEtsyAvailability(html),
        rating: this.extractEtsyRating(html),
        reviewCount: this.extractEtsyReviewCount(html),
        images: this.extractEtsyImages(html),
        description: this.extractEtsyDescription(html),
        seller: this.extractEtsyShop(html),
        sellerRating: this.extractEtsyShopRating(html),
        category: this.extractEtsyCategory(html),
        features: this.extractEtsyFeatures(html),
        specifications: this.extractEtsySpecifications(html),
        lastUpdated: Date.now(),
        source: 'etsy',
        confidence: this.calculateConfidence(html, 'etsy')
      };

      return { success: true, product };
    } catch (error) {
      console.error('Etsy scraping failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Etsy scraping failed',
        blocked: error instanceof Error && error.message.includes('blocked')
      };
    }
  }

  private async scrapeWalmart(url: string): Promise<ScrapingResult> {
    try {
      const html = await this.makeRequest(url);
      console.log(`Walmart HTML received: ${html.length} characters`);
      
      const product: ScrapedProduct = {
        name: this.extractWalmartTitle(html),
        brand: this.extractWalmartBrand(html),
        price: this.extractWalmartPrice(html),
        originalPrice: this.extractWalmartOriginalPrice(html),
        availability: this.extractWalmartAvailability(html),
        rating: this.extractWalmartRating(html),
        reviewCount: this.extractWalmartReviewCount(html),
        images: this.extractWalmartImages(html),
        description: this.extractWalmartDescription(html),
        seller: this.extractWalmartSeller(html),
        sellerRating: this.extractWalmartSellerRating(html),
        category: this.extractWalmartCategory(html),
        features: this.extractWalmartFeatures(html),
        specifications: this.extractWalmartSpecs(html),
        lastUpdated: Date.now(),
        source: 'walmart',
        confidence: this.calculateConfidence(html, 'walmart')
      };

      return { success: true, product };
    } catch (error) {
      console.error('Walmart scraping failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Walmart scraping failed',
        blocked: error instanceof Error && error.message.includes('blocked')
      };
    }
  }

  private async scrapeTarget(url: string): Promise<ScrapingResult> {
    try {
      const html = await this.makeRequest(url);
      const product: ScrapedProduct = {
        name: this.extractTargetTitle(html),
        brand: this.extractTargetBrand(html),
        price: this.extractTargetPrice(html),
        originalPrice: this.extractTargetOriginalPrice(html),
        availability: this.extractTargetAvailability(html),
        rating: this.extractTargetRating(html),
        reviewCount: this.extractTargetReviewCount(html),
        images: this.extractTargetImages(html),
        description: this.extractTargetDescription(html),
        seller: 'Target',
        sellerRating: undefined,
        category: this.extractTargetCategory(html),
        features: this.extractTargetFeatures(html),
        specifications: this.extractTargetSpecs(html),
        lastUpdated: Date.now(),
        source: 'target',
        confidence: this.calculateConfidence(html, 'target')
      };
      return { success: true, product };
    } catch (error) {
      return { success: false, error: 'Target scraping failed' };
    }
  }

  private async scrapeBestBuy(url: string): Promise<ScrapingResult> {
    try {
      const html = await this.makeRequest(url);
      const product: ScrapedProduct = {
        name: this.extractBestBuyTitle(html),
        brand: this.extractBestBuyBrand(html),
        price: this.extractBestBuyPrice(html),
        originalPrice: this.extractBestBuyOriginalPrice(html),
        availability: this.extractBestBuyAvailability(html),
        rating: this.extractBestBuyRating(html),
        reviewCount: this.extractBestBuyReviewCount(html),
        images: this.extractBestBuyImages(html),
        description: this.extractBestBuyDescription(html),
        seller: 'Best Buy',
        sellerRating: undefined,
        category: this.extractBestBuyCategory(html),
        features: this.extractBestBuyFeatures(html),
        specifications: this.extractBestBuySpecs(html),
        lastUpdated: Date.now(),
        source: 'bestbuy',
        confidence: this.calculateConfidence(html, 'bestbuy')
      };
      return { success: true, product };
    } catch (error) {
      return { success: false, error: 'Best Buy scraping failed' };
    }
  }

  private async scrapeFacebookMarketplace(url: string): Promise<ScrapingResult> {
    try {
      const html = await this.makeRequest(url);
      const product: ScrapedProduct = {
        name: this.extractFacebookTitle(html),
        brand: this.extractFacebookBrand(html),
        price: this.extractFacebookPrice(html),
        originalPrice: undefined,
        availability: this.extractFacebookAvailability(html),
        rating: undefined,
        reviewCount: undefined,
        images: this.extractFacebookImages(html),
        description: this.extractFacebookDescription(html),
        seller: this.extractFacebookSeller(html),
        sellerRating: this.extractFacebookSellerRating(html),
        category: this.extractFacebookCategory(html),
        features: [],
        specifications: {},
        lastUpdated: Date.now(),
        source: 'facebook_marketplace',
        confidence: this.calculateConfidence(html, 'facebook')
      };
      return { success: true, product };
    } catch (error) {
      return { success: false, error: 'Facebook Marketplace scraping failed' };
    }
  }

  private async scrapeMercari(url: string): Promise<ScrapingResult> {
    try {
      const html = await this.makeRequest(url);
      const product: ScrapedProduct = {
        name: this.extractMercariTitle(html),
        brand: this.extractMercariBrand(html),
        price: this.extractMercariPrice(html),
        originalPrice: this.extractMercariOriginalPrice(html),
        availability: this.extractMercariAvailability(html),
        rating: undefined,
        reviewCount: undefined,
        images: this.extractMercariImages(html),
        description: this.extractMercariDescription(html),
        seller: this.extractMercariSeller(html),
        sellerRating: this.extractMercariSellerRating(html),
        category: this.extractMercariCategory(html),
        features: [],
        specifications: {},
        lastUpdated: Date.now(),
        source: 'mercari',
        confidence: this.calculateConfidence(html, 'mercari')
      };
      return { success: true, product };
    } catch (error) {
      return { success: false, error: 'Mercari scraping failed' };
    }
  }

  private async scrapeDepop(url: string): Promise<ScrapingResult> {
    try {
      const html = await this.makeRequest(url);
      const product: ScrapedProduct = {
        name: this.extractDepopTitle(html),
        brand: this.extractDepopBrand(html),
        price: this.extractDepopPrice(html),
        originalPrice: this.extractDepopOriginalPrice(html),
        availability: this.extractDepopAvailability(html),
        rating: undefined,
        reviewCount: undefined,
        images: this.extractDepopImages(html),
        description: this.extractDepopDescription(html),
        seller: this.extractDepopSeller(html),
        sellerRating: undefined,
        category: 'Fashion',
        features: [],
        specifications: {},
        lastUpdated: Date.now(),
        source: 'depop',
        confidence: this.calculateConfidence(html, 'depop')
      };
      return { success: true, product };
    } catch (error) {
      return { success: false, error: 'Depop scraping failed' };
    }
  }

  private async scrapePoshmark(url: string): Promise<ScrapingResult> {
    try {
      const html = await this.makeRequest(url);
      const product: ScrapedProduct = {
        name: this.extractPoshmarkTitle(html),
        brand: this.extractPoshmarkBrand(html),
        price: this.extractPoshmarkPrice(html),
        originalPrice: this.extractPoshmarkOriginalPrice(html),
        availability: this.extractPoshmarkAvailability(html),
        rating: undefined,
        reviewCount: undefined,
        images: this.extractPoshmarkImages(html),
        description: this.extractPoshmarkDescription(html),
        seller: this.extractPoshmarkSeller(html),
        sellerRating: undefined,
        category: 'Fashion',
        features: [],
        specifications: {},
        lastUpdated: Date.now(),
        source: 'poshmark',
        confidence: this.calculateConfidence(html, 'poshmark')
      };
      return { success: true, product };
    } catch (error) {
      return { success: false, error: 'Poshmark scraping failed' };
    }
  }

  private async scrapeAliExpress(url: string): Promise<ScrapingResult> {
    try {
      const html = await this.makeRequest(url);
      const product: ScrapedProduct = {
        name: this.extractAliExpressTitle(html),
        brand: this.extractAliExpressBrand(html),
        price: this.extractAliExpressPrice(html),
        originalPrice: this.extractAliExpressOriginalPrice(html),
        availability: this.extractAliExpressAvailability(html),
        rating: this.extractAliExpressRating(html),
        reviewCount: this.extractAliExpressReviewCount(html),
        images: this.extractAliExpressImages(html),
        description: this.extractAliExpressDescription(html),
        seller: this.extractAliExpressSeller(html),
        sellerRating: this.extractAliExpressSellerRating(html),
        category: this.extractAliExpressCategory(html),
        features: [],
        specifications: {},
        lastUpdated: Date.now(),
        source: 'aliexpress',
        confidence: this.calculateConfidence(html, 'aliexpress')
      };
      return { success: true, product };
    } catch (error) {
      return { success: false, error: 'AliExpress scraping failed' };
    }
  }

  private async scrapeShopify(url: string): Promise<ScrapingResult> {
    try {
      const html = await this.makeRequest(url);
      const product: ScrapedProduct = {
        name: this.extractShopifyTitle(html),
        brand: this.extractShopifyBrand(html),
        price: this.extractShopifyPrice(html),
        originalPrice: this.extractShopifyOriginalPrice(html),
        availability: this.extractShopifyAvailability(html),
        rating: undefined,
        reviewCount: undefined,
        images: this.extractShopifyImages(html),
        description: this.extractShopifyDescription(html),
        seller: this.extractShopifyShopName(html),
        sellerRating: undefined,
        category: this.extractShopifyCategory(html),
        features: [],
        specifications: {},
        lastUpdated: Date.now(),
        source: 'shopify',
        confidence: this.calculateConfidence(html, 'shopify')
      };
      return { success: true, product };
    } catch (error) {
      return { success: false, error: 'Shopify scraping failed' };
    }
  }

  private async isShopifyStore(url: string): Promise<boolean> {
    try {
      const html = await this.makeRequest(url);
      return html.includes('Shopify') || html.includes('shopify-section') || html.includes('shopify.js');
    } catch {
      return false;
    }
  }

  private async scrapeGeneric(url: string): Promise<ScrapingResult> {
    // Generic scraping for unknown sites
    return { success: false, error: 'Generic scraping not implemented yet' };
  }

  // Etsy-specific extraction methods
  private extractEtsyTitle(html: string): string {
    console.log('Extracting Etsy title from HTML...');
    
    // Modern Etsy title patterns - try most specific first
    const titlePatterns = [
      // JSON-LD structured data
      /"@type":"Product"[^}]*"name":"([^"]+)"/i,
      /"name":"([^"]+)"[^}]*"@type":"Product"/i,
      
      // Modern Etsy data attributes and classes
      /<h1[^>]*data-test-id="listing-page-title"[^>]*>([^<]+)<\/h1>/i,
      /<h1[^>]*class="[^"]*listing-page-title[^"]*"[^>]*>([^<]+)<\/h1>/i,
      /<h1[^>]*class="[^"]*wt-text-body-03[^"]*"[^>]*>([^<]+)<\/h1>/i,
      
      // Meta and title tags
      /<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i,
      /<meta[^>]*name="twitter:title"[^>]*content="([^"]+)"/i,
      /<title>([^|<\-–]+)[\|<\-–]/i,
      
      // JSON data patterns
      /"title":"([^"]+)"/i,
      /"listing_title":"([^"]+)"/i,
      
      // General H1 patterns (fallback)
      /<h1[^>]*>([^<]+)<\/h1>/i
    ];

    for (let i = 0; i < titlePatterns.length; i++) {
      const pattern = titlePatterns[i];
      const match = html.match(pattern);
      
      if (match && match[1]) {
        let title = this.cleanText(match[1]);
        
        // Remove common Etsy suffixes and prefixes
        title = title
          .replace(/\s*-\s*Etsy$/i, '')
          .replace(/^Etsy\s*-\s*/i, '')
          .replace(/\s*\|\s*Etsy$/i, '')
          .replace(/\s*–\s*Etsy$/i, '')
          .trim();
        
        // Skip overly generic titles
        if (title.length > 5 && 
            !title.toLowerCase().includes('etsy') && 
            !title.toLowerCase().includes('loading') &&
            !title.toLowerCase().includes('error')) {
          console.log(`Found valid title: ${title}`);
          return title;
        }
      }
    }

    console.log('No valid title found, returning default');
    return 'Etsy Product';
  }

  private extractEtsyShop(html: string): string {
    const shopPatterns = [
      /"shop_name":"([^"]+)"/i,
      /data-shop-name="([^"]+)"/i,
      /<a[^>]*href="\/shop\/[^"]*"[^>]*>([^<]+)<\/a>/i,
      /by\s*<[^>]*>([^<]+)<\/[^>]*>/i,
      /"seller_user_id":"([^"]+)"/i
    ];

    for (const pattern of shopPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const shop = this.cleanText(match[1]);
        if (shop.length > 2) {
          return shop;
        }
      }
    }

    return 'Etsy Shop';
  }

  private extractEtsyPrice(html: string): string {
    console.log('Extracting Etsy price from HTML...');
    
    // Modern Etsy price patterns - try most specific first
    const pricePatterns = [
      // JSON-LD structured data
      /"@type":"Product"[^}]*"offers"[^}]*"price":"([^"]+)"/i,
      /"offers"[^}]*"price":"([^"]+)"/i,
      
      // Modern Etsy data attributes and classes
      /data-test-id="listing-price"[^>]*>([^<]+)</i,
      /class="[^"]*price-display[^"]*"[^>]*>([^<]+)</i,
      /class="[^"]*listing-price[^"]*"[^>]*>([^<]+)</i,
      /class="[^"]*p-xs-2[^"]*"[^>]*>\s*([A-Z]{1,3}[\s$€£¥₹₩]+[\d,]+\.?\d*)/i,
      
      // JSON data in script tags
      /"currency_formatted_short":"([^"]+)"/i,
      /"formatted_price":"([^"]+)"/i,
      /"price_int":(\d+)/i, // Price in cents
      /"price":"([^"]+)"/i,
      
      // HTML patterns for current price display
      /<span[^>]*class="[^"]*currency-value[^"]*"[^>]*>([^<]+)<\/span>/i,
      /<span[^>]*class="[^"]*shop2-review-review[^"]*"[^>]*>.*?([A-Z]{1,3}[\s$€£¥₹₩]*[\d,]+\.?\d*)/i,
      /<p[^>]*class="[^"]*wt-text-title-03[^"]*"[^>]*>([^<]*[A-Z]{1,3}[\s$€£¥₹₩]*[\d,]+\.?\d*[^<]*)<\/p>/i,
      
      // General currency patterns (more specific)
      /US\$\s*([\d,]+\.?\d*)/i,
      /USD\s*([\d,]+\.?\d*)/i,
      /\$\s*([\d,]+\.?\d*)/i,
      /£\s*([\d,]+\.?\d*)/i,
      /€\s*([\d,]+\.?\d*)/i,
      /¥\s*([\d,]+\.?\d*)/i,
      
      // Broad currency patterns (fallback)
      /([A-Z]{1,3}[\s$€£¥₹₩]*[\d,]+\.?\d*)/gi
    ];

    for (let i = 0; i < pricePatterns.length; i++) {
      const pattern = pricePatterns[i];
      const matches = html.match(pattern);
      
      if (matches) {
        console.log(`Pattern ${i} matched:`, pattern, matches);
        
        if (pattern.global) {
          // For global patterns, find the most reasonable price
          for (const match of matches) {
            const cleanPrice = this.cleanText(match);
            const numericValue = parseFloat(cleanPrice.replace(/[^0-9.]/g, ''));
            
            // Filter out unreasonable prices (too high/low for typical Etsy items)
            if (cleanPrice.length > 1 && numericValue > 0.1 && numericValue < 50000) {
              console.log(`Found valid price: ${cleanPrice}`);
              return this.formatPrice(cleanPrice);
            }
          }
        } else if (matches[1]) {
          let cleanPrice = this.cleanText(matches[1]);
          
          // Handle price_int (cents) pattern
          if (pattern.source.includes('price_int')) {
            const cents = parseInt(matches[1]);
            if (cents > 0) {
              cleanPrice = `$${(cents / 100).toFixed(2)}`;
            }
          }
          
          const numericValue = parseFloat(cleanPrice.replace(/[^0-9.]/g, ''));
          
          if (cleanPrice.length > 1 && numericValue > 0.1 && numericValue < 50000) {
            console.log(`Found valid price: ${cleanPrice}`);
            return this.formatPrice(cleanPrice);
          }
        }
      }
    }

    console.log('No valid price found, returning default');
    return '$0.00';
  }

  private formatPrice(price: string): string {
    // Clean and format the price consistently
    const cleaned = price.replace(/\s+/g, ' ').trim();
    
    // If it already has a currency symbol, return as-is
    if (/^[A-Z]{1,3}[\s$€£¥₹₩]/.test(cleaned) || /^[$€£¥₹₩]/.test(cleaned)) {
      return cleaned;
    }
    
    // If it's just numbers, add dollar sign
    if (/^\d+\.?\d*$/.test(cleaned)) {
      return `$${cleaned}`;
    }
    
    // Try to extract just the number and add dollar sign
    const numMatch = cleaned.match(/([\d,]+\.?\d*)/);
    if (numMatch) {
      return `$${numMatch[1]}`;
    }
    
    return cleaned;
  }

  private extractEtsyOriginalPrice(html: string): string | undefined {
    const originalPricePatterns = [
      /"currency_formatted_long":"([^"]+)"/i,
      /<span[^>]*class="[^"]*original[^"]*price[^"]*"[^>]*>([^<]+)<\/span>/i,
      /<span[^>]*class="[^"]*was[^"]*"[^>]*>([^<]+)<\/span>/i
    ];

    for (const pattern of originalPricePatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const originalPrice = this.cleanText(match[1]);
        if (originalPrice.length > 1) {
          return originalPrice;
        }
      }
    }

    return undefined;
  }

  private extractEtsyAvailability(html: string): 'in_stock' | 'out_of_stock' | 'limited' | 'unknown' {
    if (html.toLowerCase().includes('sold out') || 
        html.toLowerCase().includes('unavailable') ||
        html.toLowerCase().includes('out of stock')) {
      return 'out_of_stock';
    }

    if (html.toLowerCase().includes('only') && html.toLowerCase().includes('left') ||
        html.toLowerCase().includes('limited')) {
      return 'limited';
    }

    if (html.toLowerCase().includes('in stock') || 
        html.toLowerCase().includes('available') ||
        html.toLowerCase().includes('add to cart')) {
      return 'in_stock';
    }

    return 'unknown';
  }

  private extractEtsyRating(html: string): number | undefined {
    const ratingPatterns = [
      /"rating":"(\d+\.?\d*)"/i,
      /(\d+\.?\d*)\s*out\s*of\s*5\s*stars/i,
      /(\d+\.?\d*)\s*\/\s*5/i,
      /data-rating="(\d+\.?\d*)"/i
    ];

    for (const pattern of ratingPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const rating = parseFloat(match[1]);
        if (rating >= 0 && rating <= 5) {
          return rating;
        }
      }
    }

    return undefined;
  }

  private extractEtsyReviewCount(html: string): number | undefined {
    const reviewPatterns = [
      /"review_count":(\d+)/i,
      /(\d+)\s*reviews?/i,
      /(\d+)\s*customer\s*reviews?/i,
      /(\d{1,6})\s*(?:people\s*)?(?:have\s*)?(?:bought|purchased)/i
    ];

    for (const pattern of reviewPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const count = parseInt(match[1]);
        if (count >= 0) {
          return count;
        }
      }
    }

    return undefined;
  }

  private extractEtsyImages(html: string): string[] {
    const images: string[] = [];
    
    // Etsy image patterns
    const imagePatterns = [
      /"url_570xN":"([^"]+)"/gi,
      /"url_fullxfull":"([^"]+)"/gi,
      /"url":"(https:\/\/i\.etsystatic\.com[^"]+)"/gi,
      /src="(https:\/\/i\.etsystatic\.com[^"]+)"/gi
    ];

    for (const pattern of imagePatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        if (match[1] && !images.includes(match[1])) {
          images.push(match[1]);
        }
      }
    }

    return images.slice(0, 10); // Limit to 10 images
  }

  private extractEtsyDescription(html: string): string {
    const descPatterns = [
      /"description":"([^"]+)"/i,
      /<div[^>]*data-test-id="[^"]*description[^"]*"[^>]*>([^<]+)/i,
      /<div[^>]*class="[^"]*description[^"]*"[^>]*>([^<]+)/i,
      /<meta[^>]*name="description"[^>]*content="([^"]+)"/i
    ];

    for (const pattern of descPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        let desc = this.cleanText(match[1]);
        // Clean up common JSON escapes
        desc = desc.replace(/\\n/g, ' ').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        if (desc.length > 10) {
          return desc;
        }
      }
    }

    return 'Handmade item available on Etsy';
  }

  private extractEtsyShopRating(html: string): number | undefined {
    const shopRatingPatterns = [
      /"shop_rating":"(\d+\.?\d*)"/i,
      /shop\s*rating[^>]*>(\d+\.?\d*)/i
    ];

    for (const pattern of shopRatingPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const rating = parseFloat(match[1]);
        if (rating >= 0 && rating <= 5) {
          return rating;
        }
      }
    }

    return undefined;
  }

  private extractEtsyCategory(html: string): string {
    const categoryPatterns = [
      /"taxonomy_path":"([^"]+)"/i,
      /"category":"([^"]+)"/i,
      /breadcrumb[^>]*>([^<]+)</i
    ];

    for (const pattern of categoryPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        let category = this.cleanText(match[1]);
        // Clean up taxonomy paths
        if (category.includes('/')) {
          category = category.split('/').pop() || category;
        }
        if (category.length > 2) {
          return category;
        }
      }
    }

    return 'Handmade';
  }

  private extractEtsyFeatures(html: string): string[] {
    const features: string[] = [];
    
    // Look for features in various formats
    const featurePatterns = [
      /"materials":\["([^"]+)"/gi,
      /"tags":\["([^"]+)"/gi,
      /<li[^>]*>([^<]+)<\/li>/gi
    ];

    for (const pattern of featurePatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        if (match[1]) {
          const feature = this.cleanText(match[1]);
          if (feature.length > 3 && !features.includes(feature)) {
            features.push(feature);
          }
        }
      }
    }

    return features.slice(0, 8); // Limit to 8 features
  }

  private extractEtsySpecifications(html: string): { [key: string]: string } {
    const specs: { [key: string]: string } = {};
    
    // Look for specifications in JSON data
    const specPatterns = [
      /"materials":\["([^"]+)"/i,
      /"dimensions":"([^"]+)"/i,
      /"weight":"([^"]+)"/i,
      /"processing_time":"([^"]+)"/i
    ];

    if (specPatterns[0]) {
      const materialMatch = html.match(specPatterns[0]);
      if (materialMatch && materialMatch[1]) {
        specs['Materials'] = this.cleanText(materialMatch[1]);
      }
    }

    if (specPatterns[1]) {
      const dimensionMatch = html.match(specPatterns[1]);
      if (dimensionMatch && dimensionMatch[1]) {
        specs['Dimensions'] = this.cleanText(dimensionMatch[1]);
      }
    }

    if (specPatterns[2]) {
      const weightMatch = html.match(specPatterns[2]);
      if (weightMatch && weightMatch[1]) {
        specs['Weight'] = this.cleanText(weightMatch[1]);
      }
    }

    if (specPatterns[3]) {
      const processingMatch = html.match(specPatterns[3]);
      if (processingMatch && processingMatch[1]) {
        specs['Processing Time'] = this.cleanText(processingMatch[1]);
      }
    }

    return specs;
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

  clearCachedProduct(url: string): void {
    this.cache.delete(url);
    console.log(`Cleared cache for URL: ${url}`);
  }

  // eBay-specific extraction methods
  private extractEbayTitle(html: string): string {
    // Method 1: Main product title
    let match = html.match(/<h1[^>]*id=['"]x-title-label-lbl['"][^>]*>([^<]+)<\/h1>/i);
    if (match) {
      return this.cleanText(match[1]);
    }

    // Method 2: Alternative title selector
    match = html.match(/<h1[^>]*class=['"][^'"]*title[^'"]*['"][^>]*>([^<]+)<\/h1>/i);
    if (match) {
      return this.cleanText(match[1]);
    }

    // Method 3: Meta og:title
    match = html.match(/<meta[^>]*property=['"]og:title['"][^>]*content=['"]([^'"]+)['"][^>]*>/i);
    if (match) {
      const title = this.cleanText(match[1]);
      // Remove eBay suffix
      return title.replace(/\s*\|\s*eBay.*$/i, '');
    }

    // Method 4: Page title
    match = html.match(/<title>([^<]+)<\/title>/i);
    if (match) {
      const title = this.cleanText(match[1]);
      return title.replace(/\s*\|\s*eBay.*$/i, '');
    }

    console.warn('Could not extract eBay product title');
    return 'Unknown eBay Product';
  }

  private extractEbayPrice(html: string): string {
    // Method 1: Current price
    let match = html.match(/<span[^>]*class=['"][^'"]*price[^'"]*['"][^>]*>[\s\S]*?\$([0-9,]+\.?\d{0,2})[\s\S]*?<\/span>/i);
    if (match) {
      return '$' + match[1];
    }

    // Method 2: Buy It Now price
    match = html.match(/["']currentPrice["']:\s*["']?\$?([0-9,]+\.?\d{0,2})["']?/i);
    if (match) {
      return '$' + match[1];
    }

    // Method 3: Auction current bid
    match = html.match(/current\s+bid[^$]*\$([0-9,]+\.?\d{0,2})/i);
    if (match) {
      return '$' + match[1] + ' (current bid)';
    }

    // Method 4: Generic price pattern
    const pricePatterns = [
      /\$[0-9,]+\.?\d{0,2}/g,
      /USD\s*[0-9,]+\.?\d{0,2}/gi
    ];

    for (const pattern of pricePatterns) {
      const prices = html.match(pattern);
      if (prices && prices.length > 0) {
        const validPrices = prices
          .map(p => parseFloat(p.replace(/[^0-9.]/g, '')))
          .filter(p => p > 1 && p < 50000)
          .sort((a, b) => a - b);
        
        if (validPrices.length > 0) {
          return '$' + validPrices[0].toFixed(2);
        }
      }
    }

    console.warn('Could not extract eBay price');
    return '$0.00';
  }

  private extractEbayOriginalPrice(html: string): string | undefined {
    // Look for strikethrough or "was" prices
    const originalPricePatterns = [
      /was\s*\$([0-9,]+\.?\d{0,2})/i,
      /originally\s*\$([0-9,]+\.?\d{0,2})/i,
      /<s[^>]*>\s*\$([0-9,]+\.?\d{0,2})\s*<\/s>/i
    ];

    for (const pattern of originalPricePatterns) {
      const match = html.match(pattern);
      if (match) {
        return '$' + match[1];
      }
    }

    return undefined;
  }

  private extractEbayBrand(html: string): string {
    // Method 1: Brand in structured data
    let match = html.match(/"brand":\s*"([^"]+)"/i);
    if (match) {
      return this.cleanText(match[1]);
    }

    // Method 2: Brand in item specifics
    match = html.match(/brand[^>]*>([^<]+)</i);
    if (match) {
      return this.cleanText(match[1]);
    }

    // Method 3: Extract from title (common brand names)
    const title = this.extractEbayTitle(html).toLowerCase();
    const commonBrands = ['apple', 'samsung', 'nike', 'adidas', 'sony', 'microsoft', 'canon', 'nikon'];
    
    for (const brand of commonBrands) {
      if (title.includes(brand)) {
        return brand.charAt(0).toUpperCase() + brand.slice(1);
      }
    }

    return 'Unknown Brand';
  }

  private extractEbayAvailability(html: string): 'in_stock' | 'out_of_stock' | 'limited' | 'unknown' {
    const htmlLower = html.toLowerCase();
    
    if (htmlLower.includes('in stock') || htmlLower.includes('available')) {
      return 'in_stock';
    }
    if (htmlLower.includes('out of stock') || htmlLower.includes('sold out')) {
      return 'out_of_stock';
    }
    if (htmlLower.includes('limited') || htmlLower.includes('few left')) {
      return 'limited';
    }
    if (htmlLower.includes('auction') || htmlLower.includes('bidding')) {
      return 'in_stock'; // Auctions are available for bidding
    }
    
    return 'unknown';
  }

  private extractEbayRating(html: string): number | undefined {
    // eBay doesn't typically show product ratings like Amazon
    // But sellers have feedback scores
    return undefined;
  }

  private extractEbayReviewCount(html: string): number | undefined {
    // eBay shows feedback count for sellers, not product reviews
    return undefined;
  }

  private extractEbayImages(html: string): string[] {
    const images: string[] = [];
    
    // Look for eBay product images
    const imageMatches = html.match(/https:\/\/[^"'\s]*\.(?:jpg|jpeg|png|webp)[^"'\s]*/gi);
    if (imageMatches) {
      // Filter for eBay product images
      const productImages = imageMatches.filter(img => 
        img.includes('ebayimg.com') && 
        !img.includes('logo') &&
        !img.includes('icon') &&
        img.includes('/s-l')
      );
      images.push(...productImages.slice(0, 5));
    }
    
    return images;
  }

  private extractEbayDescription(html: string): string {
    // Method 1: Item description
    let match = html.match(/<div[^>]*class=['"][^'"]*item-description[^'"]*['"][^>]*>([^<]+)/i);
    if (match) {
      return this.cleanText(match[1]);
    }

    // Method 2: Meta description
    match = html.match(/<meta[^>]*name=['"]description['"][^>]*content=['"]([^'"]+)['"][^>]*>/i);
    if (match) {
      return this.cleanText(match[1]);
    }
    
    return 'No description available';
  }

  private extractEbaySeller(html: string): string {
    // Method 1: Seller ID
    let match = html.match(/seller[^>]*>([^<]+)</i);
    if (match) {
      return this.cleanText(match[1]);
    }

    // Method 2: From structured data
    match = html.match(/"seller":\s*"([^"]+)"/i);
    if (match) {
      return this.cleanText(match[1]);
    }
    
    return 'eBay Seller';
  }

  private extractEbaySellerRating(html: string): number | undefined {
    // Look for seller feedback percentage
    const ratingMatch = html.match(/([0-9.]+)%\s*positive/i);
    if (ratingMatch) {
      return parseFloat(ratingMatch[1]);
    }
    
    return undefined;
  }

  private extractEbayCategory(html: string): string {
    // Method 1: Breadcrumb navigation
    let match = html.match(/breadcrumb[^>]*>([^<]+)</i);
    if (match) {
      return this.cleanText(match[1]);
    }

    // Method 2: Category from structured data
    match = html.match(/"category":\s*"([^"]+)"/i);
    if (match) {
      return this.cleanText(match[1]);
    }
    
    return 'General';
  }

  private extractEbayFeatures(html: string): string[] {
    const features: string[] = [];
    
    // Look for item specifics or bullet points
    const featureMatches = html.match(/<li[^>]*>([^<]+)<\/li>/gi);
    if (featureMatches) {
      features.push(...featureMatches.map(match => 
        this.cleanText(match.replace(/<[^>]*>/g, ''))
      ).slice(0, 8));
    }
    
    return features;
  }

  private extractEbaySpecs(html: string): { [key: string]: string } {
    const specs: { [key: string]: string } = {};
    
    // Look for item specifics table
    const specMatches = html.match(/item\s*specifics[\s\S]*?<table[\s\S]*?<\/table>/i);
    if (specMatches) {
      const tableRows = specMatches[0].match(/<tr[^>]*>[\s\S]*?<\/tr>/gi);
      if (tableRows) {
        tableRows.forEach(row => {
          const cells = row.match(/<td[^>]*>([^<]+)<\/td>/gi);
          if (cells && cells.length >= 2) {
            const key = this.cleanText(cells[0].replace(/<[^>]*>/g, ''));
            const value = this.cleanText(cells[1].replace(/<[^>]*>/g, ''));
            specs[key] = value;
          }
        });
      }
    }
    
    return specs;
  }

  // Walmart extraction methods
  private extractWalmartTitle(html: string): string {
    const patterns = [
      /"@type":"Product"[^}]*"name":"([^"]+)"/i,
      /<h1[^>]*data-automation-id="product-title"[^>]*>([^<]+)<\/h1>/i,
      /<h1[^>]*class="[^"]*prod.name[^"]*"[^>]*>([^<]+)<\/h1>/i,
      /<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i,
      /<title>([^|<]+)[\|<]/i
    ];
    return this.extractWithPatterns(html, patterns, 'Walmart Product');
  }

  private extractWalmartPrice(html: string): string {
    const patterns = [
      /"@type":"Offer"[^}]*"price":"([^"]+)"/i,
      /data-automation-id="product-price"[^>]*>.*?\$([0-9,]+\.?\d*)/i,
      /<span[^>]*class="[^"]*price-current[^"]*"[^>]*>.*?\$([0-9,]+\.?\d*)/i,
      /\$([0-9,]+\.?\d*)/i
    ];
    const price = this.extractWithPatterns(html, patterns, '0.00');
    return price.startsWith('$') ? price : `$${price}`;
  }

  private extractWalmartBrand(html: string): string {
    const patterns = [
      /"brand":\{"name":"([^"]+)"/i,
      /<span[^>]*class="[^"]*brand[^"]*"[^>]*>([^<]+)<\/span>/i
    ];
    return this.extractWithPatterns(html, patterns, 'Walmart');
  }

  private extractWalmartOriginalPrice(html: string): string | undefined {
    const patterns = [
      /<span[^>]*class="[^"]*price-was[^"]*"[^>]*>.*?\$([0-9,]+\.?\d*)/i,
      /was\s*\$([0-9,]+\.?\d*)/i
    ];
    const price = this.extractWithPatterns(html, patterns, '');
    return price ? (price.startsWith('$') ? price : `$${price}`) : undefined;
  }

  private extractWalmartAvailability(html: string): 'in_stock' | 'out_of_stock' | 'limited' | 'unknown' {
    if (html.includes('out of stock') || html.includes('unavailable')) return 'out_of_stock';
    if (html.includes('in stock') || html.includes('add to cart')) return 'in_stock';
    return 'unknown';
  }

  private extractWalmartRating(html: string): number | undefined {
    const patterns = [
      /"ratingValue":"([0-9.]+)"/i,
      /data-testid="reviews-summary"[^>]*>.*?([0-9.]+)/i
    ];
    const rating = this.extractWithPatterns(html, patterns, '');
    return rating ? parseFloat(rating) : undefined;
  }

  private extractWalmartReviewCount(html: string): number | undefined {
    const patterns = [
      /"reviewCount":"([0-9,]+)"/i,
      /\(([0-9,]+)\s*reviews?\)/i
    ];
    const count = this.extractWithPatterns(html, patterns, '');
    return count ? parseInt(count.replace(/,/g, '')) : undefined;
  }

  private extractWalmartImages(html: string): string[] {
    const patterns = [
      /"image":\["([^"]+)"/i,
      /<img[^>]*src="([^"]*product[^"]*)"[^>]*>/gi
    ];
    return this.extractArrayWithPatterns(html, patterns);
  }

  private extractWalmartDescription(html: string): string {
    const patterns = [
      /"description":"([^"]+)"/i,
      /<div[^>]*class="[^"]*product-description[^"]*"[^>]*>([^<]+)<\/div>/i
    ];
    return this.extractWithPatterns(html, patterns, 'Walmart product');
  }

  private extractWalmartSeller(html: string): string {
    const patterns = [
      /"seller":\{"name":"([^"]+)"/i,
      /sold by\s*([^<\n]+)/i
    ];
    return this.extractWithPatterns(html, patterns, 'Walmart');
  }

  private extractWalmartSellerRating(html: string): number | undefined {
    return undefined; // Walmart doesn't typically show seller ratings for their own products
  }

  private extractWalmartCategory(html: string): string {
    const patterns = [
      /"category":"([^"]+)"/i,
      /<nav[^>]*class="[^"]*breadcrumb[^"]*"[^>]*>.*?>([^<]+)<\/a>[^<]*<\/nav>/i
    ];
    return this.extractWithPatterns(html, patterns, 'General');
  }

  private extractWalmartFeatures(html: string): string[] {
    const patterns = [
      /<li[^>]*class="[^"]*feature[^"]*"[^>]*>([^<]+)<\/li>/gi,
      /<div[^>]*class="[^"]*bullet[^"]*"[^>]*>([^<]+)<\/div>/gi
    ];
    return this.extractArrayWithPatterns(html, patterns);
  }

  private extractWalmartSpecs(html: string): { [key: string]: string } {
    const specs: { [key: string]: string } = {};
    const specPattern = /<tr[^>]*>.*?<td[^>]*>([^<]+)<\/td>.*?<td[^>]*>([^<]+)<\/td>.*?<\/tr>/gi;
    let match;
    while ((match = specPattern.exec(html)) !== null) {
      if (match[1] && match[2]) {
        specs[this.cleanText(match[1])] = this.cleanText(match[2]);
      }
    }
    return specs;
  }

  // Target extraction methods
  private extractTargetTitle(html: string): string {
    const patterns = [
      /<h1[^>]*data-test="product-title"[^>]*>([^<]+)<\/h1>/i,
      /"@type":"Product"[^}]*"name":"([^"]+)"/i,
      /<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i
    ];
    return this.extractWithPatterns(html, patterns, 'Target Product');
  }

  private extractTargetPrice(html: string): string {
    const patterns = [
      /data-test="product-price"[^>]*>\$([0-9,]+\.?\d*)/i,
      /"price":"([^"]+)"/i,
      /\$([0-9,]+\.?\d*)/i
    ];
    const price = this.extractWithPatterns(html, patterns, '0.00');
    return price.startsWith('$') ? price : `$${price}`;
  }

  private extractTargetBrand(html: string): string {
    const patterns = [
      /<a[^>]*data-test="product-brand"[^>]*>([^<]+)<\/a>/i,
      /"brand":\{"name":"([^"]+)"/i
    ];
    return this.extractWithPatterns(html, patterns, 'Target');
  }

  private extractTargetOriginalPrice(html: string): string | undefined {
    const patterns = [
      /reg\s*\$([0-9,]+\.?\d*)/i,
      /was\s*\$([0-9,]+\.?\d*)/i
    ];
    const price = this.extractWithPatterns(html, patterns, '');
    return price ? `$${price}` : undefined;
  }

  private extractTargetAvailability(html: string): 'in_stock' | 'out_of_stock' | 'limited' | 'unknown' {
    if (html.includes('out of stock') || html.includes('sold out')) return 'out_of_stock';
    if (html.includes('add to cart') || html.includes('in stock')) return 'in_stock';
    return 'unknown';
  }

  private extractTargetRating(html: string): number | undefined {
    const patterns = [
      /"ratingValue":"([0-9.]+)"/i,
      /data-test="rating-[0-9]+"[^>]*>([0-9.]+)/i
    ];
    const rating = this.extractWithPatterns(html, patterns, '');
    return rating ? parseFloat(rating) : undefined;
  }

  private extractTargetReviewCount(html: string): number | undefined {
    const patterns = [
      /\(([0-9,]+)\)/i,
      /"reviewCount":"([0-9,]+)"/i
    ];
    const count = this.extractWithPatterns(html, patterns, '');
    return count ? parseInt(count.replace(/,/g, '')) : undefined;
  }

  private extractTargetImages(html: string): string[] {
    const patterns = [
      /<img[^>]*src="([^"]*product[^"]*)"[^>]*>/gi,
      /"image":\["([^"]+)"/i
    ];
    return this.extractArrayWithPatterns(html, patterns);
  }

  private extractTargetDescription(html: string): string {
    const patterns = [
      /<div[^>]*data-test="item-details-description"[^>]*>([^<]+)<\/div>/i,
      /"description":"([^"]+)"/i
    ];
    return this.extractWithPatterns(html, patterns, 'Target product');
  }

  private extractTargetCategory(html: string): string {
    const patterns = [
      /<nav[^>]*data-test="breadcrumb"[^>]*>.*?>([^<]+)<\/a>[^<]*<\/nav>/i,
      /"category":"([^"]+)"/i
    ];
    return this.extractWithPatterns(html, patterns, 'General');
  }

  private extractTargetFeatures(html: string): string[] {
    const patterns = [
      /<li[^>]*data-test="item-details-feature"[^>]*>([^<]+)<\/li>/gi
    ];
    return this.extractArrayWithPatterns(html, patterns);
  }

  private extractTargetSpecs(html: string): { [key: string]: string } {
    const specs: { [key: string]: string } = {};
    const specPattern = /<dt[^>]*>([^<]+)<\/dt>.*?<dd[^>]*>([^<]+)<\/dd>/gi;
    let match;
    while ((match = specPattern.exec(html)) !== null) {
      if (match[1] && match[2]) {
        specs[this.cleanText(match[1])] = this.cleanText(match[2]);
      }
    }
    return specs;
  }

  // Best Buy extraction methods
  private extractBestBuyTitle(html: string): string {
    const patterns = [
      /<h1[^>]*class="sr-only"[^>]*>([^<]+)<\/h1>/i,
      /"@type":"Product"[^}]*"name":"([^"]+)"/i,
      /<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i
    ];
    return this.extractWithPatterns(html, patterns, 'Best Buy Product');
  }

  private extractBestBuyPrice(html: string): string {
    const patterns = [
      /<span[^>]*class="sr-only"[^>]*>current price \$([0-9,]+\.?\d*)/i,
      /"price":"([^"]+)"/i,
      /\$([0-9,]+\.?\d*)/i
    ];
    const price = this.extractWithPatterns(html, patterns, '0.00');
    return price.startsWith('$') ? price : `$${price}`;
  }

  private extractBestBuyBrand(html: string): string {
    const patterns = [
      /<a[^>]*class="[^"]*product-data-value[^"]*"[^>]*>([^<]+)<\/a>/i,
      /"brand":"([^"]+)"/i
    ];
    return this.extractWithPatterns(html, patterns, 'Best Buy');
  }

  private extractBestBuyOriginalPrice(html: string): string | undefined {
    const patterns = [
      /was\s*\$([0-9,]+\.?\d*)/i,
      /<span[^>]*class="[^"]*pricing-price-details[^"]*"[^>]*>\$([0-9,]+\.?\d*)/i
    ];
    const price = this.extractWithPatterns(html, patterns, '');
    return price ? `$${price}` : undefined;
  }

  private extractBestBuyAvailability(html: string): 'in_stock' | 'out_of_stock' | 'limited' | 'unknown' {
    if (html.includes('sold out') || html.includes('unavailable')) return 'out_of_stock';
    if (html.includes('add to cart') || html.includes('in stock')) return 'in_stock';
    return 'unknown';
  }

  private extractBestBuyRating(html: string): number | undefined {
    const patterns = [
      /"ratingValue":"([0-9.]+)"/i,
      /([0-9.]+) out of 5 stars/i
    ];
    const rating = this.extractWithPatterns(html, patterns, '');
    return rating ? parseFloat(rating) : undefined;
  }

  private extractBestBuyReviewCount(html: string): number | undefined {
    const patterns = [
      /\(([0-9,]+)\s*reviews?\)/i,
      /"reviewCount":"([0-9,]+)"/i
    ];
    const count = this.extractWithPatterns(html, patterns, '');
    return count ? parseInt(count.replace(/,/g, '')) : undefined;
  }

  private extractBestBuyImages(html: string): string[] {
    const patterns = [
      /<img[^>]*src="([^"]*product[^"]*)"[^>]*>/gi,
      /"image":\["([^"]+)"/i
    ];
    return this.extractArrayWithPatterns(html, patterns);
  }

  private extractBestBuyDescription(html: string): string {
    const patterns = [
      /<div[^>]*class="[^"]*product-details[^"]*"[^>]*>([^<]+)<\/div>/i,
      /"description":"([^"]+)"/i
    ];
    return this.extractWithPatterns(html, patterns, 'Best Buy product');
  }

  private extractBestBuyCategory(html: string): string {
    const patterns = [
      /<nav[^>]*class="[^"]*breadcrumb[^"]*"[^>]*>.*?>([^<]+)<\/a>[^<]*<\/nav>/i,
      /"category":"([^"]+)"/i
    ];
    return this.extractWithPatterns(html, patterns, 'Electronics');
  }

  private extractBestBuyFeatures(html: string): string[] {
    const patterns = [
      /<li[^>]*class="[^"]*feature[^"]*"[^>]*>([^<]+)<\/li>/gi
    ];
    return this.extractArrayWithPatterns(html, patterns);
  }

  private extractBestBuySpecs(html: string): { [key: string]: string } {
    const specs: { [key: string]: string } = {};
    const specPattern = /<dt[^>]*>([^<]+)<\/dt>.*?<dd[^>]*>([^<]+)<\/dd>/gi;
    let match;
    while ((match = specPattern.exec(html)) !== null) {
      if (match[1] && match[2]) {
        specs[this.cleanText(match[1])] = this.cleanText(match[2]);
      }
    }
    return specs;
  }

  // Placeholder extraction methods for other platforms (will implement based on need)
  private extractFacebookTitle(html: string): string { return this.extractWithPatterns(html, [/<title>([^<]+)<\/title>/i], 'Facebook Marketplace Item'); }
  private extractFacebookPrice(html: string): string { return this.extractWithPatterns(html, [/\$([0-9,]+\.?\d*)/i], '$0.00'); }
  private extractFacebookBrand(html: string): string { return 'Facebook Seller'; }
  private extractFacebookAvailability(html: string): 'in_stock' | 'out_of_stock' | 'limited' | 'unknown' { return 'unknown'; }
  private extractFacebookImages(html: string): string[] { return []; }
  private extractFacebookDescription(html: string): string { return 'Facebook Marketplace listing'; }
  private extractFacebookSeller(html: string): string { return 'Facebook User'; }
  private extractFacebookSellerRating(html: string): number | undefined { return undefined; }
  private extractFacebookCategory(html: string): string { return 'Marketplace'; }

  private extractMercariTitle(html: string): string { return this.extractWithPatterns(html, [/<title>([^<]+)<\/title>/i], 'Mercari Item'); }
  private extractMercariPrice(html: string): string { return this.extractWithPatterns(html, [/\$([0-9,]+\.?\d*)/i], '$0.00'); }
  private extractMercariBrand(html: string): string { return 'Various'; }
  private extractMercariOriginalPrice(html: string): string | undefined { return undefined; }
  private extractMercariAvailability(html: string): 'in_stock' | 'out_of_stock' | 'limited' | 'unknown' { return 'unknown'; }
  private extractMercariImages(html: string): string[] { return []; }
  private extractMercariDescription(html: string): string { return 'Mercari listing'; }
  private extractMercariSeller(html: string): string { return 'Mercari User'; }
  private extractMercariSellerRating(html: string): number | undefined { return undefined; }
  private extractMercariCategory(html: string): string { return 'General'; }

  private extractDepopTitle(html: string): string { return this.extractWithPatterns(html, [/<title>([^<]+)<\/title>/i], 'Depop Item'); }
  private extractDepopPrice(html: string): string { return this.extractWithPatterns(html, [/\$([0-9,]+\.?\d*)/i], '$0.00'); }
  private extractDepopBrand(html: string): string { return 'Various'; }
  private extractDepopOriginalPrice(html: string): string | undefined { return undefined; }
  private extractDepopAvailability(html: string): 'in_stock' | 'out_of_stock' | 'limited' | 'unknown' { return 'unknown'; }
  private extractDepopImages(html: string): string[] { return []; }
  private extractDepopDescription(html: string): string { return 'Depop listing'; }
  private extractDepopSeller(html: string): string { return 'Depop User'; }

  private extractPoshmarkTitle(html: string): string { return this.extractWithPatterns(html, [/<title>([^<]+)<\/title>/i], 'Poshmark Item'); }
  private extractPoshmarkPrice(html: string): string { return this.extractWithPatterns(html, [/\$([0-9,]+\.?\d*)/i], '$0.00'); }
  private extractPoshmarkBrand(html: string): string { return 'Various'; }
  private extractPoshmarkOriginalPrice(html: string): string | undefined { return undefined; }
  private extractPoshmarkAvailability(html: string): 'in_stock' | 'out_of_stock' | 'limited' | 'unknown' { return 'unknown'; }
  private extractPoshmarkImages(html: string): string[] { return []; }
  private extractPoshmarkDescription(html: string): string { return 'Poshmark listing'; }
  private extractPoshmarkSeller(html: string): string { return 'Poshmark User'; }

  private extractAliExpressTitle(html: string): string { return this.extractWithPatterns(html, [/<title>([^<]+)<\/title>/i], 'AliExpress Item'); }
  private extractAliExpressPrice(html: string): string { return this.extractWithPatterns(html, [/\$([0-9,]+\.?\d*)/i], '$0.00'); }
  private extractAliExpressBrand(html: string): string { return 'Various'; }
  private extractAliExpressOriginalPrice(html: string): string | undefined { return undefined; }
  private extractAliExpressAvailability(html: string): 'in_stock' | 'out_of_stock' | 'limited' | 'unknown' { return 'unknown'; }
  private extractAliExpressRating(html: string): number | undefined { return undefined; }
  private extractAliExpressReviewCount(html: string): number | undefined { return undefined; }
  private extractAliExpressImages(html: string): string[] { return []; }
  private extractAliExpressDescription(html: string): string { return 'AliExpress listing'; }
  private extractAliExpressSeller(html: string): string { return 'AliExpress Seller'; }
  private extractAliExpressSellerRating(html: string): number | undefined { return undefined; }
  private extractAliExpressCategory(html: string): string { return 'General'; }

  private extractShopifyTitle(html: string): string { return this.extractWithPatterns(html, [/<title>([^<]+)<\/title>/i], 'Shopify Product'); }
  private extractShopifyPrice(html: string): string { return this.extractWithPatterns(html, [/\$([0-9,]+\.?\d*)/i], '$0.00'); }
  private extractShopifyBrand(html: string): string { return 'Shopify Store'; }
  private extractShopifyOriginalPrice(html: string): string | undefined { return undefined; }
  private extractShopifyAvailability(html: string): 'in_stock' | 'out_of_stock' | 'limited' | 'unknown' { return 'unknown'; }
  private extractShopifyImages(html: string): string[] { return []; }
  private extractShopifyDescription(html: string): string { return 'Shopify product'; }
  private extractShopifyShopName(html: string): string { return 'Shopify Store'; }
  private extractShopifyCategory(html: string): string { return 'General'; }
}

export const productScraperService = new ProductScraperService();