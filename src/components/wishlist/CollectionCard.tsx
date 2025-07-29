import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Folder, 
  FolderOpen, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff,
  Calendar,
  Package,
  Globe,
  Lock
} from 'lucide-react';
import { WishlistCollection } from '../../types/wishlist';
import { useWishlist } from '../../hooks/useWishlist';

interface CollectionCardProps {
  collection: WishlistCollection;
  onEdit: (collection: WishlistCollection) => void;
}

export function CollectionCard({ collection, onEdit }: CollectionCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { deleteCollection, isDeletingCollection } = useWishlist();

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const handleDelete = async () => {
    try {
      await deleteCollection(collection.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete collection:', error);
    }
  };

  const recentItems = collection.items.slice(0, 4);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Folder className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <Link
                to={`/wishlist/collections/${collection.id}`}
                className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
              >
                {collection.name}
              </Link>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center text-xs text-gray-500">
                  {collection.isPublic ? (
                    <>
                      <Globe className="h-3 w-3 mr-1" />
                      Public
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3 mr-1" />
                      Private
                    </>
                  )}
                </div>
                <span className="text-gray-300">•</span>
                <div className="flex items-center text-xs text-gray-500">
                  <Package className="h-3 w-3 mr-1" />
                  {collection.itemCount} items
                </div>
              </div>
            </div>
          </div>

          {/* Actions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                <button
                  onClick={() => {
                    onEdit(collection);
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <Edit3 className="h-4 w-4 mr-3" />
                  Edit Collection
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-3" />
                  Delete Collection
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {collection.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {collection.description}
          </p>
        )}

        {/* Tags */}
        {collection.tags && collection.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {collection.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {collection.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{collection.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Preview Items */}
      {recentItems.length > 0 && (
        <div className="px-6 pb-4">
          <div className="grid grid-cols-4 gap-2">
            {recentItems.map((item, index) => (
              <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {item.product?.imageUrl ? (
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-4 w-4 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            <span>Updated {formatDate(collection.updatedAt)}</span>
          </div>
          <Link
            to={`/wishlist/collections/${collection.id}`}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View Collection →
          </Link>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Collection
                </h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{collection.name}"? This action cannot be undone. 
                Items in this collection will not be deleted from your wishlist.
              </p>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeletingCollection}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeletingCollection}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition-colors"
                >
                  {isDeletingCollection ? 'Deleting...' : 'Delete Collection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click overlay to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}