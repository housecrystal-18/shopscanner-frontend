import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Shield, 
  Star,
  Tag,
  Calendar,
  Loader
} from 'lucide-react';
import { api } from '../lib/api';
import { Product } from '../types/product';
import { PriceComparisonDashboard } from '../components/price/PriceComparisonDashboard';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  // Fetch product details
  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['product', id],
    queryFn: async (): Promise<Product> => {
      if (!id) throw new Error('Product ID is required');
      
      const response = await api.get(`/api/products/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  const getAuthenticityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <Loader className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading product details...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container py-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Product Not Found
              </h2>
              <p className="text-gray-600 mb-6">
                The product you're looking for doesn't exist or has been removed.
              </p>
              <Link
                to="/products"
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              to="/products"
              className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
          </div>

          {/* Product Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Image */}
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="h-24 w-24 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {product.name}
                      </h1>
                      {product.category && (
                        <div className="flex items-center space-x-2 mb-2">
                          <Tag className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600 capitalize">{product.category}</span>
                        </div>
                      )}
                    </div>

                    {/* Authenticity Badge */}
                    {product.authenticity && (
                      <div className={`px-3 py-2 rounded-lg ${getAuthenticityColor(product.authenticity.score)}`}>
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4" />
                          <span className="font-semibold">{product.authenticity.score}% Authentic</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  {product.averagePrice && (
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900">
                        {formatPrice(product.averagePrice)}
                      </span>
                      <span className="text-gray-600 ml-2">Average Price</span>
                    </div>
                  )}

                  {/* Description */}
                  {product.description && (
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {product.description}
                    </p>
                  )}
                </div>

                {/* Product Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Barcode</div>
                      <div className="font-mono text-sm text-gray-900">{product.barcode}</div>
                    </div>
                    
                    {product.stores && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">Available Stores</div>
                        <div className="font-semibold text-gray-900">
                          {product.stores.filter(s => s.inStock).length} stores
                        </div>
                      </div>
                    )}
                  </div>

                  {product.createdAt && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Added {formatDate(product.createdAt)}
                    </div>
                  )}
                </div>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Authenticity Details */}
                {product.authenticity && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Authenticity Factors
                    </h3>
                    <div className="space-y-2">
                      {product.authenticity.factors.map((factor, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                          <span className="text-gray-700">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Price Comparison Dashboard */}
          <PriceComparisonDashboard
            productId={product.id}
            productName={product.name}
            productImage={product.imageUrl}
          />
        </div>
      </div>
    </div>
  );
}