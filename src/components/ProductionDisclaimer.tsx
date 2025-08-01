import React from 'react';
import { AlertCircle, Info } from 'lucide-react';

export function ProductionDisclaimer() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-medium text-blue-900 mb-1">Demo Data Notice</h4>
          <p className="text-sm text-blue-800 leading-relaxed">
            Shop Scanner is currently using demonstration data to showcase functionality. 
            Authenticity scores and price comparisons are simulated for illustration purposes. 
            Real product database integration is coming soon. All payment processing is fully functional.
          </p>
        </div>
      </div>
    </div>
  );
}

export function DemoModeAlert() {
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-96 bg-yellow-50 border border-yellow-200 rounded-lg p-3 shadow-lg z-50">
      <div className="flex items-center space-x-2">
        <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-xs text-yellow-800">
            <strong>Demo Mode:</strong> Scan results are simulated. Payment processing is live.
          </p>
        </div>
        <button 
          onClick={() => {
            const alert = document.querySelector('[data-demo-alert]');
            if (alert) alert.remove();
          }}
          className="text-yellow-600 hover:text-yellow-800"
          data-demo-alert
        >
          ×
        </button>
      </div>
    </div>
  );
}