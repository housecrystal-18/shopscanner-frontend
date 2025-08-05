import React from 'react';
import { AlertTriangle, Shield, Info, TrendingUp, Eye, BookOpen } from 'lucide-react';
import { ScreenshotAnalysisResult, UserSubmittedData } from '../services/screenshotAnalyzer';

interface AnalysisResultsProps {
  result: ScreenshotAnalysisResult & { submittedData: UserSubmittedData };
  onNewAnalysis: () => void;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, onNewAnalysis }) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return <Shield className="w-5 h-5" />;
      case 'medium': return <Info className="w-5 h-5" />;
      case 'high': return <AlertTriangle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getPatternBars = () => {
    const totalScore = Object.values(result.patterns).reduce((sum, val) => sum + val, 0);
    return Object.entries(result.patterns).map(([key, value]) => ({
      key,
      value,
      percentage: totalScore > 0 ? (value / totalScore) * 100 : 0,
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
    }));
  };

  const getPatternColor = (key: string) => {
    switch (key) {
      case 'authentic': return 'bg-green-500';
      case 'handmade': return 'bg-blue-500';
      case 'massProduced': return 'bg-orange-500';
      case 'printOnDemand': return 'bg-purple-500';
      case 'dropshipping': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
          <button
            onClick={onNewAnalysis}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
          >
            📸 New Analysis
          </button>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${getRiskColor(result.riskLevel)}`}>
            {getRiskIcon(result.riskLevel)}
            <span className="font-medium capitalize">{result.riskLevel} Risk</span>
          </div>
          <div className="text-sm text-gray-600">
            Analysis Confidence: {result.confidence}%
          </div>
        </div>

        {/* Pattern Analysis */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Pattern Analysis
          </h3>
          
          <div className="space-y-3">
            {getPatternBars().map(({ key, value, percentage, label }) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{label}</span>
                  <span className="text-gray-600">{value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getPatternColor(key)}`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detected Indicators */}
      {result.indicators.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Detected Patterns
          </h3>
          <div className="space-y-2">
            {result.indicators.map((indicator, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{indicator}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Educational Insights */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BookOpen className="w-5 h-5 mr-2" />
          Educational Insights
        </h3>
        
        <div className="space-y-4">
          {result.educationalInsights.map((insight, index) => (
            <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">{insight}</p>
              </div>
            </div>
          ))}

          {/* Mass-produced product educational note */}
          {result.patterns.massProduced > 50 && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-orange-800">
                  <strong>Educational Note:</strong> This listing appears similar to known mass-produced products. 
                  Mass-produced items are typically manufactured in large quantities using standardized processes, 
                  which can result in lower costs but may lack the uniqueness of handmade or artisan-crafted items.
                </p>
              </div>
            </div>
          )}

          {/* General shopping tips */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">💡 Smart Shopping Tips</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Look for detailed photos of the creation process for handmade items</li>
              <li>• Check seller reviews and response rates</li>
              <li>• Compare similar products across multiple platforms</li>
              <li>• Be wary of prices that seem too good to be true</li>
              <li>• Ask sellers specific questions about their products</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Product Information */}
      {result.submittedData && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Analyzed Product</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.submittedData.productTitle && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Title</label>
                <p className="text-gray-900">{result.submittedData.productTitle}</p>
              </div>
            )}
            {result.submittedData.productPrice && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Price</label>
                <p className="text-gray-900">{result.submittedData.productPrice}</p>
              </div>
            )}
            {result.submittedData.sellerName && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Seller</label>
                <p className="text-gray-900">{result.submittedData.sellerName}</p>
              </div>
            )}
            {result.submittedData.url && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Source</label>
                <p className="text-blue-600 truncate">{result.submittedData.url}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-xs text-gray-600">
          <strong>Educational Disclaimer:</strong> This analysis is for educational purposes only and represents 
          AI-generated opinions based on pattern recognition. Results should not be considered definitive 
          statements about product authenticity. Always conduct your own research before making purchasing decisions.
        </p>
      </div>
    </div>
  );
};