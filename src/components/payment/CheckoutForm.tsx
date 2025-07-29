import { useState, useEffect } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement,
  AddressElement,
  Elements
} from '@stripe/react-stripe-js';
import {
  CreditCard,
  Shield,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader,
  ArrowLeft,
  Receipt
} from 'lucide-react';
import { getStripe, formatStripePrice, PAYMENT_METHODS } from '../../lib/stripe';
import { PricingPlan, formatPrice } from '../../types/pricing';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { toast } from 'react-hot-toast';

interface CheckoutFormProps {
  plan: PricingPlan;
  onSuccess: () => void;
  onCancel: () => void;
}

interface CheckoutSession {
  clientSecret: string;
  subscriptionId: string;
  customerId: string;
}

// Checkout form component that needs to be wrapped in Elements
function CheckoutFormInner({ plan, onSuccess, onCancel }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [paymentMethods, setPaymentMethods] = useState(PAYMENT_METHODS);
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [savePaymentMethod, setSavePaymentMethod] = useState(true);

  useEffect(() => {
    if (!stripe) return;

    // Check if payment was successful from URL parameters
    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );

    if (!clientSecret) return;

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case 'succeeded':
          setMessage('Payment succeeded!');
          toast.success('Payment successful! Your subscription is now active.');
          onSuccess();
          break;
        case 'processing':
          setMessage('Your payment is processing.');
          break;
        case 'requires_payment_method':
          setMessage('Your payment was not successful, please try again.');
          break;
        default:
          setMessage('Something went wrong.');
          break;
      }
    });
  }, [stripe, onSuccess]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setMessage('');

    try {
      // Create subscription on backend
      const { data: session } = await api.post('/api/subscriptions/create-checkout-session', {
        planId: plan.id,
        customerEmail,
        savePaymentMethod,
      });

      // Confirm payment with Stripe
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/pricing?success=true`,
          receipt_email: customerEmail,
        },
      });

      if (result.error) {
        if (result.error.type === 'card_error' || result.error.type === 'validation_error') {
          setMessage(result.error.message || 'Payment failed');
          toast.error(result.error.message || 'Payment failed');
        } else {
          setMessage('An unexpected error occurred.');
          toast.error('Payment processing failed');
        }
      } else {
        setMessage('Payment succeeded!');
        toast.success('Payment successful! Your subscription is now active.');
        onSuccess();
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      setMessage(error.response?.data?.message || 'Failed to process payment');
      toast.error('Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentElementOptions = {
    layout: 'tabs' as const,
    paymentMethodOrder: ['card', 'apple_pay', 'google_pay', 'link'],
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg mr-3 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Complete Your Purchase</h2>
            <p className="text-gray-600">Subscribe to {plan.name} - {formatPrice(plan.price)}/{plan.billingPeriod}</p>
          </div>
        </div>
      </div>

      {/* Security Badge */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-green-600 mr-3" />
          <div>
            <h3 className="text-sm font-semibold text-green-900">🔒 Secure Checkout</h3>
            <p className="text-sm text-green-800">
              Your payment information is encrypted and secure. We use Stripe for payment processing
              and never store your card details.
            </p>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Receipt className="h-5 w-5 mr-2" />
          Order Summary
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">{plan.name} Plan</span>
            <span className="font-medium">{formatPrice(plan.price)}</span>
          </div>
          
          {plan.originalPrice && (
            <div className="flex justify-between items-center text-sm text-green-600">
              <span>Annual Discount (10% off)</span>
              <span>-{formatPrice(plan.originalPrice - plan.price)}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Billing Period</span>
            <span className="capitalize">{plan.billingPeriod}ly</span>
          </div>
          
          <div className="border-t pt-3 flex justify-between items-center font-semibold">
            <span>Total</span>
            <span className="text-xl">{formatPrice(plan.price)}</span>
          </div>
          
          <div className="text-xs text-gray-500">
            {plan.billingPeriod === 'month' ? 'Billed monthly' : 'Billed annually'}
            {' • '}Cancel anytime
          </div>
        </div>
      </div>

      {/* Checkout Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            className="input-field"
            placeholder="Enter your email address"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Receipt and subscription details will be sent to this email
          </p>
        </div>

        {/* Payment Element */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <div className="border rounded-lg p-4">
            <PaymentElement 
              id="payment-element" 
              options={paymentElementOptions}
            />
          </div>
        </div>

        {/* Billing Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Billing Address
          </label>
          <div className="border rounded-lg p-4">
            <AddressElement 
              options={{
                mode: 'billing',
                allowedCountries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL'],
              }}
            />
          </div>
        </div>

        {/* Save Payment Method */}
        <div className="flex items-start">
          <input
            type="checkbox"
            id="save-payment"
            checked={savePaymentMethod}
            onChange={(e) => setSavePaymentMethod(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
          />
          <label htmlFor="save-payment" className="ml-2 block text-sm text-gray-700">
            Save this payment method for future purchases
            <span className="block text-xs text-gray-500">
              Securely store payment details for faster checkout
            </span>
          </label>
        </div>

        {/* Error Message */}
        {message && (
          <div className={`p-4 rounded-lg flex items-center ${
            message.includes('succeeded') 
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.includes('succeeded') ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            {message}
          </div>
        )}

        {/* Terms and Submit */}
        <div className="space-y-4">
          <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
            <p className="mb-2">
              By completing this purchase, you agree to our{' '}
              <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
            </p>
            <p>
              Your subscription will automatically renew every {plan.billingPeriod}. 
              You can cancel anytime from your account settings.
            </p>
          </div>

          <button
            type="submit"
            disabled={isProcessing || !stripe || !elements}
            className="w-full btn-primary btn-lg inline-flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <Loader className="h-5 w-5 animate-spin mr-2" />
                Processing Payment...
              </>
            ) : (
              <>
                <Lock className="h-5 w-5 mr-2" />
                Subscribe to {plan.name} - {formatPrice(plan.price)}/{plan.billingPeriod}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Payment Security Info */}
      <div className="mt-8 text-center">
        <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
          <div className="flex items-center">
            <Shield className="h-4 w-4 mr-1" />
            SSL Encrypted
          </div>
          <div className="flex items-center">
            <CreditCard className="h-4 w-4 mr-1" />
            Stripe Secure
          </div>
          <div className="flex items-center">
            <Lock className="h-4 w-4 mr-1" />
            PCI Compliant
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Powered by Stripe • Your card details are never stored on our servers
        </p>
      </div>
    </div>
  );
}

