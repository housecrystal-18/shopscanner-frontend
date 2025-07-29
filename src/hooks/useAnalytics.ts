import { useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: string;
}

interface UserProperties {
  userId: string;
  email?: string;
  subscriptionTier?: string;
  signupDate?: string;
  totalScans?: number;
  totalWishlistItems?: number;
}

class Analytics {
  private queue: AnalyticsEvent[] = [];
  private isInitialized = false;
  private userId: string | null = null;
  private batchTimeout: number | null = null;

  initialize(userId?: string) {
    if (this.isInitialized) return;

    this.userId = userId || null;
    this.isInitialized = true;

    // Initialize third-party analytics if needed
    if (import.meta.env.PROD) {
      this.initializeExternalProviders();
    }

    // Process any queued events
    this.processBatch();
    
    console.log('Analytics initialized', { userId });
  }

  private initializeExternalProviders() {
    // Google Analytics 4
    if (import.meta.env.VITE_GA4_MEASUREMENT_ID) {
      this.initializeGA4();
    }

    // Mixpanel
    if (import.meta.env.VITE_MIXPANEL_TOKEN) {
      this.initializeMixpanel();
    }

    // PostHog
    if (import.meta.env.VITE_POSTHOG_KEY) {
      this.initializePostHog();
    }
  }

  private initializeGA4() {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA4_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    script.onload = () => {
      (window as any).dataLayer = (window as any).dataLayer || [];
      function gtag(...args: any[]) {
        (window as any).dataLayer.push(args);
      }
      (window as any).gtag = gtag;

      gtag('js', new Date());
      gtag('config', import.meta.env.VITE_GA4_MEASUREMENT_ID, {
        send_page_view: false // We'll send page views manually
      });
    };
  }

  private initializeMixpanel() {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js';
    document.head.appendChild(script);

    script.onload = () => {
      (window as any).mixpanel.init(import.meta.env.VITE_MIXPANEL_TOKEN, {
        debug: !import.meta.env.PROD,
        track_pageview: false,
        persistence: 'localStorage'
      });
    };
  }

  private initializePostHog() {
    const script = document.createElement('script');
    script.innerHTML = `
      !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]);var n=t;if("undefined"!=typeof e){n=t[e]=function(){n.people=n.people||[],n.toString=function(t){var e="posthog";return"posthog"!==t&&(e+="."+t),e}}}t._i.push(["init",arguments])},e._i.push(["init",arguments])},e.__SV=1)}(document,window.posthog||[]);
      posthog.init('${import.meta.env.VITE_POSTHOG_KEY}', {api_host: 'https://app.posthog.com'})
    `;
    document.head.appendChild(script);
  }

