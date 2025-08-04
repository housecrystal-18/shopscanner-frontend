import { useState } from 'react';
import {
  Link2,
  Search,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Factory,
  Wrench,
  Truck,
  Printer,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Loader
} from 'lucide-react';
import { useStoreAnalysis } from '../../hooks/useStoreAnalysis';
import { ProductAnalysis } from '../../services/storeAnalyzer';

interface StoreAnalyzerProps {
  productData?: any;
  onAnalysisComplete?: (analysis: ProductAnalysis) => void;
}

export function StoreAnalyzer({ productData, onAnalysisComplete }: StoreAnalyzerProps) {
  const [url, setUrl] = useState('');
  const {
    isAnalyzing,
    currentAnalysis,
    analysisHistory,
    analyzeStore,
    clearCurrentAnalysis,
    getAuthenticityInsights,
    generateRecommendations,
  } = useStoreAnalysis();

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    try {
      const result = await analyzeStore(url, productData);
      if (onAnalysisComplete) {
        onAnalysisComplete(result.analysis);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const getProductTypeIcon = (type: string) => {
    switch (type) {
      case 'authentic_handmade':
        return <Wrench className="h-5 w-5" />;
      case 'likely_mass_produced':
        return <Factory className="h-5 w-5" />;
      case 'likely_dropshipped':
        return <Truck className="h-5 w-5" />;
      case 'custom_printed':
        return <Printer className="h-5 w-5" />;
      // Legacy support
      case 'handmade':
        return <Wrench className="h-5 w-5" />;
      case 'mass_produced':
        return <Factory className="h-5 w-5" />;
      case 'dropshipped':
        return <Truck className="h-5 w-5" />;
      case 'print_on_demand':
        return <Printer className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getProductTypeLabel = (type: string) => {
    switch (type) {
      case 'authentic_handmade':
        return 'Authentic Handmade';
      case 'likely_mass_produced':
        return 'Likely Mass Produced';
      case 'likely_dropshipped':
        return 'Likely Dropshipped';
      case 'custom_printed':
        return 'Custom Printed';
      // Legacy support
      case 'handmade':
        return 'Authentic Handmade';
      case 'mass_produced':
        return 'Likely Mass Produced';
      case 'dropshipped':
        return 'Likely Dropshipped';
      case 'print_on_demand':
        return 'Custom Printed';
      default:
        return 'Unknown';
    }
  };

  const getAuthenticityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* URL Input Form */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-4">
          <div className="bg-blue-100 p-2 rounded-lg mr-3">
            <Link2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Store URL Analysis</h3>
            <p className="text-sm text-gray-600">
              Enter a product URL to analyze authenticity and seller credibility
            </p>
          </div>
        </div>

        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product URL
            </label>
            <div className="flex space-x-3">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/product-page"
                className="flex-1 input-field"
                disabled={isAnalyzing}
                required
              />
              <button
                type="submit"
                disabled={isAnalyzing || !url.trim()}
                className="btn-primary px-6 inline-flex items-center"
              >
                {isAnalyzing ? (
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            <p>Supported platforms: Amazon, eBay, Etsy, Shopify stores, and more</p>
          </div>
        </form>
      </div>

      {/* Analysis Results */}
      {currentAnalysis && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Authenticity Score */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-blue-600 mr-2" />
                  <h4 className="font-semibold text-gray-900">Authenticity</h4>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAuthenticityColor(currentAnalysis.authenticityScore)}`}>
                  {currentAnalysis.authenticityScore}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full ${
                    currentAnalysis.authenticityScore >= 80 ? 'bg-green-500' :
                    currentAnalysis.authenticityScore >= 60 ? 'bg-yellow-500' :
                    currentAnalysis.authenticityScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${currentAnalysis.authenticityScore}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600">
                Confidence: {currentAnalysis.confidence}%
              </p>
            </div>

            {/* Product Type */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  {getProductTypeIcon(currentAnalysis.productType)}
                  <h4 className="font-semibold text-gray-900 ml-2">Product Type</h4>
                </div>
              </div>
              <p className="text-lg font-medium text-gray-900 mb-1">
                {getProductTypeLabel(currentAnalysis.productType)}
              </p>
              <p className="text-xs text-gray-600">
                Based on store and product analysis
              </p>
            </div>

            {/* Risk Level */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                  <h4 className="font-semibold text-gray-900">Risk Level</h4>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getRiskColor(currentAnalysis.riskFactors.level)}`}>
                  {currentAnalysis.riskFactors.level}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {currentAnalysis.riskFactors.factors.length > 0
                  ? `${currentAnalysis.riskFactors.factors.length} risk factor${currentAnalysis.riskFactors.factors.length !== 1 ? 's' : ''} identified`
                  : 'No significant risk factors detected'
                }
              </p>
            </div>

            {/* POD Analysis */}
            {currentAnalysis.podAnalysis && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Printer className="h-5 w-5 text-purple-600 mr-2" />
                    <h4 className="font-semibold text-gray-900">POD Detection</h4>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentAnalysis.podAnalysis.isPOD 
                      ? 'text-purple-600 bg-purple-100' 
                      : 'text-green-600 bg-green-100'
                  }`}>
                    {currentAnalysis.podAnalysis.isPOD ? 'POD Detected' : 'Not POD'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Confidence: {currentAnalysis.podAnalysis.confidence}%
                </p>
                {currentAnalysis.podAnalysis.provider && (
                  <p className="text-xs text-purple-600 font-medium">
                    Provider: {currentAnalysis.podAnalysis.provider}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Store Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Store Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Platform Details</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform:</span>
                    <span className="font-medium">{currentAnalysis.storeMetadata.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Store Name:</span>
                    <span className="font-medium">{currentAnalysis.storeMetadata.storeName}</span>
                  </div>
                  {currentAnalysis.storeMetadata.sellerRating && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Seller Rating:</span>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-500 mr-1" />
                        <span className="font-medium">{currentAnalysis.storeMetadata.sellerRating}/5</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Market Analysis</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price Position:</span>
                    <span className="font-medium capitalize">
                      {currentAnalysis.priceAnalysis.marketPosition.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Competitive Score:</span>
                    <span className="font-medium">{currentAnalysis.priceAnalysis.competitiveScore}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Positive Indicators */}
            {currentAnalysis.indicators.positive.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Positive Indicators
                </h4>
                <ul className="space-y-2">
                  {currentAnalysis.indicators.positive.map((indicator, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{indicator}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Negative Indicators */}
            {currentAnalysis.indicators.negative.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h4 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                  <XCircle className="h-5 w-5 mr-2" />
                  Risk Factors
                </h4>
                <ul className="space-y-2">
                  {currentAnalysis.indicators.negative.map((indicator, index) => (
                    <li key={index} className="flex items-start">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{indicator}</span>
                    </li>
                  ))}
                  {currentAnalysis.riskFactors.factors.map((factor, index) => (
                    <li key={`risk-${index}`} className="flex items-start">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Insights and Recommendations */}
          <div className="space-y-4">
            {/* Insights */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Authenticity Insights
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getAuthenticityInsights(currentAnalysis).map((insight, index) => (
                  <div key={index} className="flex items-start">
                    <div className={`p-1 rounded-full mr-3 mt-1 ${
                      insight.type === 'positive' ? 'bg-green-100' :
                      insight.type === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      {insight.type === 'positive' ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : insight.type === 'warning' ? (
                        <AlertTriangle className="h-3 w-3 text-yellow-600" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{insight.message}</p>
                      <p className="text-xs text-gray-600">Confidence: {insight.score}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-green-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                <Info className="h-5 w-5 mr-2" />
                Recommendations
              </h4>
              <ul className="space-y-2">
                {generateRecommendations(currentAnalysis).map((recommendation, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* POD Specific Guidance */}
            {currentAnalysis.podAnalysis && currentAnalysis.podAnalysis.isPOD && (
              <div className="bg-purple-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                  <Printer className="h-5 w-5 mr-2" />
                  Print-on-Demand Guidance
                </h4>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-purple-800 font-medium mb-2">POD Recommendation:</p>
                    <p className="text-sm text-gray-700">{currentAnalysis.podAnalysis.recommendation}</p>
                  </div>
                  {currentAnalysis.podAnalysis.provider && (
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-purple-800 font-medium mb-2">Detected Provider:</p>
                      <p className="text-sm text-gray-700">
                        This product appears to use {currentAnalysis.podAnalysis.provider} for fulfillment. 
                        This means it's printed/made only after you order, which can result in longer processing times 
                        but ensures fresh production.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={clearCurrentAnalysis}
              className="btn-secondary"
            >
              Clear Analysis
            </button>
            <button
              onClick={() => setUrl('')}
              className="btn-primary"
            >
              Analyze Another URL
            </button>
          </div>
        </div>
      )}

      {/* Analysis History */}
      {analysisHistory.length > 0 && !currentAnalysis && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Recent Analyses
          </h4>
          <div className="space-y-3">
            {analysisHistory.slice(0, 5).map((item: any) => (
              <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {new URL(item.url).hostname}
                    </p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${getAuthenticityColor(item.analysis.authenticityScore)}`}>
                        {item.analysis.authenticityScore}% authentic
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setUrl(item.url);
                      // Could trigger re-analysis here
                    }}
                    className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}