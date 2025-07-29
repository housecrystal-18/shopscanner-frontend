import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PricingPlan, UserSubscription, PRICING_PLANS, getPlanById } from '../types/pricing';
import { useAuth } from './AuthContext';
import { api } from '../lib/api';
import { initializeWebhookListeners } from '../lib/webhook-handler';

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  currentPlan: PricingPlan;
  isLoading: boolean;
  canUseFeature: (feature: 'scan' | 'storeAnalysis' | 'crossPlatformSearch') => boolean;
  getRemainingUsage: (feature: 'scan' | 'storeAnalysis' | 'crossPlatformSearch') => number | 'unlimited';
  incrementUsage: (feature: 'scan' | 'storeAnalysis' | 'crossPlatformSearch') => Promise<void>;
  upgradePlan: (planId: PricingPlan['id']) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  getUsagePercentage: (feature: 'scan' | 'storeAnalysis' | 'crossPlatformSearch') => number;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  // Get current plan (default to free if no subscription)
  const currentPlan = subscription 
    ? getPlanById(subscription.planId) || PRICING_PLANS[0]
    : PRICING_PLANS[0]; // Free plan

  useEffect(() => {
    if (isAuthenticated && user) {
      loadSubscription();
    } else {
      setSubscription(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Initialize webhook listeners for real-time subscription updates
  useEffect(() => {
    const cleanup = initializeWebhookListeners();

    // Handle subscription updates from webhooks
    const handleSubscriptionUpdated = (event: Event) => {
      const customEvent = event as CustomEvent;
      const webhookData = customEvent.detail;
      
      // Update subscription status from webhook
      if (subscription) {
        setSubscription(prev => prev ? {
          ...prev,
          status: webhookData.status,
          planId: webhookData.planId || prev.planId,
          currentPeriodEnd: webhookData.currentPeriodEnd?.toISOString() || prev.currentPeriodEnd,
        } : null);
      }
    };

    const handleSubscriptionCanceled = (event: Event) => {
      const customEvent = event as CustomEvent;
      // Update subscription to show cancellation
      if (subscription) {
        setSubscription(prev => prev ? {
          ...prev,
          status: 'canceled',
          cancelAtPeriodEnd: true,
        } : null);
      }
    };

    window.addEventListener('subscription_updated', handleSubscriptionUpdated);
    window.addEventListener('subscription_canceled', handleSubscriptionCanceled);

    return () => {
      cleanup();
      window.removeEventListener('subscription_updated', handleSubscriptionUpdated);
      window.removeEventListener('subscription_canceled', handleSubscriptionCanceled);
    };
  }, [subscription]);

  const loadSubscription = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/subscription');
      setSubscription(response.data);
    } catch (error: any) {
      // If user has no subscription, default to free plan
      if (error.response?.status === 404) {
        const freeSubscription: UserSubscription = {
          planId: 'free',
          status: 'active',
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          cancelAtPeriodEnd: false,
          usage: {
            scansUsed: 0,
            storeAnalysisUsed: 0,
            crossPlatformSearchesUsed: 0,
            lastResetDate: new Date().toISOString(),
          }
        };
        setSubscription(freeSubscription);
      } else {
        console.error('Failed to load subscription:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const canUseFeature = (feature: 'scan' | 'storeAnalysis' | 'crossPlatformSearch'): boolean => {
    if (!subscription) return false;

    const limits = currentPlan.limits;
    const usage = subscription.usage;

    switch (feature) {
      case 'scan':
        return limits.scansPerMonth === 'unlimited' || usage.scansUsed < limits.scansPerMonth;
      case 'storeAnalysis':
        return limits.storeAnalysisPerMonth === 'unlimited' || usage.storeAnalysisUsed < limits.storeAnalysisPerMonth;
      case 'crossPlatformSearch':
        return limits.crossPlatformSearches === 'unlimited' || usage.crossPlatformSearchesUsed < limits.crossPlatformSearches;
      default:
        return false;
    }
  };

  const getRemainingUsage = (feature: 'scan' | 'storeAnalysis' | 'crossPlatformSearch'): number | 'unlimited' => {
    if (!subscription) return 0;

    const limits = currentPlan.limits;
    const usage = subscription.usage;

    switch (feature) {
      case 'scan':
        if (limits.scansPerMonth === 'unlimited') return 'unlimited';
        return Math.max(0, (limits.scansPerMonth as number) - usage.scansUsed);
      case 'storeAnalysis':
        if (limits.storeAnalysisPerMonth === 'unlimited') return 'unlimited';
        return Math.max(0, (limits.storeAnalysisPerMonth as number) - usage.storeAnalysisUsed);
      case 'crossPlatformSearch':
        if (limits.crossPlatformSearches === 'unlimited') return 'unlimited';
        return Math.max(0, (limits.crossPlatformSearches as number) - usage.crossPlatformSearchesUsed);
      default:
        return 0;
    }
  };

  const getUsagePercentage = (feature: 'scan' | 'storeAnalysis' | 'crossPlatformSearch'): number => {
    if (!subscription) return 0;

    const limits = currentPlan.limits;
    const usage = subscription.usage;

    switch (feature) {
      case 'scan':
        if (limits.scansPerMonth === 'unlimited') return 0;
        return Math.min(100, (usage.scansUsed / (limits.scansPerMonth as number)) * 100);
      case 'storeAnalysis':
        if (limits.storeAnalysisPerMonth === 'unlimited') return 0;
        return Math.min(100, (usage.storeAnalysisUsed / (limits.storeAnalysisPerMonth as number)) * 100);
      case 'crossPlatformSearch':
        if (limits.crossPlatformSearches === 'unlimited') return 0;
        return Math.min(100, (usage.crossPlatformSearchesUsed / (limits.crossPlatformSearches as number)) * 100);
      default:
        return 0;
    }
  };

  const incrementUsage = async (feature: 'scan' | 'storeAnalysis' | 'crossPlatformSearch') => {
    if (!subscription || !canUseFeature(feature)) {
      throw new Error('Usage limit reached or feature not available');
    }

    try {
      const response = await api.post('/api/subscription/usage', { feature });
      setSubscription(response.data);
    } catch (error) {
      // Update locally if API fails
      const updatedSubscription = { ...subscription };
      switch (feature) {
        case 'scan':
          updatedSubscription.usage.scansUsed += 1;
          break;
        case 'storeAnalysis':
          updatedSubscription.usage.storeAnalysisUsed += 1;
          break;
        case 'crossPlatformSearch':
          updatedSubscription.usage.crossPlatformSearchesUsed += 1;
          break;
      }
      setSubscription(updatedSubscription);
      
      console.warn('Failed to update usage on server, updated locally:', error);
    }
  };

  const upgradePlan = async (planId: PricingPlan['id']) => {
    try {
      setIsLoading(true);
      const response = await api.post('/api/subscription/upgrade', { planId });
      setSubscription(response.data);
      
      // In a real implementation, this would redirect to Stripe/payment processor
      window.location.href = response.data.checkoutUrl || '/pricing?success=true';
    } catch (error) {
      console.error('Failed to upgrade plan:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async () => {
    try {
      setIsLoading(true);
      const response = await api.post('/api/subscription/cancel');
      setSubscription(response.data);
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: SubscriptionContextType = {
    subscription,
    currentPlan,
    isLoading,
    canUseFeature,
    getRemainingUsage,
    incrementUsage,
    upgradePlan,
    cancelSubscription,
    getUsagePercentage,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextType {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}