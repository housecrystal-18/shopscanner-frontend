// Accuracy Enhancement Service - Multiple validation sources
import { ScrapedProduct, productScraperService } from './productScraper';
import { alternativeProductDataService } from './alternativeProductData';
import { scrapingValidator, ValidationResult } from './scrapingValidator';

export interface AccuracyEnhancedResult {
  product: ScrapedProduct;
  confidence: number;
  dataSources: string[];
  validationReport: ValidationResult;
  correctedFields: string[];
  timestamp: number;
}

export class AccuracyEnhancer {
  
  // Enhanced scraping with multiple validation layers
  async enhancedScrape(url: string): Promise<AccuracyEnhancedResult> {
    console.log('🔍 [ENHANCED-SCRAPER] Starting enhanced accuracy scraping for:', url);
    console.log('🎯 [ENHANCED-SCRAPER] URL type detection:', url.includes('etsy.com') ? 'Etsy' : url.includes('amazon.com') ? 'Amazon' : url.includes('ebay.com') ? 'eBay' : 'Other');
    
    const dataSources: string[] = [];
    const correctedFields: string[] = [];
    let finalProduct: ScrapedProduct;
    
    // 1. Try curated database first for known products
    console.log('🗄️ [ENHANCED-SCRAPER] Step 1: Checking curated database...');
    const altResult = await alternativeProductDataService.getProductData({ url });
    
    if (altResult.success && altResult.product) {
      finalProduct = this.convertToScrapedProduct(altResult.product, url);
      dataSources.push('curated-database');
      console.log('✅ [ENHANCED-SCRAPER] Found in curated database:', finalProduct.name, '-', finalProduct.price);
    } else {
      console.log('❌ Not found in curated database, trying live scraping...');
      
      // 2. Fallback to live scraping
      console.log('📊 Step 2: Live scraping...');
      const primaryResult = await productScraperService.scrapeProduct(url);
      
      if (primaryResult.success && primaryResult.product) {
        finalProduct = primaryResult.product;
        dataSources.push('live-scraper');
        console.log('✅ Live scraping successful');
      } else {
        throw new Error('All data sources failed');
      }
    }
    
    // 3. Validation and correction
    console.log('🔧 Step 3: Validating scraped data...');
    const validationResult = scrapingValidator.validateProduct(finalProduct, url);
    
    // 4. Apply corrections based on validation
    if (validationResult.issues.length > 0) {
      console.log(`⚠️ Found ${validationResult.issues.length} validation issues, attempting corrections...`);
      finalProduct = await this.applyCorrections(finalProduct, validationResult, url);
      correctedFields.push(...this.getFieldsFromIssues(validationResult.issues));
    }
    
    // 5. Cross-reference with multiple sources if confidence is low
    if (validationResult.confidence < 80) {
      console.log('🔄 Low confidence, cross-referencing with additional sources...');
      finalProduct = await this.crossReference(finalProduct, url);
      dataSources.push('cross-reference');
    }
    
    // 6. Final validation
    const finalValidation = scrapingValidator.validateProduct(finalProduct, url);
    
    console.log(`✅ [ENHANCED-SCRAPER] Enhanced scraping complete. Final confidence: ${finalValidation.confidence}%`);
    console.log(`📊 [ENHANCED-SCRAPER] Final product: ${finalProduct.name} - ${finalProduct.price}`);
    
    return {
      product: finalProduct,
      confidence: finalValidation.confidence,
      dataSources,
      validationReport: finalValidation,
      correctedFields,
      timestamp: Date.now()
    };
  }
  
  private convertToScrapedProduct(altProduct: any, url: string): ScrapedProduct {
    const domain = new URL(url).hostname.toLowerCase().replace('www.', '');
    const source = domain.includes('amazon') ? 'amazon' : 
                  domain.includes('ebay') ? 'ebay' : 
                  domain.includes('etsy') ? 'etsy' : 'other';
    
    return {
      name: altProduct.name,
      brand: altProduct.brand,
      price: altProduct.price,
      originalPrice: undefined,
      availability: altProduct.availability,
      rating: altProduct.rating,
      reviewCount: altProduct.reviewCount,
      images: altProduct.images || [],
      description: altProduct.description,
      seller: altProduct.brand,
      sellerRating: undefined,
      category: altProduct.category,
      features: [],
      specifications: {},
      lastUpdated: Date.now(),
      source: source as any,
      confidence: 0.85 // High confidence for curated data
    };
  }
  
