// Environment configuration management
interface EnvironmentConfig {
  // API Configuration
  apiBaseUrl: string;
  apiTimeout: number;
  
  // Authentication
  jwtSecret?: string;
  sessionTimeout: number;
  
  // Stripe
  stripePublishableKey: string;
  stripeWebhookSecret?: string;
  
  // Analytics
  ga4MeasurementId?: string;
  mixpanelToken?: string;
  posthogKey?: string;
  
  // Push Notifications
  vapidPublicKey?: string;
  
  // External Services
  sentryDsn?: string;
  hotjarId?: string;
  
  // Feature Flags
  enableAnalytics: boolean;
  enablePushNotifications: boolean;
  enableOfflineMode: boolean;
  enablePWA: boolean;
  enableRateLimiting: boolean;
  
  // Development
  debugMode: boolean;
  mockApi: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  
  // AWS
  awsRegion?: string;
  cognitoUserPoolId?: string;
  cognitoClientId?: string;
  
  // Storage
  cloudinaryCloudName?: string;
  s3BucketName?: string;
  
  // Rate Limiting
  rateLimitFreeScans: number;
  rateLimitPremiumScans: number;
  rateLimitApiRequests: number;
  
  // Security
  trustedDomains: string[];
  
  // Monitoring
  errorReporting: boolean;
  performanceMonitoring: boolean;
  
  // Contact
  supportEmail: string;
  legalEmail: string;
  phoneNumber: string;
  
  // App Info
  appName: string;
  appVersion: string;
  appDescription: string;
  companyName: string;
  companyAddress: string;
}

// Type-safe environment variable getter
function getEnvVar(key: string, defaultValue?: string): string {
  const value = import.meta.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    console.warn(`Environment variable ${key} is not defined`);
    return '';
  }
  return value;
}

function getEnvBoolean(key: string, defaultValue: boolean = false): boolean {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

function getEnvArray(key: string, defaultValue: string[] = []): string[] {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value.split(',').map((item: string) => item.trim()).filter(Boolean);
}

// Environment configuration
export const config: EnvironmentConfig = {
  // API Configuration
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'https://shopscanner-production.up.railway.app'),
  apiTimeout: getEnvNumber('VITE_API_TIMEOUT', 30000),
  
  // Authentication
  jwtSecret: getEnvVar('VITE_JWT_SECRET'),
  sessionTimeout: getEnvNumber('VITE_SESSION_TIMEOUT', 3600000),
  
  // Stripe
  stripePublishableKey: getEnvVar('VITE_STRIPE_PUBLISHABLE_KEY', ''),
  stripeWebhookSecret: getEnvVar('VITE_STRIPE_WEBHOOK_SECRET'),
  
  // Analytics
  ga4MeasurementId: getEnvVar('VITE_GA4_MEASUREMENT_ID'),
  mixpanelToken: getEnvVar('VITE_MIXPANEL_TOKEN'),
  posthogKey: getEnvVar('VITE_POSTHOG_KEY'),
  
  // Push Notifications
  vapidPublicKey: getEnvVar('VITE_VAPID_PUBLIC_KEY'),
  
  // External Services
  sentryDsn: getEnvVar('VITE_SENTRY_DSN'),
  hotjarId: getEnvVar('VITE_HOTJAR_ID'),
  
  // Feature Flags
  enableAnalytics: getEnvBoolean('VITE_ENABLE_ANALYTICS', true),
  enablePushNotifications: getEnvBoolean('VITE_ENABLE_PUSH_NOTIFICATIONS', true),
  enableOfflineMode: getEnvBoolean('VITE_ENABLE_OFFLINE_MODE', true),
  enablePWA: getEnvBoolean('VITE_ENABLE_PWA', true),
  enableRateLimiting: getEnvBoolean('VITE_ENABLE_RATE_LIMITING', true),
  
  // Development
  debugMode: getEnvBoolean('VITE_DEBUG_MODE', import.meta.env.DEV),
  mockApi: getEnvBoolean('VITE_MOCK_API', true),
  logLevel: (getEnvVar('VITE_LOG_LEVEL', 'info') as any) || 'info',
  
  // AWS
  awsRegion: getEnvVar('VITE_AWS_REGION'),
  cognitoUserPoolId: getEnvVar('VITE_AWS_COGNITO_USER_POOL_ID'),
  cognitoClientId: getEnvVar('VITE_AWS_COGNITO_CLIENT_ID'),
  
  // Storage
  cloudinaryCloudName: getEnvVar('VITE_CLOUDINARY_CLOUD_NAME'),
  s3BucketName: getEnvVar('VITE_S3_BUCKET_NAME'),
  
  // Rate Limiting
  rateLimitFreeScans: getEnvNumber('VITE_RATE_LIMIT_FREE_SCANS', 10),
  rateLimitPremiumScans: getEnvNumber('VITE_RATE_LIMIT_PREMIUM_SCANS', 100),
  rateLimitApiRequests: getEnvNumber('VITE_RATE_LIMIT_API_REQUESTS', 1000),
  
  // Security
  trustedDomains: getEnvArray('VITE_TRUSTED_DOMAINS', ['shopscanner.com']),
  
  // Monitoring
  errorReporting: getEnvBoolean('VITE_ERROR_REPORTING', true),
  performanceMonitoring: getEnvBoolean('VITE_PERFORMANCE_MONITORING', true),
  
  // Contact
  supportEmail: getEnvVar('VITE_SUPPORT_EMAIL', 'support@shopscanner.com'),
  legalEmail: getEnvVar('VITE_LEGAL_EMAIL', 'legal@shopscanner.com'),
  phoneNumber: getEnvVar('VITE_PHONE_NUMBER', '+1-555-123-4567'),
  
  // App Info
  appName: getEnvVar('VITE_APP_NAME', 'Shop Scanner'),
  appVersion: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  appDescription: getEnvVar('VITE_APP_DESCRIPTION', 'Product Authenticity & Price Comparison'),
  companyName: getEnvVar('VITE_COMPANY_NAME', 'Shop Scanner LLC'),
  companyAddress: getEnvVar('VITE_COMPANY_ADDRESS', '123 Tech Street, San Francisco, CA 94105')
};

