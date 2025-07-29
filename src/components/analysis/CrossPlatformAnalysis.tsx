import { useState } from 'react';
import {
  Search,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
  DollarSign,
  Shield,
  Star,
  Truck,
  Clock,
  Award,
  Target,
  Zap,
  Info,
  Eye,
  BarChart3,
  Loader
} from 'lucide-react';
import { useCrossPlatformSearch } from '../../hooks/useCrossPlatformSearch';
import { CrossPlatformAnalysis as AnalysisType, ProductMatch } from '../../services/crossPlatformSearch';

interface CrossPlatformAnalysisProps {
  originalUrl?: string;
  productName?: string;
  productData?: any;
  onAnalysisComplete?: (analysis: AnalysisType) => void;
}

export function CrossPlatformAnalysis({
  originalUrl,
  productName,
  productData,
  onAnalysisComplete
}: CrossPlatformAnalysisProps) {
  const [url, setUrl] = useState(originalUrl || '');
  const [name, setName] = useState(productName || '');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    currentAnalysis,
    isSearching,
    searchAcrossPlatforms,
    clearCurrentAnalysis,
    getPriceInsights,
    getAuthenticityInsights,
    getTopRecommendations,
    getSimilarityWarnings,
  } = useCrossPlatformSearch();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !name.trim()) return;

    try {
      const analysis = await searchAcrossPlatforms(url, name, productData);
      if (onAnalysisComplete) {
        onAnalysisComplete(analysis);
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getMatchConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600 bg-green-100';
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPriceRankColor = (rank: ProductMatch['priceRank']) => {
    switch (rank) {
      case 'lowest': return 'text-green-600 bg-green-100';
      case 'competitive': return 'text-blue-600 bg-blue-100';
      case 'average': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'suspicious': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const priceInsights = getPriceInsights(currentAnalysis);
  const authenticityInsights = getAuthenticityInsights(currentAnalysis);
  const recommendations = getTopRecommendations(currentAnalysis);
  const warnings = getSimilarityWarnings(currentAnalysis);

  return (
    <div className="space-y-6">
      {/* Search Form */}
      {!currentAnalysis && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 p-2 rounded-lg mr-3">
              <Search className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Cross-Platform Product Search</h3>
              <p className="text-sm text-gray-600">
                Find the same product across multiple platforms and compare prices
              </p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original Product URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/product-page"
                  className="input-field"
                  disabled={isSearching}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter product name or description"
                  className="input-field"
                  disabled={isSearching}
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced Options
              </button>
              
              <button
                type="submit"
                disabled={isSearching || !url.trim() || !name.trim()}
                className="btn-primary px-8 inline-flex items-center"
              >
                {isSearching ? (
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                {isSearching ? 'Searching...' : 'Search Platforms'}
              </button>
            </div>
            
            {showAdvanced && (
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <h4 className="font-medium text-gray-900 mb-3">Advanced Search Options</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      placeholder="Electronics, Clothing, etc."
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Brand
                    </label>
                    <input
                      type="text"
                      placeholder="Product brand"
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Price Range
                    </label>
                    <input
                      type="text"
                      placeholder="$10 - $100"
                      className="input-field text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Analysis Results */}
      {currentAnalysis && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Eye className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {currentAnalysis.totalMatches}
                </span>
              </div>
              <p className="text-sm text-gray-600">Products Found</p>
              <p className="text-xs text-gray-500">
                {new Set(currentAnalysis.matches.map(m => m.platform)).size} platforms
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(currentAnalysis.priceAnalysis.lowestPrice)}
                </span>
              </div>
              <p className="text-sm text-gray-600">Lowest Price</p>
              <p className="text-xs text-gray-500">
                Save {formatPrice(currentAnalysis.priceAnalysis.averagePrice - currentAnalysis.priceAnalysis.lowestPrice)}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {currentAnalysis.searchConfidence}%
                </span>
              </div>
              <p className="text-sm text-gray-600">Search Confidence</p>
              <p className="text-xs text-gray-500">Match accuracy</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {currentAnalysis.priceAnalysis.suspiciouslyLowCount}
                </span>
              </div>
              <p className="text-sm text-gray-600">Suspicious Prices</p>
              <p className="text-xs text-gray-500">Verify quality</p>
            </div>
          </div>

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <h4 className="font-semibold text-red-900">Authenticity Warnings</h4>
              </div>
              <div className="space-y-2">
                {warnings.map((warning, index) => (
                  <div key={index} className="flex items-start">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-900">{warning.message}</p>
                      <p className="text-xs text-red-700">{warning.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Top Recommendations
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        {rec.type === 'best_value' && <Target className="h-4 w-4 text-green-600 mr-2" />}
                        {rec.type === 'most_trusted' && <Shield className="h-4 w-4 text-blue-600 mr-2" />}
                        {rec.type === 'fastest' && <Zap className="h-4 w-4 text-yellow-600 mr-2" />}
                        {rec.type === 'lowest_price' && <DollarSign className="h-4 w-4 text-green-600 mr-2" />}
                        <h5 className="font-medium text-gray-900 text-sm">{rec.title}</h5>
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(rec.product.price)}
                      </span>
                    </div>
                    <div className="mb-2">
                      <p className="text-sm text-gray-700">{rec.product.platform}</p>
                      <p className="text-xs text-gray-500">{rec.reason}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getMatchConfidenceColor(rec.product.matchConfidence)}`}>
                          {rec.product.matchConfidence}% match
                        </span>
                        {rec.product.sellerRating && (
                          <div className="flex items-center text-xs text-gray-600">
                            <Star className="h-3 w-3 text-yellow-500 mr-1" />
                            {rec.product.sellerRating}
                          </div>
                        )}
                      </div>
                      <a
                        href={rec.product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Price Analysis
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Lowest Price</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatPrice(currentAnalysis.priceAnalysis.lowestPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Highest Price</p>
                    <p className="text-xl font-bold text-red-600">
                      {formatPrice(currentAnalysis.priceAnalysis.highestPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Average Price</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatPrice(currentAnalysis.priceAnalysis.averagePrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Price Spread</p>
                    <p className="text-xl font-bold text-purple-600">
                      {formatPrice(currentAnalysis.priceAnalysis.priceSpread)}
                    </p>
                  </div>
                </div>
                
                {priceInsights.length > 0 && (
                  <div className="border-t pt-4">
                    <h5 className="font-medium text-gray-900 mb-2">Price Insights</h5>
                    <div className="space-y-2">
                      {priceInsights.map((insight, index) => (
                        <div key={index} className="flex items-start">
                          {insight.type === 'positive' && <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />}
                          {insight.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 mr-2" />}
                          {insight.type === 'info' && <Info className="h-4 w-4 text-blue-500 mt-0.5 mr-2" />}
                          <p className="text-sm text-gray-700">{insight.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Authenticity Insights
              </h4>
              <div className="space-y-3">
                {authenticityInsights.length > 0 ? (
                  authenticityInsights.map((insight, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center">
                          {insight.type === 'positive' && <CheckCircle className="h-4 w-4 text-green-500 mr-2" />}
                          {insight.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />}
                          {insight.type === 'info' && <Info className="h-4 w-4 text-blue-500 mr-2" />}
                          <p className="text-sm font-medium text-gray-900">{insight.message}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          insight.risk === 'low' ? 'bg-green-100 text-green-800' :
                          insight.risk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {insight.risk} risk
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{insight.details}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No significant authenticity concerns detected</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* All Matches */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              All Platform Matches ({currentAnalysis.matches.length})
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Platform
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Match
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentAnalysis.matches.map((match, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {match.imageUrl && (
                            <img
                              src={match.imageUrl}
                              alt={match.title}
                              className="h-10 w-10 rounded-lg object-cover mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {match.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {match.availability}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {match.platform}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {formatPrice(match.price)}
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getPriceRankColor(match.priceRank)}`}>
                          {match.priceRank}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getMatchConfidenceColor(match.matchConfidence)}`}>
                          {match.matchConfidence}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{match.seller}</div>
                        {match.sellerRating && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Star className="h-3 w-3 text-yellow-500 mr-1" />
                            {match.sellerRating}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a
                          href={match.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={clearCurrentAnalysis}
              className="btn-secondary"
            >
              Clear Results
            </button>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              New Search
            </button>
          </div>
        </div>
      )}
    </div>
  );
}