import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  Scan,
  Heart,
  ShoppingBag,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { api } from '../../lib/api';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalScans: number;
    totalRevenue: number;
    conversionRate: number;
  };
  userGrowth: Array<{
    date: string;
    newUsers: number;
    activeUsers: number;
  }>;
  featureUsage: Array<{
    feature: string;
    usage: number;
    growth: number;
  }>;
  revenue: Array<{
    date: string;
    amount: number;
    subscriptions: number;
  }>;
  topPages: Array<{
    page: string;
    views: number;
    uniqueVisitors: number;
  }>;
}

const METRICS = [
  { 
    key: 'totalUsers', 
    label: 'Total Users', 
    icon: Users, 
    color: 'blue',
    format: (value: number) => value.toLocaleString()
  },
  { 
    key: 'activeUsers', 
    label: 'Active Users (30d)', 
    icon: TrendingUp, 
    color: 'green',
    format: (value: number) => value.toLocaleString()
  },
  { 
    key: 'totalScans', 
    label: 'Total Scans', 
    icon: Scan, 
    color: 'purple',
    format: (value: number) => value.toLocaleString()
  },
  { 
    key: 'totalRevenue', 
    label: 'Total Revenue', 
    icon: DollarSign, 
    color: 'yellow',
    format: (value: number) => `$${(value / 100).toLocaleString()}`
  }
];

const TIME_RANGES = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y', label: 'Last year' }
];

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('30d');
  const [isExporting, setIsExporting] = useState(false);

  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ['analytics', timeRange],
    queryFn: async (): Promise<AnalyticsData> => {
      const response = await api.get('/api/analytics/dashboard', {
        params: { timeRange }
      });
      return response.data;
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 2 * 60 * 1000 // Consider data stale after 2 minutes
  });

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const response = await api.get('/api/analytics/export', {
        params: { timeRange },
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export analytics:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Analytics Data
          </h3>
          <p className="text-gray-600">
            Analytics data is not available at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="h-7 w-7 text-primary-600 mr-3" />
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Track user engagement and revenue optimization
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => refetch()}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {TIME_RANGES.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>{isExporting ? 'Exporting...' : 'Export'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {METRICS.map((metric) => {
          const value = analytics.overview[metric.key as keyof typeof analytics.overview];
          
          return (
            <div key={metric.key} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg bg-${metric.color}-100`}>
                  <metric.icon className={`h-6 w-6 text-${metric.color}-600`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{metric.label}</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {metric.format(value)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
          <div className="space-y-3">
            {analytics.userGrowth.slice(-7).map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {formatDate(data.date)}
                </span>
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <span className="text-green-600">+{data.newUsers}</span> new
                  </div>
                  <div className="text-sm font-medium">
                    {data.activeUsers.toLocaleString()} active
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="space-y-3">
            {analytics.revenue.slice(-7).map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {formatDate(data.date)}
                </span>
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium text-green-600">
                    ${(data.amount / 100).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {data.subscriptions} subs
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Usage & Top Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Usage */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Usage</h3>
          <div className="space-y-4">
            {analytics.featureUsage.map((feature, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {feature.feature.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {feature.usage.toLocaleString()}
                  </span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    feature.growth > 0 
                      ? 'text-green-700 bg-green-100' 
                      : feature.growth < 0
                        ? 'text-red-700 bg-red-100'
                        : 'text-gray-700 bg-gray-100'
                  }`}>
                    {feature.growth > 0 ? '+' : ''}{formatPercentage(feature.growth)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pages</h3>
          <div className="space-y-4">
            {analytics.topPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {index + 1}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {page.page}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <span>{page.views.toLocaleString()} views</span>
                  <span>•</span>
                  <span>{page.uniqueVisitors.toLocaleString()} unique</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Conversion Funnel</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Website Visitors</span>
            </div>
            <span className="font-semibold">{analytics.overview.totalUsers.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Scan className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Product Scans</span>
            </div>
            <div className="text-right">
              <div className="font-semibold">{analytics.overview.totalScans.toLocaleString()}</div>
              <div className="text-sm text-gray-600">
                {formatPercentage((analytics.overview.totalScans / analytics.overview.totalUsers) * 100)} conversion
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="font-medium">Paid Subscriptions</span>
            </div>
            <div className="text-right">
              <div className="font-semibold">
                ${(analytics.overview.totalRevenue / 100).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                {formatPercentage(analytics.overview.conversionRate)} conversion
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}