// Scraping Accuracy Validation Service
import { ScrapedProduct } from './productScraper';

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  issues: ValidationIssue[];
  suggestions: string[];
}

export interface ValidationIssue {
  field: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  detectedValue: string;
  expectedPattern?: string;
}

export class ScrapingValidator {
  
  // Validate scraped product data for accuracy and consistency
  validateProduct(product: ScrapedProduct, url: string): ValidationResult {
    const issues: ValidationIssue[] = [];
    let confidence = 100;
    
    // 1. Price validation
    const priceIssues = this.validatePrice(product.price, url);
    issues.push(...priceIssues);
    
    // 2. Title validation
    const titleIssues = this.validateTitle(product.name, url);
    issues.push(...titleIssues);
    
    // 3. Cross-field consistency
    const consistencyIssues = this.validateConsistency(product);
    issues.push(...consistencyIssues);
    
    // 4. Platform-specific validation
    const platformIssues = this.validatePlatformSpecific(product, url);
    issues.push(...platformIssues);
    
    // Calculate confidence based on issues
    confidence = this.calculateConfidence(issues);
    
    return {
      isValid: confidence >= 70,
      confidence,
      issues,
      suggestions: this.generateSuggestions(issues)
    };
  }
  
  private validatePrice(price: string, url: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Check if price is realistic
    const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
    
    if (numericPrice === 0 || isNaN(numericPrice)) {
      issues.push({
        field: 'price',
        severity: 'high',
        message: 'Price extraction failed or returned zero',
        detectedValue: price,
        expectedPattern: '$XX.XX'
      });
    }
    
    // Platform-specific price validation
    if (url.includes('etsy.com') && numericPrice > 10000) {
      issues.push({
        field: 'price',
        severity: 'medium',
        message: 'Price seems unusually high for Etsy product',
        detectedValue: price
      });
    }
    
    if (url.includes('amazon.com') && numericPrice < 0.01) {
      issues.push({
        field: 'price',
        severity: 'high',
        message: 'Amazon price too low - likely extraction error',
        detectedValue: price
      });
    }
    
    // Currency symbol validation
    if (!price.match(/[$€£¥₹₩]/)) {
      issues.push({
        field: 'price',
        severity: 'medium',
        message: 'Missing currency symbol',
        detectedValue: price,
        expectedPattern: 'Currency symbol + amount'
      });
    }
    
    return issues;
  }
  
  private validateTitle(title: string, url: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Check for generic/fallback titles
    const genericTitles = [
      'product item', 'unknown product', 'handcrafted item', 
      'etsy product', 'amazon product', 'ebay product'
    ];
    
    if (genericTitles.some(generic => title.toLowerCase().includes(generic))) {
      issues.push({
        field: 'title',
        severity: 'high',
        message: 'Generic title detected - scraping may have failed',
        detectedValue: title
      });
    }
    
    // Check title length
    if (title.length < 10) {
      issues.push({
        field: 'title',
        severity: 'medium',
        message: 'Title too short - may be incomplete',
        detectedValue: title
      });
    }
    
    // Platform-specific title validation
    if (url.includes('etsy.com')) {
      // Etsy titles should be descriptive
      if (title.length < 20) {
        issues.push({
          field: 'title',
          severity: 'low',
          message: 'Etsy title seems shorter than typical',
          detectedValue: title
        });
      }
    }
    
    return issues;
  }
  
  private validateConsistency(product: ScrapedProduct): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Check if price and availability match
    if (product.availability === 'out_of_stock' && product.price !== '$0.00') {
      // This is actually normal - out of stock items can still show prices
    }
    
    // Check if rating and review count are consistent
    if (product.rating && product.rating > 0 && (!product.reviewCount || product.reviewCount === 0)) {
      issues.push({
        field: 'rating',
        severity: 'low',
        message: 'Product has rating but no review count',
        detectedValue: `Rating: ${product.rating}, Reviews: ${product.reviewCount}`
      });
    }
    
