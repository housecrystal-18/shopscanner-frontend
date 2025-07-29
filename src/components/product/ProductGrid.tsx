import React from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter,
  Loader,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Product, ProductSearchResult } from '../../types/product';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  searchResult?: ProductSearchResult;
  onPageChange?: (page: number) => void;
  showPriceComparison?: boolean;
  emptyState?: React.ReactNode;
}

export function ProductGrid({
  products,
  isLoading = false,
  searchResult,
  onPageChange,
  showPriceComparison = false,
  emptyState,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="aspect-square bg-gray-200 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        {emptyState || (
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
            <button className="text-primary-600 hover:text-primary-700 font-medium flex items-center mx-auto">
              <Filter className="h-4 w-4 mr-2" />
              Clear all filters
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Info */}
      {searchResult && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {((searchResult.page - 1) * searchResult.limit) + 1}-{Math.min(searchResult.page * searchResult.limit, searchResult.total)} of {searchResult.total} products
          </span>
          {searchResult.totalPages > 1 && (
            <span>
              Page {searchResult.page} of {searchResult.totalPages}
            </span>
          )}
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            showPriceComparison={showPriceComparison}
          />
        ))}
      </div>

      {/* Pagination */}
      {searchResult && searchResult.totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => onPageChange(searchResult.page - 1)}
            disabled={searchResult.page <= 1}
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </button>

          <div className="flex items-center space-x-1">
            {/* First page */}
            {searchResult.page > 3 && (
              <>
                <button
                  onClick={() => onPageChange(1)}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  1
                </button>
                {searchResult.page > 4 && (
                  <span className="px-2 text-gray-400">...</span>
                )}
              </>
            )}

            {/* Current page range */}
            {Array.from({ length: Math.min(5, searchResult.totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(searchResult.totalPages - 4, searchResult.page - 2)) + i;
              if (page > searchResult.totalPages) return null;
              
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-2 text-sm rounded-lg ${
                    page === searchResult.page
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            {/* Last page */}
            {searchResult.page < searchResult.totalPages - 2 && (
              <>
                {searchResult.page < searchResult.totalPages - 3 && (
                  <span className="px-2 text-gray-400">...</span>
                )}
                <button
                  onClick={() => onPageChange(searchResult.totalPages)}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  {searchResult.totalPages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => onPageChange(searchResult.page + 1)}
            disabled={searchResult.page >= searchResult.totalPages}
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}