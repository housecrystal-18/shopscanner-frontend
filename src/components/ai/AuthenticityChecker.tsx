import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Shield, Upload, AlertTriangle, CheckCircle, Loader, TrendingUp, Eye, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { aiAnalysisService, AuthenticityAnalysis } from '../../services/aiAnalysisService';

export const AuthenticityChecker: React.FC = () => {
  const [analysis, setAnalysis] = useState<AuthenticityAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [productData, setProductData] = useState({
    productName: '',
    brand: '',
    category: '',
    price: ''
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setAnalysis(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const analyzeAuthenticity = async () => {
    if (!uploadedFile) {
      toast.error('Please upload a product image first');
      return;
    }

    setLoading(true);
    try {
      const result = await aiAnalysisService.analyzeProductAuthenticity(uploadedFile, {
        productName: productData.productName || undefined,
        brand: productData.brand || undefined,
        category: productData.category || undefined,
        price: productData.price ? parseFloat(productData.price) : undefined
      });
      
      setAnalysis(result);
      toast.success('Authenticity analysis complete!');
    } catch (error: any) {
      console.error('Authenticity analysis failed:', error);
      toast.error(error.response?.data?.error?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setUploadedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setProductData({
      productName: '',
      brand: '',
      category: '',
      price: ''
    });
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW': return 'text-green-600 dark:text-green-400';
      case 'MEDIUM': return 'text-yellow-600 dark:text-yellow-400';
      case 'HIGH': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getRiskBgColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW': return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800';
      case 'MEDIUM': return 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800';
      case 'HIGH': return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
      default: return 'bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="space-y-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Product preview"
                  className="max-w-sm max-h-64 rounded-lg shadow-md"
                />
                <div className="absolute top-2 right-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-md text-sm font-medium">
                  Ready to verify
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                  <Shield className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    Upload Product Image
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Upload a clear photo of the product for authenticity verification
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Product Information Form */}
        {uploadedFile && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-white">
              Product Information (Optional)
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Providing product details helps improve analysis accuracy
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={productData.productName}
                  onChange={(e) => setProductData({...productData, productName: e.target.value})}
                  placeholder="e.g., iPhone 15 Pro"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  value={productData.brand}
                  onChange={(e) => setProductData({...productData, brand: e.target.value})}
                  placeholder="e.g., Apple"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={productData.category}
                  onChange={(e) => setProductData({...productData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="accessories">Accessories</option>
                  <option value="shoes">Shoes</option>
                  <option value="bags">Bags</option>
                  <option value="watches">Watches</option>
                  <option value="jewelry">Jewelry</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price (USD)
                </label>
                <input
                  type="number"
                  value={productData.price}
                  onChange={(e) => setProductData({...productData, price: e.target.value})}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={analyzeAuthenticity}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Shield className="w-4 h-4" />
                )}
                {loading ? 'Analyzing...' : 'Verify Authenticity'}
              </button>
              
              <button
                onClick={resetAnalysis}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Authenticity Score */}
          <div className={`border rounded-lg p-6 ${getRiskBgColor(analysis.riskLevel)}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                  <Shield className={`w-6 h-6 ${getRiskColor(analysis.riskLevel)}`} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Authenticity Analysis
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    AI-powered verification complete
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {analysis.authenticityScore}%
                </div>
                <div className={`text-sm font-medium ${getRiskColor(analysis.riskLevel)}`}>
                  {analysis.riskLevel} RISK
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Authenticity Score</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {analysis.confidence}% confidence
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${analysis.authenticityScore}%`,
                    backgroundColor: analysis.riskLevel === 'LOW' ? '#10B981' : 
                                   analysis.riskLevel === 'MEDIUM' ? '#F59E0B' : '#EF4444'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Visual Analysis */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Visual Analysis
              </h3>
              <div className="space-y-3">
                {Object.entries(analysis.visualAnalysis).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {typeof value === 'number' ? `${value}%` : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Factors */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Analysis Summary
              </h3>
              
              {analysis.redFlags.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">Red Flags:</h4>
                  <ul className="space-y-1">
                    {analysis.redFlags.map((flag, index) => (
                      <li key={index} className="text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.positiveIndicators.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">Positive Signs:</h4>
                  <ul className="space-y-1">
                    {analysis.positiveIndicators.map((indicator, index) => (
                      <li key={index} className="text-sm text-green-600 dark:text-green-400 flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        {indicator}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Recommendations
              </h3>
              <ul className="space-y-2">
                {analysis.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Analysis Details */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Analysis Details</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <p><span className="font-medium">Analysis ID:</span> {analysis.analysisId}</p>
                <p><span className="font-medium">Processed:</span> {new Date(analysis.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <p><span className="font-medium">Confidence Level:</span> {analysis.confidence}%</p>
                <p><span className="font-medium">Risk Assessment:</span> {analysis.riskLevel}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};