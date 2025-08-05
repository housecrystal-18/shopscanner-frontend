import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { QrCode, Upload, AlertCircle, CheckCircle, Loader, Link, ShoppingCart, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { aiAnalysisService, QRAnalysis } from '../../services/aiAnalysisService';

export const QRAnalyzer: React.FC = () => {
  const [analysis, setAnalysis] = useState<QRAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  const analyzeQRCode = async () => {
    if (!uploadedFile) {
      toast.error('Please upload an image with a QR code first');
      return;
    }

    setLoading(true);
    try {
      const result = await aiAnalysisService.analyzeQRCode(uploadedFile);
      setAnalysis(result);
      
      if (result.type === 'none') {
        toast.error('No QR code detected in the image');
      } else {
        toast.success('QR code analyzed successfully!');
      }
    } catch (error: any) {
      console.error('QR code analysis failed:', error);
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
  };

  const getQRTypeIcon = (type: string) => {
    switch (type) {
      case 'product_url':
        return <Link className="w-5 h-5 text-blue-600" />;
      case 'barcode':
        return <ShoppingCart className="w-5 h-5 text-green-600" />;
      case 'generic':
        return <QrCode className="w-5 h-5 text-gray-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getQRTypeDescription = (type: string) => {
    switch (type) {
      case 'product_url':
        return 'Product URL detected - Contains link to product page';
      case 'barcode':
        return 'Barcode detected - Contains product barcode number';
      case 'generic':
        return 'Generic content - Contains text or other data';
      case 'none':
        return 'No QR code found in the image';
      default:
        return 'Unknown QR code type';
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
                  alt="QR code preview"
                  className="max-w-sm max-h-64 rounded-lg shadow-md"
                />
                <div className="absolute top-2 right-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-md text-sm font-medium">
                  Ready to scan
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                  <QrCode className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    Upload QR Code Image
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Drag & drop an image with a QR code or click to browse
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {uploadedFile && (
          <div className="flex gap-3">
            <button
              onClick={analyzeQRCode}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {loading ? 'Scanning...' : 'Scan QR Code'}
            </button>
            
            <button
              onClick={resetAnalysis}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* QR Code Detection Status */}
          <div className={`border rounded-lg p-4 ${
            analysis.type === 'none'
              ? 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'
              : 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
          }`}>
            <div className="flex items-center gap-2">
              {analysis.type === 'none' ? (
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              )}
              <h3 className={`font-medium ${
                analysis.type === 'none'
                  ? 'text-yellow-900 dark:text-yellow-100'
                  : 'text-green-900 dark:text-green-100'
              }`}>
                {analysis.type === 'none' ? 'No QR Code Detected' : 'QR Code Detected'}
              </h3>
            </div>
            <p className={`text-sm mt-1 ${
              analysis.type === 'none'
                ? 'text-yellow-700 dark:text-yellow-300'
                : 'text-green-700 dark:text-green-300'
            }`}>
              {getQRTypeDescription(analysis.type)}
              {analysis.confidence > 0 && ` (${analysis.confidence}% confidence)`}
            </p>
          </div>

          {/* QR Code Content */}
          {analysis.type !== 'none' && analysis.qrContent && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-start gap-3">
                {getQRTypeIcon(analysis.type)}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    QR Code Content
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4">
                    <code className="text-sm text-gray-700 dark:text-gray-300 break-all">
                      {analysis.qrContent}
                    </code>
                  </div>

                  {/* Type-specific actions */}
                  {analysis.type === 'product_url' && (
                    <div className="flex gap-3">
                      <a
                        href={analysis.qrContent}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open Product Page
                      </a>
                      <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm">
                        <Upload className="w-4 h-4" />
                        Analyze This URL
                      </button>
                    </div>
                  )}

                  {analysis.type === 'barcode' && analysis.barcode && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          Barcode: {analysis.barcode}
                        </span>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                        <ShoppingCart className="w-4 h-4" />
                        Look Up Product
                      </button>
                    </div>
                  )}

                  {analysis.message && (
                    <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                      {analysis.message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Product Data (if URL analysis was performed) */}
          {analysis.productData && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">Product Information</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {analysis.productData.title}
                  </h4>
                  
                  {analysis.productData.brand && (
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Brand: {analysis.productData.brand}
                    </p>
                  )}
                  
                  {analysis.productData.price && (
                    <div className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">
                      {analysis.productData.price}
                    </div>
                  )}
                  
                  {analysis.productData.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {analysis.productData.description.substring(0, 200)}
                      {analysis.productData.description.length > 200 && '...'}
                    </p>
                  )}
                </div>
                
                {analysis.productData.images && analysis.productData.images.length > 0 && (
                  <div>
                    <img
                      src={analysis.productData.images[0].url}
                      alt={analysis.productData.images[0].alt}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 mt-4">
                <a
                  href={analysis.productData.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Full Product
                </a>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm">
                  <ShoppingCart className="w-4 h-4" />
                  Add to Wishlist
                </button>
              </div>
            </div>
          )}

          {/* Analysis Details */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Analysis Details</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p><span className="font-medium">Type:</span> {analysis.type.replace('_', ' ').toUpperCase()}</p>
              <p><span className="font-medium">Confidence:</span> {analysis.confidence}%</p>
              <p><span className="font-medium">Analysis ID:</span> {analysis.analysisId}</p>
              <p><span className="font-medium">Processed:</span> {new Date(analysis.timestamp).toLocaleString()}</p>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">QR Code Tips</h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Ensure the QR code is clearly visible and not blurry</li>
              <li>• Try different lighting conditions if scanning fails</li>
              <li>• QR codes on products often link to product pages or contain barcodes</li>
              <li>• Use our URL analyzer for product links found in QR codes</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};