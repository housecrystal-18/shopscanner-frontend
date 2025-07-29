import React, { useEffect } from 'react';
import { 
  ShoppingBag, 
  TrendingUp, 
  Star,
  Search,
  Filter,
  AlertCircle
} from 'lucide-react';
import { ProductSearch } from '../components/product/ProductSearch';
import { ProductGrid } from '../components/product/ProductGrid';
import { useProductSearch } from '../hooks/useProductSearch';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export function ProductsPage() {
  const { isAuthenticated } = useAuth();
  const {
    query,
    filters,
    sort,
    products,
    searchResult,
    categories,
    isLoading,
    error,
    hasResults,
    isSearchActive,
    canSearch,
    remainingSearches,
    setQuery,
    setFilters,
    setSort,
    setPage,
    clearSearch,
  } = useProductSearch();

  // Show upgrade prompt for free users
  const showUpgradePrompt = !canSearch && remainingSearches !== 'unlimited';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Product Database
              </h1>
              <p className="text-lg text-gray-600">
                Search and discover verified products with price comparisons
              </p>
            </div>
            
            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-4 text-sm">
                {remainingSearches !== 'unlimited' && (
                  <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                    <span className="text-gray-600">Searches remaining: </span>
                    <span className="font-semibold text-primary-600">
                      {remainingSearches}
                    </span>
                  </div>
                )}
                <Link
                  to="/scan"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Scan Product
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Usage Limit Warning */}
        {showUpgradePrompt && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-800">
                  Search limit reached
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  You've used all your free searches for this month. 
                  <Link to="/pricing" className="font-medium underline ml-1">
                    Upgrade to Premium
                  </Link> for unlimited searches.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search Interface */}
        <div className="mb-8">
          <ProductSearch
            query={query}
            onQueryChange={setQuery}
            filters={filters}
            onFiltersChange={setFilters}
            sort={sort}
            onSortChange={setSort}
            categories={categories}
            onClear={clearSearch}
            isLoading={isLoading}
          />
        </div>

        {/* Quick Stats */}
        {!isSearchActive && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">25,000+</h3>
                  <p className="text-gray-600">Verified Products</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">500+</h3>
                  <p className="text-gray-600">Partner Stores</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">98%</h3>
                  <p className="text-gray-600">Accuracy Rate</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Search error
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  {error instanceof Error ? error.message : 'An error occurred while searching.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {isSearchActive ? 'Search Results' : 'Popular Products'}
            </h2>
            
            {isSearchActive && hasResults && (
              <button
                onClick={clearSearch}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Clear search
              </button>
            )}
          </div>

          {/* Product Grid */}
          <ProductGrid
            products={products}
            isLoading={isLoading}
            searchResult={searchResult}
            onPageChange={setPage}
            showPriceComparison={true}
            emptyState={
              isSearchActive ? (
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search terms or filters to find what you're looking for.
                  </p>
                  <button
                    onClick={clearSearch}
                    className="text-primary-600 hover:text-primary-700 font-medium flex items-center mx-auto"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Welcome to our product database
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start by searching for products or scanning a barcode to get started.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      to="/scan"
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Scan Product
                    </Link>
                    <button
                      onClick={() => setQuery('popular')}
                      className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Browse Popular
                    </button>
                  </div>
                </div>
              )
            }
          />
        </div>

        {/* Call to Action for Non-authenticated Users */}
        {!isAuthenticated && (
          <div className="mt-12 bg-primary-600 text-white rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              Unlock Full Product Database Access
            </h3>
            <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
              Sign up for free to get unlimited searches, price tracking, and authenticity verification for all products.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Sign Up Free
              </Link>
              <Link
                to="/pricing"
                className="border border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                View Plans
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}