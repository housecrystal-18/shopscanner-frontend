import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingDown, 
  X, 
  ExternalLink, 
  Calendar,
  DollarSign,
  Percent
} from 'lucide-react';
import { PriceDropAlert as PriceDropAlertType } from '../../types/wishlist';
import { useWishlist } from '../../hooks/useWishlist';

interface PriceDropAlertProps {
  alert: PriceDropAlertType;
  onDismiss?: () => void;
}

export function PriceDropAlert({ alert, onDismiss }: PriceDropAlertProps) {
  const { markPriceDropAsRead } = useWishlist();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const handleMarkAsRead = async () => {
    try {
      await markPriceDropAsRead(alert.id);
      onDismiss?.();
    } catch (error) {
      console.error('Failed to mark price drop as read:', error);
    }
  };

  const savingsAmount = alert.oldPrice - alert.newPrice;
  const isNewAlert = !alert.isRead;

  return (
    <div className={`relative bg-white rounded-lg border shadow-sm overflow-hidden transition-all duration-200 ${
      isNewAlert ? 'border-green-200 bg-green-50' : 'border-gray-200'
    }`}>
      {/* New Alert Indicator */}
      {isNewAlert && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600"></div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {/* Alert Icon */}
            <div className={`flex-shrink-0 p-2 rounded-lg ${
              isNewAlert ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <TrendingDown className={`h-5 w-5 ${
                isNewAlert ? 'text-green-600' : 'text-gray-600'
              }`} />
            </div>

            <div className="flex-1 min-w-0">
              {/* Product Name */}
              <Link
                to={`/products/${alert.productId}`}
                className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors block truncate"
              >
                {alert.productName}
              </Link>

              {/* Price Information */}
              <div className="mt-2 space-y-2">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Was:</span>
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(alert.oldPrice)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Now:</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatPrice(alert.newPrice)}
                    </span>
                  </div>
                </div>

                {/* Savings */}
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1 text-green-700">
                    <DollarSign className="h-3 w-3" />
                    <span className="font-medium">
                      Save {formatPrice(savingsAmount)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 text-green-700">
                    <Percent className="h-3 w-3" />
                    <span className="font-medium">
                      {alert.priceDropPercentage.toFixed(1)}% off
                    </span>
                  </div>
                </div>

                {/* Detection Time */}
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>Detected {formatDate(alert.detectedAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center space-x-3">
                <Link
                  to={`/products/${alert.productId}`}
                  className="inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <span>View Product</span>
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Link>

                {isNewAlert && (
                  <button
                    onClick={handleMarkAsRead}
                    className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Dismiss Button */}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors ml-4"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Celebration Effect for New Alerts */}
      {isNewAlert && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 right-4 text-2xl animate-bounce">
            🎉
          </div>
        </div>
      )}
    </div>
  );
}