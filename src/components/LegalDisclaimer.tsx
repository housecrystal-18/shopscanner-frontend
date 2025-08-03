import React from 'react';
import { AlertTriangle, Scale, Shield } from 'lucide-react';

interface LegalDisclaimerProps {
  variant?: 'full' | 'compact' | 'analysis';
}

export const LegalDisclaimer: React.FC<LegalDisclaimerProps> = ({ variant = 'compact' }) => {
  if (variant === 'full') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <div className="flex items-start space-x-3">
          <Scale className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">
              Important Legal Disclaimers
            </h3>
            <div className="text-sm text-yellow-700 space-y-3">
              <p>
                <strong>User-Driven Educational Tool:</strong> Shop Scan Pro provides educational analysis only when users choose to submit URLs. 
                We analyze user-provided information to teach smart shopping patterns and decision-making techniques.
              </p>
              <p>
                <strong>User-Initiated Analysis:</strong> All analysis occurs only at user request using URLs that users voluntarily provide. 
                We offer educational insights and pattern recognition training, not definitive product determinations.
              </p>
              <p>
                <strong>Platform Independence:</strong> Shop Scan Pro is not affiliated with any e-commerce platform. 
                We provide educational analysis of user-submitted URLs to teach shopping skills.
              </p>
              <p>
                <strong>User Empowerment Focus:</strong> Users control what gets analyzed by choosing which URLs to submit. 
                Our educational responses help users develop their own evaluation skills for independent decision-making.
              </p>
              <p>
                <strong>Educational Fair Use:</strong> Our pattern analysis is provided for consumer education. 
                We analyze publicly available URL patterns to teach smart shopping techniques.
              </p>
              <p>
                <strong>Learning Tool Disclaimer:</strong> This is a demonstration of pattern analysis techniques. 
                Always conduct independent research before making purchasing decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'analysis') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-start space-x-2">
          <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Educational Disclaimer</p>
            <p>
              This pattern analysis is for educational purposes only and demonstrates smart shopping techniques based on 
              URL patterns and publicly available information. Results are learning examples, not definitive determinations. 
              Always conduct independent research before making purchasing decisions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Compact variant
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
      <div className="flex items-center space-x-2">
        <AlertTriangle className="h-4 w-4 text-gray-600 flex-shrink-0" />
        <p className="text-xs text-gray-600">
          <strong>Educational Tool:</strong> Pattern analysis for learning purposes only. 
          Not affiliated with any platforms. Always research independently before purchasing.
        </p>
      </div>
    </div>
  );
};

export default LegalDisclaimer;