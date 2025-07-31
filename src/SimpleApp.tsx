import React, { useState } from 'react';
import './index.css';
import { LandingPage } from './components/LandingPage';

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
  const [showView, setShowView] = useState<'landing' | 'app' | 'login' | 'register' | 'pricing'>('landing');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'demo@shopscanner.com' && password === 'demo123') {
      setIsLoggedIn(true);
      setUser({ name: 'Demo User', email: email, type: 'consumer' });
      setShowView('app');
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
    setShowView('landing');
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
      const score = Math.floor(Math.random() * 40) + 60; // 60-100
      const storeReputation = Math.floor(Math.random() * 30) + 70;
      const priceCheck = Math.random() > 0.5 ? 'competitive' : 'below_market';
      const isVerified = Math.random() > 0.3;
      const productType = ['authentic', 'mass_produced', 'dropshipped'][Math.floor(Math.random() * 3)];
      
      // Generate scoring explanation
      const scoringFactors = [];
      const positiveFactors = [];
      const negativeFactors = [];
      
      // Store reputation analysis
      if (storeReputation >= 85) {
        positiveFactors.push(`High store reputation (${storeReputation}/100)`);
        scoringFactors.push({ factor: 'Store Reputation', impact: '+15', reason: 'Highly trusted retailer with excellent track record' });
      } else if (storeReputation >= 70) {
        positiveFactors.push(`Good store reputation (${storeReputation}/100)`);
        scoringFactors.push({ factor: 'Store Reputation', impact: '+10', reason: 'Reputable store with positive customer feedback' });
      } else {
        negativeFactors.push(`Low store reputation (${storeReputation}/100)`);
        scoringFactors.push({ factor: 'Store Reputation', impact: '-15', reason: 'Limited reputation or mixed customer reviews' });
      }
      
      // Price analysis
      if (priceCheck === 'competitive') {
        positiveFactors.push('Market-competitive pricing');
        scoringFactors.push({ factor: 'Price Analysis', impact: '+10', reason: 'Price aligns with market averages, suggests legitimate source' });
      } else {
        negativeFactors.push('Below market price detected');
        scoringFactors.push({ factor: 'Price Analysis', impact: '-10', reason: 'Unusually low price may indicate counterfeit or damaged goods' });
      }
      
      // Product type analysis
      if (productType === 'authentic') {
        positiveFactors.push('Official product listing detected');
        scoringFactors.push({ factor: 'Product Authenticity', impact: '+20', reason: 'Product matches official specifications and descriptions' });
      } else if (productType === 'mass_produced') {
        positiveFactors.push('Mass-produced item verified');
        scoringFactors.push({ factor: 'Product Authenticity', impact: '+5', reason: 'Standard manufacturing process confirmed' });
      } else {
        negativeFactors.push('Dropshipped product detected');
        scoringFactors.push({ factor: 'Product Authenticity', impact: '-5', reason: 'Dropshipped items may have quality or authenticity concerns' });
      }
      
      // URL analysis with Etsy and more platforms
      const domain = new URL(productUrl).hostname.replace('www.', '');
      if (['amazon.com', 'ebay.com', 'bestbuy.com', 'walmart.com', 'target.com'].includes(domain)) {
        positiveFactors.push('Major retailer verified');
        scoringFactors.push({ factor: 'Domain Trust', impact: '+15', reason: 'Listed on major trusted e-commerce platform with buyer protection and return policies' });
      } else if (domain === 'etsy.com') {
        positiveFactors.push('Etsy marketplace detected');
        scoringFactors.push({ factor: 'Domain Trust', impact: '+8', reason: 'Etsy is a legitimate marketplace, but individual seller verification varies. Handmade/vintage items have different authenticity considerations.' });
      } else if (['shopify.com', 'squarespace.com', 'wix.com'].some(platform => domain.includes(platform))) {
        positiveFactors.push('Professional e-commerce platform');
        scoringFactors.push({ factor: 'Domain Trust', impact: '+5', reason: 'Built on reputable e-commerce platform, but individual store verification needed' });
      } else if (domain.includes('official') || domain.includes('store')) {
        positiveFactors.push('Official store detected');
        scoringFactors.push({ factor: 'Domain Trust', impact: '+10', reason: 'Domain name suggests official brand store, but requires verification of actual brand ownership' });
      } else {
        negativeFactors.push('Unknown retailer');
        scoringFactors.push({ factor: 'Domain Trust', impact: '-5', reason: 'Unfamiliar domain requires additional verification of seller credibility and return policies' });
      }
      
      // Add platform-specific and detailed factors
      const platformSpecificFactors = [];
      
      // Etsy-specific analysis
      if (domain === 'etsy.com') {
        platformSpecificFactors.push(
          { factor: 'Etsy Seller Rating', impact: Math.random() > 0.5 ? '+12' : '-8', reason: Math.random() > 0.5 ? 'Seller has 4.8+ star rating with 500+ positive reviews, indicating consistent quality and customer satisfaction' : 'Seller has limited reviews or mixed feedback, increasing uncertainty about product quality', positive: Math.random() > 0.5 },
          { factor: 'Handmade Verification', impact: '+6', reason: 'Product listed as handmade with detailed creation process, reducing mass-production counterfeit risk', positive: true },
          { factor: 'Etsy Purchase Protection', impact: '+4', reason: 'Covered by Etsy\'s Purchase Protection program for orders that don\'t match listing description', positive: true }
        );
      }
      
      // Enhanced detailed factors for all platforms
      const detailedFactors = [
        { factor: 'Image Analysis', impact: '+12', reason: 'High-resolution product images show consistent lighting, proper angles, and match official product specifications. No signs of stock photo usage or image manipulation detected.', positive: true },
        { factor: 'Description Quality', impact: '+8', reason: 'Product description includes detailed specifications, materials, dimensions, and care instructions. Language is professional and matches brand standards.', positive: true },
        { factor: 'Seller History', impact: '-6', reason: 'Seller account created recently (less than 6 months) with limited transaction history. New sellers pose higher risk for authenticity issues.', positive: false },
        { factor: 'Return Policy', impact: '+10', reason: 'Comprehensive 30-day return policy with free returns indicates seller confidence in product authenticity and quality. Clear refund process documented.', positive: true },
        { factor: 'Customer Reviews', impact: '-12', reason: 'Multiple recent reviews mention receiving items that differ from photos, with complaints about quality and potential counterfeits. 23% negative feedback in last 30 days.', positive: false },
        { factor: 'Shipping Analysis', impact: '+5', reason: 'Ships from official brand location/authorized distributor region. Shipping time consistent with authentic product fulfillment.', positive: true },
        { factor: 'Price Volatility', impact: '-8', reason: 'Product price has fluctuated significantly (40% variance) over past 30 days, suggesting potential inventory authenticity issues or desperation selling.', positive: false },
        { factor: 'Brand Authorization', impact: '+18', reason: 'Seller is listed as authorized retailer on brand\'s official website. Direct partnership verified through manufacturer\'s dealer locator tool.', positive: true },
        { factor: 'Payment Security', impact: '+6', reason: 'Accepts secure payment methods with buyer protection (PayPal, major credit cards). No red flags in payment processing setup.', positive: true },
        { factor: 'Inventory Analysis', impact: '-4', reason: 'Large quantities available for limited edition/exclusive items raises questions about source authenticity and official distribution channels.', positive: false }
      ];
      
      // Combine platform-specific and general factors
      const allFactors = [...platformSpecificFactors, ...detailedFactors];
      
      const selectedDetailedFactors = allFactors.sort(() => 0.5 - Math.random()).slice(0, 3);
      selectedDetailedFactors.forEach(factor => {
        scoringFactors.push(factor);
        if (factor.positive) {
          positiveFactors.push(factor.reason.split('.')[0]);
        } else {
          negativeFactors.push(factor.reason.split('.')[0]);
        }
      });

      const demoResults = {
        url: productUrl,
        authenticity: {
          score: score,
          verified: isVerified,
          productType: productType,
          flags: [],
          explanation: {
            summary: score >= 80 ? 'This product shows strong indicators of authenticity' :
                    score >= 70 ? 'This product has moderate authenticity confidence' :
                    score >= 60 ? 'This product has some authenticity concerns' :
                    'This product has significant authenticity red flags',
            positiveFactors: positiveFactors,
            negativeFactors: negativeFactors,
            scoringBreakdown: scoringFactors,
            recommendation: score >= 80 ? 'Safe to purchase - high confidence in authenticity' :
                           score >= 70 ? 'Proceed with caution - verify seller details' :
                           score >= 60 ? 'High risk - recommend additional verification' :
                           'Not recommended - significant counterfeit risk'
          }
        },
        product: {
          name: 'iPhone 15 Pro',
          brand: 'Apple',
          price: '$999.99',
          store: domain,
          category: 'Electronics'
        },
        analysis: {
          storeReputation: storeReputation,
          priceComparison: priceCheck,
          riskLevel: score >= 80 ? 'low' : score >= 60 ? 'medium' : 'high'
        },
        similarProducts: [
          {
            store: 'Amazon',
            price: '$949.99',
            url: 'https://amazon.com/dp/B0CHX3HJKL',
            seller: 'Amazon.com',
            rating: 4.8,
            reviews: 2341,
            shipping: 'Free 2-day',
            authenticity: 95,
            inStock: true,
            image: 'https://via.placeholder.com/150x150?text=iPhone+Amazon'
          },
          {
            store: 'Best Buy',
            price: '$999.99',
            url: 'https://bestbuy.com/site/apple-iphone-15-pro/6539232.p',
            seller: 'Best Buy',
            rating: 4.7,
            reviews: 1876,
            shipping: 'Free shipping',
            authenticity: 98,
            inStock: true,
            image: 'https://via.placeholder.com/150x150?text=iPhone+BestBuy'
          },
          {
            store: 'Walmart',
            price: '$979.99',
            url: 'https://walmart.com/ip/Apple-iPhone-15-Pro/567891234',
            seller: 'Walmart',
            rating: 4.6,
            reviews: 892,
            shipping: 'Free pickup',
            authenticity: 92,
            inStock: false,
            image: 'https://via.placeholder.com/150x150?text=iPhone+Walmart'
          },
          {
            store: 'eBay',
            price: '$899.99',
            url: 'https://ebay.com/itm/iPhone-15-Pro-128GB/234567890123',
            seller: 'TechDeals_Pro',
            rating: 4.3,
            reviews: 456,
            shipping: '$15.99',
            authenticity: 78,
            inStock: true,
            image: 'https://via.placeholder.com/150x150?text=iPhone+eBay'
          },
          {
            store: 'Etsy',
            price: '$89.99',
            url: 'https://etsy.com/listing/1234567/iphone-case-handmade',
            seller: 'CraftedCases',
            rating: 4.9,
            reviews: 234,
            shipping: '$5.99',
            authenticity: 85,
            inStock: true,
            image: 'https://via.placeholder.com/150x150?text=Case+Etsy',
            note: 'Similar iPhone case - handmade leather'
          }
        ]
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
      
      const qrScore = Math.floor(Math.random() * 40) + 60; // 60-100
      const serialMatch = Math.random() > 0.25;
      const officialDb = Math.random() > 0.2;
      const hologramValid = Math.random() > 0.25;
      const serialVerified = Math.random() > 0.3;
      
      // Generate QR scoring explanation
      const qrScoringFactors = [];
      const qrPositiveFactors = [];
      const qrNegativeFactors = [];
      
      // QR Code validation with detailed analysis
      if (randomQr.includes('QR') && randomQr.length > 10) {
        qrPositiveFactors.push('Valid QR code format detected');
        qrScoringFactors.push({ factor: 'QR Code Format', impact: '+10', reason: 'QR code follows standard manufacturer encoding protocols with proper error correction and data structure. Format matches authentic product authentication standards used by major brands.' });
      } else {
        qrNegativeFactors.push('Invalid QR code format');
        qrScoringFactors.push({ factor: 'QR Code Format', impact: '-15', reason: 'QR code does not match expected format standards. Missing proper encoding structure or error correction typically found in authentic product authentication systems.' });
      }
      
      // Serial number verification with detailed analysis
      if (serialMatch) {
        qrPositiveFactors.push('Serial number verified against database');
        qrScoringFactors.push({ factor: 'Serial Verification', impact: '+25', reason: 'Product serial number successfully matched against official manufacturer database records. Serial follows proper format, date codes align with manufacturing records, and no duplicate entries found in counterfeit reports.' });
      } else {
        qrNegativeFactors.push('Serial number not found in database');
        qrScoringFactors.push({ factor: 'Serial Verification', impact: '-20', reason: 'Serial number could not be verified in official databases. This could indicate counterfeit production, stolen merchandise, or products from unauthorized manufacturing facilities.' });
      }
      
      // Official database check
      if (officialDb) {
        qrPositiveFactors.push('Product found in official database');
        qrScoringFactors.push({ factor: 'Database Verification', impact: '+20', reason: 'Product registered in manufacturer\'s official database' });
      } else {
        qrNegativeFactors.push('Product not in official database');
        qrScoringFactors.push({ factor: 'Database Verification', impact: '-25', reason: 'No record found in official product databases' });
      }
      
      // Hologram verification
      if (hologramValid) {
        qrPositiveFactors.push('Security hologram validated');
        qrScoringFactors.push({ factor: 'Hologram Check', impact: '+15', reason: 'Security hologram matches authentic product specifications' });
      } else {
        qrNegativeFactors.push('Invalid or missing security hologram');
        qrScoringFactors.push({ factor: 'Hologram Check', impact: '-15', reason: 'Security hologram absent or does not match authentic standards' });
      }
      
      // Brand-specific checks
      if (brand === 'Apple') {
        if (Math.random() > 0.3) {
          qrPositiveFactors.push('Apple verification signature valid');
          qrScoringFactors.push({ factor: 'Brand Authentication', impact: '+15', reason: 'Apple\'s proprietary authentication signature verified' });
        } else {
          qrNegativeFactors.push('Apple verification signature invalid');
          qrScoringFactors.push({ factor: 'Brand Authentication', impact: '-20', reason: 'Apple\'s authentication signature missing or invalid' });
        }
      }
      
      // Manufacturing date check
      const manufactureDate = '2024-01-15';
      const currentDate = new Date();
      const prodDate = new Date(manufactureDate);
      const daysDiff = Math.floor((currentDate.getTime() - prodDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff < 365 && daysDiff > 0) {
        qrPositiveFactors.push('Recent manufacturing date confirmed');
        qrScoringFactors.push({ factor: 'Manufacturing Date', impact: '+8', reason: 'Manufacturing date is recent and realistic' });
      } else if (daysDiff > 365) {
        qrScoringFactors.push({ factor: 'Manufacturing Date', impact: '+0', reason: 'Older product - manufacturing date checks out' });
      }

      const demoQrResult = {
        qrCode: randomQr,
        authenticity: {
          score: qrScore,
          verified: Math.random() > 0.2,
          authenticityCheck: qrScore >= 70 ? 'genuine' : 'suspicious',
          serialMatch: serialMatch,
          explanation: {
            summary: qrScore >= 80 ? 'QR code verification shows strong authenticity indicators' :
                    qrScore >= 70 ? 'QR code verification shows moderate authenticity confidence' :
                    qrScore >= 60 ? 'QR code verification raises some authenticity concerns' :
                    'QR code verification indicates high counterfeit risk',
            positiveFactors: qrPositiveFactors,
            negativeFactors: qrNegativeFactors,
            scoringBreakdown: qrScoringFactors,
            recommendation: qrScore >= 80 ? 'Authentic product confirmed - safe to purchase' :
                           qrScore >= 70 ? 'Likely authentic - verify warranty and purchase from trusted source' :
                           qrScore >= 60 ? 'Authenticity questionable - seek additional verification' :
                           'High counterfeit risk - avoid purchase'
          }
        },
        product: {
          name: brand === 'Apple' ? 'iPhone 15 Pro' :
                brand === 'Nike' ? 'Air Jordan 1' :
                brand === 'Samsung' ? 'Galaxy S24' : 'WH-1000XM5',
          brand: brand,
          model: brand === 'Apple' ? 'A2848' : brand === 'Nike' ? 'DZ5485-612' : 'SM-S921B',
          manufactureDate: manufactureDate,
          warrantyStatus: Math.random() > 0.3 ? 'valid' : 'expired'
        },
        verification: {
          officialDatabase: officialDb,
          hologramCheck: hologramValid,
          serialVerified: serialVerified,
          counterfeitRisk: qrScore >= 80 ? 'low' : qrScore >= 60 ? 'medium' : 'high'
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
                        <h4 className="font-medium text-gray-900 mb-2">🤖 AI Authenticity Analysis</h4>
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
                        
                        {/* AI Disclaimer */}
                        <div className="mt-3 p-2 bg-blue-50 border-l-4 border-blue-400 rounded">
                          <p className="text-xs text-blue-800">
                            <strong>⚠️ AI Analysis:</strong> This analysis is generated by artificial intelligence and may not be 100% accurate. 
                            Always verify with official sources and use your judgment when making purchasing decisions.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Explanation */}
                    <div className="mt-6 border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">🔍 Why This Score?</h4>
                      <p className="text-sm text-gray-700 mb-4">{scanResult.authenticity.explanation?.summary}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Positive Factors */}
                        <div className="bg-green-50 p-3 rounded-lg">
                          <h5 className="font-medium text-green-800 mb-2">✅ Positive Indicators</h5>
                          <ul className="text-sm text-green-700 space-y-1">
                            {scanResult.authenticity.explanation?.positiveFactors.map((factor: string, index: number) => (
                              <li key={index}>• {factor}</li>
                            ))}
                          </ul>
                        </div>
                        
                        {/* Negative Factors */}
                        <div className="bg-red-50 p-3 rounded-lg">
                          <h5 className="font-medium text-red-800 mb-2">⚠️ Concerns</h5>
                          <ul className="text-sm text-red-700 space-y-1">
                            {scanResult.authenticity.explanation?.negativeFactors.length > 0 ? (
                              scanResult.authenticity.explanation.negativeFactors.map((factor: string, index: number) => (
                                <li key={index}>• {factor}</li>
                              ))
                            ) : (
                              <li>• No significant concerns detected</li>
                            )}
                          </ul>
                        </div>
                      </div>
                      
                      {/* Detailed Scoring Breakdown */}
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h5 className="font-medium text-gray-800 mb-3">📊 Detailed Scoring Analysis</h5>
                        <div className="space-y-4">
                          {scanResult.authenticity.explanation?.scoringBreakdown.map((item: any, index: number) => (
                            <div key={index} className="border-l-4 border-gray-300 pl-4">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-medium text-gray-800">{item.factor}</span>
                                <span className={`font-bold text-lg ${
                                  item.impact.startsWith('+') ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {item.impact}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 leading-relaxed">{item.reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Recommendation */}
                      <div className={`p-3 rounded-lg ${
                        scanResult.authenticity.score >= 80 ? 'bg-green-100 text-green-800' :
                        scanResult.authenticity.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        <h5 className="font-medium mb-1">💡 Recommendation</h5>
                        <p className="text-sm">{scanResult.authenticity.explanation?.recommendation}</p>
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
                        <h4 className="font-medium text-gray-900 mb-2">🤖 AI Authenticity Verification</h4>
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
                        
                        {/* AI Disclaimer */}
                        <div className="mt-3 p-2 bg-blue-50 border-l-4 border-blue-400 rounded">
                          <p className="text-xs text-blue-800">
                            <strong>⚠️ AI Analysis:</strong> This verification uses artificial intelligence and may not be 100% accurate. 
                            For valuable items, verify authenticity through official manufacturer channels.
                          </p>
                        </div>
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

                    {/* QR Detailed Explanation */}
                    <div className="mt-6 border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">🔍 QR Code Analysis Explanation</h4>
                      <p className="text-sm text-gray-700 mb-4">{qrResult.authenticity.explanation?.summary}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Positive Factors */}
                        <div className="bg-green-50 p-3 rounded-lg">
                          <h5 className="font-medium text-green-800 mb-2">✅ Verification Passed</h5>
                          <ul className="text-sm text-green-700 space-y-1">
                            {qrResult.authenticity.explanation?.positiveFactors.map((factor: string, index: number) => (
                              <li key={index}>• {factor}</li>
                            ))}
                          </ul>
                        </div>
                        
                        {/* Negative Factors */}
                        <div className="bg-red-50 p-3 rounded-lg">
                          <h5 className="font-medium text-red-800 mb-2">⚠️ Verification Failed</h5>
                          <ul className="text-sm text-red-700 space-y-1">
                            {qrResult.authenticity.explanation?.negativeFactors.length > 0 ? (
                              qrResult.authenticity.explanation.negativeFactors.map((factor: string, index: number) => (
                                <li key={index}>• {factor}</li>
                              ))
                            ) : (
                              <li>• All verification checks passed</li>
                            )}
                          </ul>
                        </div>
                      </div>
                      
                      {/* QR Detailed Verification Breakdown */}
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h5 className="font-medium text-gray-800 mb-3">📊 Detailed Verification Analysis</h5>
                        <div className="space-y-4">
                          {qrResult.authenticity.explanation?.scoringBreakdown.map((item: any, index: number) => (
                            <div key={index} className="border-l-4 border-blue-300 pl-4">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-medium text-gray-800">{item.factor}</span>
                                <span className={`font-bold text-lg ${
                                  item.impact.startsWith('+') ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {item.impact}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 leading-relaxed">{item.reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* QR Recommendation */}
                      <div className={`p-3 rounded-lg ${
                        qrResult.authenticity.score >= 80 ? 'bg-green-100 text-green-800' :
                        qrResult.authenticity.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        <h5 className="font-medium mb-1">💡 Final Recommendation</h5>
                        <p className="text-sm">{qrResult.authenticity.explanation?.recommendation}</p>
                      </div>
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

  // Show landing page for non-authenticated users first
  if (!isLoggedIn && showView === 'landing') {
    return (
      <LandingPage
        onLogin={() => setShowView('login')}
        onRegister={() => setShowView('register')}
        onViewPricing={() => setShowView('pricing')}
      />
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