    // Check source consistency
    if (product.source === 'amazon' && product.seller?.toLowerCase().includes('etsy')) {
      issues.push({
        field: 'source',
        severity: 'high',
        message: 'Source/seller mismatch detected',
        detectedValue: `Source: ${product.source}, Seller: ${product.seller}`
      });
    }
    
    return issues;
  }
  
  private validatePlatformSpecific(product: ScrapedProduct, url: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const domain = new URL(url).hostname.toLowerCase().replace('www.', '');
    
    switch (domain) {
      case 'etsy.com':
        return this.validateEtsyProduct(product);
      case 'amazon.com':
        return this.validateAmazonProduct(product);
      case 'ebay.com':
        return this.validateEbayProduct(product);
      default:
        return [];
    }
  }
  
  private validateEtsyProduct(product: ScrapedProduct): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Etsy should have shop/seller information
    if (!product.seller || product.seller === 'Etsy Seller') {
      issues.push({
        field: 'seller',
        severity: 'medium',
        message: 'Etsy shop name not properly extracted',
        detectedValue: product.seller || 'none'
      });
    }
    
    // Etsy products often have multiple images
    if (product.images.length === 0) {
      issues.push({
        field: 'images',
        severity: 'low',
        message: 'No product images extracted',
        detectedValue: `${product.images.length} images`
      });
    }
    
    return issues;
  }
  
  private validateAmazonProduct(product: ScrapedProduct): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Amazon should have ASIN in some form
    if (!product.specifications || !Object.keys(product.specifications).length) {
      issues.push({
        field: 'specifications',
        severity: 'low',
        message: 'No product specifications extracted',
        detectedValue: 'none'
      });
    }
    
    return issues;
  }
  
  private validateEbayProduct(product: ScrapedProduct): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // eBay validation logic
    return issues;
  }
  
  private calculateConfidence(issues: ValidationIssue[]): number {
    let confidence = 100;
    
    for (const issue of issues) {
      switch (issue.severity) {
        case 'high':
          confidence -= 25;
          break;
        case 'medium':
          confidence -= 15;
          break;
        case 'low':
          confidence -= 5;
          break;
      }
    }
    
    return Math.max(0, confidence);
  }
  
  private generateSuggestions(issues: ValidationIssue[]): string[] {
    const suggestions: string[] = [];
    
    const highIssues = issues.filter(i => i.severity === 'high');
    if (highIssues.length > 0) {
      suggestions.push('Consider re-scraping this URL as critical data may be missing');
    }
    
    const priceIssues = issues.filter(i => i.field === 'price');
    if (priceIssues.length > 0) {
      suggestions.push('Verify price manually on the original website');
    }
    
    const titleIssues = issues.filter(i => i.field === 'title');
    if (titleIssues.length > 0) {
      suggestions.push('Product title may be incomplete - check original listing');
    }
    
    return suggestions;
  }
  
  // Generate accuracy report
  generateAccuracyReport(validationResults: ValidationResult[]): {
    overallAccuracy: number;
    commonIssues: string[];
    recommendations: string[];
  } {
    const totalValidations = validationResults.length;
    const successfulValidations = validationResults.filter(r => r.isValid).length;
    const overallAccuracy = (successfulValidations / totalValidations) * 100;
    
    // Find most common issues
    const allIssues = validationResults.flatMap(r => r.issues);
    const issueFrequency = new Map<string, number>();
    
    allIssues.forEach(issue => {
      const key = `${issue.field}: ${issue.message}`;
      issueFrequency.set(key, (issueFrequency.get(key) || 0) + 1);
    });
    
    const commonIssues = Array.from(issueFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([issue]) => issue);
    
    const recommendations = [
      'Implement additional extraction patterns for problematic fields',
      'Add more robust error handling for edge cases',
      'Consider using multiple data sources for validation',
      'Implement user feedback mechanism for accuracy improvement'
    ];
    
    return {
      overallAccuracy,
      commonIssues,
      recommendations
    };
  }
}

export const scrapingValidator = new ScrapingValidator();