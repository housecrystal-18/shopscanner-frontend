import { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Trash2,
  Check,
  Shield,
  Calendar,
  AlertCircle,
  Edit,
  Loader
} from 'lucide-react';
import { PaymentMethod } from '../../lib/stripe';
import { api } from '../../lib/api';
import { toast } from 'react-hot-toast';

interface PaymentMethodsProps {
  onAddPaymentMethod?: () => void;
}

export function PaymentMethods({ onAddPaymentMethod }: PaymentMethodsProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string>('');
  const [settingDefaultId, setSettingDefaultId] = useState<string>('');

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/payment-methods');
      setPaymentMethods(response.data);
    } catch (error) {
      console.error('Failed to load payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setIsLoading(false);
    }
  };

  const deletePaymentMethod = async (paymentMethodId: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    try {
      setDeletingId(paymentMethodId);
      await api.delete(`/api/payment-methods/${paymentMethodId}`);
      setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentMethodId));
      toast.success('Payment method deleted successfully');
    } catch (error) {
      console.error('Failed to delete payment method:', error);
      toast.error('Failed to delete payment method');
    } finally {
      setDeletingId('');
    }
  };

  const setDefaultPaymentMethod = async (paymentMethodId: string) => {
    try {
      setSettingDefaultId(paymentMethodId);
      await api.post(`/api/payment-methods/${paymentMethodId}/set-default`);
      setPaymentMethods(prev => 
        prev.map(pm => ({
          ...pm,
          is_default: pm.id === paymentMethodId
        }))
      );
      toast.success('Default payment method updated');
    } catch (error) {
      console.error('Failed to set default payment method:', error);
      toast.error('Failed to update default payment method');
    } finally {
      setSettingDefaultId('');
    }
  };

  const getCardBrandIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      case 'discover':
        return '💳';
      case 'diners':
        return '💳';
      case 'jcb':
        return '💳';
      case 'unionpay':
        return '💳';
      default:
        return '💳';
    }
  };

  const getCardBrandName = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'amex':
        return 'American Express';
      case 'mastercard':
        return 'Mastercard';
      default:
        return brand.charAt(0).toUpperCase() + brand.slice(1);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <Loader className="h-6 w-6 animate-spin text-blue-600 mr-2" />
          <span className="text-gray-600">Loading payment methods...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <CreditCard className="h-6 w-6 text-gray-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
            <p className="text-sm text-gray-600">Manage your saved payment methods</p>
          </div>
        </div>
        
        <button
          onClick={onAddPaymentMethod}
          className="btn-primary inline-flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Payment Method
        </button>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              Secure Payment Storage
            </h4>
            <p className="text-sm text-blue-800">
              Your payment information is securely stored by Stripe and encrypted with 
              industry-standard security. We never see or store your full card details.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Methods List */}
      {paymentMethods.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Payment Methods</h4>
          <p className="text-gray-600 mb-6">
            Add a payment method to start your subscription and make purchases.
          </p>
          <button
            onClick={onAddPaymentMethod}
            className="btn-primary inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Payment Method
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {paymentMethods.map((paymentMethod) => (
            <div
              key={paymentMethod.id}
              className={`border rounded-lg p-4 transition-all ${
                paymentMethod.is_default 
                  ? 'border-blue-200 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-12 h-8 bg-gray-100 rounded border mr-4">
                    <span className="text-lg">
                      {getCardBrandIcon(paymentMethod.card?.brand || 'card')}
                    </span>
                  </div>
                  
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-medium text-gray-900">
                        {getCardBrandName(paymentMethod.card?.brand || 'Card')} 
                        ••••{paymentMethod.card?.last4}
                      </h4>
                      {paymentMethod.is_default && (
                        <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      Expires {paymentMethod.card?.exp_month}/{paymentMethod.card?.exp_year}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {!paymentMethod.is_default && (
                    <button
                      onClick={() => setDefaultPaymentMethod(paymentMethod.id)}
                      disabled={settingDefaultId === paymentMethod.id}
                      className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    >
                      {settingDefaultId === paymentMethod.id ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        'Set as Default'
                      )}
                    </button>
                  )}
                  
                  <button
                    onClick={() => deletePaymentMethod(paymentMethod.id)}
                    disabled={deletingId === paymentMethod.id}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Delete payment method"
                  >
                    {deletingId === paymentMethod.id ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Methods Info */}
      <div className="mt-6 text-xs text-gray-500 space-y-1">
        <p>• Payment methods are securely stored and managed by Stripe</p>
        <p>• You can update or remove payment methods at any time</p>
        <p>• Your default payment method will be used for subscription renewals</p>
        <p>• We support all major credit and debit cards</p>
      </div>
    </div>
  );
}