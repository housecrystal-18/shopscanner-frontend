import React, { useState } from 'react';
import { 
  TrendingDown, 
  Filter, 
  ChevronDown, 
  Calendar,
  Eye,
  EyeOff,
  Package,
  Bell
} from 'lucide-react';
import { useWishlist } from '../../hooks/useWishlist';
import { PriceDropAlert as PriceDropAlertComponent } from './PriceDropAlert';

export function PriceDropPanel() {
  const [showRead, setShowRead] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'biggest_drop' | 'smallest_drop'>('newest');
  
  const { priceDrops, isLoadingPriceDrops, markPriceDropAsRead } = useWishlist();

  const filteredAlerts = priceDrops.filter(alert => showRead || !alert.isRead);

  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
      case 'oldest':
        return new Date(a.detectedAt).getTime() - new Date(b.detectedAt).getTime();
      case 'biggest_drop':
        return b.priceDropPercentage - a.priceDropPercentage;
      case 'smallest_drop':
        return a.priceDropPercentage - b.priceDropPercentage;
      default:
        return 0;
    }
  });

  const unreadCount = priceDrops.filter(alert => !alert.isRead).length;
  const totalSavings = priceDrops.reduce((sum, alert) => sum + (alert.oldPrice - alert.newPrice), 0);

  const handleMarkAllAsRead = async () => {
    const unreadAlerts = priceDrops.filter(alert => !alert.isRead);
    
    try {
      await Promise.all(
        unreadAlerts.map(alert => markPriceDropAsRead(alert.id))
      );
    } catch (error) {
      console.error('Failed to mark all alerts as read:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoadingPriceDrops) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading price drops...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <TrendingDown className="h-6 w-6 text-green-600 mr-2" />
              Price Drop Alerts
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Track price changes on your wishlist items
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Mark All as Read
            </button>
          )}
        </div>

        {/* Stats */}
        {priceDrops.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-800">Unread Alerts</p>
                  <p className="text-lg font-semibold text-green-900">{unreadCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <Package className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Total Alerts</p>
                  <p className="text-lg font-semibold text-blue-900">{priceDrops.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <TrendingDown className="h-5 w-5 text-purple-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-purple-800">Total Savings</p>
                  <p className="text-lg font-semibold text-purple-900">{formatCurrency(totalSavings)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowRead(!showRead)}
              className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showRead
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showRead ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide Read
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Show Read
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="biggest_drop">Biggest Drop</option>
              <option value="smallest_drop">Smallest Drop</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {sortedAlerts.length === 0 ? (
          <div className="text-center py-8">
            <TrendingDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {priceDrops.length === 0 ? 'No price drops yet' : 'No alerts to show'}
            </h3>
            <p className="text-gray-600">
              {priceDrops.length === 0 
                ? 'We\'ll notify you when prices drop on your wishlist items.'
                : showRead 
                  ? 'All price drop alerts have been read.'
                  : 'No unread price drop alerts. Toggle "Show Read" to see all alerts.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedAlerts.map((alert) => (
              <PriceDropAlertComponent
                key={alert.id}
                alert={alert}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}