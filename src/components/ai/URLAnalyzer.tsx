import React, { useState } from 'react';
import { Link, Search, AlertCircle, CheckCircle, Loader, ExternalLink, Star, ShoppingCart, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { aiAnalysisService, URLAnalysis } from '../../services/aiAnalysisService';

export const URLAnalyzer: React.FC = () => {
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState<URLAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [enhanceWithAI, setEnhanceWithAI] = useState(true);

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const analyzeURL = async () => {
    if (!url.trim()) {
      toast.error('Please enter a product URL');
      return;
    }

    if (!isValidUrl(url)) {
      toast.error('Please enter a valid URL');
      return;
    }

    setLoading(true);
    try {
      const result = await aiAnalysisService.analyzeProductFromURL(url, enhanceWithAI);
      setAnalysis(result);
      toast.success('URL analyzed successfully!');
    } catch (error: any) {
      console.error('URL analysis failed:', error);
      toast.error(error.response?.data?.error?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setUrl('');
    setEnhanceWithAI(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      analyzeURL();
    }
  };

  return (
    <div className="space-y-6">
      {/* URL Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Product URL
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Link className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="https://example.com/product/..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Supports Amazon, eBay, Etsy, Shopify stores, and most e-commerce sites
          </p>
        </div>

        {/* Options */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center">
            <input
              id="enhance-ai"
              type="checkbox"
              checked={enhanceWithAI}
              onChange={(e) => setEnhanceWithAI(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="enhance-ai" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Enhance data with AI analysis (recommended)
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={analyzeURL}
            disabled={loading || !url.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {loading ? 'Analyzing...' : 'Analyze URL'}
          </button>
          
          <button
            onClick={resetAnalysis}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="font-medium text-green-900 dark:text-green-100">
                URL Analysis Complete
              </h3>
            </div>
            <p className="text-green-700 dark:text-green-300 text-sm mt-1">
              Successfully extracted product information
              {analysis.aiEnhanced && ' with AI enhancement'}
            </p>
          </div>

          {/* Product Information */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Product Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Header */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {analysis.title}
                    </h3>
                    {analysis.brand && (
                      <p className="text-gray-600 dark:text-gray-400">
                        Brand: <span className="font-medium">{analysis.brand}</span>
                      </p>
                    )}
                  </div>
                  {analysis.price && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {analysis.price}
                      </div>
                      {analysis.availability && (
                        <div className={`text-sm mt-1 ${
                          analysis.availability === 'in_stock' 
                            ? 'text-green-600 dark:text-green-400'
                            : analysis.availability === 'out_of_stock'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {analysis.availability.replace('_', ' ').toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Reviews */}
                {analysis.reviews && (analysis.reviews.rating || analysis.reviews.count) && (
                  <div className="flex items-center gap-4 py-3 border-t border-gray-200 dark:border-gray-700">
                    {analysis.reviews.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{analysis.reviews.rating}</span>
                      </div>
                    )}
                    {analysis.reviews.count && (
                      <span className="text-gray-600 dark:text-gray-400">
                        ({analysis.reviews.count} reviews)
                      </span>
                    )}
                  </div>
                )}

                {/* Description */}
                {analysis.description && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {analysis.description}
                    </p>
                  </div>
                )}

                {/* Key Features (if AI enhanced) */}
                {analysis.keyFeatures && analysis.keyFeatures.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Key Features</h4>
                    <ul className="space-y-1">
                      {analysis.keyFeatures.map((feature, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Product Images */}
              {analysis.images && analysis.images.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Product Images</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {analysis.images.slice(0, 6).map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.url}
                          alt={image.alt}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-image.png';
                          }}
                        />
                        {image.isPrimary && (
                          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            Primary
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Source Link */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Source</h4>
                <a
                  href={analysis.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Original Product
                </a>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Analyzed: {new Date(analysis.timestamp).toLocaleString()}
                </p>
              </div>

              {/* Analysis Details */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Analysis Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">AI Enhanced:</span>
                    <span className={analysis.aiEnhanced ? 'text-green-600' : 'text-gray-500'}>
                      {analysis.aiEnhanced ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {analysis.category && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Category:</span>
                      <span className="text-gray-900 dark:text-white">{analysis.category}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Analysis ID:</span>
                    <span className="text-gray-500 text-xs">{analysis.analysisId}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Actions</h4>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors">
                    <ShoppingCart className="w-4 h-4" />
                    Add to Wishlist
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900 transition-colors">
                    <TrendingUp className="w-4 h-4" />
                    Price Alert
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">What's Next?</h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Check product authenticity using our AI authenticity checker</li>
              <li>• Compare prices across different retailers</li>
              <li>• Set up price drop alerts for this product</li>
              <li>• Read user reviews and seller credibility analysis</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};