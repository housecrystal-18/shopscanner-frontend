import { useState } from 'react';
import { 
  Package, 
  DollarSign, 
  Store, 
  ExternalLink, 
  Edit2, 
  Plus,
  TrendingUp,
  Clock,
  Scan,
  Shield,
  Search
} from 'lucide-react';
import { useStoreAnalysis } from '../../hooks/useStoreAnalysis';
import { useCrossPlatformSearch } from '../../hooks/useCrossPlatformSearch';
import { CrossPlatformAnalysis } from '../analysis/CrossPlatformAnalysis';

interface Product {
  id: string;
  name: string;
  barcode: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  averagePrice?: number;
  priceHistory?: Array<{
    price: number;
    source: string;
    timestamp: string;
  }>;
  stores?: Array<{
    name: string;
    price: number;
    url?: string;
    inStock: boolean;
    lastUpdated: string;
  }>;
}

interface ProductResultProps {
  barcode: string;
  product?: Product;
  isNewProduct: boolean;
  isLoading: boolean;
  onAddProduct: (productData: Omit<Product, 'id'>) => Promise<void>;
  onUpdateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  onRescan: () => void;
  onNewScan: () => void;
}

export function ProductResult({
  barcode,
  product,
  isNewProduct,
  isLoading,
  onAddProduct,
  onUpdateProduct,
  onRescan,
  onNewScan,
}: ProductResultProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || '',
    imageUrl: product?.imageUrl || '',
  });

  const { analyzeStore, isAnalyzing } = useStoreAnalysis();
  const { searchAcrossPlatforms, isSearching } = useCrossPlatformSearch();

  const [showCrossPlatformSearch, setShowCrossPlatformSearch] = useState(false);

  const handleAnalyzeStore = async (url: string) => {
    try {
      await analyzeStore(url, product);
    } catch (error) {
      console.error('Store analysis failed:', error);
    }
  };

  const handleCrossPlatformSearch = async () => {
    if (!product) return;
    
    try {
      const firstStoreUrl = product.stores?.[0]?.url;
      if (firstStoreUrl) {
        await searchAcrossPlatforms(firstStoreUrl, product.name, product);
        setShowCrossPlatformSearch(true);
      }
    } catch (error) {
      console.error('Cross-platform search failed:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isNewProduct) {
        await onAddProduct({
          ...formData,
          barcode,
        } as Omit<Product, 'id'>);
        setShowAddForm(false);
      } else if (product) {
        await onUpdateProduct(product.id, formData);
        setIsEditing(false);
      }
      
      setFormData({
        name: '',
        description: '',
        category: '',
        imageUrl: '',
      });
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4"></div>
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-primary-100 p-2 rounded-lg mr-3">
              <Package className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Scan Result</h3>
              <p className="text-sm text-gray-600">Barcode: {barcode}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onRescan}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Rescan"
            >
              <Scan className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {isNewProduct ? (
          /* New Product */
          <div className="text-center py-8">
            <div className="bg-yellow-100 p-4 rounded-lg mb-6">
              <Plus className="h-12 w-12 text-yellow-600 mx-auto mb-2" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                New Product
              </h4>
              <p className="text-gray-600">
                This barcode is not in our database yet. Would you like to add it?
              </p>
            </div>
            
            {!showAddForm ? (
              <div className="space-y-3">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="btn-primary w-full"
                >
                  Add Product Information
                </button>
                <button
                  onClick={onNewScan}
                  className="btn-secondary w-full"
                >
                  Scan Another Product
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="Enter product name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="Enter product description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Electronics, Food, Books"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="input-field"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    Add Product
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : product ? (
          /* Existing Product */
          <div>
            {!isEditing ? (
              <div>
                {/* Product Info */}
                <div className="flex items-start mb-6">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg mr-4 bg-gray-100"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg mr-4 flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900 mb-1">
                          {product.name}
                        </h4>
                        {product.category && (
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
                            {product.category}
                          </span>
                        )}
                        {product.description && (
                          <p className="text-gray-600 text-sm">{product.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Edit product"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Price Information */}
                {product.averagePrice && (
                  <div className="bg-green-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center mb-2">
                      <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-medium text-green-900">Average Price</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900">
                      {formatPrice(product.averagePrice)}
                    </p>
                  </div>
                )}

                {/* Store Prices */}
                {product.stores && product.stores.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <Store className="h-5 w-5 text-gray-600 mr-2" />
                      <h5 className="font-medium text-gray-900">Available at stores</h5>
                    </div>
                    <div className="space-y-3">
                      {product.stores.map((store, index) => (
                        <div
                          key={index}
                          className="border rounded-lg p-4 flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <div className="mr-3">
                              <h6 className="font-medium text-gray-900">{store.name}</h6>
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="h-3 w-3 mr-1" />
                                Updated {formatDate(store.lastUpdated)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">
                              {formatPrice(store.price)}
                            </p>
                            <div className="flex items-center text-sm">
                              <span className={`inline-flex items-center ${
                                store.inStock ? 'text-green-600' : 'text-red-600'
                              }`}>
                                <div className={`w-2 h-2 rounded-full mr-1 ${
                                  store.inStock ? 'bg-green-600' : 'bg-red-600'
                                }`}></div>
                                {store.inStock ? 'In Stock' : 'Out of Stock'}
                              </span>
                              {store.url && (
                                <div className="ml-2 flex items-center space-x-1">
                                  <a
                                    href={store.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                  <button
                                    onClick={() => store.url && handleAnalyzeStore(store.url)}
                                    disabled={isAnalyzing || !store.url}
                                    className="text-purple-600 hover:text-purple-800 disabled:opacity-50"
                                    title="Analyze store authenticity"
                                  >
                                    <Shield className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price History */}
                {product.priceHistory && product.priceHistory.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <TrendingUp className="h-5 w-5 text-gray-600 mr-2" />
                      <h5 className="font-medium text-gray-900">Price History</h5>
                    </div>
                    <div className="space-y-2">
                      {product.priceHistory.slice(0, 5).map((entry, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {entry.source} - {formatDate(entry.timestamp)}
                          </span>
                          <span className="font-medium">{formatPrice(entry.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3 pt-4 border-t">
                  {product && product.stores && product.stores.length > 0 && (
                    <button 
                      onClick={handleCrossPlatformSearch}
                      disabled={isSearching}
                      className="btn-primary w-full inline-flex items-center justify-center"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      {isSearching ? 'Searching...' : 'Find This Product on Other Platforms'}
                    </button>
                  )}
                  
                  <div className="flex space-x-3">
                    <button onClick={onNewScan} className="btn-secondary flex-1">
                      Scan Another Product
                    </button>
                    <button onClick={onRescan} className="btn-secondary">
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="input-field"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    Update Product
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* Error State */
          <div className="text-center py-8">
            <div className="bg-red-100 p-4 rounded-lg mb-6">
              <Package className="h-12 w-12 text-red-600 mx-auto mb-2" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Product Not Found
              </h4>
              <p className="text-gray-600">
                We couldn't find this product in our database.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary w-full"
              >
                Add This Product
              </button>
              <button
                onClick={onNewScan}
                className="btn-secondary w-full"
              >
                Scan Another Product
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Cross-Platform Search Results */}
      {showCrossPlatformSearch && (
        <div className="mt-6">
          <CrossPlatformAnalysis 
            originalUrl={product?.stores?.[0]?.url}
            productName={product?.name}
            productData={product}
            onAnalysisComplete={() => {}}
          />
        </div>
      )}
    </div>
  );
}