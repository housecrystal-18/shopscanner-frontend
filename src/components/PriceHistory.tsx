import React, { useState, useEffect } from 'react';
import { TrendingDown, TrendingUp, Bell, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { priceTrackingService, type PriceHistoryResult } from '../services/priceTracking';

interface PricePoint {
  date: string;
  price: number;
  store: string;
}

interface PriceHistoryProps {
  productName: string;
  currentPrice: number;
  productId?: string; // ASIN, eBay item ID, etc.
  productUrl?: string; // For extracting product ID
  currency?: string;
  className?: string;
}

export function PriceHistory({ 
  productName, 
  currentPrice,
  productId,
  productUrl,
  currency = 'USD',
  className = '' 
}: PriceHistoryProps) {
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [priceHistory, setPriceHistory] = useState<PriceHistoryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract product ID from URL if not provided directly
  const extractProductId = (url: string): string | null => {
    // Amazon ASIN
    const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})|\/gp\/product\/([A-Z0-9]{10})|asin=([A-Z0-9]{10})/i);
    if (asinMatch) return asinMatch[1] || asinMatch[2] || asinMatch[3];

    // eBay item ID
    const ebayMatch = url.match(/\/itm\/([0-9]{12})|item=([0-9]{12})/i);
    if (ebayMatch) return ebayMatch[1] || ebayMatch[2];

    // Etsy listing ID
    const etsyMatch = url.match(/\/listing\/([0-9]+)/i);
    if (etsyMatch) return etsyMatch[1];

    return null;
  };

  // Load real price history data
  useEffect(() => {
    const loadPriceHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const resolvedProductId = productId || (productUrl ? extractProductId(productUrl) : null);
        
        if (!resolvedProductId) {
          console.warn('No product ID available for price history');
          setError('Product ID not available for price tracking');
          setLoading(false);
          return;
        }

        const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365;
        const history = await priceTrackingService.getPriceHistory(resolvedProductId, days);
        
        if (history) {
          setPriceHistory(history);
          console.log(`Loaded ${history.pricePoints.length} price data points for ${productName}`);
        } else {
          console.log('No price history available yet');
          setPriceHistory(null);
        }
      } catch (err) {
        console.error('Failed to load price history:', err);
        setError('Failed to load price history');
      } finally {
        setLoading(false);
      }
    };

    loadPriceHistory();
  }, [productId, productUrl, timeframe, productName]);

  // Fallback: Mock price history data for demonstration when no real data exists
  const generatePriceHistory = (): PricePoint[] => {
    const basePrice = currentPrice;
    const history: PricePoint[] = [];
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate realistic price fluctuations
      const variance = (Math.random() - 0.5) * 0.3; // ±15% variance
      const seasonalFactor = Math.sin((i / days) * Math.PI * 2) * 0.1; // Seasonal trends
      const price = basePrice * (1 + variance + seasonalFactor);
      
      const stores = ['Amazon', 'Best Buy', 'Walmart', 'Target', 'eBay'];
      const store = stores[Math.floor(Math.random() * stores.length)];
      
      history.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(price * 100) / 100,
        store
      });
    }
    
    return history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Use real price history data if available, otherwise fall back to mock data
  const displayData = priceHistory ? {
    history: priceHistory.pricePoints.map(point => ({
      date: new Date(point.timestamp).toISOString().split('T')[0],
      price: point.price,
      store: point.store
    })),
    lowestPrice: priceHistory.lowestPrice,
    highestPrice: priceHistory.highestPrice,
    currentPrice: priceHistory.currentPrice,
    priceChange7d: priceHistory.priceChange7d,
    priceChange30d: priceHistory.priceChange30d,
    bestStore: priceHistory.bestStore
  } : {
    history: generatePriceHistory(),
    lowestPrice: 0,
    highestPrice: 0,
    currentPrice: currentPrice,
    priceChange7d: undefined,
    priceChange30d: undefined,
    bestStore: undefined
  };

  const { history, lowestPrice, highestPrice } = displayData;
  const averagePrice = history.length > 0 ? history.reduce((sum, p) => sum + p.price, 0) / history.length : currentPrice;
  
  // Calculate price trend
  const oldPrice = history[0]?.price || currentPrice;
  const priceDiff = currentPrice - oldPrice;
  const priceChangePercent = ((priceDiff / oldPrice) * 100).toFixed(1);
  const isIncreasing = priceDiff > 0;

  // Best time to buy recommendation
  const getBuyRecommendation = () => {
    const currentVsAverage = ((currentPrice - averagePrice) / averagePrice) * 100;
    const currentVsLowest = ((currentPrice - lowestPrice) / lowestPrice) * 100;
    
    if (currentVsLowest < 10) return { text: 'Excellent time to buy!', color: 'text-green-600', bg: 'bg-green-50' };
    if (currentVsAverage < -5) return { text: 'Good time to buy', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (currentVsAverage > 15) return { text: 'Consider waiting', color: 'text-red-600', bg: 'bg-red-50' };
    return { text: 'Fair price', color: 'text-yellow-600', bg: 'bg-yellow-50' };
  };

  const recommendation = getBuyRecommendation();

  const handlePriceAlert = async () => {
    if (!alertEnabled) {
      try {
        const resolvedProductId = productId || (productUrl ? extractProductId(productUrl) : null);
        if (!resolvedProductId) {
          alert('Unable to create price alert: Product ID not available');
          return;
        }

        const alertPrice = parseFloat(targetPrice) || currentPrice * 0.9;
        await priceTrackingService.createPriceAlert(resolvedProductId, alertPrice);
        
        setAlertEnabled(true);
        alert(`Price alert created! You'll be notified when ${productName} drops below $${alertPrice.toFixed(2)}`);
        console.log(`Created price alert for ${productName} at $${alertPrice.toFixed(2)}`);
      } catch (error) {
        console.error('Failed to create price alert:', error);
        alert('Failed to create price alert. Please try again.');
      }
    } else {
      setAlertEnabled(false);
      alert('Price alert disabled');
    }
  };

  // Create simple SVG chart
  const chartWidth = 300;
  const chartHeight = 100;
  const chartMaxPrice = Math.max(...history.map(p => p.price));
  const chartMinPrice = Math.min(...history.map(p => p.price));
  const priceRange = chartMaxPrice - chartMinPrice || 1;

  const chartPoints = history.map((point, index) => {
    const x = (index / (history.length - 1)) * chartWidth;
    const y = chartHeight - ((point.price - chartMinPrice) / priceRange) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className={`bg-white rounded-lg border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-900">Price History</h3>
          {loading && (
            <span className="text-sm text-gray-500">Loading...</span>
          )}
          {!loading && priceHistory && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Real Data ({priceHistory.pricePoints.length} points)
            </span>
          )}
          {!loading && !priceHistory && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              Demo Data
            </span>
          )}
          {error && (
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
              {error}
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          {(['7d', '30d', '90d', '1y'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1 text-xs rounded-full ${
                timeframe === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Price Trend Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-sm text-gray-500">Current</div>
          <div className="text-lg font-bold">${currentPrice.toFixed(2)}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500">Average</div>
          <div className="text-lg font-bold">${averagePrice.toFixed(2)}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500">Lowest</div>
          <div className="text-lg font-bold text-green-600">${lowestPrice.toFixed(2)}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500">Highest</div>
          <div className="text-lg font-bold text-red-600">${highestPrice.toFixed(2)}</div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Price line */}
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              points={chartPoints}
            />
            
            {/* Data points */}
            {history.map((point, index) => {
              const x = (index / (history.length - 1)) * chartWidth;
              const y = chartHeight - ((point.price - chartMinPrice) / priceRange) * chartHeight;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="3"
                  fill="#3b82f6"
                  className="hover:r-4 cursor-pointer"
                >
                  <title>{`${point.date}: $${point.price.toFixed(2)} at ${point.store}`}</title>
                </circle>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Price Trend & Recommendation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center space-x-2">
          {isIncreasing ? (
            <TrendingUp className="w-5 h-5 text-red-500" />
          ) : (
            <TrendingDown className="w-5 h-5 text-green-500" />
          )}
          <span className={`font-medium ${isIncreasing ? 'text-red-600' : 'text-green-600'}`}>
            {isIncreasing ? '+' : ''}{priceChangePercent}% vs {timeframe} ago
          </span>
        </div>
        
        <div className={`px-3 py-2 rounded-lg ${recommendation.bg}`}>
          <div className={`text-sm font-medium ${recommendation.color} flex items-center`}>
            <DollarSign className="w-4 h-4 mr-1" />
            {recommendation.text}
          </div>
        </div>
      </div>

      {/* Price Alert Setup */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Bell className="w-4 h-4 mr-2" />
            Price Alert
          </h4>
          <button
            onClick={handlePriceAlert}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              alertEnabled
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {alertEnabled ? 'Alert Active' : 'Set Alert'}
          </button>
        </div>
        
        {!alertEnabled && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Notify me when price drops below</span>
            <div className="flex items-center">
              <span className="text-sm mr-1">$</span>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder={(currentPrice * 0.9).toFixed(2)}
                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.01"
                min="0"
              />
            </div>
          </div>
        )}
        
        {alertEnabled && (
          <div className="flex items-center text-sm text-green-600">
            <AlertCircle className="w-4 h-4 mr-1" />
            You'll be notified when price drops below ${targetPrice || (currentPrice * 0.9).toFixed(2)}
          </div>
        )}
      </div>

      {/* Historical Price Points */}
      <div className="mt-4">
        <h5 className="text-sm font-medium text-gray-900 mb-2">Recent Price Changes</h5>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {history.slice(-5).reverse().map((point, index) => (
            <div key={index} className="flex justify-between items-center text-xs text-gray-600">
              <span>{new Date(point.date).toLocaleDateString()}</span>
              <span>{point.store}</span>
              <span className="font-medium">${point.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}