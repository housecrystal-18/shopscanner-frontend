import React from 'react';
import { ScanLine, Check, Shield, TrendingUp } from 'lucide-react';
import { SocialShare, SocialShareCompact } from './SocialShare';

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
  onViewPricing: () => void;
}

export function LandingPage({ onLogin, onRegister, onViewPricing }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <ScanLine className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">Shop Scan Pro</span>
            </div>
            <div className="flex items-center space-x-4">
              <SocialShareCompact />
              <button
                onClick={onLogin}
                className="px-4 py-2 text-sm text-gray-700 hover:text-blue-600"
              >
                Login
              </button>
              <button
                onClick={onRegister}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Verify Product Authenticity
            <span className="block text-blue-600">Before You Buy</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Scan product URLs, barcodes, and QR codes to detect fake products, 
            analyze store reputation, and get real-time price comparisons.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={onRegister}
              className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transform hover:scale-105 transition-all"
            >
              Start Free Trial
            </button>
            <button
              onClick={onViewPricing}
              className="px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transform hover:scale-105 transition-all"
            >
              View Pricing
            </button>
          </div>

          {/* Social Sharing Section */}
          <div className="mb-12 text-center">
            <p className="text-gray-600 mb-4">Help others avoid counterfeit products</p>
            <SocialShare 
              title="Shop Scan Pro - AI-Powered Product Authenticity Verification"
              description="🛡️ Protect yourself from fake products! Scan URLs & QR codes to verify authenticity with advanced AI analysis. Join thousands of smart shoppers staying safe online. #ShopScanPro #AntiCounterfeit"
              className="inline-block"
            />
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <ScanLine className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">URL Analysis</h3>
              <p className="text-gray-600">Paste any product URL to analyze store reputation and detect potential fraud.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">🤖 AI-Powered Scanner</h3>
              <p className="text-gray-600">Scan product codes to verify authenticity using advanced artificial intelligence.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Instant AI Analysis</h3>
              <p className="text-gray-600">Get immediate authenticity scores and detailed AI-generated reports.</p>
            </div>
          </div>

          {/* Pricing Preview */}
          <div className="mt-16 bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold mb-8">Simple Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="border-2 border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-2">Free Trial</h3>
                <div className="text-3xl font-bold mb-4">$0<span className="text-lg text-gray-500">/month</span></div>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />10 scans per month</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Basic authenticity analysis</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Store reputation check</li>
                </ul>
                <button 
                  onClick={onRegister}
                  className="w-full py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                >
                  Start Free Trial
                </button>
              </div>
              <div className="border-2 border-blue-500 rounded-xl p-6 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm">Popular</div>
                <h3 className="text-xl font-semibold mb-2">Monthly</h3>
                <div className="text-3xl font-bold mb-4">$10.00<span className="text-lg text-gray-500">/month</span></div>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Unlimited scans</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Advanced AI analysis</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Price comparison</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Priority support</li>
                </ul>
                <button 
                  onClick={onRegister}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Get Monthly Plan
                </button>
              </div>
              <div className="border-2 border-green-500 rounded-xl p-6 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm">Save 10%</div>
                <h3 className="text-xl font-semibold mb-2">Annual</h3>
                <div className="text-3xl font-bold mb-1">$9.00<span className="text-lg text-gray-500">/month</span></div>
                <div className="text-sm text-gray-500 mb-4">$108.00 billed annually</div>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Unlimited scans</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Advanced AI analysis</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Price comparison</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Priority support</li>
                  <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />2 months free</li>
                </ul>
                <button 
                  onClick={onRegister}
                  className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Get Annual Plan
                </button>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16">
            <p className="text-gray-500 text-sm mb-4">Trusted by thousands of shoppers worldwide</p>
            <div className="flex justify-center items-center space-x-8 opacity-60 mb-8">
              <div className="text-2xl">⭐⭐⭐⭐⭐</div>
              <div className="text-sm">4.9/5 Rating</div>
              <div className="text-sm">10,000+ Scans</div>
              <div className="text-sm">500+ Reviews</div>
            </div>
            
            {/* AI Disclaimer */}
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-3xl mx-auto">
              <p className="text-sm text-yellow-800 text-center">
                <strong>⚠️ Important:</strong> Shop Scanner uses artificial intelligence to analyze products and may not be 100% accurate. 
                Our AI analysis should be used as a guide only. Always verify authenticity through official manufacturer channels for valuable purchases.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}