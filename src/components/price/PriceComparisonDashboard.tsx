import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingDown, 
  Store, 
  Shield,
  AlertCircle,
  RefreshCw,
  Filter,
  SortAsc,
  SortDesc,
  Star,
  ExternalLink
} from 'lucide-react';
import { PriceComparisonCard } from './PriceComparisonCard';
import { PriceTrendChart } from './PriceTrendChart';
import { PriceAlertManager } from './PriceAlertManager';
import { usePriceComparison } from '../../hooks/usePriceComparison';
import { PriceComparisonFilters, PriceComparisonSort } from '../../types/priceComparison';

interface PriceComparisonDashboardProps {
  productId: string;
  productName?: string;
  productImage?: string;
}

export function PriceComparisonDashboard({ 
  productId, 
  productName,
  productImage 
}: PriceComparisonDashboardProps) {
  const [selectedTrendPeriod, setSelectedTrendPeriod] = useState<'24h' | '7d' | '30d' | '90d'>('30d');
  const [showFilters, setShowFilters] = useState(false);

  const {
    priceComparison,
    priceTrend,
    priceAlerts,
    bestDeal,
    potentialSavings,
    isLoadingComparison,
    isLoadingTrend,
    isLoadingAlerts,
    comparisonError,
    filters,
    sort,
    updateFilters,
    updateSort,
    createPriceAlert,
    deletePriceAlert,
    refetchComparison,
    isCreatingAlert,
    isDeletingAlert,
    canUsePriceComparison,
    remainingComparisons,
  } = usePriceComparison(productId);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleFilterChange = (key: keyof PriceComparisonFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
      delete newFilters[key];
    }
    updateFilters(newFilters);
  };

  const handleSortChange = (field: PriceComparisonSort['field']) => {
    const newDirection = sort?.field === field && sort?.direction === 'asc' ? 'desc' : 'asc';
    updateSort({ field, direction: newDirection });
  };

  const handleVisitStore = (url: string) => {
    // Track store visit for analytics
    window.open(url, '_blank');
  };

  // Usage limit check
  if (!canUsePriceComparison && remainingComparisons !== 'unlimited') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Price comparison limit reached
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              You've used all your free price comparisons for this month. 
              <a href="/pricing" className="font-medium underline ml-1">
                Upgrade to Premium
              </a> for unlimited comparisons.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (comparisonError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Error loading price comparison
            </h3>
            <p className="text-sm text-red-700 mt-1">
              {comparisonError instanceof Error ? comparisonError.message : 'Failed to load price data.'}
            </p>
            <button
              onClick={() => refetchComparison()}
              className="mt-3 text-red-600 hover:text-red-700 font-medium text-sm flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            {productImage && (
              <img
                src={productImage}
                alt={productName}
                className="w-16 h-16 object-cover rounded-lg"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Price Comparison
              </h1>
              {productName && (
                <p className="text-lg text-gray-600">{productName}</p>
              )}
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                {remainingComparisons !== 'unlimited' && (
                  <span>Comparisons remaining: {remainingComparisons}</span>
                )}
                <button
                  onClick={() => refetchComparison()}
                  disabled={isLoadingComparison}
                  className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${isLoadingComparison ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          {priceComparison && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatPrice(priceComparison.lowestPrice)}
                </div>
                <div className="text-sm text-gray-600">Lowest Price</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {priceComparison.stores.filter(s => s.inStock).length}
                </div>
                <div className="text-sm text-gray-600">Stores Available</div>
              </div>
              
              {potentialSavings && potentialSavings.amount > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatPrice(potentialSavings.amount)}
                  </div>
                  <div className="text-sm text-gray-600">Potential Savings</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filters and Sort */}
      {priceComparison && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {Object.keys(filters).length > 0 && (
                <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {Object.keys(filters).length}
                </span>
              )}
            </button>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              {['price', 'rating', 'name'].map((field) => (
                <button
                  key={field}
                  onClick={() => handleSortChange(field as PriceComparisonSort['field'])}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    sort?.field === field
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="capitalize">{field}</span>
                  {sort?.field === field && (
                    sort.direction === 'asc' ? 
                      <SortAsc className="h-3 w-3" /> : 
                      <SortDesc className="h-3 w-3" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Price
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrice || ''}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Any"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Rating
                  </label>
                  <select
                    value={filters.minRating || ''}
                    onChange={(e) => handleFilterChange('minRating', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Any rating</option>
                    <option value="4">4+ stars</option>
                    <option value="3">3+ stars</option>
                    <option value="2">2+ stars</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.inStockOnly || false}
                      onChange={(e) => handleFilterChange('inStockOnly', e.target.checked || undefined)}
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">In stock only</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.freeShipping || false}
                      onChange={(e) => handleFilterChange('freeShipping', e.target.checked || undefined)}
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Free shipping</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.hasDiscount || false}
                      onChange={(e) => handleFilterChange('hasDiscount', e.target.checked || undefined)}
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">On sale</span>
                  </label>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => updateFilters({})}
                    className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Price Comparison Grid */}
      {isLoadingComparison ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="h-6 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 bg-gray-200 rounded animate-pulse w-1/2" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : priceComparison?.stores.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {priceComparison.stores.map((store, index) => (
            <PriceComparisonCard
              key={`${store.name}-${index}`}
              store={store}
              isBestDeal={bestDeal?.name === store.name}
              averagePrice={priceComparison.averagePrice}
              onVisitStore={handleVisitStore}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Stores Found
          </h3>
          <p className="text-gray-600 mb-6">
            We couldn't find any stores selling this product at the moment.
          </p>
          <button
            onClick={() => refetchComparison()}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Refresh Search
          </button>
        </div>
      )}

      {/* Price Trend Chart */}
      {!isLoadingTrend && priceTrend && (
        <PriceTrendChart
          trends={priceTrend}
          selectedPeriod={selectedTrendPeriod}
          onPeriodChange={setSelectedTrendPeriod}
        />
      )}

      {/* Price Alerts */}
      <PriceAlertManager
        alerts={priceAlerts}
        currentPrice={priceComparison?.lowestPrice}
        productName={productName}
        onCreateAlert={createPriceAlert}
        onDeleteAlert={deletePriceAlert}
        isCreating={isCreatingAlert}
        isDeleting={isDeletingAlert}
      />
    </div>
  );
}