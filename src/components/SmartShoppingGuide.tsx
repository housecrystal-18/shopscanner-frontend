import React, { useState } from 'react';
import { BookOpen, Eye, Shield, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

export const SmartShoppingGuide: React.FC = () => {
  const [activeSection, setActiveSection] = useState('patterns');

  const sections = {
    patterns: {
      title: 'URL Pattern Recognition',
      icon: <Eye className="h-5 w-5" />,
      content: [
        {
          type: 'tip',
          title: 'Learn to Read URLs',
          content: 'URLs contain valuable information about where products come from. Learn to identify marketplace patterns, seller indicators, and product authenticity clues.'
        },
        {
          type: 'example',
          title: 'Artisan Marketplace Patterns',
          content: 'Look for URLs with handmade technique keywords like "laser-engraved," "hand-carved," or "custom-made." These suggest individual craftsmanship.'
        },
        {
          type: 'warning',
          title: 'Red Flag Patterns',
          content: 'Be cautious of URLs with "fast shipping from overseas," "bulk," or "wholesale" on platforms that claim to sell handmade items.'
        }
      ]
    },
    research: {
      title: 'Independent Research Tips',
      icon: <BookOpen className="h-5 w-5" />,
      content: [
        {
          type: 'tip',
          title: 'Seller Verification',
          content: 'Always check seller ratings, response times, and review history. Established sellers typically have consistent positive feedback.'
        },
        {
          type: 'tip',
          title: 'Cross-Platform Comparison',
          content: 'Search for the same item across multiple platforms to understand pricing patterns and identify potential dropshipping.'
        },
        {
          type: 'tip',
          title: 'Reverse Image Search',
          content: 'Use reverse image search to verify if product photos are unique or used by multiple sellers.'
        }
      ]
    },
    protection: {
      title: 'Buyer Protection',
      icon: <Shield className="h-5 w-5" />,
      content: [
        {
          type: 'tip',
          title: 'Payment Methods',
          content: 'Use payment methods with buyer protection. Credit cards and PayPal offer dispute resolution services.'
        },
        {
          type: 'tip',
          title: 'Return Policies',
          content: 'Always read return policies carefully. Legitimate sellers typically offer clear, reasonable return terms.'
        },
        {
          type: 'warning',
          title: 'Too Good to be True',
          content: 'If prices seem unusually low for branded items, proceed with extra caution and verify authenticity.'
        }
      ]
    },
    trends: {
      title: 'Market Awareness',
      icon: <TrendingUp className="h-5 w-5" />,
      content: [
        {
          type: 'tip',
          title: 'Price Research',
          content: 'Research typical price ranges for items before buying. Use price tracking tools and comparison sites.'
        },
        {
          type: 'tip',
          title: 'Seasonal Patterns',
          content: 'Understand seasonal pricing patterns. Some items are consistently cheaper at certain times of year.'
        },
        {
          type: 'example',
          title: 'Market Comparison',
          content: 'Compare prices across established retailers to understand normal market ranges for authentic products.'
        }
      ]
    }
  };

  const renderContent = (item: any) => {
    const Icon = item.type === 'warning' ? AlertCircle : 
                 item.type === 'example' ? BookOpen : CheckCircle;
    const bgColor = item.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                   item.type === 'example' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200';
    const iconColor = item.type === 'warning' ? 'text-yellow-600' :
                     item.type === 'example' ? 'text-blue-600' : 'text-green-600';
    const textColor = item.type === 'warning' ? 'text-yellow-800' :
                     item.type === 'example' ? 'text-blue-800' : 'text-green-800';

    return (
      <div key={item.title} className={`border rounded-lg p-4 ${bgColor}`}>
        <div className="flex items-start space-x-3">
          <Icon className={`h-5 w-5 ${iconColor} flex-shrink-0 mt-0.5`} />
          <div>
            <h4 className={`font-medium ${textColor} mb-2`}>{item.title}</h4>
            <p className={`text-sm ${textColor.replace('800', '700')}`}>{item.content}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
      <div className="flex items-center space-x-2 mb-6">
        <BookOpen className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Smart Shopping Education</h3>
      </div>

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(sections).map(([key, section]) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === key
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {section.icon}
            <span>{section.title}</span>
          </button>
        ))}
      </div>

      {/* Active Section Content */}
      <div className="space-y-4">
        {sections[activeSection as keyof typeof sections].content.map(renderContent)}
      </div>

      {/* Educational Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600 text-center">
          💡 <strong>Remember:</strong> This tool teaches pattern recognition techniques. 
          Always conduct independent research and use multiple verification methods before making purchasing decisions.
        </p>
      </div>
    </div>
  );
};

export default SmartShoppingGuide;