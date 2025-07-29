import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Settings,
  TrendingUp,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Crown,
  Zap,
  BarChart3,
  Users,
  Clock,
  Shield,
  ArrowRight
} from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { formatPrice, PRICING_PLANS } from '../types/pricing';
import { PaymentMethods } from '../components/payment/PaymentMethods';
import { BillingHistory } from '../components/payment/BillingHistory';
import { CheckoutForm } from '../components/payment/CheckoutForm';
import { MonitoringDashboard } from '../components/monitoring/PaymentAlerts';
import { toast } from 'react-hot-toast';

export function SubscriptionPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'payment' | 'billing' | 'monitoring'>('overview');
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  
  const { 
    subscription, 
    currentPlan, 
    isLoading, 
    cancelSubscription,
    getRemainingUsage,
    getUsagePercentage
  } = useSubscription();

  const handleUpgrade = (plan: any) => {
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return;
    }

    try {
      await cancelSubscription();
      toast.success('Subscription cancelled successfully');
    } catch (error) {
      toast.error('Failed to cancel subscription');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (showCheckout && selectedPlan) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <CheckoutForm
            plan={selectedPlan}
            onSuccess={() => {
              setShowCheckout(false);
              setSelectedPlan(null);
              window.location.reload(); // Refresh to update subscription
            }}
            onCancel={() => {
              setShowCheckout(false);
              setSelectedPlan(null);
            }}
          />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
            <p className="text-gray-600">
              Manage your subscription, payment methods, and billing information
            </p>
          </div>

          {/* Subscription Status Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                {currentPlan.id === 'free' ? (
                  <div className="bg-gray-100 p-3 rounded-lg mr-4">
                    <Shield className="h-6 w-6 text-gray-600" />
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-lg mr-4">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{currentPlan.name} Plan</h2>
                  <p className="text-gray-600">
                    {currentPlan.id === 'free' 
                      ? 'Free forever • Limited features'
                      : `${formatPrice(currentPlan.price)}/${currentPlan.billingPeriod} • Full access`
                    }
                  </p>
                </div>
              </div>

              {subscription && subscription.status === 'active' && currentPlan.id !== 'free' && (
                <div className="text-right">
                  <div className="flex items-center text-green-600 mb-1">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {subscription.cancelAtPeriodEnd 
                      ? `Expires ${formatDate(subscription.currentPeriodEnd)}`
                      : `Renews ${formatDate(subscription.currentPeriodEnd)}`
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Usage Tracking for Free Plan */}
            {currentPlan.id === 'free' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Scans</h4>
                    <span className="text-sm text-gray-600">
                      {subscription?.usage.scansUsed || 0}/{currentPlan.limits.scansPerMonth}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getUsageColor(getUsagePercentage('scan'))}`}
                      style={{ width: `${getUsagePercentage('scan')}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Store Analysis</h4>
                    <span className="text-sm text-gray-600">
                      {subscription?.usage.storeAnalysisUsed || 0}/{currentPlan.limits.storeAnalysisPerMonth}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getUsageColor(getUsagePercentage('storeAnalysis'))}`}
                      style={{ width: `${getUsagePercentage('storeAnalysis')}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Cross-Platform Searches</h4>
                    <span className="text-sm text-gray-600">
                      {subscription?.usage.crossPlatformSearchesUsed || 0}/{currentPlan.limits.crossPlatformSearches}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getUsageColor(getUsagePercentage('crossPlatformSearch'))}`}
                      style={{ width: `${getUsagePercentage('crossPlatformSearch')}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Upgrade CTA for Free Plan */}
            {currentPlan.id === 'free' && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900">Unlock Unlimited Access</h4>
                      <p className="text-sm text-gray-600">
                        Upgrade to Premium for unlimited scans, analyses, and priority support
                      </p>
                    </div>
                  </div>
                  <Link to="/pricing" className="btn-primary">
                    Upgrade Now
                  </Link>
                </div>
              </div>
            )}

            {/* Cancellation Warning */}
            {subscription?.cancelAtPeriodEnd && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Subscription Cancelled</h4>
                    <p className="text-sm text-yellow-800">
                      Your subscription will end on {formatDate(subscription.currentPeriodEnd)}. 
                      You'll still have access to premium features until then.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="border-b">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <BarChart3 className="h-4 w-4 inline mr-2" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('payment')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'payment'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <CreditCard className="h-4 w-4 inline mr-2" />
                  Payment Methods
                </button>
                <button
                  onClick={() => setActiveTab('billing')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'billing'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Billing History
                </button>
                <button
                  onClick={() => setActiveTab('monitoring')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'monitoring'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <TrendingUp className="h-4 w-4 inline mr-2" />
                  Monitoring
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Plan Comparison */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Plans</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {PRICING_PLANS.map((plan) => (
                        <div
                          key={plan.id}
                          className={`border rounded-lg p-6 ${
                            currentPlan.id === plan.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="text-center mb-4">
                            <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                              {formatPrice(plan.price)}
                              <span className="text-sm text-gray-600">/{plan.billingPeriod}</span>
                            </p>
                            {plan.originalPrice && (
                              <p className="text-sm text-green-600">
                                Save {formatPrice(plan.originalPrice - plan.price)} per year
                              </p>
                            )}
                          </div>

                          <ul className="space-y-2 mb-6">
                            {plan.features.slice(0, 4).map((feature, index) => (
                              <li key={index} className="flex items-start text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{feature}</span>
                              </li>
                            ))}
                          </ul>

                          {currentPlan.id === plan.id ? (
                            <div className="text-center">
                              <span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-lg">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Current Plan
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleUpgrade(plan)}
                              className="w-full btn-primary"
                            >
                              {plan.id === 'free' ? 'Downgrade' : 'Upgrade'}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Subscription Actions */}
                  {currentPlan.id !== 'free' && (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Actions</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">Change Plan</h4>
                            <p className="text-sm text-gray-600">
                              Upgrade or downgrade your subscription at any time
                            </p>
                          </div>
                          <Link to="/pricing" className="btn-secondary">
                            View Plans
                          </Link>
                        </div>

                        {!subscription?.cancelAtPeriodEnd && (
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">Cancel Subscription</h4>
                              <p className="text-sm text-gray-600">
                                Cancel your subscription (access continues until period end)
                              </p>
                            </div>
                            <button
                              onClick={handleCancelSubscription}
                              className="btn-secondary text-red-600 hover:bg-red-50"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'payment' && (
                <PaymentMethods onAddPaymentMethod={() => setActiveTab('payment')} />
              )}

              {activeTab === 'billing' && <BillingHistory />}

              {activeTab === 'monitoring' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Monitoring</h3>
                    <p className="text-gray-600 mb-6">
                      Monitor payment system health, error rates, and performance metrics.
                    </p>
                  </div>
                  <MonitoringDashboard />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}