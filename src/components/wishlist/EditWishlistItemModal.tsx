import React, { useState, useEffect } from 'react';
import { 
  X, 
  Star, 
  Bell, 
  BellOff, 
  Tag, 
  Plus,
  Minus,
  DollarSign,
  AlertCircle,
  Package
} from 'lucide-react';
import { WishlistItem, WishlistItemUpdate } from '../../types/wishlist';
import { useWishlist } from '../../hooks/useWishlist';

interface EditWishlistItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: WishlistItem | null;
}

export function EditWishlistItemModal({ isOpen, onClose, item }: EditWishlistItemModalProps) {
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [targetPrice, setTargetPrice] = useState('');
  const [priceAlertEnabled, setPriceAlertEnabled] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<{ targetPrice?: string; notes?: string }>({});

  const { updateWishlistItem, isUpdatingItem } = useWishlist();

  useEffect(() => {
    if (item) {
      setNotes(item.notes || '');
      setPriority(item.priority);
      setTargetPrice(item.targetPrice ? item.targetPrice.toString() : '');
      setPriceAlertEnabled(item.priceAlertEnabled || false);
      setTags(item.tags || []);
    }
  }, [item]);

  const validateForm = () => {
    const newErrors: { targetPrice?: string; notes?: string } = {};

    if (targetPrice && (isNaN(Number(targetPrice)) || Number(targetPrice) <= 0)) {
      newErrors.targetPrice = 'Please enter a valid price';
    }

    if (notes && notes.length > 500) {
      newErrors.notes = 'Notes must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!item || !validateForm()) {
      return;
    }

    const updates: WishlistItemUpdate = {
      notes: notes.trim() || undefined,
      priority,
      targetPrice: targetPrice ? Number(targetPrice) : undefined,
      priceAlertEnabled,
      tags: tags.length > 0 ? tags : undefined,
    };

    try {
      await updateWishlistItem(item.id, updates);
      handleClose();
    } catch (error) {
      console.error('Failed to update wishlist item:', error);
    }
  };

  const handleClose = () => {
    setNotes('');
    setPriority('medium');
    setTargetPrice('');
    setPriceAlertEnabled(false);
    setTags([]);
    setNewTag('');
    setErrors({});
    onClose();
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 10) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const getPriorityColor = (priorityLevel: string) => {
    switch (priorityLevel) {
      case 'high':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getCurrentPrice = () => {
    if (!item?.product?.stores) return null;
    const inStockStores = item.product.stores.filter(s => s.inStock);
    if (inStockStores.length === 0) return null;
    return Math.min(...inStockStores.map(s => s.price));
  };

  const currentPrice = getCurrentPrice();

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Package className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Wishlist Item</h2>
              <p className="text-sm text-gray-600 truncate max-w-md">
                {item.product?.name || 'Product'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                {item.product?.imageUrl ? (
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">
                  {item.product?.name || 'Product Name'}
                </h3>
                {currentPrice && (
                  <p className="text-sm text-gray-600">
                    Current price: <span className="font-semibold">${currentPrice.toFixed(2)}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['low', 'medium', 'high'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setPriority(level)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                    priority === level
                      ? getPriorityColor(level)
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center mb-1">
                    <Star className={`h-4 w-4 ${priority === level ? 'fill-current' : ''}`} />
                  </div>
                  <span className="text-sm font-medium capitalize">{level}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Target Price & Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="target-price" className="block text-sm font-medium text-gray-700 mb-2">
                Target Price (Optional)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="target-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="0.00"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.targetPrice ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.targetPrice && (
                <p className="mt-1 text-sm text-red-600">{errors.targetPrice}</p>
              )}
              {currentPrice && targetPrice && Number(targetPrice) < currentPrice && (
                <p className="mt-1 text-sm text-green-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Target is below current price
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Alerts
              </label>
              <button
                type="button"
                onClick={() => setPriceAlertEnabled(!priceAlertEnabled)}
                className={`w-full p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center space-x-2 ${
                  priceAlertEnabled
                    ? 'border-primary-200 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {priceAlertEnabled ? (
                  <>
                    <Bell className="h-4 w-4" />
                    <span className="font-medium">Alerts On</span>
                  </>
                ) : (
                  <>
                    <BellOff className="h-4 w-4" />
                    <span className="font-medium">Alerts Off</span>
                  </>
                )}
              </button>
              <p className="mt-1 text-xs text-gray-500">
                Get notified when the price drops
              </p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this item..."
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${
                errors.notes ? 'border-red-300' : 'border-gray-300'
              }`}
              maxLength={500}
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {notes.length}/500 characters
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (Optional)
            </label>
            
            {/* Existing Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 p-0.5 hover:bg-primary-200 rounded-full transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add New Tag */}
            {tags.length < 10 && (
              <div className="flex space-x-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a tag..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    maxLength={20}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!newTag.trim() || tags.includes(newTag.trim())}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700 rounded-lg transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}
            
            <p className="mt-1 text-xs text-gray-500">
              {tags.length}/10 tags • Press Enter or click + to add
            </p>
          </div>
        </form>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUpdatingItem}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {isUpdatingItem ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}