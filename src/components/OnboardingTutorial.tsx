import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, ScanLine, Shield, TrendingUp, Check, Camera, Link, BarChart3 } from 'lucide-react';

interface OnboardingTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  example?: {
    type: 'scan-result' | 'price-chart' | 'authenticity-score';
    data: any;
  };
}

export function OnboardingTutorial({ onComplete, onSkip }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);

  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Shop Scanner!',
      description: 'Protect yourself from counterfeit products with AI-powered authenticity verification. Let\'s show you how it works.',
      icon: Shield,
    },
    {
      id: 'url-scanning',
      title: 'Scan Product URLs',
      description: 'Paste any product URL from Amazon, eBay, or other stores. We\'ll analyze the seller, pricing, and authenticity indicators.',
      icon: Link,
      example: {
        type: 'scan-result',
        data: {
          url: 'https://amazon.com/dp/B0CHX3HJKL',
          score: 92,
          status: 'Likely Authentic',
          factors: ['Trusted seller', 'Market price', 'Official product listing']
        }
      }
    },
    {
      id: 'qr-scanning',
      title: 'Scan QR Codes',
      description: 'Use your camera to scan product QR codes and barcodes. We\'ll verify against official databases and detect counterfeits.',
      icon: Camera,
      example: {
        type: 'authenticity-score',
        data: {
          score: 89,
          product: 'iPhone 15 Pro',
          verified: true,
          database: 'Official Apple Registry'
        }
      }
    },
    {
      id: 'price-tracking',
      title: 'Track Price History',
      description: 'See price trends over time and get alerts when prices drop. Know the best time to buy and save money.',
      icon: TrendingUp,
      example: {
        type: 'price-chart',
        data: {
          current: 999.99,
          lowest: 849.99,
          trend: 'decreasing',
          recommendation: 'Good time to buy'
        }
      }
    },
    {
      id: 'interpretation',
      title: 'Understanding Your Results',
      description: 'Learn how to interpret authenticity scores, price recommendations, and safety warnings.',
      icon: BarChart3,
    },
    {
      id: 'ready',
      title: 'You\'re Ready to Shop Safely!',
      description: 'Start scanning products and join thousands of smart shoppers protecting themselves from fakes.',
      icon: Check,
    }
  ];

  const currentStepData = tutorialSteps[currentStep];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderExample = () => {
    if (!currentStepData.example) return null;

    const { type, data } = currentStepData.example;

    switch (type) {
      case 'scan-result':
        return (
          <div className="bg-white border rounded-lg p-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Example URL Scan</span>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                data.score >= 80 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {data.status}
              </div>
            </div>
            <div className="text-lg font-bold mb-2">{data.score}/100</div>
            <div className="space-y-1">
              {data.factors.map((factor: string, index: number) => (
                <div key={index} className="flex items-center text-sm text-green-600">
                  <Check className="w-3 h-3 mr-2" />
                  {factor}
                </div>
              ))}
            </div>
          </div>
        );

      case 'authenticity-score':
        return (
          <div className="bg-white border rounded-lg p-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">QR Code Result</span>
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-lg font-bold mb-2">{data.product}</div>
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-green-600">{data.score}/100</div>
              <div className="text-sm">
                <div className="text-green-600 font-medium">✓ Verified Authentic</div>
                <div className="text-gray-500">{data.database}</div>
              </div>
            </div>
          </div>
        );

      case 'price-chart':
        return (
          <div className="bg-white border rounded-lg p-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Price Analysis</span>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-sm text-gray-500">Current Price</div>
                <div className="text-lg font-bold">${data.current}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Lowest Price</div>
                <div className="text-lg font-bold text-green-600">${data.lowest}</div>
              </div>
            </div>
            <div className="bg-blue-50 px-3 py-2 rounded text-sm text-blue-800">
              💡 {data.recommendation}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Close tutorial when clicking outside
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSkip();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onSkip]);

  if (!showOverlay) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <currentStepData.icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {tutorialSteps.length}
            </span>
          </div>
          <button
            onClick={onSkip}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            {currentStepData.title}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {currentStepData.description}
          </p>

          {/* Interactive Example */}
          {renderExample()}

          {/* Special content for specific steps */}
          {currentStep === 4 && ( // Interpretation step
            <div className="mt-4 space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 bg-green-600 rounded text-white text-xs flex items-center justify-center font-bold">80+</div>
                  <span className="ml-2 font-medium text-green-800">High Confidence</span>
                </div>
                <p className="text-sm text-green-700">Product appears authentic and safe to purchase</p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 bg-yellow-600 rounded text-white text-xs flex items-center justify-center font-bold">60+</div>
                  <span className="ml-2 font-medium text-yellow-800">Moderate Risk</span>
                </div>
                <p className="text-sm text-yellow-700">Some concerns detected - verify with additional sources</p>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">&lt;60</div>
                  <span className="ml-2 font-medium text-red-800">High Risk</span>
                </div>
                <p className="text-sm text-red-700">Multiple red flags - likely counterfeit, avoid purchase</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            Skip Tutorial
          </button>
          
          <div className="flex items-center space-x-3">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            )}
            
            <button
              onClick={nextStep}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              <span>{currentStep === tutorialSteps.length - 1 ? 'Get Started' : 'Next'}</span>
              {currentStep === tutorialSteps.length - 1 ? (
                <Check className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick tutorial overlay for specific features
export function FeatureTutorial({ 
  feature, 
  onClose, 
  targetElement 
}: { 
  feature: 'first-scan' | 'price-alert' | 'authenticity-result';
  onClose: () => void;
  targetElement?: HTMLElement;
}) {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 10,
        left: rect.left
      });
    }
  }, [targetElement]);

  const getTutorialContent = () => {
    switch (feature) {
      case 'first-scan':
        return {
          title: '🎉 Great! Your First Scan',
          content: 'This authenticity score shows how likely this product is genuine. Green means safe to buy, yellow means be cautious, red means high risk of counterfeit.'
        };
      case 'price-alert':
        return {
          title: '💰 Smart Shopping Tip',
          content: 'Set a price alert to get notified when this item goes on sale. We track prices across multiple stores!'
        };
      case 'authenticity-result':
        return {
          title: '🛡️ Understanding Your Results',
          content: 'Our AI analyzes seller reputation, price patterns, product details, and database verification to give you this confidence score.'
        };
      default:
        return { title: '', content: '' };
    }
  };

  const { title, content } = getTutorialContent();

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div 
        className="absolute bg-blue-900 text-white p-4 rounded-lg shadow-xl max-w-xs pointer-events-auto"
        style={{ top: position.top, left: position.left }}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-1">
            <h4 className="font-medium mb-1">{title}</h4>
            <p className="text-sm text-blue-100">{content}</p>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Arrow pointing to target */}
        <div className="absolute -top-2 left-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-blue-900" />
      </div>
    </div>
  );
}