// Wrapper component that provides Stripe Elements context
export function CheckoutForm({ plan, onSuccess, onCancel }: CheckoutFormProps) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Create PaymentIntent on component mount
    const createPaymentIntent = async () => {
      try {
        setIsLoading(true);
        const response = await api.post('/api/payments/create-intent', {
          planId: plan.id,
          amount: plan.price * 100, // Convert to cents
          currency: 'usd',
        });
        
        setClientSecret(response.data.client_secret);
      } catch (error: any) {
        console.error('Failed to create payment intent:', error);
        setError('Failed to initialize payment. Please try again.');
        toast.error('Failed to initialize payment');
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [plan]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Setting up secure checkout...</span>
      </div>
    );
  }

  if (error || !clientSecret) {
    return (
      <div className="text-center p-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Setup Failed</h3>
        <p className="text-gray-600 mb-4">{error || 'Unable to initialize payment'}</p>
        <button onClick={onCancel} className="btn-secondary">
          Go Back
        </button>
      </div>
    );
  }

  const stripePromise = getStripe();
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#3B82F6',
        colorBackground: '#ffffff',
        colorText: '#1F2937',
        colorDanger: '#EF4444',
        fontFamily: 'Inter, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Elements options={options} stripe={stripePromise}>
      <CheckoutFormInner plan={plan} onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
}