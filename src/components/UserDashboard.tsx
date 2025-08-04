import React from 'react';
import { User, BarChart3, History, Star, Download, Settings } from 'lucide-react';

interface UserDashboardProps {
  user: any;
  onBack: () => void;
}

export function UserDashboard({ user, onBack }: UserDashboardProps) {
  // Mock scan history data
  const recentScans = [
    {
      id: 1,
      type: 'URL',
      product: 'iPhone 15 Pro',
      score: 98,
      date: '2025-07-31',
      store: 'amazon.com',
      status: 'Authentic'
    },
    {
      id: 2,
      type: 'QR',
      product: 'Nike Air Jordan',
      score: 85,
      date: '2025-07-30',
      store: 'footlocker.com',
      status: 'Likely Authentic'
    },
    {
      id: 3,
      type: 'URL',
      product: 'Rolex Watch',
      score: 45,
      date: '2025-07-29',
      store: 'cheapwatches.net',
      status: 'Suspicious'
    }
  ];

  const stats = {
    totalScans: 47,
    authenticProducts: 32,
    suspiciousProducts: 8,
    moneySaved: '$2,340'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.name}!</p>
              </div>
            </div>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Scanner
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Scans</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalScans}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Product Reality Check</p>
                <p className="text-2xl font-bold text-green-600">{stats.authenticProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center">
              <History className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Suspicious Items</p>
                <p className="text-2xl font-bold text-red-600">{stats.suspiciousProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center">
              <Download className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Money Saved</p>
                <p className="text-2xl font-bold text-purple-600">{stats.moneySaved}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Scans */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Scans</h2>
            <button className="flex items-center text-blue-600 hover:text-blue-700">
              <Download className="h-4 w-4 mr-1" />
              Export Report
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Score</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Store</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentScans.map((scan) => (
                  <tr key={scan.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{scan.product}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        scan.type === 'URL' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {scan.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold">{scan.score}/100</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        scan.score >= 80 ? 'bg-green-100 text-green-800' :
                        scan.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {scan.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{scan.store}</td>
                    <td className="py-3 px-4 text-gray-600">{scan.date}</td>
                    <td className="py-3 px-4">
                      <button className="text-blue-600 hover:text-blue-700 text-sm">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Account Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Account Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Name</label>
                <p className="font-medium">{user?.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Plan</label>
                <p className="font-medium capitalize">{user?.plan || 'Free'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Account Type</label>
                <p className="font-medium capitalize">{user?.type}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Usage This Month</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Scans Used</span>
                  <span>7 / {user?.plan === 'free' ? '10' : '∞'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: user?.plan === 'free' ? '70%' : '15%' }}></div>
                </div>
              </div>
              
              {user?.plan === 'free' && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Upgrade to Premium</strong> for unlimited scans and advanced features!
                  </p>
                  <button className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700">
                    Upgrade Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}