import { useState } from 'react';
import { Link2, Shield, Info } from 'lucide-react';
import { StoreAnalyzer } from '../components/analysis/StoreAnalyzer';

export function StoreAnalysisPage() {
  const [showInstructions, setShowInstructions] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-lg mr-3">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Link2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Store Authenticity Analyzer
            </h1>
            <p className="text-lg text-gray-600">
              Analyze product authenticity and seller credibility from any store URL
            </p>
          </div>

          {/* Instructions */}
          {showInstructions && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">
                    How Store Analysis Works
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                    <div>
                      <h4 className="font-medium mb-2">What We Analyze:</h4>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Product type (handmade, mass produced, dropshipped, POD)</li>
                        <li>Store credibility and reputation</li>
                        <li>Price competitiveness and market position</li>
                        <li>Risk factors and trust indicators</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Authenticity Score Based On:</h4>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Platform reputation and policies</li>
                        <li>Seller history and ratings</li>
                        <li>Product description quality</li>
                        <li>Pricing anomalies</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-medium mb-2 text-blue-900">Supported Platforms:</h4>
                    <p className="text-sm text-blue-800">
                      Amazon, eBay, Etsy, Shopify stores, AliExpress, and most e-commerce websites
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="text-blue-600 hover:text-blue-800 ml-2"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Store Analyzer Component */}
          <StoreAnalyzer />

          {/* Additional Information */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="bg-green-100 p-3 rounded-lg w-fit mb-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Authenticity Score
              </h3>
              <p className="text-gray-600 text-sm">
                Our algorithm analyzes multiple factors to provide a comprehensive 
                authenticity score from 0-100%, helping you make informed decisions.
              </p>
              <div className="mt-4 text-xs space-y-1">
                <div className="flex justify-between">
                  <span>80-100%:</span>
                  <span className="text-green-600 font-medium">High Authenticity</span>
                </div>
                <div className="flex justify-between">
                  <span>60-79%:</span>
                  <span className="text-yellow-600 font-medium">Good Authenticity</span>
                </div>
                <div className="flex justify-between">
                  <span>40-59%:</span>
                  <span className="text-orange-600 font-medium">Moderate Risk</span>
                </div>
                <div className="flex justify-between">
                  <span>0-39%:</span>
                  <span className="text-red-600 font-medium">High Risk</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4">
                <Info className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Product Types
              </h3>
              <div className="text-sm space-y-2">
                <div>
                  <span className="font-medium text-gray-900">Handmade:</span>
                  <p className="text-gray-600">Unique, artisan-crafted products</p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Mass Produced:</span>
                  <p className="text-gray-600">Standard retail manufactured items</p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Dropshipped:</span>
                  <p className="text-gray-600">Products fulfilled by third parties</p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Print on Demand:</span>
                  <p className="text-gray-600">Custom printed made-to-order items</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="bg-purple-100 p-3 rounded-lg w-fit mb-4">
                <Link2 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Privacy & Security
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                We analyze publicly available information only. No personal data 
                or payment information is accessed or stored.
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• URL analysis only</li>
                <li>• No cookies stored</li>
                <li>• No tracking</li>
                <li>• Secure processing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}