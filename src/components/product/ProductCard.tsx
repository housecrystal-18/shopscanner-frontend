import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Shield, 
  ShieldCheck, 
  ShieldAlert,
  Store,
  Eye,
  Star,
  Tag,
  ShoppingBag,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { Product, PriceTrend } from '../../types/product';
import { useAuth } from '../../contexts/AuthContext';
import { wishlistAPI } from '../../lib/api';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';

interface ProductCardProps {
  product: Product;
  onWishlistToggle?: (productId: string, isAdded: boolean) => void;
  showDetailedView?: boolean;
  className?: string;
}

export function ProductCard({ 
  product, 
  onWishlistToggle, 
  showDetailedView = false, 
  className 
}: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const [isInWishlist, setIsInWishlist] = React.useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = React.useState(false);
  // Calculate price trend
  const getPriceTrend = (): { trend: PriceTrend; changePercent: number; changeAmount: number } => {
    if (!product.priceHistory || product.priceHistory.length < 2) {
      return { trend: 'stable', changePercent: 0, changeAmount: 0 };
    }

    const recent = product.priceHistory[product.priceHistory.length - 1];
    const previous = product.priceHistory[product.priceHistory.length - 2];
    
    const changeAmount = recent.price - previous.price;
    const changePercent = (changeAmount / previous.price) * 100;
    
    if (Math.abs(changePercent) < 1) return { trend: 'stable', changePercent, changeAmount };
    return { trend: changeAmount > 0 ? 'up' : 'down', changePercent, changeAmount };
  };

  const priceTrend = getPriceTrend();

  // Get authenticity badge info
  const getAuthenticityBadge = () => {
    const { score, verified, productType } = product.authenticity;
    
    if (verified && productType === 'authentic') {
      return {
        icon: ShieldCheck,
        text: 'Verified Authentic',
        color: 'bg-green-100 text-green-800 border-green-200',
        iconColor: 'text-green-600'
      };
    }
    
    if (productType === 'counterfeit') {
      return {
        icon: ShieldAlert,
        text: 'Counterfeit Risk',
        color: 'bg-red-100 text-red-800 border-red-200',
        iconColor: 'text-red-600'
      };
    }
    
    if (score >= 80) {
      return {
        icon: Shield,
        text: `${score}% Authentic`,
        color: 'bg-green-100 text-green-800 border-green-200',
        iconColor: 'text-green-600'
      };
    }
    
    if (score >= 60) {
      return {
        icon: Shield,
        text: `${score}% Authentic`,
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        iconColor: 'text-yellow-600'
      };
    }
    
    return {
      icon: ShieldAlert,
      text: `${score}% Risk`,
      color: 'bg-red-100 text-red-800 border-red-200',
      iconColor: 'text-red-600'
    };
  };

  const authenticityBadge = getAuthenticityBadge();

  // Get price trend icon
  const PriceTrendIcon = priceTrend.trend === 'up' ? TrendingUp : 
                       priceTrend.trend === 'down' ? TrendingDown : Minus;

  // Handle wishlist toggle
  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please sign in to add items to your wishlist');
      return;
    }

    setIsAddingToWishlist(true);
    try {
      if (isInWishlist) {
        // Remove from wishlist logic would go here
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
        onWishlistToggle?.(product.id, false);
      } else {
        await wishlistAPI.quickAddToFavorites({
          productId: product.id,
          notes: `Added ${product.name}`,
        });
        setIsInWishlist(true);
        toast.success('Added to wishlist');
        onWishlistToggle?.(product.id, true);
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  // Get primary image
  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];

  // Count in-stock stores
  const inStockStores = product.storeAvailability?.filter(store => store.inStock).length || 0;
  const totalStores = product.storeAvailability?.length || 0;

  return (
    <div className={cn(
      "bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 overflow-hidden group",
      className
    )}>
      <Link to={`/products/${product.id}`} className="block">
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Store className="w-12 h-12" />
            </div>
          )}
          
          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            disabled={isAddingToWishlist}
            className={cn(
              "absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200",
              isInWishlist 
                ? "bg-red-500 text-white hover:bg-red-600" 
                : "bg-white/80 text-gray-600 hover:bg-white hover:text-red-500"
            )}
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={cn("w-4 h-4", isInWishlist && "fill-current")} />
          </button>

          {/* Featured Badge */}
          {product.featured && (
            <div className="absolute top-3 left-3 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              Featured
            </div>
          )}

          {/* Stock Status */}
          <div className="absolute bottom-3 left-3">
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm",
              product.availability.inStock 
                ? "bg-green-500/90 text-white" 
                : "bg-red-500/90 text-white"
            )}>
              <div className={cn(
                "w-2 h-2 rounded-full",
                product.availability.inStock ? "bg-white" : "bg-white"
              )} />
              {product.availability.inStock ? 'In Stock' : 'Out of Stock'}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Authenticity Badge */}
          <div className="flex items-center justify-between mb-2">
            <div className={cn(
              "inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border",
              authenticityBadge.color
            )}>
              <authenticityBadge.icon className={cn("w-3 h-3", authenticityBadge.iconColor)} />
              {authenticityBadge.text}
            </div>
            
            {/* Views */}
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Eye className="w-3 h-3" />
              {product.views.toLocaleString()}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-2">
            {/* Brand & Category */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {product.brand && (
                <>
                  <span className="font-medium">{product.brand}</span>
                  <span>•</span>
                </>
              )}
              <span>{product.category}</span>
            </div>

            {/* Product Name */}
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>

            {/* Price Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900">
                  ${product.price.current.toFixed(2)}
                </span>
                {product.price.original && product.price.original > product.price.current && (
                  <span className="text-sm text-gray-500 line-through">
                    ${product.price.original.toFixed(2)}
                  </span>
                )}
              </div>
              
              {/* Price Trend */}
              {priceTrend.trend !== 'stable' && (
                <div className={cn(
                  "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                  priceTrend.trend === 'up' 
                    ? "bg-red-100 text-red-700" 
                    : "bg-green-100 text-green-700"
                )}>
                  <PriceTrendIcon className="w-3 h-3" />
                  {Math.abs(priceTrend.changePercent).toFixed(1)}%
                </div>
              )}
            </div>

            {/* Store Availability */}
            {totalStores > 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Store className="w-3 h-3" />
                <span>{inStockStores}/{totalStores} stores in stock</span>
              </div>
            )}

            {/* Ratings */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium">{product.ratings.average.toFixed(1)}</span>
              </div>
              <span className="text-xs text-gray-500">
                ({product.ratings.count.toLocaleString()} reviews)
              </span>
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {product.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                  >
                    <Tag className="w-2 h-2" />
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
          </div>
        </div>
      </Link>
    </div>
  );
}