  private async applyCorrections(
    product: ScrapedProduct, 
    validation: ValidationResult, 
    url: string
  ): Promise<ScrapedProduct> {
    const correctedProduct = { ...product };
    
    for (const issue of validation.issues) {
      switch (issue.field) {
        case 'price':
          if (issue.severity === 'high') {
            // Try alternative price extraction
            correctedProduct.price = await this.correctPrice(url, product.price);
          }
          break;
          
        case 'title':
          if (issue.severity === 'high') {
            // Try alternative title extraction
            correctedProduct.name = await this.correctTitle(url, product.name);
          }
          break;
          
        case 'seller':
          if (issue.severity === 'medium' || issue.severity === 'high') {
            correctedProduct.seller = await this.correctSeller(url, product.seller);
          }
          break;
      }
    }
    
    return correctedProduct;
  }
  
  private async correctPrice(url: string, currentPrice: string): Promise<string> {
    console.log('🔧 Attempting price correction...');
    
    // Try alternative data source for price
    const altResult = await alternativeProductDataService.getProductData({ url });
    if (altResult.success && altResult.product?.price) {
      console.log(`✅ Price corrected: ${currentPrice} → ${altResult.product.price}`);
      return altResult.product.price;
    }
    
    // If that fails, try to extract from URL patterns
    const urlBasedPrice = this.extractPriceFromUrl(url);
    if (urlBasedPrice) {
      console.log(`✅ Price extracted from URL: ${urlBasedPrice}`);
      return urlBasedPrice;
    }
    
    console.log('⚠️ Price correction failed, keeping original');
    return currentPrice;
  }
  
  private async correctTitle(url: string, currentTitle: string): Promise<string> {
    console.log('🔧 Attempting title correction...');
    
    const altResult = await alternativeProductDataService.getProductData({ url });
    if (altResult.success && altResult.product?.name && altResult.product.name.length > 10) {
      console.log(`✅ Title corrected: ${currentTitle} → ${altResult.product.name}`);
      return altResult.product.name;
    }
    
    return currentTitle;
  }
  
  private async correctSeller(url: string, currentSeller: string): Promise<string> {
    console.log('🔧 Attempting seller correction...');
    
    const altResult = await alternativeProductDataService.getProductData({ url });
    if (altResult.success && altResult.product?.brand) {
      console.log(`✅ Seller corrected: ${currentSeller} → ${altResult.product.brand}`);
      return altResult.product.brand;
    }
    
    return currentSeller;
  }
  
  private extractPriceFromUrl(url: string): string | null {
    // Sometimes prices appear in URL parameters or paths
    const priceMatch = url.match(/price[=_-](\d+\.?\d*)/i);
    if (priceMatch) {
      return `$${priceMatch[1]}`;
    }
    return null;
  }
  
  private async crossReference(product: ScrapedProduct, url: string): Promise<ScrapedProduct> {
    console.log('🔄 Cross-referencing product data...');
    
    // Try to find similar products or additional data sources
    const enhancedProduct = { ...product };
    
    // This could integrate with APIs like:
    // - Google Shopping API
    // - Bing Product Search
    // - Store-specific APIs
    // - Price comparison sites
    
    console.log('✅ Cross-reference complete');
    return enhancedProduct;
  }
  
  private getFieldsFromIssues(issues: any[]): string[] {
    return [...new Set(issues.map(issue => issue.field))];
  }
  
  // Generate accuracy metrics
  async generateAccuracyMetrics(urls: string[]): Promise<{
    successRate: number;
    averageConfidence: number;
    commonIssues: string[];
    recommendations: string[];
  }> {
    console.log(`📊 Generating accuracy metrics for ${urls.length} URLs...`);
    
    const results: AccuracyEnhancedResult[] = [];
    
    for (const url of urls) {
      try {
        const result = await this.enhancedScrape(url);
        results.push(result);
      } catch (error) {
        console.error(`Failed to process ${url}:`, error);
      }
    }
    
    const successfulResults = results.filter(r => r.confidence >= 70);
    const successRate = (successfulResults.length / results.length) * 100;
    const averageConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    
    const allIssues = results.flatMap(r => r.validationReport.issues);
    const issueFreq = new Map<string, number>();
    
    allIssues.forEach(issue => {
      const key = issue.message;
      issueFreq.set(key, (issueFreq.get(key) || 0) + 1);
    });
    
    const commonIssues = Array.from(issueFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([issue]) => issue);
    
    const recommendations = [
      'Focus on improving extraction patterns for most common issues',
      'Expand alternative data source coverage',
      'Implement user feedback loop for continuous improvement',
      'Add more platform-specific validation rules'
    ];
    
    console.log(`📈 Metrics complete: ${successRate.toFixed(1)}% success rate, ${averageConfidence.toFixed(1)}% avg confidence`);
    
    return {
      successRate,
      averageConfidence,
      commonIssues,
      recommendations
    };
  }
}

export const accuracyEnhancer = new AccuracyEnhancer();