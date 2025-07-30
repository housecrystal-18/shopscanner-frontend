// Mock API for development and demo purposes
export const mockApi = {
  // Authentication
  auth: {
    async login(email: string, password: string) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      if (email === 'demo@shopscanner.com' && password === 'demo123') {
        return {
          success: true,
          token: 'mock-jwt-token-12345',
          user: {
            id: 'mock-user-id',
            name: 'Demo User',
            email: 'demo@shopscanner.com',
            type: 'consumer',
            plan: 'free'
          }
        };
      }
      
      throw new Error('Invalid credentials');
    },

    async register(data: any) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        token: 'mock-jwt-token-12345',
        user: {
          id: 'mock-user-id',
          name: data.name,
          email: data.email,
          type: data.type,
          plan: 'free'
        }
      };
    },

    async logout() {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    }
  },

  // Products
  products: {
    async list(params: any = {}) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockProducts = [
        {
          id: '1',
          name: 'iPhone 15 Pro',
          brand: 'Apple',
          price: { current: 999.99, currency: 'USD' },
          category: 'Electronics',
          authenticity: { score: 95, verified: true, productType: 'authentic' },
          images: [{ url: 'https://via.placeholder.com/300x300?text=iPhone+15', isPrimary: true }],
          description: 'Latest iPhone with Pro features'
        },
        {
          id: '2',
          name: 'Nike Air Max 90',
          brand: 'Nike',
          price: { current: 120.00, currency: 'USD' },
          category: 'Footwear',
          authenticity: { score: 88, verified: true, productType: 'authentic' },
          images: [{ url: 'https://via.placeholder.com/300x300?text=Nike+Air+Max', isPrimary: true }],
          description: 'Classic Nike sneakers'
        },
        {
          id: '3',
          name: 'Samsung Galaxy Watch',
          brand: 'Samsung',
          price: { current: 249.99, currency: 'USD' },
          category: 'Electronics',
          authenticity: { score: 75, verified: false, productType: 'unknown' },
          images: [{ url: 'https://via.placeholder.com/300x300?text=Galaxy+Watch', isPrimary: true }],
          description: 'Smart watch with health tracking'
        }
      ];

      return {
        success: true,
        data: mockProducts,
        pagination: {
          page: 1,
          limit: 20,
          total: mockProducts.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      };
    },

    async getById(id: string) {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const product = {
        id,
        name: 'iPhone 15 Pro',
        brand: 'Apple',
        price: { current: 999.99, original: 1099.99, currency: 'USD' },
        category: 'Electronics',
        authenticity: { 
          score: 95, 
          verified: true, 
          productType: 'authentic',
          flags: []
        },
        images: [
          { url: 'https://via.placeholder.com/400x400?text=iPhone+15+Pro', isPrimary: true },
          { url: 'https://via.placeholder.com/400x400?text=iPhone+Back', isPrimary: false }
        ],
        description: 'The iPhone 15 Pro features a titanium design, A17 Pro chip, and advanced camera system.',
        specifications: [
          { name: 'Display', value: '6.1-inch Super Retina XDR' },
          { name: 'Chip', value: 'A17 Pro' },
          { name: 'Storage', value: '128GB' },
          { name: 'Camera', value: '48MP Main + 12MP Ultra Wide' }
        ],
        seller: {
          name: 'Apple Store',
          reputation: { score: 98, reviewCount: 1500 }
        }
      };

      return { success: true, data: product };
    }
  },

  // Barcode scanning
  barcode: {
    async scan(imageData: any) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
      
      return {
        success: true,
        data: {
          barcode: '123456789012',
          confidence: 0.95,
          productInfo: {
            name: 'Coca-Cola Classic',
            brand: 'Coca-Cola',
            category: 'Beverages'
          },
          existingProduct: null
        }
      };
    },

    async lookup(barcode: string) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        success: true,
        data: {
          barcode,
          productInfo: {
            name: 'Product with barcode ' + barcode,
            brand: 'Generic Brand',
            category: 'General',
            suggestedPrice: { current: 29.99, currency: 'USD' }
          },
          existingProduct: null,
          sources: 1
        }
      };
    }
  },

  // Price comparison
  priceComparison: {
    async compare(productId: string) {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate scraping time
      
      return {
        success: true,
        data: {
          product: {
            id: productId,
            name: 'iPhone 15 Pro',
            currentPrice: 999.99,
            currency: 'USD'
          },
          comparisons: [
            {
              retailer: 'Amazon',
              title: 'iPhone 15 Pro 128GB',
              price: 949.99,
              currency: 'USD',
              url: 'https://amazon.com/iphone-15-pro',
              availability: 'In Stock',
              confidence: 95
            },
            {
              retailer: 'Best Buy',
              title: 'Apple iPhone 15 Pro',
              price: 999.99,
              currency: 'USD',
              url: 'https://bestbuy.com/iphone-15-pro',
              availability: 'In Stock',
              confidence: 90
            },
            {
              retailer: 'Walmart',
              title: 'iPhone 15 Pro Smartphone',
              price: 979.99,
              currency: 'USD',
              url: 'https://walmart.com/iphone-15-pro',
              availability: 'Limited Stock',
              confidence: 85
            }
          ],
          bestPrice: 949.99,
          savings: 50.00,
          savingsPercentage: 5,
          searchedRetailers: 3
        }
      };
    },

    async getTrending() {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        data: [
          {
            id: '1',
            name: 'iPhone 15 Pro',
            brand: 'Apple',
            category: 'Electronics',
            currentPrice: 999.99,
            priceChange: -0.05,
            priceChangePercentage: -5,
            firstPrice: 1049.99,
            lastPrice: 999.99
          },
          {
            id: '2',
            name: 'AirPods Pro',
            brand: 'Apple',
            category: 'Electronics',
            currentPrice: 199.99,
            priceChange: -0.1,
            priceChangePercentage: -10,
            firstPrice: 219.99,
            lastPrice: 199.99
          }
        ]
      };
    }
  },

  // Wishlist
  wishlist: {
    async list() {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        data: [
          {
            id: 'default-wishlist',
            name: 'My Favorites',
            itemCount: 2,
            totalValue: 1199.98,
            isDefault: true,
            items: [
              {
                product: {
                  id: '1',
                  name: 'iPhone 15 Pro',
                  price: { current: 999.99, currency: 'USD' },
                  images: [{ url: 'https://via.placeholder.com/150x150?text=iPhone', isPrimary: true }]
                },
                addedAt: new Date().toISOString(),
                priority: 'high'
              },
              {
                product: {
                  id: '2',
                  name: 'AirPods Pro',
                  price: { current: 199.99, currency: 'USD' },
                  images: [{ url: 'https://via.placeholder.com/150x150?text=AirPods', isPrimary: true }]
                },
                addedAt: new Date().toISOString(),
                priority: 'medium'
              }
            ]
          }
        ]
      };
    },

    async addItem(productId: string) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        success: true,
        message: 'Item added to favorites successfully'
      };
    }
  }
};

// Mock API interceptor
export function setupMockApi() {
  console.log('🔧 Mock API enabled - using demo data');
  
  // You can extend this to intercept actual API calls if needed
  return mockApi;
}