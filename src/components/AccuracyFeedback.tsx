import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, AlertCircle, CheckCircle, X } from 'lucide-react';
import { accuracyMonitor } from '../services/accuracyMonitor';

interface AccuracyFeedbackProps {
  productUrl: string;
  productName: string;
  price: string;
  userEmail?: string;
  onFeedbackSubmitted?: () => void;
}

export function AccuracyFeedback({ 
  productUrl, 
  productName, 
  price, 
  userEmail,
  onFeedbackSubmitted 
}: AccuracyFeedbackProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedField, setSelectedField] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctValue, setCorrectValue] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleFeedbackSubmit = () => {
    if (selectedField && isCorrect !== null) {
      accuracyMonitor.recordUserFeedback({
        url: productUrl,
        isCorrect,
        expectedValue: correctValue || undefined,
        actualValue: selectedField === 'name' ? productName : 
                    selectedField === 'price' ? price : 'unknown',
        field: selectedField,
        timestamp: Date.now(),
        userEmail
      });

      setFeedbackSubmitted(true);
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }

      // Auto-hide after 3 seconds
      setTimeout(() => {
        setShowFeedback(false);
        setFeedbackSubmitted(false);
        setSelectedField('');
        setIsCorrect(null);
        setCorrectValue('');
      }, 3000);
    }
  };

  if (feedbackSubmitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
        <div className="flex items-center">
          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
          <span className="text-sm text-green-800">Thank you for your feedback! This helps improve our accuracy.</span>
        </div>
      </div>
    );
  }

  if (!showFeedback) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Is this information accurate?</span>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setIsCorrect(true);
                accuracyMonitor.recordUserFeedback({
                  url: productUrl,
                  isCorrect: true,
                  field: 'overall',
                  timestamp: Date.now(),
                  userEmail
                });
                setFeedbackSubmitted(true);
                setTimeout(() => setFeedbackSubmitted(false), 2000);
              }}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
            >
              <ThumbsUp className="w-3 h-3" />
              <span>Yes</span>
            </button>
            <button
              onClick={() => setShowFeedback(true)}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
            >
              <ThumbsDown className="w-3 h-3" />
              <span>No</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-yellow-800 mb-3">Help us improve accuracy</h4>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-yellow-700 mb-2 block">Which information is incorrect?</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="field"
                      value="name"
                      checked={selectedField === 'name'}
                      onChange={(e) => setSelectedField(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Product name: "{productName}"</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="field"
                      value="price"
                      checked={selectedField === 'price'}
                      onChange={(e) => setSelectedField(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Price: {price}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="field"
                      value="other"
                      checked={selectedField === 'other'}
                      onChange={(e) => setSelectedField(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Other information</span>
                  </label>
                </div>
              </div>

              {selectedField && (
                <div>
                  <label className="text-sm text-yellow-700 mb-1 block">What should it be? (optional)</label>
                  <input
                    type="text"
                    value={correctValue}
                    onChange={(e) => setCorrectValue(e.target.value)}
                    placeholder="Enter correct value..."
                    className="w-full px-3 py-2 text-sm border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setShowFeedback(false)}
                className="text-sm text-yellow-600 hover:text-yellow-800"
              >
                Cancel
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setIsCorrect(false);
                    handleFeedbackSubmit();
                  }}
                  disabled={!selectedField}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Report Issue
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowFeedback(false)}
            className="text-yellow-500 hover:text-yellow-700 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Admin component to view accuracy metrics
export function AccuracyMetricsDisplay() {
  const [metrics, setMetrics] = useState(accuracyMonitor.getMetrics());
  const [report, setReport] = useState(accuracyMonitor.generateReport());

  const refreshMetrics = () => {
    setMetrics(accuracyMonitor.getMetrics());
    setReport(accuracyMonitor.generateReport());
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Accuracy Metrics</h3>
        <button
          onClick={refreshMetrics}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{report.successRate.toFixed(1)}%</div>
          <div className="text-sm text-blue-800">Success Rate</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{metrics.averageConfidence.toFixed(1)}%</div>
          <div className="text-sm text-green-800">Avg Confidence</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{metrics.totalScans}</div>
          <div className="text-sm text-purple-800">Total Scans</div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Platform Breakdown</h4>
          <div className="space-y-2">
            {report.platformBreakdown.map(platform => (
              <div key={platform.platform} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="capitalize">{platform.platform}</span>
                <div className="text-sm text-gray-600">
                  {platform.scans} scans • {platform.confidence.toFixed(1)}% confidence
                </div>
              </div>
            ))}
          </div>
        </div>

        {report.topErrors.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Common Issues</h4>
            <ul className="space-y-1">
              {report.topErrors.map((error, index) => (
                <li key={index} className="text-sm text-red-600">• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {report.recommendations.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
            <ul className="space-y-1">
              {report.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-blue-600">• {rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}