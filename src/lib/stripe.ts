import { loadStripe, Stripe, StripeError } from '@stripe/stripe-js';

// Production Stripe configuration with proper error handling
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Validate Stripe key configuration - allow missing key for now
if (!STRIPE_PUBLISHABLE_KEY) {
  console.warn('⚠️  VITE_STRIPE_PUBLISHABLE_KEY is not configured - payment features will be disabled');
}

// Warn if using test keys in production
if (import.meta.env.PROD && STRIPE_PUBLISHABLE_KEY && STRIPE_PUBLISHABLE_KEY.startsWith('pk_test_')) {
  console.warn('⚠️  Using Stripe test key in production mode');
}

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
let stripePromise: Promise<Stripe | null>;

export const getStripe = (): Promise<Stripe | null> => {
  if (!STRIPE_PUBLISHABLE_KEY) {
    console.warn('Stripe not available - no publishable key configured');
    return Promise.resolve(null);
  }
  
  if (!stripePromise) {
    try {
      stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
    } catch (error) {
      console.error('Failed to load Stripe:', error);
      return Promise.resolve(null);
    }
  }
  return stripePromise;
};

/**
 * Handle Stripe errors with proper error categorization
 */
export const handleStripeError = (error: StripeError): {
  message: string;
  type: 'card_error' | 'validation_error' | 'network_error' | 'api_error' | 'rate_limit_error' | 'authentication_error' | 'invalid_request_error' | 'unknown';
  shouldRetry: boolean;
} => {
  const errorType = error.type || 'unknown';
  
  switch (errorType) {
    case 'card_error':
      return {
        message: error.message || 'Your card was declined. Please try a different payment method.',
        type: 'card_error',
        shouldRetry: false
      };
      
    case 'validation_error':
      return {
        message: error.message || 'Please check your payment information and try again.',
        type: 'validation_error',
        shouldRetry: false
      };
      
    case 'rate_limit_error':
      return {
        message: 'Too many requests. Please wait a moment and try again.',
        type: 'rate_limit_error',
        shouldRetry: true
      };
      
    case 'api_connection_error':
      return {
        message: 'Network error. Please check your connection and try again.',
        type: 'api_connection_error' as any,
        shouldRetry: true
      };
      
    case 'authentication_error':
      return {
        message: 'Authentication failed. Please refresh the page and try again.',
        type: 'authentication_error',
        shouldRetry: false
      };
      
    case 'api_error':
    case 'invalid_request_error':
    default:
      return {
        message: 'An unexpected error occurred. Please try again or contact support.',
        type: errorType as any,
        shouldRetry: false
      };
  }
};

/**
 * Retry wrapper for Stripe operations
 */
export const withStripeRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: StripeError | Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as StripeError | Error;
      
      // If it's a Stripe error, check if we should retry
      if ('type' in lastError) {
        const errorInfo = handleStripeError(lastError);
        if (!errorInfo.shouldRetry || attempt === maxRetries) {
          throw lastError;
        }
      } else if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait before retrying
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  
  throw lastError!;
};

export const formatStripePrice = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount / 100); // Stripe amounts are in cents
};

// Stripe product and price IDs (these would be created in your Stripe dashboard)
export const STRIPE_PRODUCTS = {
  premium_monthly: {
    priceId: 'price_premium_monthly', // Replace with actual Stripe Price ID
    productId: 'prod_premium', // Replace with actual Stripe Product ID
  },
  premium_annual: {
    priceId: 'price_premium_annual', // Replace with actual Stripe Price ID
    productId: 'prod_premium_annual', // Replace with actual Stripe Product ID
  },
};

export const PAYMENT_METHODS = [
  {
    type: 'card',
    name: 'Credit/Debit Card',
    description: 'Visa, MasterCard, American Express, and more',
    icon: '💳',
    processing_fee: 'Standard processing fees apply',
  },
  {
    type: 'apple_pay',
    name: 'Apple Pay',
    description: 'Pay with Touch ID or Face ID',
    icon: '🍎',
    processing_fee: 'No additional fees',
  },
  {
    type: 'google_pay',
    name: 'Google Pay',
    description: 'Pay with your Google account',
    icon: '🔵',
    processing_fee: 'No additional fees',
  },
  {
    type: 'link',
    name: 'Link',
    description: 'Save payment details for faster checkout',
    icon: '🔗',
    processing_fee: 'No additional fees',
  },
];

export const BILLING_COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺' },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰' },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹' },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾' },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸' },
  { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮' },
];

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  created: number;
  is_default: boolean;
}

export interface Invoice {
  id: string;
  amount_paid: number;
  amount_due: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  created: number;
  period_start: number;
  period_end: number;
  hosted_invoice_url: string;
  invoice_pdf: string;
  subscription_id: string;
}