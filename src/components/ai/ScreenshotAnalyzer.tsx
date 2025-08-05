import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, Upload, AlertCircle, CheckCircle, Loader, Image, ShoppingCart, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { aiAnalysisService, ScreenshotAnalysis } from '../../services/aiAnalysisService';

export const ScreenshotAnalyzer: React.FC = () => {
  const [analysis, setAnalysis] = useState<ScreenshotAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [focusArea, setFocusArea] = useState('');
  const [extractPrices, setExtractPrices] = useState(true);

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

  const analyzeScreenshot = async () => {
    if (!uploadedFile) {
      toast.error('Please upload a screenshot first');
      return;
    }

    setLoading(true);
    try {
      const result = await aiAnalysisService.analyzeScreenshot(uploadedFile, {
        focusArea: focusArea || undefined,
        extractPrices
      });
      
      setAnalysis(result);
      toast.success('Screenshot analyzed successfully!');
    } catch (error: any) {
      console.error('Screenshot analysis failed:', error);
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
    setFocusArea('');
    setExtractPrices(true);
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
                  alt="Screenshot preview"
                  className="max-w-sm max-h-64 rounded-lg shadow-md"
                />
                <div className="absolute top-2 right-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-md text-sm font-medium">
                  Ready to analyze
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                  <Camera className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    Upload Screenshot
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Drag & drop a screenshot or click to browse
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Analysis Options */}
        {uploadedFile && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-white">Analysis Options</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Focus Area (Optional)
                </label>
                <input
                  type="text"
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  placeholder="e.g., product prices, brand names, specific items"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="extract-prices"
                  type="checkbox"
                  checked={extractPrices}
                  onChange={(e) => setExtractPrices(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="extract-prices" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Focus on price extraction
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={analyzeScreenshot}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {loading ? 'Analyzing...' : 'Analyze Screenshot'}
              </button>
              
              <button
                onClick={resetAnalysis}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="font-medium text-green-900 dark:text-green-100">
                Screenshot Analysis Complete
              </h3>
            </div>
            <p className="text-green-700 dark:text-green-300 text-sm mt-1">
              Found {analysis.products?.length || 0} product(s) with {analysis.confidence}% confidence
            </p>
          </div>

          {/* Products Found */}
          {analysis.products && analysis.products.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Products Discovered
              </h3>
              <div className="grid gap-4">
                {analysis.products.map((product, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <ShoppingCart className="w-4 h-4 text-blue-600" />
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </h4>
                          {product.confidence && (
                            <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                              {product.confidence}% match
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          {product.brand && (
                            <p><span className="font-medium">Brand:</span> {product.brand}</p>
                          )}
                          {product.category && (
                            <p><span className="font-medium">Category:</span> {product.category}</p>
                          )}
                          {product.location && (
                            <p><span className="font-medium">Location:</span> {product.location}</p>
                          )}
                        </div>
                      </div>

                      {product.price && (
                        <div className="flex items-center gap-1 text-lg font-semibold text-green-600 dark:text-green-400">
                          <DollarSign className="w-4 h-4" />
                          {product.price}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analysis Context */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Analysis Details</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p><span className="font-medium">Context:</span> {analysis.context}</p>
              <p><span className="font-medium">Analysis Type:</span> {analysis.analysisType}</p>
              <p><span className="font-medium">Confidence Level:</span> {analysis.confidence}%</p>
              <p><span className="font-medium">Analysis ID:</span> {analysis.analysisId}</p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Next Steps</h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Use the product names to search for better deals</li>
              <li>• Check authenticity using our AI authenticity checker</li>
              <li>• Set up price alerts for products you're interested in</li>
              <li>• Compare prices across different retailers</li>
            </ul>
          </div>
        </div>
      )}

      {/* No Results */}
      {analysis && (!analysis.products || analysis.products.length === 0) && (
        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <h3 className="font-medium text-yellow-900 dark:text-yellow-100">
              No Products Found
            </h3>
          </div>
          <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
            We couldn't identify any products in this screenshot. Try uploading a clearer image or one with visible product information.
          </p>
        </div>
      )}
    </div>
  );
};