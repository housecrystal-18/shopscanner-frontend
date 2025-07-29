import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  ShoppingBag, 
  TrendingDown, 
  TrendingUp, 
  Edit3, 
  Trash2, 
  Bell,
  BellOff,
  ExternalLink,
  Calendar,
  DollarSign,
  Tag,
  AlertCircle,
  Star
} from 'lucide-react';
import { WishlistItem } from '../../types/wishlist';
import { useWishlist } from '../../hooks/useWishlist';

interface WishlistItemCardProps {
  item: WishlistItem;
  showCollection?: boolean;
  onEdit?: (item: WishlistItem) => void;
}

export function WishlistItemCard({ 
  item, 
  showCollection = false,
  onEdit 
}: WishlistItemCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { removeFromWishlist, isRemovingFromWishlist } = useWishlist();

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
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getCurrentPrice = () => {
    if (!item.product?.stores) return null;
    const inStockStores = item.product.stores.filter(s => s.inStock);
    if (inStockStores.length === 0) return null;
    return Math.min(...inStockStores.map(s => s.price));
  };

  const getPriceChange = () => {
    const currentPrice = getCurrentPrice();
    if (!currentPrice || !item.priceWhenAdded) return null;
    
    const change = currentPrice - item.priceWhenAdded;
    const percentage = (change / item.priceWhenAdded) * 100;
    
    return { change, percentage, current: currentPrice };
  };

  const handleRemove = async () => {
    try {
      await removeFromWishlist(item.id);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const priceChange = getPriceChange();
  const currentPrice = getCurrentPrice();
  const isAvailable = item.product?.stores?.some(s => s.inStock) || false;
  const targetReached = item.targetPrice && currentPrice && currentPrice <= item.targetPrice;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Main Content */}
      <div className="p-6">
        <div className="flex items-start space-x-4">
          {/* Product Image */}
          <Link 
            to={`/products/${item.productId}`}
            className="flex-shrink-0"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
              {item.product?.imageUrl ? (
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
          </Link>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <Link 
                  to={`/products/${item.productId}`}
                  className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors truncate block"
                >
                  {item.product?.name || 'Product Name'}
                </Link>
                {item.product?.category && (
                  <p className="text-sm text-gray-600 capitalize">{item.product.category}</p>
                )}
              </div>

              {/* Priority Badge */}
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                {item.priority}
              </div>
            </div>

            {/* Price Information */}
            <div className="mb-3">
              <div className="flex items-center space-x-3">
                {currentPrice && (
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(currentPrice)}
                    </span>
                    {!isAvailable && (
                      <span className="text-sm text-red-600 bg-red-100 px-2 py-1 rounded-full">
                        Out of Stock
                      </span>
                    )}
                  </div>
                )}

                {/* Price Change Indicator */}
                {priceChange && (
                  <div className={`flex items-center space-x-1 text-sm ${
                    priceChange.change < 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {priceChange.change < 0 ? (
                      <TrendingDown className="h-4 w-4" />
                    ) : (
                      <TrendingUp className="h-4 w-4" />
                    )}
                    <span>
                      {priceChange.change < 0 ? '' : '+'}
                      {formatPrice(Math.abs(priceChange.change))}
                      ({priceChange.percentage > 0 ? '+' : ''}{priceChange.percentage.toFixed(1)}%)
                    </span>
                  </div>
                )}
              </div>

              {/* Target Price Alert */}
              {item.targetPrice && (
                <div className={`flex items-center space-x-2 mt-2 text-sm ${
                  targetReached ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {item.priceAlertEnabled ? (
                    <Bell className="h-4 w-4" />
                  ) : (
                    <BellOff className="h-4 w-4" />
                  )}
                  <span>
                    Target: {formatPrice(item.targetPrice)}
                    {targetReached && ' (Reached!)'}
                  </span>
                </div>
              )}
            </div>

            {/* Notes */}
            {item.notes && (
              <p className="text-sm text-gray-700 mb-3 italic">"{item.notes}"</p>
            )}

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {item.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>Added {formatDate(item.addedAt)}</span>
              </div>
              
              {item.priceWhenAdded && (
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-3 w-3" />
                  <span>Was {formatPrice(item.priceWhenAdded)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <Link
              to={`/products/${item.productId}`}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1"
            >
              <span>View Details</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
            
            {isAvailable && currentPrice && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                {showDetails ? 'Hide' : 'Show'} Stores
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit?.(item)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Edit item"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            
            <button
              onClick={handleRemove}
              disabled={isRemovingFromWishlist}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
              title="Remove from wishlist"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Store Details */}
        {showDetails && isAvailable && item.product?.stores && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Available at:</h4>
            <div className="space-y-2">
              {item.product.stores
                .filter(store => store.inStock)
                .slice(0, 3)
                .map((store, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-900">{store.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {formatPrice(store.price)}
                      </span>
                      {store.url && (
                        <a
                          href={store.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Alerts */}
      {targetReached && (
        <div className="bg-green-50 border-t border-green-200 px-6 py-3">
          <div className="flex items-center space-x-2 text-green-800">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              🎉 Target price reached! Current price is at or below your target.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}