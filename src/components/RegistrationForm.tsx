import React, { useState } from 'react';
import { Check, CreditCard, Shield, User, Mail, Lock, Building } from 'lucide-react';

interface RegistrationFormProps {
  onBack: () => void;
  onRegister: (userData: any) => void;
}

export function RegistrationForm({ onBack, onRegister }: RegistrationFormProps) {
  const [step, setStep] = useState<'account' | 'plan' | 'payment'>('account');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    accountType: 'consumer' as 'consumer' | 'business',
    companyName: '',
    selectedPlan: 'monthly' as 'free' | 'monthly' | 'annual',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
    city: '',
    zipCode: '',
    country: 'United States'
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateStep = (currentStep: string) => {
    const newErrors: {[key: string]: string} = {};

    if (currentStep === 'account') {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
      if (formData.accountType === 'business' && !formData.companyName.trim()) {
        newErrors.companyName = 'Company name is required for business accounts';
      }
    }

    if (currentStep === 'payment' && formData.selectedPlan !== 'free') {
      if (!formData.cardNumber.replace(/\s/g, '')) newErrors.cardNumber = 'Card number is required';
      if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
      if (!formData.cvv) newErrors.cvv = 'CVV is required';
      if (!formData.billingAddress.trim()) newErrors.billingAddress = 'Billing address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step === 'account') setStep('plan');
      else if (step === 'plan') {
        if (formData.selectedPlan === 'free') {
          // Skip payment for free plan
          handleSubmit();
        } else {
          setStep('payment');
        }
      }
    }
  };

  const handleSubmit = () => {
    if (formData.selectedPlan === 'free' || validateStep('payment')) {
      onRegister(formData);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const getPlanPrice = (plan: string) => {
    switch (plan) {
      case 'free': return '$0';
      case 'monthly': return '$10.00';
      case 'annual': return '$9.00';
      default: return '$0';
    }
  };

  const getPlanDescription = (plan: string) => {
    switch (plan) {
      case 'free': return 'per month';
      case 'monthly': return 'per month';
      case 'annual': return 'per month ($108 billed annually)';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
          <p className="text-gray-600 mt-2">Join thousands of smart shoppers protecting themselves from fakes</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            <div className={`flex items-center ${step === 'account' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`rounded-full w-8 h-8 flex items-center justify-center border-2 ${
                step === 'account' ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-400'
              }`}>
                <User className="w-4 h-4" />
              </div>
              <span className="ml-2 text-sm font-medium">Account</span>
            </div>
            <div className={`flex items-center ${step === 'plan' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`rounded-full w-8 h-8 flex items-center justify-center border-2 ${
                step === 'plan' ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-400'
              }`}>
                <Shield className="w-4 h-4" />
              </div>
              <span className="ml-2 text-sm font-medium">Plan</span>
            </div>
            <div className={`flex items-center ${step === 'payment' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`rounded-full w-8 h-8 flex items-center justify-center border-2 ${
                step === 'payment' ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-400'
              }`}>
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="ml-2 text-sm font-medium">Payment</span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-8">
          {/* Account Information Step */}
          {step === 'account' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Account Information</h2>
              </div>

              {/* Account Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Account Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, accountType: 'consumer'})}
                    className={`p-4 border-2 rounded-lg text-left ${
                      formData.accountType === 'consumer' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <User className="w-6 h-6 mb-2 text-blue-600" />
                    <div className="font-medium">Personal</div>
                    <div className="text-sm text-gray-500">For individual shoppers</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, accountType: 'business'})}
                    className={`p-4 border-2 rounded-lg text-left ${
                      formData.accountType === 'business' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Building className="w-6 h-6 mb-2 text-blue-600" />
                    <div className="font-medium">Business</div>
                    <div className="text-sm text-gray-500">For companies & retailers</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>

              {formData.accountType === 'business' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.companyName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Your Company Inc."
                  />
                  {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Plan Selection Step */}
          {step === 'plan' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Choose Your Plan</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Free Plan */}
                <div className={`border-2 rounded-xl p-6 cursor-pointer ${
                  formData.selectedPlan === 'free' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`} onClick={() => setFormData({...formData, selectedPlan: 'free'})}>
                  <h3 className="text-lg font-semibold mb-2">Free Trial</h3>
                  <div className="text-2xl font-bold mb-4">$0<span className="text-lg text-gray-500">/month</span></div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm"><Check className="h-4 w-4 text-green-500 mr-2" />2 scans per month</li>
                    <li className="flex items-center text-sm"><Check className="h-4 w-4 text-green-500 mr-2" />Basic authenticity analysis</li>
                    <li className="flex items-center text-sm"><Check className="h-4 w-4 text-green-500 mr-2" />Store reputation check</li>
                  </ul>
                </div>

                {/* Monthly Plan */}
                <div className={`border-2 rounded-xl p-6 cursor-pointer relative ${
                  formData.selectedPlan === 'monthly' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`} onClick={() => setFormData({...formData, selectedPlan: 'monthly'})}>
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs">Popular</div>
                  <h3 className="text-lg font-semibold mb-2">Monthly</h3>
                  <div className="text-2xl font-bold mb-4">$10.00<span className="text-lg text-gray-500">/month</span></div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm"><Check className="h-4 w-4 text-green-500 mr-2" />Unlimited scans</li>
                    <li className="flex items-center text-sm"><Check className="h-4 w-4 text-green-500 mr-2" />Advanced AI analysis</li>
                    <li className="flex items-center text-sm"><Check className="h-4 w-4 text-green-500 mr-2" />Price comparison</li>
                    <li className="flex items-center text-sm"><Check className="h-4 w-4 text-green-500 mr-2" />Priority support</li>
                  </ul>
                </div>

                {/* Annual Plan */}
                <div className={`border-2 rounded-xl p-6 cursor-pointer relative ${
                  formData.selectedPlan === 'annual' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`} onClick={() => setFormData({...formData, selectedPlan: 'annual'})}>
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs">Save 10%</div>
                  <h3 className="text-lg font-semibold mb-2">Annual</h3>
                  <div className="text-2xl font-bold mb-1">$9.00<span className="text-lg text-gray-500">/month</span></div>
                  <div className="text-sm text-gray-500 mb-4">$108.00 billed annually</div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm"><Check className="h-4 w-4 text-green-500 mr-2" />Unlimited scans</li>
                    <li className="flex items-center text-sm"><Check className="h-4 w-4 text-green-500 mr-2" />Advanced AI analysis</li>
                    <li className="flex items-center text-sm"><Check className="h-4 w-4 text-green-500 mr-2" />Price comparison</li>
                    <li className="flex items-center text-sm"><Check className="h-4 w-4 text-green-500 mr-2" />Priority support</li>
                    <li className="flex items-center text-sm"><Check className="h-4 w-4 text-green-500 mr-2" />2 months free</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Payment Step */}
          {step === 'payment' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Selected Plan: {formData.selectedPlan === 'monthly' ? 'Monthly' : 'Annual'}</h3>
                      <p className="text-sm text-gray-600">
                        {getPlanPrice(formData.selectedPlan)} {getPlanDescription(formData.selectedPlan)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {formData.selectedPlan === 'annual' ? '$108.00' : '$10.00'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formData.selectedPlan === 'annual' ? 'billed annually' : 'billed monthly'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({...formData, cardNumber: formatCardNumber(e.target.value)})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                  {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                  {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input
                    type="text"
                    value={formData.cvv}
                    onChange={(e) => setFormData({...formData, cvv: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.cvv ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="123"
                    maxLength={4}
                  />
                  {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Billing Address</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.billingAddress}
                    onChange={(e) => setFormData({...formData, billingAddress: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.billingAddress ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="123 Main Street"
                  />
                  {errors.billingAddress && <p className="text-red-500 text-xs mt-1">{errors.billingAddress}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="New York"
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.zipCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="10001"
                    />
                    {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Security Features */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-medium text-green-800">Secure Payment</h4>
                    <p className="text-sm text-green-700">Your payment information is encrypted and secure. We use industry-standard SSL encryption.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <button
              onClick={onBack}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back to Home
            </button>
            <div className="space-x-4">
              {step !== 'account' && (
                <button
                  onClick={() => {
                    if (step === 'plan') setStep('account');
                    else if (step === 'payment') setStep('plan');
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
              <button
                onClick={step === 'payment' || (step === 'plan' && formData.selectedPlan === 'free') ? handleSubmit : handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {step === 'payment' || (step === 'plan' && formData.selectedPlan === 'free') ? 'Complete Registration' : 'Continue'}
              </button>
            </div>
          </div>
        </div>

        {/* Terms and Privacy */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and{' '}
            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}