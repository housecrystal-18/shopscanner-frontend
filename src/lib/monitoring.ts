/**
 * Production Monitoring and Alerting System
 * Handles error tracking, performance monitoring, and payment failure alerts
 */

interface MonitoringConfig {
  sentryDsn?: string;
  environment: 'development' | 'staging' | 'production';
  enableErrorTracking: boolean;
  enablePerformanceMonitoring: boolean;
  enablePaymentAlerts: boolean;
}

interface PaymentError {
  type: 'payment_failed' | 'subscription_cancelled' | 'invoice_overdue' | 'webhook_failure';
  customerId?: string;
  subscriptionId?: string;
  amount?: number;
  currency?: string;
  errorCode?: string;
  errorMessage: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  timestamp: Date;
  tags?: Record<string, string>;
}

class MonitoringService {
  private config: MonitoringConfig;
  private errorQueue: PaymentError[] = [];
  private metricsBuffer: PerformanceMetric[] = [];
  private isInitialized = false;

  constructor() {
    this.config = {
      sentryDsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.PROD ? 'production' : 'development',
      enableErrorTracking: import.meta.env.VITE_ENABLE_MONITORING === 'true',
      enablePerformanceMonitoring: import.meta.env.VITE_ENABLE_MONITORING === 'true',
      enablePaymentAlerts: import.meta.env.VITE_ENABLE_MONITORING === 'true',
    };
  }

  /**
   * Initialize monitoring services
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize Sentry for error tracking
      if (this.config.enableErrorTracking && this.config.sentryDsn) {
        await this.initializeSentry();
      }

      // Set up performance monitoring
      if (this.config.enablePerformanceMonitoring) {
        this.initializePerformanceMonitoring();
      }

      // Set up payment failure monitoring
      if (this.config.enablePaymentAlerts) {
        this.initializePaymentMonitoring();
      }

      // Start background services
      this.startBackgroundServices();

      this.isInitialized = true;
      console.log('✅ Monitoring services initialized');
    } catch (error) {
      console.error('❌ Failed to initialize monitoring:', error);
    }
  }

  /**
   * Initialize Sentry error tracking
   */
  private async initializeSentry(): Promise<void> {
    try {
      // Dynamic import to avoid bundle size impact if not used
      const Sentry = await import('@sentry/browser');
      
      Sentry.init({
        dsn: this.config.sentryDsn,
        environment: this.config.environment,
        tracesSampleRate: this.config.environment === 'production' ? 0.1 : 1.0,
        beforeSend(event) {
          // Filter out non-critical errors in production
          if (event.level === 'info' || event.level === 'debug') {
            return null;
          }
          return event;
        },
        integrations: [
          // Performance monitoring integration
        ],
      });

      console.log('✅ Sentry initialized');
    } catch (error) {
      console.warn('⚠️  Sentry initialization failed:', error);
    }
  }

