// Real-time Accuracy Monitoring Service
import { AccuracyEnhancedResult } from './accuracyEnhancer';

export interface AccuracyMetrics {
  totalScans: number;
  successfulScans: number;
  averageConfidence: number;
  commonErrors: { error: string; count: number }[];
  platformStats: { [platform: string]: { scans: number; avgConfidence: number } };
  lastUpdated: number;
}

export interface UserFeedback {
  url: string;
  isCorrect: boolean;
  expectedValue?: string;
  actualValue?: string;
  field: string;
  timestamp: number;
  userEmail?: string;
}

class AccuracyMonitor {
  private metricsKey = 'shopScanPro_accuracyMetrics';
  private feedbackKey = 'shopScanPro_userFeedback';
  
  // Record scraping result for metrics
  recordScanResult(result: AccuracyEnhancedResult, url: string): void {
    const metrics = this.getMetrics();
    const platform = this.extractPlatform(url);
    
    // Update total counters
    metrics.totalScans++;
    if (result.confidence >= 70) {
      metrics.successfulScans++;
    }
    
    // Update average confidence
    const totalConfidence = (metrics.averageConfidence * (metrics.totalScans - 1)) + result.confidence;
    metrics.averageConfidence = totalConfidence / metrics.totalScans;
    
    // Update platform stats
    if (!metrics.platformStats[platform]) {
      metrics.platformStats[platform] = { scans: 0, avgConfidence: 0 };
    }
    
    const platformStats = metrics.platformStats[platform];
    const platformTotalConfidence = (platformStats.avgConfidence * platformStats.scans) + result.confidence;
    platformStats.scans++;
    platformStats.avgConfidence = platformTotalConfidence / platformStats.scans;
    
    // Record errors
    result.validationReport.issues.forEach(issue => {
      if (issue.severity === 'high') {
        const existingError = metrics.commonErrors.find(e => e.error === issue.message);
        if (existingError) {
          existingError.count++;
        } else {
          metrics.commonErrors.push({ error: issue.message, count: 1 });
        }
      }
    });
    
    // Sort errors by frequency
    metrics.commonErrors.sort((a, b) => b.count - a.count);
    metrics.commonErrors = metrics.commonErrors.slice(0, 10); // Keep top 10
    
    metrics.lastUpdated = Date.now();
    this.saveMetrics(metrics);
    
    console.log(`📊 Accuracy metrics updated. Success rate: ${((metrics.successfulScans / metrics.totalScans) * 100).toFixed(1)}%`);
  }
  
  // Record user feedback about accuracy
  recordUserFeedback(feedback: UserFeedback): void {
    const allFeedback = this.getFeedback();
    allFeedback.push(feedback);
    
    // Keep only last 1000 feedback entries
    if (allFeedback.length > 1000) {
      allFeedback.splice(0, allFeedback.length - 1000);
    }
    
    localStorage.setItem(this.feedbackKey, JSON.stringify(allFeedback));
    
    console.log(`📝 User feedback recorded: ${feedback.field} ${feedback.isCorrect ? 'correct' : 'incorrect'}`);
    
    // If feedback indicates error, update error metrics
    if (!feedback.isCorrect) {
      const metrics = this.getMetrics();
      const errorMessage = `User reported incorrect ${feedback.field}`;
      const existingError = metrics.commonErrors.find(e => e.error === errorMessage);
      
      if (existingError) {
        existingError.count++;
      } else {
        metrics.commonErrors.push({ error: errorMessage, count: 1 });
      }
      
      this.saveMetrics(metrics);
    }
  }
  
  // Get current accuracy metrics
  getMetrics(): AccuracyMetrics {
    const stored = localStorage.getItem(this.metricsKey);
    if (stored) {
      return JSON.parse(stored);
    }
    
    return {
      totalScans: 0,
      successfulScans: 0,
      averageConfidence: 0,
      commonErrors: [],
      platformStats: {},
      lastUpdated: Date.now()
    };
  }
  
  // Get user feedback history
  getFeedback(): UserFeedback[] {
    const stored = localStorage.getItem(this.feedbackKey);
    return stored ? JSON.parse(stored) : [];
  }
  
  private saveMetrics(metrics: AccuracyMetrics): void {
    localStorage.setItem(this.metricsKey, JSON.stringify(metrics));
  }
  
  private extractPlatform(url: string): string {
    try {
      const domain = new URL(url).hostname.toLowerCase().replace('www.', '');
      if (domain.includes('amazon')) return 'amazon';
      if (domain.includes('ebay')) return 'ebay';
      if (domain.includes('etsy')) return 'etsy';
      return 'other';
    } catch {
      return 'unknown';
    }
  }
  
  // Generate accuracy report
  generateReport(): {
    summary: string;
    successRate: number;
    recommendations: string[];
    platformBreakdown: { platform: string; scans: number; confidence: number }[];
    topErrors: string[];
  } {
    const metrics = this.getMetrics();
    const feedback = this.getFeedback();
    
    const successRate = metrics.totalScans > 0 ? (metrics.successfulScans / metrics.totalScans) * 100 : 0;
    const userCorrectionRate = feedback.length > 0 ? (feedback.filter(f => !f.isCorrect).length / feedback.length) * 100 : 0;
    
    let summary = `Processed ${metrics.totalScans} scans with ${successRate.toFixed(1)}% success rate and ${metrics.averageConfidence.toFixed(1)}% average confidence.`;
    
    if (feedback.length > 0) {
      summary += ` User feedback indicates ${userCorrectionRate.toFixed(1)}% correction rate.`;
    }
    
    const recommendations: string[] = [];
    
    if (successRate < 80) {
      recommendations.push('Success rate below 80% - review extraction patterns');
    }
    
    if (metrics.averageConfidence < 75) {
      recommendations.push('Average confidence below 75% - enhance validation rules');
    }
    
    if (userCorrectionRate > 20) {
      recommendations.push('High user correction rate - investigate common accuracy issues');
    }
    
    const platformBreakdown = Object.entries(metrics.platformStats).map(([platform, stats]) => ({
      platform,
      scans: stats.scans,
      confidence: stats.avgConfidence
    }));
    
    const topErrors = metrics.commonErrors.slice(0, 5).map(e => e.error);
    
    return {
      summary,
      successRate,
      recommendations,
      platformBreakdown,
      topErrors
    };
  }
  
  // Reset metrics (for testing/debugging)
  resetMetrics(): void {
    localStorage.removeItem(this.metricsKey);
    localStorage.removeItem(this.feedbackKey);
    console.log('📊 Accuracy metrics reset');
  }
  
  // Export metrics for analysis
  exportMetrics(): string {
    const metrics = this.getMetrics();
    const feedback = this.getFeedback();
    
    return JSON.stringify({
      metrics,
      feedback,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }
}

export const accuracyMonitor = new AccuracyMonitor();