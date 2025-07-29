import React, { useState } from 'react';
import { Heart, Plus, Check, Loader } from 'lucide-react';
import { useWishlist } from '../../hooks/useWishlist';

interface WishlistButtonProps {
  productId: string;
  variant?: 'icon' | 'button' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function WishlistButton({ 
  productId, 
  variant = 'icon',
  size = 'md',
  showText = false,
  className = '' 
}: WishlistButtonProps) {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const { 
    isInWishlist, 
    addToWishlist, 
    removeFromWishlist, 
    getWishlistItem,
    isAddingToWishlist, 
    isRemovingFromWishlist,
    isAuthenticated 
  } = useWishlist();

  const inWishlist = isInWishlist(productId);
  const wishlistItem = getWishlistItem(productId);
  const isLoading = isAddingToWishlist || isRemovingFromWishlist;

  const handleToggle = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!isAuthenticated) {
      // Could trigger auth modal here
      return;
    }

    try {
      if (inWishlist && wishlistItem) {
        await removeFromWishlist(wishlistItem.id);
      } else {
        await addToWishlist(productId, {
          priority: 'medium',
        });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-8 w-8 text-xs';
      case 'lg':
        return 'h-12 w-12 text-lg';
      default:
        return 'h-10 w-10 text-sm';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-6 w-6';
      default:
        return 'h-5 w-5';
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading || !isAuthenticated}
        className={`
          ${getSizeClasses()}
          rounded-full transition-all duration-200 flex items-center justify-center
          ${inWishlist 
            ? 'text-red-500 bg-red-50 hover:bg-red-100' 
            : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
          }
          ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {isLoading ? (
          <Loader className={`${getIconSize()} animate-spin`} />
        ) : (
          <Heart className={`${getIconSize()} ${inWishlist ? 'fill-current' : ''}`} />
        )}
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading || !isAuthenticated}
        className={`
          inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
          ${inWishlist
            ? 'text-red-600 bg-red-50 hover:bg-red-100 border border-red-200'
            : 'text-gray-600 bg-white hover:bg-gray-50 border border-gray-300 hover:border-red-300'
          }
          ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
      >
        {isLoading ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : inWishlist ? (
          <Check className="h-4 w-4" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        {showText && (
          <span>{inWishlist ? 'In Wishlist' : 'Add to Wishlist'}</span>
        )}
      </button>
    );
  }

  // Button variant
  return (
    <button
      onClick={handleToggle}
      disabled={isLoading || !isAuthenticated}
      className={`
        inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
        ${inWishlist
          ? 'text-red-600 bg-red-50 hover:bg-red-100 border border-red-200'
          : 'text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 hover:border-red-300'
        }
        ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {isLoading ? (
        <Loader className="h-5 w-5 animate-spin" />
      ) : (
        <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current text-red-500' : ''}`} />
      )}
      <span>
        {isLoading 
          ? 'Updating...' 
          : inWishlist 
            ? 'In Wishlist' 
            : 'Add to Wishlist'
        }
      </span>
    </button>
  );
}