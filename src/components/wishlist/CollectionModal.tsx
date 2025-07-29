import React, { useState } from 'react';
import { X, Folder, Globe, Lock } from 'lucide-react';
import { useWishlist } from '../../hooks/useWishlist';

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCollection?: { id: string; name: string; description?: string; isPublic: boolean } | null;
}

export function CollectionModal({ isOpen, onClose, editingCollection }: CollectionModalProps) {
  const [name, setName] = useState(editingCollection?.name || '');
  const [description, setDescription] = useState(editingCollection?.description || '');
  const [isPublic, setIsPublic] = useState(editingCollection?.isPublic || false);
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  const { createCollection, isCreatingCollection } = useWishlist();

  const validateForm = () => {
    const newErrors: { name?: string; description?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Collection name is required';
    } else if (name.trim().length < 3) {
      newErrors.name = 'Collection name must be at least 3 characters';
    } else if (name.trim().length > 50) {
      newErrors.name = 'Collection name must be less than 50 characters';
    }

    if (description && description.trim().length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createCollection(name.trim(), description.trim() || undefined, isPublic);
      handleClose();
    } catch (error) {
      console.error('Failed to create collection:', error);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setIsPublic(false);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Folder className="h-5 w-5 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {editingCollection ? 'Edit Collection' : 'Create New Collection'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Collection Name */}
            <div>
              <label htmlFor="collection-name" className="block text-sm font-medium text-gray-700 mb-2">
                Collection Name *
              </label>
              <input
                id="collection-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Holiday Gifts, Tech Gadgets, Home Decor"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                maxLength={50}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {name.length}/50 characters
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="collection-description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="collection-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for your collection..."
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                maxLength={200}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {description.length}/200 characters
              </p>
            </div>

            {/* Privacy Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Privacy Settings
              </label>
              <div className="space-y-3">
                <div
                  className={`relative rounded-lg border p-4 cursor-pointer transition-colors ${
                    !isPublic 
                      ? 'border-primary-200 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setIsPublic(false)}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      checked={!isPublic}
                      onChange={() => setIsPublic(false)}
                      className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <div className="flex items-center">
                        <Lock className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          Private
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Only you can see this collection
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`relative rounded-lg border p-4 cursor-pointer transition-colors ${
                    isPublic 
                      ? 'border-primary-200 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setIsPublic(true)}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      checked={isPublic}
                      onChange={() => setIsPublic(true)}
                      className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          Public
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Anyone can view this collection
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isCreatingCollection || !name.trim()}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {isCreatingCollection ? 'Creating...' : editingCollection ? 'Save Changes' : 'Create Collection'}
          </button>
        </div>
      </div>
    </div>
  );
}