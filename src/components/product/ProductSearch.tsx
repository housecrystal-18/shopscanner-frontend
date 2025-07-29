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
              {sort?.direction === 'desc' ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
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
                            direction: sort?.field === option.field && sort?.direction === 'asc' ? 'desc' : 'asc'
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
                          {sort.direction === 'asc' ? (
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters?.priceRange?.min || ''}
                  onChange={(e) => {
                    const min = e.target.value ? parseFloat(e.target.value) : undefined;
                    handleFilterChange('priceRange', {
                      ...filters?.priceRange,
                      min,
                    });
                  }}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters?.priceRange?.max || ''}
                  onChange={(e) => {
                    const max = e.target.value ? parseFloat(e.target.value) : undefined;
                    handleFilterChange('priceRange', {
                      ...filters?.priceRange,
                      max,
                    });
                  }}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Availability & Verification Filters */}
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