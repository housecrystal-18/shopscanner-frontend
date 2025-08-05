import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  X,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { ProductFilter, ProductSort } from '../../types/product';

interface ProductSearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  filters: ProductFilter | undefined;
  onFiltersChange: (filters: ProductFilter) => void;
  sort: ProductSort | undefined;
  onSortChange: (sort: ProductSort) => void;
  categories: string[];
  onClear: () => void;
  isLoading?: boolean;
}

export function ProductSearch({
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  categories,
  onClear,
  isLoading = false,
}: ProductSearchProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const handleFilterChange = (key: keyof ProductFilter, value: any) => {
    const newFilters = { ...filters, [key]: value };
    if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
      delete newFilters[key];
    }
    onFiltersChange(newFilters);
  };

  const hasActiveFilters = filters && Object.keys(filters).length > 0;
  const hasActiveSort = sort && sort.field;

  const sortOptions = [
    { field: 'name', label: 'Name' },
    { field: 'price', label: 'Price' },
    { field: 'category', label: 'Category' },
    { field: 'createdAt', label: 'Date Added' },
    { field: 'authenticity', label: 'Authenticity Score' },
    { field: 'ratings', label: 'Customer Rating' },
    { field: 'views', label: 'Popularity' },
  ] as const;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 space-y-4">
      {/* Main Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search products by name, barcode, or description..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm md:text-base"
            disabled={isLoading}
          />
          {query && (
            <button
              onClick={() => onQueryChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-colors ${
              hasActiveFilters || showFilters
                ? 'bg-primary-50 border-primary-200 text-primary-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
            {hasActiveFilters && (
              <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {Object.keys(filters).length}
              </span>
            )}
          </button>

          {/* Sort Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-colors ${
                hasActiveSort || showSort
                  ? 'bg-primary-50 border-primary-200 text-primary-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {sort?.order === 'desc' ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
              <span className="hidden sm:inline">Sort</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {/* Sort Dropdown */}
            {showSort && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="p-2">
                  {sortOptions.map((option) => (
                    <div key={option.field} className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          onSortChange({
                            field: option.field,
                            order: sort?.field === option.field && sort?.order === 'asc' ? 'desc' : 'asc'
                          });
                          setShowSort(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          sort?.field === option.field
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {option.label}
                      </button>
                      {sort?.field === option.field && (
                        <div className="px-2">
                          {sort.order === 'asc' ? (
                            <SortAsc className="h-4 w-4 text-primary-600" />
                          ) : (
                            <SortDesc className="h-4 w-4 text-primary-600" />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Clear All */}
          {(query || hasActiveFilters || hasActiveSort) && (
            <button
              onClick={onClear}
              className="flex items-center space-x-1 px-3 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              title="Clear all"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters?.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Any category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <input
                type="text"
                placeholder="Any brand"
                value={filters?.brand || ''}
                onChange={(e) => handleFilterChange('brand', e.target.value || undefined)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters?.minPrice || ''}
                  onChange={(e) => {
                    const minPrice = e.target.value ? parseFloat(e.target.value) : undefined;
                    handleFilterChange('minPrice', minPrice);
                  }}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters?.maxPrice || ''}
                  onChange={(e) => {
                    const maxPrice = e.target.value ? parseFloat(e.target.value) : undefined;
                    handleFilterChange('maxPrice', maxPrice);
                  }}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Authenticity Score Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Authenticity Score
              </label>
              <select
                value={filters?.minAuthenticityScore || ''}
                onChange={(e) => {
                  const score = e.target.value ? parseInt(e.target.value) : undefined;
                  handleFilterChange('minAuthenticityScore', score);
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Any score</option>
                <option value="90">90%+ (Excellent)</option>
                <option value="80">80%+ (Very Good)</option>
                <option value="70">70%+ (Good)</option>
                <option value="60">60%+ (Fair)</option>
              </select>
            </div>
          </div>

          {/* Additional Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Product Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Type
              </label>
              <select
                value={filters?.productType || ''}
                onChange={(e) => handleFilterChange('productType', e.target.value || undefined)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Any type</option>
                <option value="authentic">Authentic</option>
                <option value="unknown">Unknown</option>
                <option value="counterfeit">Counterfeit Risk</option>
              </select>
            </div>

            {/* Checkbox Filters */}
            <div className="space-y-3">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters?.inStock || false}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked || undefined)}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">In stock only</span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters?.verified || false}
                    onChange={(e) => handleFilterChange('verified', e.target.checked || undefined)}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Verified authentic</span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters?.featured || false}
                    onChange={(e) => handleFilterChange('featured', e.target.checked || undefined)}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured products</span>
                </label>
              </div>
            </div>

            {/* Active Filter Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Active Filters
              </label>
              <div className="flex flex-wrap gap-2">
                {hasActiveFilters && Object.entries(filters || {}).map(([key, value]) => {
                  if (!value) return null;
                  
                  const getFilterLabel = () => {
                    switch (key) {
                      case 'category': return `Category: ${value}`;
                      case 'brand': return `Brand: ${value}`;
                      case 'minPrice': return `Min: $${value}`;
                      case 'maxPrice': return `Max: $${value}`;
                      case 'minAuthenticityScore': return `Auth: ${value}%+`;
                      case 'productType': return `Type: ${value}`;
                      case 'inStock': return 'In Stock';
                      case 'verified': return 'Verified';
                      case 'featured': return 'Featured';
                      default: return `${key}: ${value}`;
                    }
                  };

                  return (
                    <button
                      key={key}
                      onClick={() => handleFilterChange(key as keyof ProductFilter, undefined)}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full hover:bg-primary-200 transition-colors"
                    >
                      {getFilterLabel()}
                      <X className="w-3 h-3" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdowns */}
      {showSort && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowSort(false)}
        />
      )}
    </div>
  );
}