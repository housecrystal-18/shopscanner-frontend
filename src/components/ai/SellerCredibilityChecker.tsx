import React, { useState } from 'react';
import { UserCheck, Shield, Star, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const SellerCredibilityChecker: React.FC = () => {
  const [sellerId, setSellerId] = useState('');
  const [loading, setLoading] = useState(false);

  const analyzeCredibility = async () => {
    if (!sellerId.trim()) {
      toast.error('Please enter a seller ID or name');
      return;
    }

    setLoading(true);
    try {
      // Simulate analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Seller credibility analysis complete!');
    } catch (error) {
      toast.error('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <div className="p-4 bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
          <UserCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Seller Credibility Analysis
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          Analyze seller trustworthiness, reputation, and credibility score before making a purchase.
        </p>
        
        <div className="max-w-md mx-auto space-y-4">
          <input
            type="text"
            value={sellerId}
            onChange={(e) => setSellerId(e.target.value)}
            placeholder="Enter seller ID or username"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <button
            onClick={analyzeCredibility}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Analyzing...' : 'Analyze Seller'}
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
          <div className="text-center">
            <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white">Trust Score</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Overall credibility rating</p>
          </div>
          <div className="text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white">Reputation Analysis</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Reviews and feedback history</p>
          </div>
          <div className="text-center">
            <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white">Risk Assessment</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Potential red flags and warnings</p>
          </div>
        </div>
      </div>
    </div>
  );
};