export interface PricingPlan {
  id: 'free' | 'premium' | 'annual';
  name: string;
  price: number;
  billingPeriod: 'month' | 'year';
  originalPrice?: number; // For showing discounts
  features: string[];
  limits: {
    scansPerMonth: number | 'unlimited';
    storeAnalysisPerMonth: number | 'unlimited';
    crossPlatformSearches: number | 'unlimited';
    historyRetention: number; // days
    prioritySupport: boolean;
    advancedAnalytics: boolean;
    bulkOperations: boolean;
  };
  popular?: boolean;
  description: string;
}

export interface UserSubscription {
  planId: PricingPlan['id'];
  status: 'active' | 'canceled' | 'past_due' | 'trial';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  usage: {
    scansUsed: number;
    storeAnalysisUsed: number;
    crossPlatformSearchesUsed: number;
    lastResetDate: string;
  };
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    billingPeriod: 'month',
    description: 'Perfect for occasional product verification',
    features: [
      '2 barcode scans per month',
      '2 store authenticity analyses per month',
      'Basic price comparison',
      'Community support',
      '7-day search history',
      'Mobile app access'
    ],
    limits: {
      scansPerMonth: 2,
      storeAnalysisPerMonth: 2,
      crossPlatformSearches: 2,
      historyRetention: 7,
      prioritySupport: false,
      advancedAnalytics: false,
      bulkOperations: false,
    }
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 10.00,
    billingPeriod: 'month',
    description: 'Unlimited access for power users and businesses',
    popular: true,
    features: [
      'Unlimited barcode scans',
      'Unlimited store authenticity analyses',
      'Unlimited cross-platform searches',
      'Advanced fraud detection',
      'Priority customer support',
      '90-day search history',
      'Advanced analytics dashboard',
      'Bulk operations',
      'Export reports (CSV/PDF)',
      'Real-time price alerts',
      'API access (coming soon)'
    ],
    limits: {
      scansPerMonth: 'unlimited',
      storeAnalysisPerMonth: 'unlimited',
      crossPlatformSearches: 'unlimited',
      historyRetention: 90,
      prioritySupport: true,
      advancedAnalytics: true,
      bulkOperations: true,
    }
  },
  {
    id: 'annual',
    name: 'Premium Annual',
    price: 108.00, // $9/month when billed annually (10% discount)
    originalPrice: 120.00, // Regular monthly price * 12
    billingPeriod: 'year',
    description: 'Save 10% with annual billing - best value!',
    features: [
      'Everything in Premium',
      '10% discount (save $12/year)',
      'Priority feature requests',
      'Annual usage reports',
      'Dedicated account manager (for businesses)',
      'Early access to new features'
    ],
    limits: {
      scansPerMonth: 'unlimited',
      storeAnalysisPerMonth: 'unlimited',
      crossPlatformSearches: 'unlimited',
      historyRetention: 365,
      prioritySupport: true,
      advancedAnalytics: true,
      bulkOperations: true,
    }
  }
];

export const PRIVACY_GUARANTEES = [
  {
    icon: '🔒',
    title: 'Your Data is Never Sold',
    description: 'We never sell, rent, or share your personal information with third parties for marketing purposes.'
  },
  {
    icon: '🛡️',
    title: 'Secure Data Storage',
    description: 'All data is encrypted at rest and in transit using industry-standard security protocols.'
  },
  {
    icon: '👁️',
    title: 'Transparent Data Use',
    description: 'We only use your data to provide and improve our services. You can view and delete your data anytime.'
  },
  {
    icon: '🔐',
    title: 'GDPR & CCPA Compliant',
    description: 'We comply with all major privacy regulations and give you full control over your data.'
  },
  {
    icon: '📊',
    title: 'Anonymous Analytics Only',
    description: 'We collect aggregated, anonymous usage statistics to improve our service - never personal data.'
  },
  {
    icon: '🚫',
    title: 'No Tracking Across Sites',
    description: 'We don\'t track your browsing activity outside of our application.'
  }
];

export function getPlanById(planId: string): PricingPlan | undefined {
  return PRICING_PLANS.find(plan => plan.id === planId);
}

export function calculateAnnualSavings(): number {
  const monthlyPlan = getPlanById('premium');
  const annualPlan = getPlanById('annual');
  
  if (!monthlyPlan || !annualPlan) return 0;
  
  const annualMonthlyEquivalent = monthlyPlan.price * 12;
  return annualMonthlyEquivalent - annualPlan.price;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

export function getUsagePercentage(used: number, limit: number | 'unlimited'): number {
  if (limit === 'unlimited') return 0;
  return Math.min(100, (used / limit) * 100);
}

export function isUsageLimitReached(used: number, limit: number | 'unlimited'): boolean {
  if (limit === 'unlimited') return false;
  return used >= limit;
}