import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar,
  DollarSign,
  Info
} from 'lucide-react';
import { PriceTrend } from '../../types/priceComparison';

interface PriceTrendChartProps {
  trends: PriceTrend[];
  selectedPeriod?: string;
  onPeriodChange?: (period: '24h' | '7d' | '30d' | '90d') => void;
}

export function PriceTrendChart({ 
  trends, 
  selectedPeriod = '30d', 
  onPeriodChange 
}: PriceTrendChartProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  const currentTrend = trends.find(t => t.period === selectedPeriod) || trends[0];

  const chartData = useMemo(() => {
    if (!currentTrend?.data) return [];
    
    const data = currentTrend.data.slice(-30); // Show last 30 data points max
    const minPrice = Math.min(...data.map(d => d.price));
    const maxPrice = Math.max(...data.map(d => d.price));
    const priceRange = maxPrice - minPrice;
    
    return data.map(point => ({
      ...point,
      normalizedPrice: priceRange > 0 ? ((point.price - minPrice) / priceRange) * 100 : 50,
    }));
  }, [currentTrend]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-5 w-5 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-5 w-5 text-green-500" />;
      default:
        return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-red-600';
      case 'down':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const periods = [
    { key: '24h', label: '24 Hours' },
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: '90d', label: '90 Days' },
  ] as const;

  if (!trends.length || !currentTrend) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Price History Available
          </h3>
          <p className="text-gray-600">
            Price trend data will appear here once we start tracking this product.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Price Trend</h3>
            <p className="text-sm text-gray-600">Track price changes over time</p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {periods.map(period => (
            <button
              key={period.key}
              onClick={() => onPeriodChange?.(period.key)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                selectedPeriod === period.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trend Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-1">
            {getTrendIcon(currentTrend.trend)}
            <span className="text-sm font-medium text-gray-700">Trend</span>
          </div>
          <div className={`text-lg font-semibold ${getTrendColor(currentTrend.trend)}`}>
            {currentTrend.trend === 'up' ? 'Increasing' : 
             currentTrend.trend === 'down' ? 'Decreasing' : 'Stable'}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-1">
            <DollarSign className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Change</span>
          </div>
          <div className={`text-lg font-semibold ${getTrendColor(currentTrend.trend)}`}>
            {currentTrend.changeAmount >= 0 ? '+' : ''}{formatPrice(currentTrend.changeAmount)}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-1">
            <TrendingUp className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Percentage</span>
          </div>
          <div className={`text-lg font-semibold ${getTrendColor(currentTrend.trend)}`}>
            {currentTrend.changePercentage >= 0 ? '+' : ''}{currentTrend.changePercentage.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <div className="h-48 border border-gray-200 rounded-lg bg-gray-50 relative overflow-hidden">
          {/* Chart SVG */}
          <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="10" height="20" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
            
            {/* Price line */}
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="0.5"
              points={chartData.map((point, index) => 
                `${(index / (chartData.length - 1)) * 100},${100 - point.normalizedPrice}`
              ).join(' ')}
            />
            
            {/* Data points */}
            {chartData.map((point, index) => (
              <circle
                key={index}
                cx={(index / (chartData.length - 1)) * 100}
                cy={100 - point.normalizedPrice}
                r="0.8"
                fill="#3b82f6"
                className="hover:r-1.5 transition-all cursor-pointer"
              >
                <title>{`${formatDate(point.date)}: ${formatPrice(point.price)}`}</title>
              </circle>
            ))}
          </svg>
        </div>

        {/* X-axis labels */}
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{chartData.length > 0 ? formatDate(chartData[0].date) : ''}</span>
          <span>{chartData.length > 0 ? formatDate(chartData[chartData.length - 1].date) : ''}</span>
        </div>
      </div>

      {/* Recent Data Points */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Price Points</h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {chartData.slice(-5).reverse().map((point, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-gray-600">{formatDate(point.date)}</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {point.source}
                </span>
              </div>
              <span className="font-medium text-gray-900">
                {formatPrice(point.price)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}