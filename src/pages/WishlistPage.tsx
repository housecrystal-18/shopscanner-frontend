import React, { useState } from 'react';
import { 
  Heart, 
  Plus, 
  Filter, 
  SortAsc, 
  Grid, 
  List, 
  Search, 
  Bell,
  BellOff,
  Folder,
  FolderPlus,
  Star,
  Trash2,
  Edit3,
  ChevronDown,
  AlertCircle,
  TrendingDown,
  Package
} from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import { WishlistItemCard } from '../components/wishlist/WishlistItemCard';
import { WishlistButton } from '../components/wishlist/WishlistButton';
import { CollectionModal } from '../components/wishlist/CollectionModal';
import { CollectionCard } from '../components/wishlist/CollectionCard';
import { PriceDropPanel } from '../components/wishlist/PriceDropPanel';
import { EditWishlistItemModal } from '../components/wishlist/EditWishlistItemModal';
import { WishlistFilters, WishlistSort, WishlistCollection, WishlistItem } from '../types/wishlist';

export function WishlistPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
  const [editingCollection, setEditingCollection] = useState<WishlistCollection | null>(null);
  const [showCollections, setShowCollections] = useState(false);
  const [showPriceDrops, setShowPriceDrops] = useState(false);

  const {
    wishlistItems,
    collections,
    stats,
    priceDrops,
    isLoadingItems,
    isLoadingStats,
    filters,
    sort,
    selectedCollection,
    setSelectedCollection,
    updateFilters,
    updateSort,
    clearFilters,
    createCollection,
    isCreatingCollection,
    isAuthenticated
  } = useWishlist();

  const handleFilterChange = (newFilters: Partial<WishlistFilters>) => {
    updateFilters({ ...filters, ...newFilters });
  };

  const handleSortChange = (newSort: WishlistSort) => {
    updateSort(newSort);
  };

  const filteredItems = wishlistItems.filter(item => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return item.product?.name?.toLowerCase().includes(query) ||
             item.notes?.toLowerCase().includes(query) ||
             item.tags?.some(tag => tag.toLowerCase().includes(query));
    }
    return true;
  });

  const unreadPriceDrops = priceDrops.filter(drop => !drop.isRead);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container py-8">
          <div className="max-w-4xl mx-auto text-center py-12">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Wishlist</h1>
            <p className="text-gray-600 mb-8">
              Sign in to save products you love and track price changes.
            </p>
            <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
                <p className="text-gray-600">
                  {stats?.totalItems || 0} items • 
                  {stats?.collections || 0} collections •
                  Total value: ${(stats?.totalValue || 0).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setShowCollections(!showCollections);
                    setShowPriceDrops(false);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center ${
                    showCollections ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Folder className="h-4 w-4 mr-2" />
                  {showCollections ? 'View Items' : 'Collections'}
                </button>
                <button
                  onClick={() => {
                    setShowPriceDrops(!showPriceDrops);
                    setShowCollections(false);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center ${
                    showPriceDrops ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <TrendingDown className="h-4 w-4 mr-2" />
                  {showPriceDrops ? 'View Items' : 'Price Drops'}
                  {unreadPriceDrops.length > 0 && (
                    <span className="ml-2 bg-green-600 text-white text-xs rounded-full px-2 py-1">
                      {unreadPriceDrops.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setShowCollectionModal(true)}
                  className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
                >
                  <FolderPlus className="h-4 w-4 mr-2" />
                  New Collection
                </button>
              </div>
            </div>

            {/* Price Drop Alerts */}
            {unreadPriceDrops.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <TrendingDown className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      🎉 Price Drops Detected!
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        {unreadPriceDrops.length} item{unreadPriceDrops.length > 1 ? 's' : ''} on your wishlist 
                        {unreadPriceDrops.length === 1 ? ' has' : ' have'} dropped in price.
                      </p>
                    </div>
                    <div className="mt-3">
                      <button className="text-sm font-medium text-green-800 hover:text-green-900">
                        View Price Drops →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Package className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Total Items</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalItems}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TrendingDown className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Price Drops</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.priceDrops}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Star className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">High Priority</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.priorityCounts.high}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Folder className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Collections</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.collections}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search and Collections */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search wishlist..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="relative">
                  <select
                    value={selectedCollection || ''}
                    onChange={(e) => setSelectedCollection(e.target.value || null)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Collections</option>
                    {collections.map(collection => (
                      <option key={collection.id} value={collection.id}>
                        {collection.name} ({collection.itemCount})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* View Controls */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors inline-flex items-center ${
                    showFilters || Object.keys(filters).length > 0
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {Object.keys(filters).length > 0 && (
                    <span className="ml-2 bg-primary-600 text-white text-xs rounded-full px-2 py-1">
                      {Object.keys(filters).length}
                    </span>
                  )}
                </button>

                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                <div className="relative">
                  <select
                    value={`${sort.field}:${sort.direction}`}
                    onChange={(e) => {
                      const [field, direction] = e.target.value.split(':');
                      handleSortChange({ 
                        field: field as WishlistSort['field'], 
                        direction: direction as 'asc' | 'desc' 
                      });
                    }}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="addedAt:desc">Newest First</option>
                    <option value="addedAt:asc">Oldest First</option>
                    <option value="name:asc">Name A-Z</option>
                    <option value="name:desc">Name Z-A</option>
                    <option value="price:asc">Price Low-High</option>
                    <option value="price:desc">Price High-Low</option>
                    <option value="priority:desc">High Priority</option>
                  </select>
                  <SortAsc className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={filters.category || ''}
                      onChange={(e) => handleFilterChange({ category: e.target.value || undefined })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">All Categories</option>
                      {stats?.categoryCounts && Object.keys(stats.categoryCounts).map(category => (
                        <option key={category} value={category}>
                          {category} ({stats.categoryCounts[category]})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={filters.priority || ''}
                      onChange={(e) => handleFilterChange({ priority: e.target.value as any || undefined })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">All Priorities</option>
                      <option value="high">High ({stats?.priorityCounts.high || 0})</option>
                      <option value="medium">Medium ({stats?.priorityCounts.medium || 0})</option>
                      <option value="low">Low ({stats?.priorityCounts.low || 0})</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                    <select
                      value={filters.availability || ''}
                      onChange={(e) => handleFilterChange({ availability: e.target.value as any || undefined })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">All Items</option>
                      <option value="available">In Stock</option>
                      <option value="unavailable">Out of Stock</option>
                      <option value="on_sale">On Sale</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="hasNotes"
                      checked={filters.hasNotes || false}
                      onChange={(e) => handleFilterChange({ hasNotes: e.target.checked || undefined })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="hasNotes" className="ml-2 text-sm text-gray-700">
                      Has Notes
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="hasPriceAlert"
                      checked={filters.hasPriceAlert || false}
                      onChange={(e) => handleFilterChange({ hasPriceAlert: e.target.checked || undefined })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="hasPriceAlert" className="ml-2 text-sm text-gray-700">
                      Price Alerts
                    </label>
                  </div>
                </div>

                {Object.keys(filters).length > 0 && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          {showPriceDrops ? (
            /* Price Drops View */
            <PriceDropPanel />
          ) : showCollections ? (
            /* Collections View */
            isLoadingItems ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading collections...</p>
              </div>
            ) : collections.length === 0 ? (
              <div className="text-center py-12">
                <Folder className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No collections yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create collections to organize your wishlist items by theme, occasion, or any way you like.
                </p>
                <button
                  onClick={() => setShowCollectionModal(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Create Your First Collection
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.map((collection) => (
                  <CollectionCard
                    key={collection.id}
                    collection={collection}
                    onEdit={(collection) => setEditingCollection(collection)}
                  />
                ))}
              </div>
            )
          ) : (
            /* Items View */
            isLoadingItems ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your wishlist...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {wishlistItems.length === 0 ? 'Your wishlist is empty' : 'No items match your filters'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {wishlistItems.length === 0 
                    ? 'Start adding products you love to keep track of them and price changes.'
                    : 'Try adjusting your search or filters to find what you\'re looking for.'
                  }
                </p>
                {wishlistItems.length === 0 && (
                  <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Browse Products
                  </button>
                )}
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {filteredItems.map((item) => (
                  <WishlistItemCard
                    key={item.id}
                    item={item}
                    showCollection={!selectedCollection}
                    onEdit={(item) => setEditingItem(item)}
                  />
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Collection Modal */}
      <CollectionModal
        isOpen={showCollectionModal || !!editingCollection}
        onClose={() => {
          setShowCollectionModal(false);
          setEditingCollection(null);
        }}
        editingCollection={editingCollection}
      />

      {/* Edit Item Modal */}
      <EditWishlistItemModal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        item={editingItem}
      />
    </div>
  );
}