  track(event: string, properties?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        referrer: document.referrer,
        user_agent: navigator.userAgent
      },
      userId: this.userId || undefined,
      timestamp: new Date().toISOString()
    };

    // Add to queue for batch processing
    this.queue.push(analyticsEvent);

    // Send to external providers immediately in production
    if (import.meta.env.PROD && this.isInitialized) {
      this.sendToExternalProviders(analyticsEvent);
    }

    // Batch internal analytics
    this.scheduleBatch();
  }

  identify(userId: string, properties?: UserProperties) {
    this.userId = userId;

    const identifyEvent: AnalyticsEvent = {
      event: '$identify',
      properties: {
        ...properties,
        timestamp: new Date().toISOString()
      },
      userId,
      timestamp: new Date().toISOString()
    };

    this.queue.push(identifyEvent);

    // Send to external providers
    if (import.meta.env.PROD && this.isInitialized) {
      this.identifyExternalProviders(userId, properties);
    }

    this.scheduleBatch();
  }

  page(pageName?: string, properties?: Record<string, any>) {
    this.track('$pageview', {
      page_name: pageName || document.title,
      page_url: window.location.href,
      page_path: window.location.pathname,
      ...properties
    });
  }

  private sendToExternalProviders(event: AnalyticsEvent) {
    // Google Analytics 4
    if ((window as any).gtag) {
      (window as any).gtag('event', event.event, {
        ...event.properties,
        user_id: event.userId
      });
    }

    // Mixpanel
    if ((window as any).mixpanel && (window as any).mixpanel.track) {
      (window as any).mixpanel.track(event.event, event.properties);
    }

    // PostHog
    if ((window as any).posthog && (window as any).posthog.capture) {
      (window as any).posthog.capture(event.event, event.properties);
    }
  }

  private identifyExternalProviders(userId: string, properties?: UserProperties) {
    // Google Analytics 4
    if ((window as any).gtag) {
      (window as any).gtag('config', import.meta.env.VITE_GA4_MEASUREMENT_ID, {
        user_id: userId
      });
    }

    // Mixpanel
    if ((window as any).mixpanel && (window as any).mixpanel.identify) {
      (window as any).mixpanel.identify(userId);
      if (properties) {
        (window as any).mixpanel.people.set(properties);
      }
    }

    // PostHog
    if ((window as any).posthog && (window as any).posthog.identify) {
      (window as any).posthog.identify(userId, properties);
    }
  }

  private scheduleBatch() {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = window.setTimeout(() => {
      this.processBatch();
    }, 5000); // Send batch every 5 seconds
  }

  private async processBatch() {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      // Send to internal analytics API
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ events })
      });
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-queue events if they failed to send
      this.queue.unshift(...events);
    }
  }

  // Revenue tracking
  trackRevenue(amount: number, properties?: Record<string, any>) {
    this.track('revenue', {
      amount,
      currency: 'USD',
      ...properties
    });
  }

  // Subscription events
  trackSubscription(action: 'started' | 'upgraded' | 'downgraded' | 'cancelled', properties?: Record<string, any>) {
    this.track(`subscription_${action}`, properties);
  }

  // Feature usage tracking
  trackFeatureUsage(feature: string, properties?: Record<string, any>) {
    this.track('feature_used', {
      feature,
      ...properties
    });
  }

  // Error tracking
  trackError(error: Error, properties?: Record<string, any>) {
    this.track('error', {
      error_message: error.message,
      error_stack: error.stack,
      error_name: error.name,
      ...properties
    });
  }
}

const analytics = new Analytics();

export function useAnalytics() {
  const { user } = useAuth();
  const { subscription } = useSubscription();

  // Initialize analytics when user data is available
  useEffect(() => {
    if (user) {
      analytics.initialize(user.id);
      analytics.identify(user.id, {
        userId: user.id,
        email: user.email,
        subscriptionTier: user.plan || 'free',
        signupDate: new Date().toISOString()
      });
    }
  }, [user, subscription]);

  // Track page views on route changes
  useEffect(() => {
    analytics.page();
  }, []);

  const track = useCallback((event: string, properties?: Record<string, any>) => {
    analytics.track(event, properties);
  }, []);

  const page = useCallback((pageName?: string, properties?: Record<string, any>) => {
    analytics.page(pageName, properties);
  }, []);

  const trackRevenue = useCallback((amount: number, properties?: Record<string, any>) => {
    analytics.trackRevenue(amount, properties);
  }, []);

  const trackSubscription = useCallback((action: 'started' | 'upgraded' | 'downgraded' | 'cancelled', properties?: Record<string, any>) => {
    analytics.trackSubscription(action, properties);
  }, []);

  const trackFeatureUsage = useCallback((feature: string, properties?: Record<string, any>) => {
    analytics.trackFeatureUsage(feature, properties);
  }, []);

  const trackError = useCallback((error: Error, properties?: Record<string, any>) => {
    analytics.trackError(error, properties);
  }, []);

  return {
    track,
    page,
    trackRevenue,
    trackSubscription,
    trackFeatureUsage,
    trackError
  };
}

// Export analytics instance for direct use
export { analytics };