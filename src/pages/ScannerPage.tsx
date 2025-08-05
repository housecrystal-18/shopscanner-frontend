import React, { useState } from 'react';
import { ScanLine, Camera, Upload, History, X, AlertTriangle, Shield, TrendingUp } from 'lucide-react';
import { BarcodeScanner } from '../components/scanner/BarcodeScanner';
import { ProductResult } from '../components/scanner/ProductResult';
import { useScanner } from '../hooks/useScanner';

export function ScannerPage() {
  const {
    isScanning,
    currentBarcode,
    scanHistory,
    isLoadingProduct,
    startScanning,
    stopScanning,
    handleBarcodeDetected,
    clearCurrentScan,
    rescanBarcode,
    addProductManually,
    updateProduct,
    getScanResult,
  } = useScanner();

  const [activeTab, setActiveTab] = useState<'barcode' | 'url' | 'qr' | 'screenshot'>('barcode');
  const [productUrl, setProductUrl] = useState('');
  const [isUrlScanning, setIsUrlScanning] = useState(false);
  const [urlScanResult, setUrlScanResult] = useState<any>(null);
  const [isQrScanning, setIsQrScanning] = useState(false);
  const [qrResult, setQrResult] = useState<any>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isScreenshotAnalyzing, setIsScreenshotAnalyzing] = useState(false);
  const [screenshotResult, setScreenshotResult] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  
  const scanResult = getScanResult();

  const handleNewScan = () => {
    clearCurrentScan();
    startScanning();
  };

  const handleRescan = () => {
    if (currentBarcode) {
      rescanBarcode(currentBarcode);
    }
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
          flags: ['Price below market average', 'New seller account'].slice(0, Math.floor(Math.random() * 2) + 1)
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

  const handleQrScan = async () => {
    setIsQrScanning(true);
    
    // Simulate QR code scanning
    setTimeout(() => {
      const brands = ['Apple', 'Nike', 'Samsung', 'Sony'];
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
          name: randomBrand === 'Apple' ? 'iPhone 15 Pro' : randomBrand === 'Nike' ? 'Air Jordan 1' : 'Galaxy S24',
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

  const handleScreenshotUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setScreenshotFile(file);
    setIsScreenshotAnalyzing(true);

    // Simulate screenshot analysis
    setTimeout(() => {
      const demoScreenshotResult = {
        filename: file.name,
        analysis: {
          detectedText: 'Product: Nike Air Max 90\\nPrice: $120.00\\nSeller: TrendyShoes Store\\nCondition: New',
          productIdentified: true,
          confidence: Math.floor(Math.random() * 30) + 70,
          extractedInfo: {
            productName: 'Nike Air Max 90',
            price: '$120.00',
            seller: 'TrendyShoes Store',
            condition: 'New'
          }
        },
        authenticity: {
          score: Math.floor(Math.random() * 40) + 60,
          riskFactors: [
            'Price significantly below market average',
            'Seller has limited history',
            'Product images appear to be stock photos'
          ].slice(0, Math.floor(Math.random() * 3) + 1),
          recommendation: Math.random() > 0.5 ? 'proceed_with_caution' : 'high_risk'
        },
        product: {
          name: 'Nike Air Max 90',
          estimatedPrice: '$120.00',
          marketPrice: '$140.00',
          brand: 'Nike',
          category: 'Footwear'
        },
        store: {
          name: 'TrendyShoes Store',
          trustScore: Math.floor(Math.random() * 40) + 60,
          redFlags: Math.random() > 0.7 ? [] : ['New seller account', 'Limited reviews']
        }
      };

      setScreenshotResult(demoScreenshotResult);
      setIsScreenshotAnalyzing(false);
    }, 3500);
  };

  return (
    <div className="min-h-screen">
      {/* Scanner Modal */}
      {isScanning && (
        <BarcodeScanner
          onBarcodeDetected={handleBarcodeDetected}
          onClose={stopScanning}
          isScanning={isScanning}
        />
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Scan History</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              {scanHistory.length > 0 ? (
                <div className="space-y-2">
                  {scanHistory.map((barcode, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        rescanBarcode(barcode);
                        setShowHistory(false);
                      }}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border"
                    >
                      <div className="font-mono text-sm text-gray-900">{barcode}</div>
                      <div className="text-xs text-gray-500">
                        Scan #{scanHistory.length - index}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No scan history yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <ScanLine className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Product Intelligence Scanner
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Scan, analyze, and verify products using multiple methods. Get detailed authenticity scores and protect yourself from counterfeits.
          </p>
        </div>

        {/* Disclaimers */}
        <div className="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-amber-800 mb-2">Important Disclaimers</h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Analysis results are estimates and should not be considered as definitive authentication</li>
                <li>• Always verify high-value purchases through official brand channels</li>
                <li>• Shop Scan Pro LLC is not responsible for purchase decisions based on our analysis</li>
                <li>• Results may vary and should be used as guidance only</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Scanner Interface */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('barcode')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'barcode'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ScanLine className="h-5 w-5 inline mr-2" />
                Barcode Scanner
              </button>
              <button
                onClick={() => setActiveTab('url')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'url'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🌐 URL Scanner
              </button>
              <button
                onClick={() => setActiveTab('qr')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'qr'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📱 QR Code
              </button>
              <button
                onClick={() => setActiveTab('screenshot')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'screenshot'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📸 Screenshot Upload
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Barcode Scanner Tab */}
            {activeTab === 'barcode' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Barcode Scanner
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Scan product barcodes to get instant authenticity analysis and price comparisons
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={handleNewScan}
                      disabled={isScanning || isLoadingProduct}
                      className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 inline-flex items-center justify-center space-x-2"
                    >
                      <Camera className="h-5 w-5" />
                      <span>{isScanning ? 'Scanning...' : 'Start Camera Scan'}</span>
                    </button>
                    
                    {scanHistory.length > 0 && (
                      <button
                        onClick={() => setShowHistory(true)}
                        className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 inline-flex items-center space-x-2"
                      >
                        <History className="h-5 w-5" />
                        <span>Scan History ({scanHistory.length})</span>
                      </button>
                    )}
                  </div>

                  {isLoadingProduct && (
                    <div className="mt-6 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      <p className="text-sm text-gray-600 mt-2">Analyzing product...</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* URL Scanner Tab */}
            {activeTab === 'url' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    URL Product Scanner
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Paste any product URL to analyze authenticity and get detailed insights
                  </p>
                  
                  <form onSubmit={handleUrlScan} className="space-y-4">
                    <div>
                      <label htmlFor="productUrl" className="block text-sm font-medium text-gray-700 mb-2">
                        Product URL
                      </label>
                      <input
                        id="productUrl"
                        type="url"
                        value={productUrl}
                        onChange={(e) => setProductUrl(e.target.value)}
                        placeholder="https://amazon.com/product/... or any shopping site"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        disabled={isUrlScanning}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isUrlScanning}
                      className="w-full bg-primary-600 text-white py-3 px-4 rounded-md font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                      {isUrlScanning ? 'Analyzing...' : 'Analyze Product'}
                    </button>
                  </form>

                  {isUrlScanning && (
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      <p className="text-sm text-gray-600 mt-2">Analyzing product URL...</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* QR Code Tab */}
            {activeTab === 'qr' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    QR Code Scanner
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Scan product QR codes for authenticity verification against manufacturer databases. 
                    Perfect for in-store verification of luxury goods, electronics, and branded products.
                  </p>
                  
                  <button
                    onClick={handleQrScan}
                    disabled={isQrScanning}
                    className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 inline-flex items-center space-x-2"
                  >
                    <Camera className="h-5 w-5" />
                    <span>{isQrScanning ? 'Scanning QR Code...' : 'Start QR Code Scan'}</span>
                  </button>

                  {isQrScanning && (
                    <div className="mt-6 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      <p className="text-sm text-gray-600 mt-2">Scanning QR Code...</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Screenshot Upload Tab */}
            {activeTab === 'screenshot' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Screenshot Analysis
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Upload a screenshot of a product listing to analyze authenticity and detect potential risks
                  </p>
                  
                  <div>
                    <label htmlFor="screenshot" className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Product Screenshot
                    </label>
                    <input
                      id="screenshot"
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotUpload}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      disabled={isScreenshotAnalyzing}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Supports JPG, PNG, WebP. Max file size: 10MB
                    </p>
                  </div>
                  
                  {isScreenshotAnalyzing && (
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      <p className="text-sm text-gray-600 mt-2">Analyzing screenshot...</p>
                    </div>
                  )}
                  
                  {screenshotFile && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>File:</strong> {screenshotFile.name} ({(screenshotFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Barcode Results */}
        {currentBarcode && activeTab === 'barcode' && (
          <ProductResult
            barcode={currentBarcode}
            product={scanResult?.product}
            isNewProduct={!scanResult?.product}
            isLoading={isLoadingProduct}
            onAddProduct={addProductManually}
            onUpdateProduct={updateProduct}
            onRescan={handleRescan}
            onNewScan={handleNewScan}
          />
        )}

        {/* URL Scan Results */}
        {urlScanResult && activeTab === 'url' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <Shield className="h-6 w-6 mr-2 text-primary-600" />
              URL Analysis Results
            </h3>
            
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
                  <span className="text-2xl font-bold mr-3">{urlScanResult.authenticity.score}/100</span>
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
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Risk Factors Detected
                </h4>
                <ul className="text-sm text-yellow-700">
                  {urlScanResult.authenticity.flags.map((flag: string, index: number) => (
                    <li key={index}>• {flag}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => setUrlScanResult(null)}
              className="mt-6 text-sm text-primary-600 hover:text-primary-800 font-medium"
            >
              Clear Results
            </button>
          </div>
        )}

        {/* QR Code Results */}
        {qrResult && activeTab === 'qr' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <Shield className="h-6 w-6 mr-2 text-primary-600" />
              QR Code Verification Results
            </h3>
            
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
                <h4 className="font-medium text-gray-900 mb-3">Verification Status</h4>
                <div className="flex items-center mb-3">
                  <span className="text-2xl font-bold mr-3">{qrResult.authenticity.score}/100</span>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    qrResult.authenticity.authenticityCheck === 'genuine' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {qrResult.authenticity.authenticityCheck === 'genuine' ? 'Genuine Product' : 'Suspicious'}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p><strong>Serial Match:</strong> {qrResult.authenticity.serialMatch ? '✅ Verified' : '❌ No Match'}</p>
                  <p><strong>Official Database:</strong> {qrResult.verification.officialDatabase ? '✅ Found' : '❌ Not Found'}</p>
                  <p><strong>Hologram Check:</strong> {qrResult.verification.hologramCheck ? '✅ Valid' : '❌ Invalid'}</p>
                  <p><strong>Counterfeit Risk:</strong> {qrResult.verification.counterfeitRisk}</p>
                </div>
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

            {/* Authenticity Tips for QR Codes */}
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">🔍 QR Code Authenticity Tips</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Genuine QR codes should lead to official brand websites or verification pages</li>
                <li>• Check if the QR code is properly integrated into the product packaging</li>
                <li>• Verify that product details match the information from the QR scan</li>
                <li>• Authentic products often have multiple security features beyond just QR codes</li>
                <li>• Be cautious of QR codes that redirect to suspicious or unrelated websites</li>
              </ul>
            </div>

            <button
              onClick={() => setQrResult(null)}
              className="mt-6 text-sm text-primary-600 hover:text-primary-800 font-medium"
            >
              Clear Results
            </button>
          </div>
        )}

        {/* Screenshot Results */}
        {screenshotResult && activeTab === 'screenshot' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-primary-600" />
              Screenshot Analysis Results
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Detected Product */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Detected Product</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {screenshotResult.product.name}</p>
                  <p><strong>Brand:</strong> {screenshotResult.product.brand}</p>
                  <p><strong>Listed Price:</strong> {screenshotResult.product.estimatedPrice}</p>
                  <p><strong>Market Price:</strong> {screenshotResult.product.marketPrice}</p>
                  <p><strong>Detection Confidence:</strong> {screenshotResult.analysis.confidence}%</p>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Risk Assessment</h4>
                <div className="flex items-center mb-3">
                  <span className="text-2xl font-bold mr-3">{screenshotResult.authenticity.score}/100</span>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    screenshotResult.authenticity.recommendation === 'proceed_with_caution' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {screenshotResult.authenticity.recommendation === 'proceed_with_caution' ? 'Proceed with Caution' : 'High Risk'}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p><strong>Store:</strong> {screenshotResult.store.name}</p>
                  <p><strong>Trust Score:</strong> {screenshotResult.store.trustScore}/100</p>
                </div>
              </div>
            </div>

            {screenshotResult.authenticity.riskFactors.length > 0 && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Risk Factors Detected
                </h4>
                <ul className="text-sm text-yellow-700">
                  {screenshotResult.authenticity.riskFactors.map((factor: string, index: number) => (
                    <li key={index}>• {factor}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">📋 Extracted Text</h4>
              <pre className="text-sm text-blue-700 whitespace-pre-wrap">{screenshotResult.analysis.detectedText}</pre>
            </div>

            {screenshotResult.store.redFlags.length > 0 && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">🚩 Store Red Flags</h4>
                <ul className="text-sm text-red-700">
                  {screenshotResult.store.redFlags.map((flag: string, index: number) => (
                    <li key={index}>• {flag}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => {setScreenshotResult(null); setScreenshotFile(null);}}
              className="mt-6 text-sm text-primary-600 hover:text-primary-800 font-medium"
            >
              Clear Results
            </button>
          </div>
        )}

        {/* How It Works */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            How Shop Scan Pro Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ScanLine className="h-8 w-8 text-primary-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Scan Products</h4>
              <p className="text-gray-600">
                Use our advanced scanning technology to analyze products via barcode, URL, QR code, or screenshot
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Analyze Authenticity</h4>
              <p className="text-gray-600">
                Get detailed authenticity scores, risk assessments, and comprehensive product analysis
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-primary-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Make Informed Decisions</h4>
              <p className="text-gray-600">
                Use our insights to shop smarter and protect yourself from counterfeits and scams
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}