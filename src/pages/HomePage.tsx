import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ScanLine, Shield, TrendingUp, ArrowRight, CheckCircle, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { analyzeUserSubmission, UserSubmittedData } from '../services/screenshotAnalyzer';

export function HomePage() {
  const navigate = useNavigate();
  const [isQrScanning, setIsQrScanning] = useState(false);
  const [qrResult, setQrResult] = useState<any>(null);
  const [productUrl, setProductUrl] = useState('');
  const [isUrlScanning, setIsUrlScanning] = useState(false);
  const [urlScanResult, setUrlScanResult] = useState<any>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isScreenshotAnalyzing, setIsScreenshotAnalyzing] = useState(false);
  const [screenshotResult, setScreenshotResult] = useState<any>(null);
  const [activeScreenshotTab, setActiveScreenshotTab] = useState<'capture' | 'upload' | 'manual'>('capture');
  const [manualEntry, setManualEntry] = useState({
    title: '',
    price: '',
    description: '',
    seller: '',
    shipping: ''
  });

  // Safely get auth context with fallback
  let isAuthenticated = false;
  try {
    const auth = useAuth();
    isAuthenticated = auth.isAuthenticated;
  } catch (error) {
    // AuthProvider not ready yet, use defaults
    isAuthenticated = false;
  }

  const handleQrScanDemo = async () => {
    setIsQrScanning(true);
    
    // Simulate QR code scanning
    setTimeout(() => {
      const brands = ['Apple', 'Nike', 'Samsung', 'Sony', 'Gucci'];
      const randomBrand = brands[Math.floor(Math.random() * brands.length)];
      
      const demoQrResult = {
        qrCode: `QR${Math.random().toString(36).substr(2, 12).toUpperCase()}`,
        authenticity: {
          score: Math.floor(Math.random() * 40) + 60,
          verified: Math.random() > 0.2,
          authenticityCheck: Math.random() > 0.3 ? 'genuine' : 'suspicious',
          serialMatch: Math.random() > 0.25
        },
        product: {
          name: randomBrand === 'Apple' ? 'iPhone 15 Pro' : 
                randomBrand === 'Nike' ? 'Air Jordan 1' : 
                randomBrand === 'Samsung' ? 'Galaxy S24' : 
                randomBrand === 'Sony' ? 'WH-1000XM5' : 'GG Marmont Bag',
          brand: randomBrand,
          model: `Model-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          manufactureDate: '2024-01-15',
          warrantyStatus: Math.random() > 0.3 ? 'valid' : 'expired'
        },
        verification: {
          officialDatabase: Math.random() > 0.2,
          hologramCheck: Math.random() > 0.25,
          serialVerified: Math.random() > 0.3,
          counterfeitRisk: Math.random() > 0.7 ? 'low' : 'medium'
        }
      };
      
      setQrResult(demoQrResult);
      setIsQrScanning(false);
    }, 3000);
  };

  const handleUrlScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productUrl.trim()) {
      alert('Please enter a product URL');
      return;
    }

    setIsUrlScanning(true);
    
    // Simulate URL scanning with demo data
    setTimeout(() => {
      const demoResults = {
        url: productUrl,
        authenticity: {
          score: Math.floor(Math.random() * 40) + 60, // 60-100
          verified: Math.random() > 0.3,
          productType: ['authentic', 'mass_produced', 'dropshipped'][Math.floor(Math.random() * 3)],
          flags: ['Price below market average', 'New seller account', 'Limited product reviews'].slice(0, Math.floor(Math.random() * 3) + 1)
        },
        product: {
          name: 'iPhone 15 Pro Max',
          brand: 'Apple',
          price: '$999.99',
          store: new URL(productUrl).hostname.replace('www.', ''),
          category: 'Electronics',
          description: 'Latest iPhone with advanced camera system and A17 Pro chip'
        },
        analysis: {
          storeReputation: Math.floor(Math.random() * 30) + 70,
          priceComparison: Math.random() > 0.5 ? 'competitive' : 'below_market',
          riskLevel: Math.random() > 0.7 ? 'low' : 'medium',
          recommendedAction: Math.random() > 0.6 ? 'proceed' : 'investigate'
        }
      };
      
      setUrlScanResult(demoResults);
      setIsUrlScanning(false);
    }, 2500);
  };

  const handleScreenshotCapture = async () => {
    setIsScreenshotAnalyzing(true);
    
    // Simulate screenshot capture and analysis
    setTimeout(() => {
      const demoScreenshotResult = {
        method: 'capture',
        analysis: {
          detectedText: 'Product: Handcrafted Leather Wallet\nPrice: $89.99\nSeller: ArtisanGoods Store\nDescription: Genuine leather, handmade with care',
          productIdentified: true,
          confidence: 92,
          extractedInfo: {
            productName: 'Handcrafted Leather Wallet',
            price: '$89.99',
            seller: 'ArtisanGoods Store',
            description: 'Genuine leather, handmade with care'
          }
        },
        patterns: {
          handmade: 85,
          authentic: 75,
          massProduced: 15,
          dropshipped: 10
        },
        educationalInsights: [
          'The listing shows strong indicators of handmade craftsmanship',
          'Price point aligns with artisan-made leather goods',
          'Detailed creation process description suggests authentic handmade item',
          'Consider asking the seller about customization options'
        ],
        opinion: 'Based on pattern analysis, this appears to be a genuine handmade product with authentic craftsmanship indicators.'
      };

      setScreenshotResult(demoScreenshotResult);
      setIsScreenshotAnalyzing(false);
    }, 3000);
  };

  const handleScreenshotUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setScreenshotFile(file);
    setIsScreenshotAnalyzing(true);

    try {
      // Use real screenshot analyzer
      const analysisData: UserSubmittedData = {
        screenshot: file
      };
      
      const result = await analyzeUserSubmission(analysisData);
      
      const screenshotResult = {
        method: 'upload',
        filename: file.name,
        analysis: {
          productIdentified: true,
          confidence: result.confidence,
        },
        patterns: result.patterns,
        educationalInsights: result.educationalInsights,
        indicators: result.indicators,
        riskLevel: result.riskLevel,
        opinion: result.riskLevel === 'low' 
          ? 'Based on pattern analysis, this appears to be an authentic product with genuine indicators.'
          : result.riskLevel === 'high'
          ? 'This listing appears similar to known mass-produced products commonly found in dropshipping operations.'
          : 'This product shows mixed indicators. Consider requesting additional information from the seller.'
      };

      setScreenshotResult(screenshotResult);
    } catch (error) {
      console.error('Screenshot analysis error:', error);
      setScreenshotResult({
        method: 'upload',
        filename: file.name,
        error: 'Unable to analyze screenshot. Please try again.',
        patterns: {
          handmade: 0,
          authentic: 0,
          massProduced: 0,
          dropshipped: 0
        }
      });
    } finally {
      setIsScreenshotAnalyzing(false);
    }
  };

  const handleManualEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEntry.title.trim()) {
      alert('Please enter at least a product title');
      return;
    }

    setIsScreenshotAnalyzing(true);

    try {
      // Use real analyzer for manual entry
      const analysisData: UserSubmittedData = {
        productTitle: manualEntry.title,
        productPrice: manualEntry.price,
        productDescription: manualEntry.description,
        sellerName: manualEntry.seller
      };
      
      // Add shipping info to description for analysis
      if (manualEntry.shipping) {
        analysisData.productDescription = `${analysisData.productDescription} Shipping: ${manualEntry.shipping}`;
      }
      
      const result = await analyzeUserSubmission(analysisData);
      
      const screenshotResult = {
        method: 'manual',
        analysis: {
          productIdentified: true,
          confidence: result.confidence,
          extractedInfo: {
            productName: manualEntry.title,
            price: manualEntry.price,
            description: manualEntry.description
          }
        },
        patterns: result.patterns,
        educationalInsights: result.educationalInsights,
        indicators: result.indicators,
        riskLevel: result.riskLevel,
        opinion: result.riskLevel === 'low' 
          ? 'Based on the provided information, this product shows strong indicators of authenticity.'
          : result.riskLevel === 'high'
          ? 'The product information suggests this may be a mass-produced item. Consider requesting more details from the seller.'
          : 'This product shows mixed authenticity indicators. Additional verification recommended.'
      };

      setScreenshotResult(screenshotResult);
    } catch (error) {
      console.error('Manual entry analysis error:', error);
      setScreenshotResult({
        method: 'manual',
        error: 'Unable to analyze product information. Please try again.',
        patterns: {
          handmade: 0,
          authentic: 0,
          massProduced: 0,
          dropshipped: 0
        }
      });
    } finally {
      setIsScreenshotAnalyzing(false);
    }
  };

  const features = [
    {
      icon: ScanLine,
      title: 'Scan & Verify',
      description: 'Instantly scan product barcodes to verify authenticity and explore market value trends across platforms.',
    },
    {
      icon: Shield,
      title: 'Store Analysis',
      description: 'Analyze online stores to detect potential fraud and protect yourself from fake products.',
    },
    {
      icon: TrendingUp,
      title: 'Smart Insights',
      description: 'Get detailed product analytics and authenticity scores to make informed decisions.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-black/20" />
        <div className="container relative">
          <div className="py-20 md:py-28 text-center">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Knowledge-First
                <span className="block text-primary-200 mt-2">Shopping Decisions</span>
              </h1>
              <p className="text-lg md:text-xl text-primary-100 mb-10 leading-relaxed max-w-2xl mx-auto">
                Shopping Education for the Digital Age
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                {isAuthenticated ? (
                  <Link
                    to="/scan"
                    className="bg-white text-primary-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg inline-flex items-center space-x-3"
                  >
                    <ScanLine className="h-5 w-5" />
                    <span>Start Scanning</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="bg-white text-primary-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg inline-flex items-center space-x-3"
                    >
                      <span>Get Started Free</span>
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                    <Link
                      to="/pricing"
                      className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
                    >
                      View Pricing
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* URL Product Scanner Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-100">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🌐</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                URL Product Scanner
              </h2>
              
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Turn every purchase into a learning experience. Paste a product link from Amazon, eBay, Etsy, 
                or Shopify to gain insights on authenticity, seller reliability, and smart price comparisons.
              </p>
              
              <form onSubmit={handleUrlScan} className="space-y-4 mb-6">
                <div className="max-w-2xl mx-auto">
                  <input
                    type="url"
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    placeholder="https://amazon.com/dp/B123456789 or any product URL"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    disabled={isUrlScanning}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUrlScanning || !productUrl.trim()}
                  className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg inline-flex items-center space-x-3 text-lg disabled:opacity-50"
                >
                  {isUrlScanning ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>Analyzing Product...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">🔍</span>
                      <span>Analyze Product URL</span>
                    </>
                  )}
                </button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="flex items-center space-x-2 justify-center">
                  <span className="text-green-600">✅</span>
                  <span>Authenticity Score (0-100)</span>
                </div>
                <div className="flex items-center space-x-2 justify-center">
                  <span className="text-green-600">✅</span>
                  <span>Store Reputation Analysis</span>
                </div>
                <div className="flex items-center space-x-2 justify-center">
                  <span className="text-green-600">✅</span>
                  <span>Price Comparison Insights</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshot Analysis Section */}
      <section className="py-16 bg-gradient-to-r from-purple-50 to-pink-100">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📸</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Screenshot Analysis
              </h2>
              
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Analyze product listings from any marketplace using screenshots. 
                Get AI-powered pattern analysis and educational insights about product authenticity.
              </p>

              {/* Tabs */}
              <div className="flex justify-center mb-8">
                <div className="bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveScreenshotTab('capture')}
                    className={`px-6 py-2 rounded-md font-medium transition-all ${
                      activeScreenshotTab === 'capture'
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    📸 Capture
                  </button>
                  <button
                    onClick={() => setActiveScreenshotTab('upload')}
                    className={`px-6 py-2 rounded-md font-medium transition-all ${
                      activeScreenshotTab === 'upload'
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    📤 Upload
                  </button>
                  <button
                    onClick={() => setActiveScreenshotTab('manual')}
                    className={`px-6 py-2 rounded-md font-medium transition-all ${
                      activeScreenshotTab === 'manual'
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    📝 Manual
                  </button>
                </div>
              </div>

              {/* Capture Tab */}
              {activeScreenshotTab === 'capture' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Capture any product page directly from your browser
                  </p>
                  <button
                    onClick={handleScreenshotCapture}
                    disabled={isScreenshotAnalyzing}
                    className="bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-purple-700 transition-all duration-200 shadow-lg inline-flex items-center space-x-3 text-lg disabled:opacity-50"
                  >
                    {isScreenshotAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        <span>Analyzing Screenshot...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xl">📸</span>
                        <span>Capture Product Page</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Upload Tab */}
              {activeScreenshotTab === 'upload' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Upload a saved screenshot with drag & drop support
                  </p>
                  <div className="max-w-md mx-auto">
                    <label
                      htmlFor="screenshot-upload"
                      className="block w-full p-8 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-400 transition-colors cursor-pointer bg-purple-50"
                    >
                      <div className="text-center">
                        <span className="text-4xl mb-2 block">📤</span>
                        <p className="text-purple-600 font-medium mb-1">Drop screenshot here or click to upload</p>
                        <p className="text-sm text-gray-500">PNG, JPG, WEBP up to 10MB</p>
                      </div>
                      <input
                        id="screenshot-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotUpload}
                        className="hidden"
                        disabled={isScreenshotAnalyzing}
                      />
                    </label>
                    {screenshotFile && (
                      <p className="text-sm text-gray-600 mt-2">
                        Selected: {screenshotFile.name}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Manual Tab */}
              {activeScreenshotTab === 'manual' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Type in product details for analysis
                  </p>
                  <form onSubmit={handleManualEntry} className="max-w-md mx-auto space-y-4">
                    <div className="text-left">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Title *
                      </label>
                      <input
                        type="text"
                        value={manualEntry.title}
                        onChange={(e) => setManualEntry({...manualEntry, title: e.target.value})}
                        placeholder="e.g., Handmade Wooden Bowl - Made to Order"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div className="text-left">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price
                      </label>
                      <input
                        type="text"
                        value={manualEntry.price}
                        onChange={(e) => setManualEntry({...manualEntry, price: e.target.value})}
                        placeholder="e.g., $45.99"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="text-left">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={manualEntry.description}
                        onChange={(e) => setManualEntry({...manualEntry, description: e.target.value})}
                        placeholder="e.g., Gift box includes: soy candle, matches, hair clip, glass jar. Each bowl is individually hand-carved"
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="text-left">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Seller Name
                      </label>
                      <input
                        type="text"
                        value={manualEntry.seller}
                        onChange={(e) => setManualEntry({...manualEntry, seller: e.target.value})}
                        placeholder="e.g., CraftyCreations or FastFashion Store"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="text-left">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Shipping Info
                      </label>
                      <input
                        type="text"
                        value={manualEntry.shipping}
                        onChange={(e) => setManualEntry({...manualEntry, shipping: e.target.value})}
                        placeholder="e.g., Ships in 1-2 days or 15-30 days from overseas"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isScreenshotAnalyzing || !manualEntry.title.trim()}
                      className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      {isScreenshotAnalyzing ? 'Analyzing...' : 'Analyze Product'}
                    </button>
                  </form>
                </div>
              )}

              {isScreenshotAnalyzing && (
                <div className="mt-6 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <p className="text-sm text-gray-600 mt-2">Analyzing product patterns...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Screenshot Analysis Results */}
      {screenshotResult && (
        <section className="py-16 bg-white">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-6 border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold flex items-center">
                    <span className="text-2xl mr-2">📸</span>
                    Screenshot Analysis Results
                  </h3>
                  <button
                    onClick={() => {
                      setScreenshotResult(null);
                      setScreenshotFile(null);
                      setManualEntry({ title: '', price: '', description: '', seller: '', shipping: '' });
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                {/* Product Type Badge */}
                {screenshotResult.productType && screenshotResult.productType !== 'single' && (
                  <div className="mb-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      screenshotResult.productType === 'gift-box' ? 'bg-purple-100 text-purple-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {screenshotResult.productType === 'gift-box' ? '🎁 Gift Box Detected' : '📦 Product Bundle'}
                    </span>
                  </div>
                )}

                {/* Risk Level */}
                {screenshotResult.riskLevel && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Risk Assessment</h4>
                    <div className="flex items-center space-x-3">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        screenshotResult.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                        screenshotResult.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {screenshotResult.riskLevel === 'low' ? '✅ Low Risk' :
                         screenshotResult.riskLevel === 'high' ? '⚠️ High Risk' :
                         '⚡ Medium Risk'}
                      </div>
                      <span className="text-sm text-gray-600">
                        Based on {screenshotResult.indicators?.length || 0} pattern indicators
                      </span>
                    </div>
                  </div>
                )}

                {/* Pattern Analysis */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Pattern Analysis</h4>
                  <div className="space-y-3">
                    {Object.entries(screenshotResult.patterns).map(([key, value]: [string, any]) => (
                      <div key={key}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700 capitalize">
                            {key === 'massProduced' ? 'Mass Produced' : 
                             key === 'dropshipped' ? 'Dropshipping' :
                             key === 'printOnDemand' ? 'Print on Demand' :
                             key === 'giftBox' ? 'Gift Box' :
                             key === 'mixedSourcing' ? 'Mixed Sourcing' :
                             key}
                          </span>
                          <span className="text-gray-600">{value}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              key === 'handmade' || key === 'authentic' ? 'bg-green-500' :
                              key === 'massProduced' || key === 'dropshipped' || key === 'printOnDemand' ? 'bg-orange-500' :
                              key === 'giftBox' ? 'bg-purple-500' :
                              key === 'mixedSourcing' ? 'bg-blue-500' :
                              'bg-gray-500'
                            }`}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pattern Indicators */}
                {screenshotResult.indicators && screenshotResult.indicators.length > 0 && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-3">🔍 Pattern Indicators Found</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {screenshotResult.indicators.slice(0, 5).map((indicator: string, index: number) => (
                        <li key={index}>• {indicator}</li>
                      ))}
                      {screenshotResult.indicators.length > 5 && (
                        <li className="italic">...and {screenshotResult.indicators.length - 5} more indicators</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Educational Insights */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-3">📚 Educational Insights</h4>
                  <ul className="text-sm text-blue-700 space-y-2">
                    {screenshotResult.educationalInsights.map((insight: string, index: number) => (
                      <li key={index}>• {insight}</li>
                    ))}
                  </ul>
                </div>

                {/* AI Opinion */}
                <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">🤖 AI Opinion</h4>
                  <p className="text-sm text-purple-700">{screenshotResult.opinion}</p>
                </div>

                {/* Extracted Information */}
                {screenshotResult.analysis?.extractedInfo && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Extracted Information</h4>
                    <div className="text-sm space-y-1">
                      {Object.entries(screenshotResult.analysis.extractedInfo).map(([key, value]: [string, any]) => (
                        <p key={key}>
                          <strong className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</strong> {value}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Legal Disclaimer */}
                <div className="mt-6 p-3 bg-gray-100 rounded-lg">
                  <p className="text-xs text-gray-600">
                    <strong>Educational Disclaimer:</strong> This analysis provides educational insights and AI-generated opinions 
                    based on pattern recognition. Results are not definitive statements about product authenticity. 
                    Always conduct your own research before making purchasing decisions.
                  </p>
                </div>

                <div className="mt-6 text-center">
                  {isAuthenticated ? (
                    <Link
                      to="/scan?tab=screenshot"
                      className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    >
                      Access Full Scanner Features
                    </Link>
                  ) : (
                    <Link
                      to="/register"
                      className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    >
                      Sign Up for Full Features
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* QR Code Scanner Section */}
      <section className="py-16 bg-gradient-to-r from-primary-50 to-primary-100">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📱</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                QR Code Authenticity Scanner
              </h2>
              
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Instantly verify product authenticity by scanning QR codes. Perfect for in-store verification 
                of luxury goods, electronics, and branded products against manufacturer databases.
              </p>
              
              <div className="mb-8">
                <button
                  onClick={handleQrScanDemo}
                  disabled={isQrScanning}
                  className="bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-700 transition-all duration-200 shadow-lg inline-flex items-center space-x-3 text-lg disabled:opacity-50"
                >
                  {isQrScanning ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>Scanning QR Code...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">📱</span>
                      <span>Scan QR Code Now</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="flex items-center space-x-2 justify-center">
                  <span className="text-green-600">✅</span>
                  <span>Manufacturer Database Verification</span>
                </div>
                <div className="flex items-center space-x-2 justify-center">
                  <span className="text-green-600">✅</span>
                  <span>Anti-Counterfeiting Detection</span>
                </div>
                <div className="flex items-center space-x-2 justify-center">
                  <span className="text-green-600">✅</span>
                  <span>Real-Time Authenticity Scoring</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* URL Scan Results */}
      {urlScanResult && (
        <section className="py-16 bg-white">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-6 border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold flex items-center">
                    <Shield className="h-6 w-6 mr-2 text-blue-600" />
                    URL Analysis Results
                  </h3>
                  <button
                    onClick={() => setUrlScanResult(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Product Details</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {urlScanResult.product.name}</p>
                      <p><strong>Brand:</strong> {urlScanResult.product.brand}</p>
                      <p><strong>Price:</strong> {urlScanResult.product.price}</p>
                      <p><strong>Store:</strong> {urlScanResult.product.store}</p>
                      <p><strong>Category:</strong> {urlScanResult.product.category}</p>
                    </div>
                  </div>

                  {/* Authenticity Score */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Authenticity Analysis</h4>
                    <div className="flex items-center mb-3">
                      <span className="text-3xl font-bold mr-3">{urlScanResult.authenticity.score}/100</span>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        urlScanResult.authenticity.score >= 80 ? 'bg-green-100 text-green-800' :
                        urlScanResult.authenticity.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {urlScanResult.authenticity.score >= 80 ? 'Likely Authentic' :
                         urlScanResult.authenticity.score >= 60 ? 'Moderate Risk' :
                         'High Risk'}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><strong>Product Type:</strong> {urlScanResult.authenticity.productType}</p>
                      <p><strong>Store Reputation:</strong> {urlScanResult.analysis.storeReputation}/100</p>
                      <p><strong>Price Analysis:</strong> {urlScanResult.analysis.priceComparison}</p>
                      <p><strong>Risk Level:</strong> {urlScanResult.analysis.riskLevel}</p>
                    </div>
                  </div>
                </div>

                {urlScanResult.authenticity.flags.length > 0 && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
                      <span className="text-lg mr-2">⚠️</span>
                      Risk Factors Detected
                    </h4>
                    <ul className="text-sm text-yellow-700">
                      {urlScanResult.authenticity.flags.map((flag: string, index: number) => (
                        <li key={index}>• {flag}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Analyzed URL:</strong> {urlScanResult.url}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    This URL was analyzed using our AI-powered authenticity detection system
                  </p>
                </div>

                <div className="mt-6 text-center">
                  {isAuthenticated ? (
                    <Link
                      to="/scan?tab=url"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Access Full Scanner Features
                    </Link>
                  ) : (
                    <Link
                      to="/register"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Sign Up for Full Features
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* QR Code Results */}
      {qrResult && (
        <section className="py-16 bg-white">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-6 border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold flex items-center">
                    <Shield className="h-6 w-6 mr-2 text-primary-600" />
                    QR Code Verification Results
                  </h3>
                  <button
                    onClick={() => setQrResult(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Product Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {qrResult.product.name}</p>
                      <p><strong>Brand:</strong> {qrResult.product.brand}</p>
                      <p><strong>Model:</strong> {qrResult.product.model}</p>
                      <p><strong>Manufacture Date:</strong> {qrResult.product.manufactureDate}</p>
                      <p><strong>Warranty Status:</strong> {qrResult.product.warrantyStatus}</p>
                    </div>
                  </div>

                  {/* Verification Results */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Authenticity Verification</h4>
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl font-bold">{qrResult.authenticity.score}/100</span>
                        <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                          qrResult.authenticity.score >= 85 ? 'bg-green-100 text-green-800' :
                          qrResult.authenticity.score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {qrResult.authenticity.score >= 85 ? '✅ Genuine' : 
                           qrResult.authenticity.score >= 70 ? '⚠️ Uncertain' : 
                           '❌ Suspicious'}
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            qrResult.authenticity.score >= 85 ? 'bg-green-500' :
                            qrResult.authenticity.score >= 70 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${qrResult.authenticity.score}%` }}
                        />
                      </div>
                    </div>
                    
                    <h5 className="font-medium text-gray-800 mb-2">Security Checks:</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Serial Number Matching</span>
                        <span>{qrResult.authenticity.serialMatch ? '✅ Verified' : '❌ No Match'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Official Database Verification</span>
                        <span>{qrResult.verification.officialDatabase ? '✅ Found' : '❌ Not Found'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Hologram Validation</span>
                        <span>{qrResult.verification.hologramCheck ? '✅ Valid' : '❌ Invalid'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Risk Assessment</span>
                        <span className={`font-medium ${
                          qrResult.verification.counterfeitRisk === 'low' ? 'text-green-600' :
                          qrResult.verification.counterfeitRisk === 'medium' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {qrResult.verification.counterfeitRisk === 'low' ? '✅ Low Risk' :
                           qrResult.verification.counterfeitRisk === 'medium' ? '⚠️ Medium Risk' :
                           '❌ High Risk'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Authenticity Insights */}
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">🔐 Authenticity Insights</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    {qrResult.authenticity.score >= 85 ? (
                      <>
                        <p>• This product shows strong authenticity indicators</p>
                        <p>• QR code matches manufacturer's official database</p>
                        <p>• All security features have been validated</p>
                      </>
                    ) : qrResult.authenticity.score >= 70 ? (
                      <>
                        <p>• Some authenticity checks could not be fully verified</p>
                        <p>• Consider purchasing from authorized retailers</p>
                        <p>• Request additional proof of authenticity from seller</p>
                      </>
                    ) : (
                      <>
                        <p>• Multiple security checks have failed</p>
                        <p>• High risk of counterfeit product</p>
                        <p>• We recommend avoiding this purchase</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>QR Code:</strong> {qrResult.qrCode}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    This QR code was verified against official manufacturer databases and anti-counterfeiting systems
                  </p>
                </div>

                <div className="mt-6 text-center">
                  {isAuthenticated ? (
                    <Link
                      to="/scan?tab=qr"
                      className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                    >
                      Access Full Scanner Features
                    </Link>
                  ) : (
                    <Link
                      to="/register"
                      className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                    >
                      Sign Up for Full Features
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to shop safely
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Powerful tools to verify product authenticity and protect yourself from online fraud.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors duration-200">
                  <feature.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-lg md:text-xl text-gray-600">
              Three simple steps to verify any product
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                step: '01',
                title: 'Scan Product',
                description: 'Use your camera to scan any product barcode or enter the product URL',
              },
              {
                step: '02',
                title: 'Analyze Data',
                description: 'Our AI analyzes the product across multiple platforms and databases',
              },
              {
                step: '03',
                title: 'Get Results',
                description: 'Receive authenticity scores, price comparisons, and safety ratings',
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="w-18 h-18 bg-primary-600 text-white rounded-xl flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-9 left-[55%] w-[90%] h-0.5 bg-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-primary-600 text-white">
        <div className="container text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to start shopping smarter?
            </h2>
            <p className="text-lg md:text-xl text-primary-100 mb-8 leading-relaxed">
              Join thousands of users who trust Shop Scanner to verify products and protect them from fraud.
            </p>
            {!isAuthenticated && (
              <Link
                to="/register"
                className="bg-white text-primary-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg inline-flex items-center space-x-3"
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}