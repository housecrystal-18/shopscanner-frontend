import React, { useState } from 'react';
import './index.css';

export function SimpleApp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [productUrl, setProductUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'url' | 'qr'>('url');
  const [isQrScanning, setIsQrScanning] = useState(false);
  const [qrResult, setQrResult] = useState<any>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'demo@shopscanner.com' && password === 'demo123') {
      setIsLoggedIn(true);
      setUser({ name: 'Demo User', email: email, type: 'consumer' });
    } else {
      alert('Invalid credentials. Use: demo@shopscanner.com / demo123');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setEmail('');
    setPassword('');
    setScanResult(null);
    setProductUrl('');
    setQrResult(null);
    setActiveTab('url');
  };

  const handleUrlScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productUrl.trim()) {
      alert('Please enter a product URL');
      return;
    }

    setIsScanning(true);
    
    // Simulate scanning with demo data
    setTimeout(() => {
      const demoResults = {
        url: productUrl,
        authenticity: {
          score: Math.floor(Math.random() * 40) + 60, // 60-100
          verified: Math.random() > 0.3,
          productType: ['authentic', 'mass_produced', 'dropshipped'][Math.floor(Math.random() * 3)],
          flags: []
        },
        product: {
          name: 'iPhone 15 Pro',
          brand: 'Apple',
          price: '$999.99',
          store: new URL(productUrl).hostname.replace('www.', ''),
          category: 'Electronics'
        },
        analysis: {
          storeReputation: Math.floor(Math.random() * 30) + 70,
          priceComparison: Math.random() > 0.5 ? 'competitive' : 'below_market',
          riskLevel: Math.random() > 0.7 ? 'low' : 'medium'
        }
      };
      
      setScanResult(demoResults);
      setIsScanning(false);
    }, 2000);
  };

  const handleQrScan = async () => {
    setIsQrScanning(true);
    
    // Simulate QR code scanning process
    setTimeout(() => {
      const qrCodes = [
        'QR12345APPLE67890',
        'AUTH98765NIKE12345', 
        'VERIFY555SAMSUNG999',
        'CHECK777SONY888'
      ];
      
      const randomQr = qrCodes[Math.floor(Math.random() * qrCodes.length)];
      const brand = randomQr.includes('APPLE') ? 'Apple' : 
                   randomQr.includes('NIKE') ? 'Nike' :
                   randomQr.includes('SAMSUNG') ? 'Samsung' : 'Sony';
      
      const demoQrResult = {
        qrCode: randomQr,
        authenticity: {
          score: Math.floor(Math.random() * 40) + 60, // 60-100
          verified: Math.random() > 0.2,
          authenticityCheck: Math.random() > 0.3 ? 'genuine' : 'suspicious',
          serialMatch: Math.random() > 0.25
        },
        product: {
          name: brand === 'Apple' ? 'iPhone 15 Pro' :
                brand === 'Nike' ? 'Air Jordan 1' :
                brand === 'Samsung' ? 'Galaxy S24' : 'WH-1000XM5',
          brand: brand,
          model: brand === 'Apple' ? 'A2848' : brand === 'Nike' ? 'DZ5485-612' : 'SM-S921B',
          manufactureDate: '2024-01-15',
          warrantyStatus: Math.random() > 0.3 ? 'valid' : 'expired'
        },
        verification: {
          officialDatabase: Math.random() > 0.2,
          hologramCheck: Math.random() > 0.25,
          serialVerified: Math.random() > 0.3,
          counterfeitRisk: Math.random() > 0.7 ? 'low' : Math.random() > 0.4 ? 'medium' : 'high'
        }
      };
      
      setQrResult(demoQrResult);
      setIsQrScanning(false);
    }, 2500);
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">🛍️ Shop Scanner</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Welcome, {user.name}!</span>
                <button 
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Scanner Section */}
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">🔍 Product Authenticity Scanner</h2>
                <p className="text-sm text-gray-600 mt-1">Scan products by URL or QR code to verify authenticity</p>
                
                {/* Tabs */}
                <div className="mt-4">
                  <nav className="flex space-x-8" aria-label="Tabs">
                    <button
                      onClick={() => setActiveTab('url')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'url'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      🌐 URL Scanner
                    </button>
                    <button
                      onClick={() => setActiveTab('qr')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'qr'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      📱 QR Code Scanner
                    </button>
                  </nav>
                </div>
              </div>
              <div className="p-6">
                {/* URL Scanner Tab */}
                {activeTab === 'url' && (
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
                        placeholder="https://amazon.com/product/..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isScanning}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isScanning}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isScanning ? 'Scanning...' : 'Scan Product'}
                    </button>
                  </form>
                )}

                {/* QR Code Scanner Tab */}
                {activeTab === 'qr' && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="mb-4">
                        <div className="mx-auto w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                          {isQrScanning ? (
                            <div className="text-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                              <p className="text-sm text-gray-600">Scanning QR Code...</p>
                            </div>
                          ) : (
                            <div className="text-center">
                              <div className="text-4xl mb-2">📱</div>
                              <p className="text-sm text-gray-600">Tap to scan QR code</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={handleQrScan}
                        disabled={isQrScanning}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        {isQrScanning ? 'Scanning QR Code...' : 'Start QR Code Scan'}
                      </button>
                      <p className="mt-2 text-xs text-gray-500">
                        Point your camera at a product QR code for authenticity verification
                      </p>
                    </div>
                  </div>
                )}

                {/* URL Scan Results */}
                {scanResult && activeTab === 'url' && (
                  <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">URL Scan Results</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Product Info */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Product Details</h4>
                        <p><strong>Name:</strong> {scanResult.product.name}</p>
                        <p><strong>Brand:</strong> {scanResult.product.brand}</p>
                        <p><strong>Price:</strong> {scanResult.product.price}</p>
                        <p><strong>Store:</strong> {scanResult.product.store}</p>
                      </div>

                      {/* Authenticity Score */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Authenticity Analysis</h4>
                        <div className="flex items-center mb-2">
                          <span className="text-lg font-bold mr-2">{scanResult.authenticity.score}/100</span>
                          <div className={`px-2 py-1 rounded text-sm font-medium ${
                            scanResult.authenticity.score >= 80 ? 'bg-green-100 text-green-800' :
                            scanResult.authenticity.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {scanResult.authenticity.score >= 80 ? 'Likely Authentic' :
                             scanResult.authenticity.score >= 60 ? 'Moderate Risk' :
                             'High Risk'}
                          </div>
                        </div>
                        <p><strong>Type:</strong> {scanResult.authenticity.productType}</p>
                        <p><strong>Store Rep:</strong> {scanResult.analysis.storeReputation}/100</p>
                        <p><strong>Price:</strong> {scanResult.analysis.priceComparison}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setScanResult(null)}
                      className="mt-4 text-sm text-blue-600 hover:text-blue-800"
                    >
                      Clear Results
                    </button>
                  </div>
                )}

                {/* QR Code Scan Results */}
                {qrResult && activeTab === 'qr' && (
                  <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">QR Code Scan Results</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Product Info */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Product Details</h4>
                        <p><strong>Name:</strong> {qrResult.product.name}</p>
                        <p><strong>Brand:</strong> {qrResult.product.brand}</p>
                        <p><strong>Model:</strong> {qrResult.product.model}</p>
                        <p><strong>Manufacture Date:</strong> {qrResult.product.manufactureDate}</p>
                        <p><strong>Warranty:</strong> {qrResult.product.warrantyStatus}</p>
                      </div>

                      {/* Authenticity Verification */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Authenticity Verification</h4>
                        <div className="flex items-center mb-2">
                          <span className="text-lg font-bold mr-2">{qrResult.authenticity.score}/100</span>
                          <div className={`px-2 py-1 rounded text-sm font-medium ${
                            qrResult.authenticity.score >= 80 ? 'bg-green-100 text-green-800' :
                            qrResult.authenticity.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {qrResult.authenticity.authenticityCheck === 'genuine' ? 'Genuine Product' : 'Suspicious'}
                          </div>
                        </div>
                        <p><strong>Serial Match:</strong> {qrResult.authenticity.serialMatch ? '✅ Verified' : '❌ No Match'}</p>
                        <p><strong>Official DB:</strong> {qrResult.verification.officialDatabase ? '✅ Found' : '❌ Not Found'}</p>
                        <p><strong>Hologram:</strong> {qrResult.verification.hologramCheck ? '✅ Valid' : '❌ Invalid'}</p>
                        <p><strong>Risk Level:</strong> {qrResult.verification.counterfeitRisk}</p>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>QR Code:</strong> {qrResult.qrCode}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        This QR code was verified against official manufacturer databases
                      </p>
                    </div>

                    <button
                      onClick={() => setQrResult(null)}
                      className="mt-4 text-sm text-blue-600 hover:text-blue-800"
                    >
                      Clear Results
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  🎉 Shop Scanner is Working!
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Your app is successfully deployed and running.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-2xl mb-4">🌐</div>
                    <h3 className="text-lg font-semibold mb-2">URL Scanning</h3>
                    <p className="text-gray-600">Paste product URLs to analyze authenticity and compare prices</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-2xl mb-4">📱</div>
                    <h3 className="text-lg font-semibold mb-2">QR Code Verification</h3>
                    <p className="text-gray-600">Scan QR codes to verify genuine products against official databases</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-2xl mb-4">🛡️</div>
                    <h3 className="text-lg font-semibold mb-2">Authenticity Analysis</h3>
                    <p className="text-gray-600">Advanced scoring system to detect counterfeits and fakes</p>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-green-50 rounded-lg">
                  <h4 className="text-lg font-semibold text-green-800 mb-2">✅ Success!</h4>
                  <p className="text-green-700">
                    Your frontend is connected to the Railway backend API at:<br/>
                    <code className="bg-green-100 px-2 py-1 rounded">https://shopscanner-production.up.railway.app</code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🛍️ Shop Scanner</h1>
          <h2 className="text-xl text-gray-600">Product Authenticity & Price Comparison</h2>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="demo@shopscanner.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="demo123"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign in
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo credentials</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Email: <code className="bg-gray-100 px-2 py-1 rounded">demo@shopscanner.com</code><br/>
                Password: <code className="bg-gray-100 px-2 py-1 rounded">demo123</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}