import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Shield, 
  Star, 
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin
} from 'lucide-react';
import { Product } from '../../types/product';

interface ProductCardProps {
  product: Product;
  showPriceComparison?: boolean;
}

export function ProductCard({ product, showPriceComparison = false }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getAuthenticityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPriceTrend = () => {
    if (!product.priceHistory || product.priceHistory.length < 2) return null;
    
    const latest = product.priceHistory[0]?.price;
    const previous = product.priceHistory[1]?.price;
    
    if (!latest || !previous) return null;
    
    if (latest > previous) return { trend: 'up', icon: TrendingUp, color: 'text-red-500' };
    if (latest < previous) return { trend: 'down', icon: TrendingDown, color: 'text-green-500' };
    return { trend: 'stable', icon: Minus, color: 'text-gray-500' };
  };

  const priceTrend = getPriceTrend();
  const lowestPrice = product.stores?.reduce((min, store) => 
    store.inStock && store.price < min ? store.price : min, 
    product.averagePrice || Infinity
  );
  const inStockStores = product.stores?.filter(store => store.inStock).length || 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-1">
      {/* Product Image */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="h-16 w-16 text-gray-400" />
          </div>
        )}
        
        {/* Authenticity Badge */}
        {product.authenticity && (
          <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${getAuthenticityColor(product.authenticity.score)}`}>
            <Shield className="h-3 w-3 inline mr-1" />
            {product.authenticity.score}%
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {product.name}
            </h3>
            {product.category && (
              <p className="text-sm text-gray-500 capitalize">{product.category}</p>
            )}
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price Info */}
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {lowestPrice && lowestPrice !== Infinity ? (
                <span className="text-xl font-bold text-gray-900">
                  {formatPrice(lowestPrice)}
                </span>
              ) : product.averagePrice ? (
                <span className="text-xl font-bold text-gray-900">
                  {formatPrice(product.averagePrice)}
                </span>
              ) : (
                <span className="text-sm text-gray-500">Price unavailable</span>
              )}
              
              {priceTrend && (
                <div className={`flex items-center ${priceTrend.color}`}>
                  <priceTrend.icon className="h-4 w-4" />
                </div>
              )}
            </div>
            
            {inStockStores > 0 && (
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-1" />
                {inStockStores} store{inStockStores !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{product.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Store Availability Preview */}
        {showPriceComparison && product.stores && product.stores.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Available at:</span>
              <Link
                to={`/products/${product.id}`}
                className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
              >
                View all
                <ExternalLink className="h-3 w-3 ml-1" />
              </Link>
            </div>
            <div className="mt-1 space-y-1">
              {product.stores.slice(0, 2).map((store, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{store.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{formatPrice(store.price)}</span>
                    <div className={`w-2 h-2 rounded-full ${store.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link
            to={`/products/${product.id}`}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors text-center mr-2"
          >
            View Details
          </Link>
          
          <button
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Add to wishlist"
          >
            <Star className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}