// Environment validation
export function validateEnvironment(): void {
  const requiredVars = [
    'apiBaseUrl',
    'stripePublishableKey'
  ];

  const missingVars = requiredVars.filter(key => !config[key as keyof EnvironmentConfig]);
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    if (import.meta.env.PROD) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }

  // Validate URLs
  try {
    new URL(config.apiBaseUrl);
  } catch {
    console.error('Invalid API base URL:', config.apiBaseUrl);
    if (import.meta.env.PROD) {
      throw new Error('Invalid API base URL');
    }
  }

  // Validate email addresses
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(config.supportEmail)) {
    console.warn('Invalid support email:', config.supportEmail);
  }
  if (!emailRegex.test(config.legalEmail)) {
    console.warn('Invalid legal email:', config.legalEmail);
  }

  if (config.debugMode) {
    console.log('Environment configuration loaded:', {
      ...config,
      jwtSecret: config.jwtSecret ? '[REDACTED]' : undefined,
      stripeWebhookSecret: config.stripeWebhookSecret ? '[REDACTED]' : undefined
    });
  }
}

// Environment-specific configurations
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
export const isTest = import.meta.env.MODE === 'test';

// Feature flags
export const features = {
  analytics: config.enableAnalytics && !!(config.ga4MeasurementId || config.mixpanelToken || config.posthogKey),
  pushNotifications: config.enablePushNotifications && !!config.vapidPublicKey,
  offlineMode: config.enableOfflineMode,
  pwa: config.enablePWA,
  rateLimiting: config.enableRateLimiting,
  errorReporting: config.errorReporting && !!config.sentryDsn,
  performanceMonitoring: config.performanceMonitoring
};

// API endpoints
export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    verify: '/auth/verify'
  },
  products: {
    scan: '/products/scan',
    search: '/products/search',
    details: '/products/:id',
    analyze: '/products/analyze'
  },
  user: {
    profile: '/user/profile',
    preferences: '/user/preferences',
    subscription: '/user/subscription'
  },
  payments: {
    checkout: '/payments/checkout',
    webhooks: '/payments/webhooks',
    methods: '/payments/methods'
  },
  support: {
    tickets: '/support/tickets',
    contact: '/support/contact'
  },
  analytics: {
    events: '/analytics/events',
    dashboard: '/analytics/dashboard',
    export: '/analytics/export'
  }
};

// Initialize environment validation
validateEnvironment();