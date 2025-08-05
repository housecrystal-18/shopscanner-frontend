import React, { useState } from 'react';
import { BookOpen, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const VerificationGuide: React.FC = () => {
  const [category, setCategory] = useState('');
  const [productName, setProductName] = useState('');
  const [loading, setLoading] = useState(false);

  const generateGuide = async () => {
    if (!category.trim()) {
      toast.error('Please select a product category');
      return;
    }

    setLoading(true);
    try {
      // Simulate guide generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Verification guide generated!');
    } catch (error) {
      toast.error('Guide generation failed');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Electronics',
    'Clothing',
    'Shoes',
    'Bags',
    'Watches',
    'Jewelry',
    'Cosmetics',
    'Accessories',
    'Other'
  ];

  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Product Verification Guide
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          Get educational guides with step-by-step instructions to verify product authenticity.
        </p>
        
        <div className="max-w-md mx-auto space-y-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select product category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat.toLowerCase()}>{cat}</option>
            ))}
          </select>
          
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Specific product name (optional)"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <button
            onClick={generateGuide}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Generating...' : 'Generate Guide'}
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
          <div className="text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white">Quick Checks</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Immediate verification steps</p>
          </div>
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white">Red Flags</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Warning signs to watch for</p>
          </div>
          <div className="text-center">
            <Lightbulb className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white">Pro Tips</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Expert verification techniques</p>
          </div>
        </div>
      </div>
    </div>
  );
};