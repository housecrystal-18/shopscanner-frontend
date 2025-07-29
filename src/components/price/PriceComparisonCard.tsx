import React from 'react';
import { 
  ExternalLink, 
  Star, 
  Truck, 
  Shield, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Tag,
  Clock
} from 'lucide-react';
import { StoreComparison } from '../../types/priceComparison';

interface PriceComparisonCardProps {
  store: StoreComparison;
  isBestDeal?: boolean;
  averagePrice?: number;
  onVisitStore?: (url: string) => void;
}

export function PriceComparisonCard({ 
  store, 
  isBestDeal = false, 
  averagePrice,
  onVisitStore 
}: PriceComparisonCardProps) {
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
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const getSavingsVsAverage = () => {
    if (!averagePrice) return null;
    const savings = averagePrice - store.price;
    const percentage = (savings / averagePrice) * 100;
    return { amount: savings, percentage };
  };

  const savings = getSavingsVsAverage();
  const totalCost = store.price + (store.shipping?.free ? 0 : store.shipping?.cost || 0);
  const hasDiscount = store.originalPrice && store.originalPrice > store.price;

  const handleVisitStore = () => {
    if (store.url && onVisitStore) {
      onVisitStore(store.url);
    } else if (store.url) {
      window.open(store.url, '_blank');
    }
  };

  return (
    <div className={`bg-white rounded-xl border-2 overflow-hidden transition-all duration-200 hover:shadow-md ${
      isBestDeal 
        ? 'border-green-500 shadow-lg ring-2 ring-green-100' 
        : 'border-gray-200 hover:border-gray-300'
    }`}>
      {/* Best Deal Badge */}
      {isBestDeal && (
        <div className="bg-green-500 text-white text-center py-2 text-sm font-medium">
          <Star className="h-4 w-4 inline mr-1" />
          Best Deal
        </div>
      )}

      <div className="p-4 md:p-6">
        {/* Store Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
            {store.trustScore && (
              <div className="flex items-center space-x-1">
                <Shield className={`h-4 w-4 ${
                  store.trustScore >= 80 ? 'text-green-500' : 
                  store.trustScore >= 60 ? 'text-yellow-500' : 'text-red-500'
                }`} />
                <span className="text-xs text-gray-500">{store.trustScore}%</span>
              </div>
            )}
          </div>
          
          {/* Stock Status */}
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            store.inStock 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {store.inStock ? 'In Stock' : 'Out of Stock'}
          </div>
        </div>

        {/* Price Information */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(store.price)}
            </span>
            
            {hasDiscount && (
              <>
                <span className="text-lg text-gray-500 line-through">
                  {formatPrice(store.originalPrice!)}
                </span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                  -{store.discountPercentage}%
                </span>
              </>
            )}
          </div>

          {/* Savings vs Average */}
          {savings && savings.amount > 0 && (
            <div className="flex items-center text-green-600 text-sm">
              <TrendingDown className="h-4 w-4 mr-1" />
              Save {formatPrice(savings.amount)} ({savings.percentage.toFixed(1)}% below average)
            </div>
          )}
        </div>

        {/* Shipping Information */}
        {store.shipping && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {store.shipping.free ? 'Free Shipping' : formatPrice(store.shipping.cost)}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {store.shipping.estimatedDays} day{store.shipping.estimatedDays !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="mt-2 text-sm font-medium text-gray-900">
              Total: {formatPrice(totalCost)}
            </div>
          </div>
        )}

        {/* Rating */}
        {store.rating && (
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(store.rating!) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {store.rating.toFixed(1)}
              {store.reviewCount && ` (${store.reviewCount.toLocaleString()} reviews)`}
            </span>
          </div>
        )}

        {/* Last Updated */}
        <div className="flex items-center text-xs text-gray-500 mb-4">
          <Clock className="h-3 w-3 mr-1" />
          Updated {formatDate(store.lastUpdated)}
        </div>

        {/* Action Button */}
        <button
          onClick={handleVisitStore}
          disabled={!store.inStock || !store.url}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
            store.inStock && store.url
              ? isBestDeal
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
              : 'bg-gray-100 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span>{store.inStock ? 'Visit Store' : 'Out of Stock'}</span>
          {store.inStock && store.url && <ExternalLink className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}