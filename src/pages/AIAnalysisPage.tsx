import React, { useState } from 'react';
import { Camera, Link, QrCode, Shield, Brain, TrendingUp, UserCheck, BookOpen } from 'lucide-react';

// AI Analysis Components
import { ScreenshotAnalyzer } from '../components/ai/ScreenshotAnalyzer';
import { URLAnalyzer } from '../components/ai/URLAnalyzer';
import { QRAnalyzer } from '../components/ai/QRAnalyzer';
import { AuthenticityChecker } from '../components/ai/AuthenticityChecker';
import { PriceIntelligence } from '../components/ai/PriceIntelligence';
import { SellerCredibilityChecker } from '../components/ai/SellerCredibilityChecker';
import { VerificationGuide } from '../components/ai/VerificationGuide';

type AnalysisTab = 
  | 'screenshot' 
  | 'url' 
  | 'qr' 
  | 'authenticity' 
  | 'price' 
  | 'seller' 
  | 'guide';

interface AnalysisFeature {
  id: AnalysisTab;
  name: string;
  description: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  badge?: string;
}

export const AIAnalysisPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AnalysisTab>('screenshot');

  const features: AnalysisFeature[] = [
    {
      id: 'screenshot',
      name: 'Screenshot Analysis',
      description: 'Upload screenshots to discover products and prices',
      icon: <Camera className="w-5 h-5" />,
      component: <ScreenshotAnalyzer />,
      badge: 'New'
    },
    {
      id: 'url',
      name: 'URL Analysis',
      description: 'Analyze products from e-commerce URLs',
      icon: <Link className="w-5 h-5" />,
      component: <URLAnalyzer />,
      badge: 'New'
    },
    {
      id: 'qr',
      name: 'QR Code Scanner',
      description: 'Scan QR codes for product information',
      icon: <QrCode className="w-5 h-5" />,
      component: <QRAnalyzer />,
      badge: 'New'
    },
    {
      id: 'authenticity',
      name: 'Authenticity Checker',
      description: 'AI-powered product authenticity verification',
      icon: <Shield className="w-5 h-5" />,
      component: <AuthenticityChecker />
    },
    {
      id: 'price',
      name: 'Price Intelligence',
      description: 'Smart pricing analysis and recommendations',
      icon: <TrendingUp className="w-5 h-5" />,
      component: <PriceIntelligence />
    },
    {
      id: 'seller',
      name: 'Seller Credibility',
      description: 'Analyze seller trustworthiness and reputation',
      icon: <UserCheck className="w-5 h-5" />,
      component: <SellerCredibilityChecker />
    },
    {
      id: 'guide',
      name: 'Verification Guide',
      description: 'Educational guides for product verification',
      icon: <BookOpen className="w-5 h-5" />,
      component: <VerificationGuide />
    }
  ];

  const activeFeature = features.find(f => f.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                AI Product Analysis
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Advanced AI-powered tools for product discovery and verification
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Analysis Tools
              </h2>
              <nav className="space-y-2">
                {features.map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => setActiveTab(feature.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === feature.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className={`p-1.5 rounded-md ${
                      activeTab === feature.id
                        ? 'bg-blue-100 dark:bg-blue-800'
                        : 'bg-gray-100 dark:bg-gray-600'
                    }`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{feature.name}</span>
                        {feature.badge && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded-full">
                            {feature.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                        {feature.description}
                      </p>
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                AI Capabilities
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Visual authenticity verification
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Screenshot product discovery
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  URL-based analysis
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  QR code detection
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Price intelligence
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Seller credibility scoring
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              {/* Feature Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    {activeFeature?.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {activeFeature?.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {activeFeature?.description}
                    </p>
                  </div>
                  {activeFeature?.badge && (
                    <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded-full">
                      {activeFeature.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Feature Content */}
              <div className="p-6">
                {activeFeature?.component}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};