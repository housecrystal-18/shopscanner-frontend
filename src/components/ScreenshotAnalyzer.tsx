import React, { useState, useRef } from 'react';
import { Camera, Upload, Clipboard, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { analyzeUserSubmission, UserSubmittedData, ScreenshotAnalysisResult } from '../services/screenshotAnalyzer';

interface ScreenshotAnalyzerProps {
  onAnalysisComplete: (result: ScreenshotAnalysisResult & { submittedData: UserSubmittedData }) => void;
}

export const ScreenshotAnalyzer: React.FC<ScreenshotAnalyzerProps> = ({ onAnalysisComplete }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [captureMethod, setCaptureMethod] = useState<'screenshot' | 'upload' | 'manual'>('screenshot');
  const [formData, setFormData] = useState<UserSubmittedData>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScreenCapture = async () => {
    try {
      setAnalyzing(true);
      
      if (!navigator.mediaDevices?.getDisplayMedia) {
        alert('Screen capture not supported in this browser. Please use the upload or manual entry options.');
        return;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' }
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      video.addEventListener('loadedmetadata', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        
        canvas.toBlob(async (blob) => {
          if (blob) {
            const submittedData = { ...formData, screenshot: blob };
            const result = await analyzeUserSubmission(submittedData);
            onAnalysisComplete({ ...result, submittedData });
          }
          
          stream.getTracks().forEach(track => track.stop());
          setAnalyzing(false);
        }, 'image/png');
      });
    } catch (error) {
      console.error('Screen capture failed:', error);
      alert('Screen capture was cancelled or failed. Please try again or use another method.');
      setAnalyzing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    try {
      const submittedData = { ...formData, screenshot: file };
      const result = await analyzeUserSubmission(submittedData);
      onAnalysisComplete({ ...result, submittedData });
    } catch (error) {
      console.error('File analysis failed:', error);
      alert('Failed to analyze uploaded image. Please try again.');
    }
    setAnalyzing(false);
  };

  const handleManualSubmit = async () => {
    if (!formData.productTitle && !formData.url) {
      alert('Please provide at least a product title or URL.');
      return;
    }

    setAnalyzing(true);
    try {
      const result = await analyzeUserSubmission(formData);
      onAnalysisComplete({ ...result, submittedData: formData });
    } catch (error) {
      console.error('Manual analysis failed:', error);
      alert('Analysis failed. Please try again.');
    }
    setAnalyzing(false);
  };

  const updateFormData = (field: keyof UserSubmittedData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyze Product Authenticity</h2>
        <p className="text-gray-600">
          Choose how you'd like to provide product information for analysis. All data stays private and secure.
        </p>
      </div>

      {/* Method Selection */}
      <div className="mb-6">
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => setCaptureMethod('screenshot')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              captureMethod === 'screenshot'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Camera className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-sm font-medium">Screenshot</div>
            <div className="text-xs text-gray-500">Capture product page</div>
          </button>

          <button
            onClick={() => setCaptureMethod('upload')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              captureMethod === 'upload'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-sm font-medium">Upload Image</div>
            <div className="text-xs text-gray-500">Upload screenshot</div>
          </button>

          <button
            onClick={() => setCaptureMethod('manual')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              captureMethod === 'manual'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Clipboard className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-sm font-medium">Manual Entry</div>
            <div className="text-xs text-gray-500">Type/paste details</div>
          </button>
        </div>
      </div>

      {/* Screenshot Capture */}
      {captureMethod === 'screenshot' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">How to capture:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Navigate to the product page you want to analyze</li>
                  <li>Click "Capture Screenshot" below</li>
                  <li>Select the browser window/tab with the product</li>
                  <li>Click "Share" to capture the page</li>
                </ol>
              </div>
            </div>
          </div>

          <button
            onClick={handleScreenCapture}
            disabled={analyzing}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Camera className="w-5 h-5" />
            <span>{analyzing ? 'Capturing & Analyzing...' : 'Capture Screenshot'}</span>
          </button>
        </div>
      )}

      {/* File Upload */}
      {captureMethod === 'upload' && (
        <div className="space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={analyzing}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors disabled:opacity-50"
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <div className="text-lg font-medium text-gray-700">
              {analyzing ? 'Analyzing Image...' : 'Click to Upload Screenshot'}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              PNG, JPG, or other image formats
            </div>
          </button>
        </div>
      )}

      {/* Manual Entry */}
      {captureMethod === 'manual' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product URL (optional)
            </label>
            <input
              type="url"
              value={formData.url || ''}
              onChange={(e) => updateFormData('url', e.target.value)}
              placeholder="https://example.com/product"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Title *
            </label>
            <input
              type="text"
              value={formData.productTitle || ''}
              onChange={(e) => updateFormData('productTitle', e.target.value)}
              placeholder="Enter the product title"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price
            </label>
            <input
              type="text"
              value={formData.productPrice || ''}
              onChange={(e) => updateFormData('productPrice', e.target.value)}
              placeholder="$19.99"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Description
            </label>
            <textarea
              value={formData.productDescription || ''}
              onChange={(e) => updateFormData('productDescription', e.target.value)}
              placeholder="Paste the product description here"
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seller Name
            </label>
            <input
              type="text"
              value={formData.sellerName || ''}
              onChange={(e) => updateFormData('sellerName', e.target.value)}
              placeholder="Store or seller name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleManualSubmit}
            disabled={analyzing || (!formData.productTitle && !formData.url)}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {analyzing ? 'Analyzing...' : 'Analyze Product'}
          </button>
        </div>
      )}

      {analyzing && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center space-x-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">Analyzing product data...</span>
          </div>
        </div>
      )}
    </div>
  );
};