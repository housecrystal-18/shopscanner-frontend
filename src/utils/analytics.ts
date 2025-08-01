// Analytics utility for tracking user events and business metrics

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  userId?: string;
  properties?: Record<string, any>;
}

// Track key business events
export const trackEvent = (event: AnalyticsEvent) => {
  // Google Analytics 4
  if (typeof gtag !== 'undefined') {
    gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      user_id: event.userId,
      ...event.properties
    });
  }

  // Console log for development
  if (import.meta.env.DEV) {
    console.log('Analytics Event:', event);
  }
};

// Business metric tracking functions
export const analytics = {
  // User acquisition
  userSignup: (method: 'email' | 'social', planType: 'free' | 'monthly' | 'annual') => {
    trackEvent({
      action: 'user_signup',
      category: 'acquisition',
      label: method,
      properties: { planType, timestamp: Date.now() }
    });
  },

  // Conversion events
  subscriptionStarted: (planType: 'monthly' | 'annual', amount: number) => {
    trackEvent({
      action: 'subscription_started',
      category: 'conversion',
      label: planType,
      value: amount,
      properties: { revenue: amount }
    });
  },

  // Product usage
  productScanned: (scanType: 'url' | 'qr', authenticityScore: number, userId?: string) => {
    trackEvent({
      action: 'product_scanned',
      category: 'engagement',
      label: scanType,
      value: authenticityScore,
      userId,
      properties: { scanType, authenticityScore }
    });
  },

  // Price alerts
  priceAlertCreated: (productName: string, targetPrice: number, currentPrice: number) => {
    trackEvent({
      action: 'price_alert_created',
      category: 'engagement',
      label: 'price_tracking',
      properties: { 
        productName, 
        targetPrice, 
        currentPrice,
        discount: ((currentPrice - targetPrice) / currentPrice * 100).toFixed(1)
      }
    });
  },

  // Feature usage
  featureUsed: (featureName: string, userId?: string) => {
    trackEvent({
      action: 'feature_used',
      category: 'engagement',
      label: featureName,
      userId,
      properties: { feature: featureName }
    });
  },

  // Onboarding
  onboardingCompleted: (stepsCompleted: number, totalSteps: number, userId?: string) => {
    trackEvent({
      action: 'onboarding_completed',
      category: 'onboarding',
      label: 'tutorial_finished',
      value: stepsCompleted,
      userId,
      properties: { 
        completionRate: (stepsCompleted / totalSteps * 100).toFixed(1),
        stepsCompleted,
        totalSteps
      }
    });
  },

  onboardingSkipped: (currentStep: number, totalSteps: number, userId?: string) => {
    trackEvent({
      action: 'onboarding_skipped',
      category: 'onboarding',
      label: 'tutorial_skipped',
      value: currentStep,
      userId,
      properties: { 
        skipRate: (currentStep / totalSteps * 100).toFixed(1),
        currentStep,
        totalSteps
      }
    });
  },

  // Social sharing
  contentShared: (platform: string, content: string) => {
    trackEvent({
      action: 'content_shared',
      category: 'social',
      label: platform,
      properties: { platform, contentType: content }
    });
  },

  // Error tracking
  errorOccurred: (errorType: string, errorMessage: string, userId?: string) => {
    trackEvent({
      action: 'error_occurred',
      category: 'error',
      label: errorType,
      userId,
      properties: { errorMessage, errorType }
    });
  },

  // Revenue tracking
  paymentSucceeded: (amount: number, planType: string, userId: string) => {
    trackEvent({
      action: 'payment_succeeded',
      category: 'revenue',
      label: planType,
      value: amount,
      userId,
      properties: { 
        revenue: amount, 
        planType,
        currency: 'USD'
      }
    });
  },

  paymentFailed: (amount: number, planType: string, errorReason: string, userId?: string) => {
    trackEvent({
      action: 'payment_failed',
      category: 'revenue',
      label: planType,
      value: amount,
      userId,
      properties: { 
        amount, 
        planType,
        errorReason,
        currency: 'USD'
      }
    });
  }
};

// Set up user properties
export const setUserProperties = (userId: string, properties: Record<string, any>) => {
  if (typeof gtag !== 'undefined') {
    gtag('config', 'GA_MEASUREMENT_ID', {
      user_id: userId,
      custom_map: properties
    });
  }
};

// Track page views
export const trackPageView = (pageName: string, userId?: string) => {
  if (typeof gtag !== 'undefined') {
    gtag('config', 'GA_MEASUREMENT_ID', {
      page_title: pageName,
      page_location: window.location.href,
      user_id: userId
    });
  }
};

declare global {
  function gtag(...args: any[]): void;
}