  /**
   * Initialize performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    // Monitor Web Vitals
    this.monitorWebVitals();
    
    // Monitor API response times
    this.monitorApiPerformance();
    
    // Monitor payment processing times
    this.monitorPaymentPerformance();
  }

  /**
   * Monitor Core Web Vitals
   */
  private monitorWebVitals(): void {
    // Use web-vitals library if available
    if ('performance' in window && 'PerformanceObserver' in window) {
      // Monitor Largest Contentful Paint (LCP)
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            name: 'web_vitals.lcp',
            value: entry.startTime,
            unit: 'ms',
            timestamp: new Date(),
            tags: { type: 'core_web_vital' }
          });
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Monitor First Input Delay (FID)
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            name: 'web_vitals.fid',
            value: (entry as any).processingStart - entry.startTime,
            unit: 'ms',
            timestamp: new Date(),
            tags: { type: 'core_web_vital' }
          });
        }
      }).observe({ entryTypes: ['first-input'] });

      // Monitor Cumulative Layout Shift (CLS)
      new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.recordMetric({
          name: 'web_vitals.cls',
          value: clsValue,
          unit: 'count',
          timestamp: new Date(),
          tags: { type: 'core_web_vital' }
        });
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }

  /**
   * Monitor API performance
   */
  private monitorApiPerformance(): void {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args): Promise<Response> => {
      const startTime = performance.now();
      let urlPath = 'unknown';
      
      try {
        if (typeof args[0] === 'string') {
          urlPath = new URL(args[0]).pathname;
        } else if (args[0] instanceof Request) {
          urlPath = new URL(args[0].url).pathname;
        }
      } catch {
        urlPath = 'unknown';
      }
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        
        this.recordMetric({
          name: 'api.response_time',
          value: endTime - startTime,
          unit: 'ms',
          timestamp: new Date(),
          tags: {
            method: args[1]?.method || 'GET',
            status: response.status.toString(),
            url: urlPath
          }
        });
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        
        this.recordMetric({
          name: 'api.response_time',
          value: endTime - startTime,
          unit: 'ms',
          timestamp: new Date(),
          tags: {
            method: args[1]?.method || 'GET',
            status: 'error',
            url: urlPath
          }
        });
        
        throw error;
      }
    };
  }

  /**
   * Monitor payment processing performance
   */
  private monitorPaymentPerformance(): void {
    // This will be called from payment components
    window.addEventListener('payment_processing_start', (event: Event) => {
      const customEvent = event as CustomEvent;
      const { paymentIntentId } = customEvent.detail;
      sessionStorage.setItem(`payment_start_${paymentIntentId}`, Date.now().toString());
    });

    window.addEventListener('payment_processing_complete', (event: Event) => {
      const customEvent = event as CustomEvent;
      const { paymentIntentId, success } = customEvent.detail;
      const startTime = sessionStorage.getItem(`payment_start_${paymentIntentId}`);
      
      if (startTime) {
        const duration = Date.now() - parseInt(startTime);
        sessionStorage.removeItem(`payment_start_${paymentIntentId}`);
        
        this.recordMetric({
          name: 'payment.processing_time',
          value: duration,
          unit: 'ms',
          timestamp: new Date(),
          tags: {
            success: success.toString(),
            payment_intent: paymentIntentId
          }
        });
      }
    });
  }

  /**
   * Initialize payment failure monitoring
   */
  private initializePaymentMonitoring(): void {
    // Listen for payment events
    window.addEventListener('payment_failed', (event: Event) => {
      const customEvent = event as CustomEvent;
      this.recordPaymentError({
        type: 'payment_failed',
        errorMessage: customEvent.detail.error || 'Payment processing failed',
        timestamp: new Date(),
        metadata: customEvent.detail
      });
    });

    window.addEventListener('subscription_canceled', (event: Event) => {
      const customEvent = event as CustomEvent;
      this.recordPaymentError({
        type: 'subscription_cancelled',
        subscriptionId: customEvent.detail.id,
        errorMessage: 'Subscription was cancelled',
        timestamp: new Date(),
        metadata: customEvent.detail
      });
    });

    window.addEventListener('invoice_payment_failed', (event: Event) => {
      const customEvent = event as CustomEvent;
      this.recordPaymentError({
        type: 'invoice_overdue',
        amount: customEvent.detail.amountDue,
        errorMessage: 'Invoice payment failed',
        timestamp: new Date(),
        metadata: customEvent.detail
      });
    });
  }

  /**
   * Record a payment error for monitoring
   */
  recordPaymentError(error: PaymentError): void {
    this.errorQueue.push(error);
    
    // Send to error tracking service
    if (this.config.enableErrorTracking) {
      this.sendToSentry(error);
    }
    
    // Log to console in development
    if (this.config.environment === 'development') {
      console.error('Payment Error:', error);
    }
    
    // Trigger immediate alert for critical errors
    if (this.isCriticalPaymentError(error)) {
      this.sendCriticalAlert(error);
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: PerformanceMetric): void {
    this.metricsBuffer.push(metric);
    
    // Log slow operations
    if (metric.name.includes('response_time') && metric.value > 1000) {
      console.warn(`Slow operation detected: ${metric.name} took ${metric.value}ms`);
    }
    
    // Track payment performance issues
    if (metric.name === 'payment.processing_time' && metric.value > 10000) {
      this.recordPaymentError({
        type: 'payment_failed',
        errorMessage: `Payment processing took ${metric.value}ms (too slow)`,
        timestamp: new Date(),
        metadata: { metric }
      });
    }
  }

  /**
   * Send error to Sentry
   */
  private async sendToSentry(error: PaymentError): Promise<void> {
    try {
      const Sentry = await import('@sentry/browser');
      
      Sentry.withScope(scope => {
        scope.setTag('error_type', error.type);
        scope.setLevel('error');
        
        if (error.customerId) scope.setUser({ id: error.customerId });
        if (error.subscriptionId) scope.setTag('subscription_id', error.subscriptionId);
        if (error.amount) scope.setTag('amount', error.amount.toString());
        if (error.errorCode) scope.setTag('error_code', error.errorCode);
        
        Object.entries(error.metadata || {}).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
        
        Sentry.captureException(new Error(error.errorMessage));
      });
    } catch (err) {
      console.error('Failed to send error to Sentry:', err);
    }
  }

  /**
   * Check if payment error is critical
   */
  private isCriticalPaymentError(error: PaymentError): boolean {
    return (
      error.type === 'payment_failed' ||
      error.type === 'webhook_failure' ||
      (error.type === 'invoice_overdue' && (error.amount || 0) > 100)
    );
  }

  /**
   * Send critical alert
   */
  private sendCriticalAlert(error: PaymentError): void {
    // In production, this would integrate with alerting services
    // like PagerDuty, Slack, or email notifications
    
    const alertData = {
      severity: 'critical',
      service: 'shop-scanner-payments',
      error_type: error.type,
      message: error.errorMessage,
      timestamp: error.timestamp.toISOString(),
      metadata: error.metadata
    };
    
    // Send to alerting service (mock implementation)
    this.sendAlert(alertData);
  }

  /**
   * Send alert to external service
   */
  private async sendAlert(alertData: any): Promise<void> {
    try {
      // Mock implementation - replace with actual alerting service
      console.error('🚨 CRITICAL PAYMENT ALERT:', alertData);
      
      // Example: Send to webhook endpoint
      if (import.meta.env.VITE_ALERT_WEBHOOK_URL) {
        await fetch(import.meta.env.VITE_ALERT_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alertData)
        });
      }
    } catch (error) {
      console.error('Failed to send alert:', error);
    }
  }

  /**
   * Start background services
   */
  private startBackgroundServices(): void {
    // Flush metrics buffer every 30 seconds
    setInterval(() => {
      if (this.metricsBuffer.length > 0) {
        this.flushMetrics();
      }
    }, 30000);

    // Process error queue every 10 seconds
    setInterval(() => {
      if (this.errorQueue.length > 0) {
        this.processErrorQueue();
      }
    }, 10000);
  }

  /**
   * Flush metrics to monitoring service
   */
  private flushMetrics(): void {
    const metrics = [...this.metricsBuffer];
    this.metricsBuffer = [];
    
    // Send to monitoring service (mock implementation)
    if (this.config.environment === 'development') {
      console.log('📊 Metrics:', metrics);
    }
    
    // TODO: Send to actual monitoring service like DataDog, New Relic, etc.
  }

  /**
   * Process error queue
   */
  private processErrorQueue(): void {
    const errors = [...this.errorQueue];
    this.errorQueue = [];
    
    // Aggregate and analyze errors
    const errorsByType = errors.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Log error summary
    if (Object.keys(errorsByType).length > 0) {
      console.warn('⚠️  Payment errors summary:', errorsByType);
    }
  }

  /**
   * Get monitoring health status
   */
  getHealthStatus(): {
    isHealthy: boolean;
    services: Record<string, boolean>;
    metrics: {
      errorsInQueue: number;
      metricsInBuffer: number;
    };
  } {
    return {
      isHealthy: this.isInitialized,
      services: {
        errorTracking: this.config.enableErrorTracking,
        performanceMonitoring: this.config.enablePerformanceMonitoring,
        paymentAlerts: this.config.enablePaymentAlerts,
      },
      metrics: {
        errorsInQueue: this.errorQueue.length,
        metricsInBuffer: this.metricsBuffer.length,
      }
    };
  }
}

// Export singleton instance
export const monitoring = new MonitoringService();

// Auto-initialize in production
if (import.meta.env.PROD) {
  monitoring.initialize().catch(console.error);
}

export default monitoring;