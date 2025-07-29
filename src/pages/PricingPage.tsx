import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Star,
  Shield,
  Lock,
  Eye,
  Users,
  BarChart3,
  Zap,
  DollarSign,
  Clock,
  AlertCircle,
  Info,
  X
} from 'lucide-react';
import { PRICING_PLANS, PRIVACY_GUARANTEES, formatPrice, calculateAnnualSavings } from '../types/pricing';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';
import { CheckoutForm } from '../components/payment/CheckoutForm';
import { toast } from 'react-hot-toast';

export function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [showPrivacyDetails, setShowPrivacyDetails] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const { currentPlan, upgradePlan, isLoading } = useSubscription();
  const { isAuthenticated } = useAuth();

  const handleUpgrade = async (planId: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to upgrade your plan');
      return;
    }

    if (planId === 'free') {
      // Handle downgrade to free plan
      try {
        await upgradePlan(planId as any);
        toast.success('Downgraded to free plan');
      } catch (error) {
        toast.error('Failed to downgrade plan');
      }
      return;
    }

    // Show checkout for paid plans
    const plan = PRICING_PLANS.find(p => p.id === planId);
    if (plan) {
      setSelectedPlan(plan);
      setShowCheckout(true);
    }
  };

  const filteredPlans = PRICING_PLANS.filter(plan => {
    if (billingPeriod === 'monthly') {
      return plan.billingPeriod === 'month';
    } else {
      return plan.id === 'free' || plan.id === 'annual';
    }
  });

  const annualSavings = calculateAnnualSavings();

  // Show checkout form if a plan is selected
  if (showCheckout && selectedPlan) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <CheckoutForm
            plan={selectedPlan}
            onSuccess={() => {
              setShowCheckout(false);
              setSelectedPlan(null);
              toast.success('Welcome to ' + selectedPlan.name + '!');
              // Optionally redirect to dashboard or reload page
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8">
              Powerful product verification and price comparison tools for everyone
            </p>
            
            {/* Billing Toggle */}
            <div className="flex flex-col sm:flex-row items-center justify-center mb-6 md:mb-8 space-y-2 sm:space-y-0">
              <div className="flex items-center">
                <span className={`mr-3 text-sm md:text-base ${billingPeriod === 'monthly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                  Monthly
                </span>
                <button
                  onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    billingPeriod === 'annual' ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      billingPeriod === 'annual' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`ml-3 text-sm md:text-base ${billingPeriod === 'annual' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                  Annual
                </span>
              </div>
              {billingPeriod === 'annual' && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full sm:ml-2">
                  Save {formatPrice(annualSavings)}
                </span>
              )}
            </div>
          </div>

          {/* Privacy Assurance Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 md:p-6 mb-8 md:mb-12">
            <div className="flex items-start">
              <Shield className="h-5 w-5 md:h-6 md:w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-semibold text-blue-900 mb-2">
                  🔒 Your Privacy is Our Priority
                </h3>
                <p className="text-sm md:text-base text-blue-800 mb-3">
                  <strong>We NEVER sell your data.</strong> Your personal information, search history, and usage patterns 
                  remain completely private and are never shared with third parties for marketing purposes.
                </p>
                <button
                  onClick={() => setShowPrivacyDetails(!showPrivacyDetails)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
                >
                  {showPrivacyDetails ? 'Hide' : 'View'} Privacy Details
                  <Info className="h-3 w-3 ml-1" />
                </button>
              </div>
            </div>
            
            {showPrivacyDetails && (
              <div className="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {PRIVACY_GUARANTEES.map((guarantee, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 md:p-4">
                    <div className="flex items-start">
                      <span className="text-xl md:text-2xl mr-2 md:mr-3">{guarantee.icon}</span>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1 text-sm md:text-base">{guarantee.title}</h4>
                        <p className="text-xs md:text-sm text-gray-600">{guarantee.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
            {filteredPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden ${
                  plan.popular ? 'ring-2 ring-blue-500 md:scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-center py-2 text-sm font-medium">
                    <Star className="h-4 w-4 inline mr-1" />
                    Most Popular
                  </div>
                )}
                
                <div className={`p-6 md:p-8 ${plan.popular ? 'pt-8 md:pt-12' : ''}`}>
                  {/* Plan Header */}
                  <div className="text-center mb-6 md:mb-8">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                    
                    <div className="mb-4">
                      {plan.originalPrice && (
                        <span className="text-gray-500 line-through text-base md:text-lg mr-2">
                          {formatPrice(plan.originalPrice)}
                        </span>
                      )}
                      <span className="text-3xl md:text-4xl font-bold text-gray-900">
                        {formatPrice(plan.price)}
                      </span>
                      <span className="text-gray-600 ml-1 text-sm md:text-base">
                        /{plan.billingPeriod}
                      </span>
                    </div>
                    
                    {plan.id === 'annual' && (
                      <div className="bg-green-100 text-green-800 text-xs md:text-sm px-3 py-1 rounded-full inline-block">
                        Save {formatPrice(annualSavings)} per year
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-4 w-4 md:h-5 md:w-5 text-green-500 mr-2 md:mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-xs md:text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isLoading || currentPlan.id === plan.id}
                    className={`w-full py-3 px-4 rounded-lg text-sm md:text-base font-medium transition-colors ${
                      currentPlan.id === plan.id
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {isLoading ? (
                      'Processing...'
                    ) : currentPlan.id === plan.id ? (
                      'Current Plan'
                    ) : plan.id === 'free' ? (
                      'Get Started Free'
                    ) : (
                      'Upgrade Now'
                    )}
                  </button>
                  
                  {plan.id !== 'free' && (
                    <p className="text-center text-xs text-gray-500 mt-3">
                      Cancel anytime. No hidden fees.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Feature Comparison */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-8 mb-8 md:mb-12">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-6 md:mb-8">
              Feature Comparison
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 md:py-4 px-2 md:px-4 font-medium text-gray-900 text-sm md:text-base">Features</th>
                    <th className="text-center py-3 md:py-4 px-2 md:px-4 font-medium text-gray-900 text-sm md:text-base">Free</th>
                    <th className="text-center py-3 md:py-4 px-2 md:px-4 font-medium text-gray-900 text-sm md:text-base">Premium</th>
                    <th className="text-center py-3 md:py-4 px-2 md:px-4 font-medium text-gray-900 text-sm md:text-base">Annual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-3 md:py-4 px-2 md:px-4 text-gray-700 text-xs md:text-sm">Barcode scans per month</td>
                    <td className="py-3 md:py-4 px-2 md:px-4 text-center text-xs md:text-sm">2</td>
                    <td className="py-3 md:py-4 px-2 md:px-4 text-center text-xs md:text-sm">Unlimited</td>
                    <td className="py-3 md:py-4 px-2 md:px-4 text-center text-xs md:text-sm">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-3 md:py-4 px-2 md:px-4 text-gray-700 text-xs md:text-sm">Store authenticity analysis</td>
                    <td className="py-3 md:py-4 px-2 md:px-4 text-center text-xs md:text-sm">2/month</td>
                    <td className="py-3 md:py-4 px-2 md:px-4 text-center text-xs md:text-sm">Unlimited</td>
                    <td className="py-3 md:py-4 px-2 md:px-4 text-center text-xs md:text-sm">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-3 md:py-4 px-2 md:px-4 text-gray-700 text-xs md:text-sm">Cross-platform searches</td>
                    <td className="py-3 md:py-4 px-2 md:px-4 text-center text-xs md:text-sm">2/month</td>
                    <td className="py-3 md:py-4 px-2 md:px-4 text-center text-xs md:text-sm">Unlimited</td>
                    <td className="py-3 md:py-4 px-2 md:px-4 text-center text-xs md:text-sm">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-3 md:py-4 px-2 md:px-4 text-gray-700 text-xs md:text-sm">Search history retention</td>
                    <td className="py-3 md:py-4 px-2 md:px-4 text-center text-xs md:text-sm">7 days</td>
                    <td className="py-3 md:py-4 px-2 md:px-4 text-center text-xs md:text-sm">90 days</td>
                    <td className="py-3 md:py-4 px-2 md:px-4 text-center text-xs md:text-sm">1 year</td>
                  </tr>
                  <tr>
                    <td className="py-3 md:py-4 px-2 md:px-4 text-gray-700 text-xs md:text-sm">Priority support</td>
                    <td className="py-3 md:py-4 px-2 md:px-4 text-center">
                      <X className="h-4 w-4 md:h-5 md:w-5 text-red-500 mx-auto" />
                    </td>
                    <td className="py-3 md:py-4 px-2 md:px-4 text-center">
                      <Check className="h-4 w-4 md:h-5 md:w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="py-3 md:py-4 px-2 md:px-4 text-center">
                      <Check className="h-4 w-4 md:h-5 md:w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 md:py-4 px-2 md:px-4 text-gray-700 text-xs md:text-sm">Advanced analytics</td>
                    <td className="py-3 md:py-4 px-2 md:px-4 text-center">
                      <X className="h-4 w-4 md:h-5 md:w-5 text-red-500 mx-auto" />
                    </td>
                    <td className="py-3 md:py-4 px-2 md:px-4 text-center">
                      <Check className="h-4 w-4 md:h-5 md:w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="py-3 md:py-4 px-2 md:px-4 text-center">
                      <Check className="h-4 w-4 md:h-5 md:w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 md:py-4 px-2 md:px-4 text-gray-700 text-xs md:text-sm">Bulk operations</td>
                    <td className="py-3 md:py-4 px-2 md:px-4 text-center">
                      <X className="h-4 w-4 md:h-5 md:w-5 text-red-500 mx-auto" />
                    </td>
                    <td className="py-3 md:py-4 px-2 md:px-4 text-center">
                      <Check className="h-4 w-4 md:h-5 md:w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="py-3 md:py-4 px-2 md:px-4 text-center">
                      <Check className="h-4 w-4 md:h-5 md:w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-8 mb-8 md:mb-12">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-6 md:mb-8">
              Frequently Asked Questions
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Is my data really safe?</h4>
                <p className="text-gray-600 text-xs md:text-sm mb-4">
                  Absolutely. We never sell your personal information and use industry-standard encryption. 
                  You can view our full privacy policy for complete details.
                </p>
                
                <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Can I cancel anytime?</h4>
                <p className="text-gray-600 text-xs md:text-sm mb-4">
                  Yes, you can cancel your subscription at any time. You'll continue to have access 
                  until the end of your billing period.
                </p>
                
                <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">What payment methods do you accept?</h4>
                <p className="text-gray-600 text-xs md:text-sm">
                  We accept all major credit cards, PayPal, and bank transfers for annual plans.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Do you offer refunds?</h4>
                <p className="text-gray-600 text-xs md:text-sm mb-4">
                  Yes, we offer a 30-day money-back guarantee. If you're not satisfied, 
                  contact us for a full refund.
                </p>
                
                <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Can I upgrade or downgrade plans?</h4>
                <p className="text-gray-600 text-xs md:text-sm mb-4">
                  Yes, you can change your plan at any time. Upgrades take effect immediately, 
                  and downgrades take effect at the next billing cycle.
                </p>
                
                <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Is there a free trial for premium features?</h4>
                <p className="text-gray-600 text-xs md:text-sm">
                  The free plan gives you a great taste of our features. We occasionally offer 
                  free trials for premium plans - sign up for our newsletter to be notified.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-gray-600 mb-6 md:mb-8 text-sm md:text-base">
              Join thousands of users who trust Shop Scanner for product verification and price comparison.
            </p>
            
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                <Link to="/register" className="btn-primary w-full sm:w-auto">
                  Sign Up Free
                </Link>
                <Link to="/login" className="btn-secondary w-full sm:w-auto">
                  Sign In
                </Link>
              </div>
            ) : (
              <Link to="/scan" className="btn-primary">
                Start Scanning Products
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}