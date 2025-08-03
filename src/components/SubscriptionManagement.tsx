import React, { useState } from 'react';
import { CreditCard, Calendar, Shield, AlertCircle, Check, X } from 'lucide-react';

interface SubscriptionManagementProps {
  currentPlan?: 'free' | 'monthly' | 'annual';
  nextBillingDate?: string;
  onCancel?: () => void;
  onUpdatePlan?: (plan: string) => void;
}

export const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({
  currentPlan = 'monthly',
  nextBillingDate = '2025-09-02',
  onCancel,
  onUpdatePlan
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const getPlanDetails = (plan: string) => {
    switch (plan) {
      case 'monthly':
        return { name: 'Monthly Plan', price: '$10.00/month', color: 'blue' };
      case 'annual':
        return { name: 'Annual Plan', price: '$9.00/month ($108/year)', color: 'green' };
      case 'free':
        return { name: 'Free Trial', price: '7 days remaining', color: 'gray' };
      default:
        return { name: 'Unknown Plan', price: '', color: 'gray' };
    }
  };

  const planDetails = getPlanDetails(currentPlan);

  const handleCancelSubscription = () => {
    setShowCancelModal(true);
  };

  const confirmCancellation = () => {
    setShowCancelConfirm(true);
    setTimeout(() => {
      if (onCancel) onCancel();
      setShowCancelModal(false);
      setShowCancelConfirm(false);
    }, 2000);
  };

  const cancelReasons = [
    'Too expensive',
    'Not using it enough',
    'Found a better alternative',
    'Technical issues',
    'No longer need the service',
    'Other'
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Subscription Management</h3>
      
      {/* Current Plan */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CreditCard className={`h-5 w-5 text-${planDetails.color}-600`} />
            <div>
              <h4 className="font-medium text-gray-900">{planDetails.name}</h4>
              <p className="text-sm text-gray-600">{planDetails.price}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <Calendar className="h-4 w-4 mr-1" />
              Next billing: {nextBillingDate}
            </div>
            <span className={`px-2 py-1 text-xs rounded-full bg-${planDetails.color}-100 text-${planDetails.color}-800`}>
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Easy Cancellation Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="h-5 w-5 text-green-600" />
            <h4 className="font-medium text-gray-900">Easy Cancellation</h4>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• One-click cancellation</li>
            <li>• No phone calls required</li>
            <li>• Immediate confirmation</li>
            <li>• Access until period ends</li>
          </ul>
        </div>
        
        <div className="border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Check className="h-5 w-5 text-blue-600" />
            <h4 className="font-medium text-gray-900">Consumer Protection</h4>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• No cancellation fees</li>
            <li>• 30-day money back guarantee</li>
            <li>• Prorated refunds available</li>
            <li>• Transparent billing</li>
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => onUpdatePlan && onUpdatePlan('monthly')}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Change Plan
        </button>
        <button
          onClick={handleCancelSubscription}
          className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          Cancel Subscription
        </button>
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            {!showCancelConfirm ? (
              <>
                <div className="flex items-center space-x-2 mb-4">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                  <h3 className="text-lg font-semibold">Cancel Subscription</h3>
                </div>
                
                <p className="text-gray-600 mb-4">
                  We're sorry to see you go! Your subscription will remain active until {nextBillingDate}.
                </p>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Help us improve (optional):
                  </label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Select a reason...</option>
                    {cancelReasons.map((reason) => (
                      <option key={reason} value={reason}>{reason}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <h4 className="font-medium text-blue-900 mb-2">Before you cancel:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• No cancellation fees</li>
                    <li>• Keep access until {nextBillingDate}</li>
                    <li>• Reactivate anytime</li>
                    <li>• Export your data anytime</li>
                  </ul>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200"
                  >
                    Keep Subscription
                  </button>
                  <button
                    onClick={confirmCancellation}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700"
                  >
                    Confirm Cancellation
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <Check className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Subscription Cancelled</h3>
                <p className="text-gray-600 mb-4">
                  Your subscription has been cancelled. You'll continue to have access until {nextBillingDate}.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    Confirmation email sent. You can reactivate anytime before {nextBillingDate}.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;