import React, { useState } from 'react';
import { 
  Bell, 
  Plus, 
  X, 
  DollarSign, 
  Target,
  Trash2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { PriceAlert } from '../../types/priceComparison';

interface PriceAlertManagerProps {
  alerts: PriceAlert[];
  currentPrice?: number;
  productName?: string;
  onCreateAlert: (targetPrice: number, storeName?: string) => Promise<void>;
  onDeleteAlert: (alertId: string) => Promise<void>;
  isCreating?: boolean;
  isDeleting?: boolean;
}

export function PriceAlertManager({
  alerts,
  currentPrice,
  productName,
  onCreateAlert,
  onDeleteAlert,
  isCreating = false,
  isDeleting = false,
}: PriceAlertManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');
  const [storeName, setStoreName] = useState('');

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) {
      return;
    }

    try {
      await onCreateAlert(price, storeName || undefined);
      setTargetPrice('');
      setStoreName('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create alert:', error);
    }
  };

  const getAlertStatus = (alert: PriceAlert) => {
    if (!alert.isActive) return 'inactive';
    if (alert.triggeredAt) return 'triggered';
    if (currentPrice && currentPrice <= alert.targetPrice) return 'ready';
    return 'active';
  };

  const getAlertStatusInfo = (status: string) => {
    switch (status) {
      case 'triggered':
        return {
          icon: CheckCircle,
          color: 'text-green-600 bg-green-100',
          label: 'Triggered',
        };
      case 'ready':
        return {
          icon: Target,
          color: 'text-blue-600 bg-blue-100',
          label: 'Target Reached',
        };
      case 'active':
        return {
          icon: Bell,
          color: 'text-yellow-600 bg-yellow-100',
          label: 'Active',
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-600 bg-gray-100',
          label: 'Inactive',
        };
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Bell className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Price Alerts</h3>
            <p className="text-sm text-gray-600">Get notified when prices drop</p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Alert</span>
        </button>
      </div>

      {/* Create Alert Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <form onSubmit={handleCreateAlert} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Price
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="Enter target price"
                  className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              {currentPrice && (
                <p className="text-sm text-gray-500 mt-1">
                  Current lowest price: {formatPrice(currentPrice)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store (Optional)
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Specific store (leave empty for any store)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="submit"
                disabled={isCreating || !targetPrice}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating...' : 'Create Alert'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setTargetPrice('');
                  setStoreName('');
                }}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Alerts List */}
      {alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const status = getAlertStatus(alert);
            const statusInfo = getAlertStatusInfo(status);
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={alert.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${statusInfo.color}`}>
                      <StatusIcon className="h-4 w-4" />
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {formatPrice(alert.targetPrice)}
                        </span>
                        {alert.storeName && (
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {alert.storeName}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span className={`font-medium ${statusInfo.color.split(' ')[0]}`}>
                          {statusInfo.label}
                        </span>
                        <span>•</span>
                        <span>Created {formatDate(alert.createdAt)}</span>
                        {alert.triggeredAt && (
                          <>
                            <span>•</span>
                            <span>Triggered {formatDate(alert.triggeredAt)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteAlert(alert.id)}
                    disabled={isDeleting}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete alert"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Progress indicator */}
                {alert.isActive && !alert.triggeredAt && currentPrice && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Current: {formatPrice(currentPrice)}</span>
                      <span>Target: {formatPrice(alert.targetPrice)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          currentPrice <= alert.targetPrice ? 'bg-green-500' : 'bg-primary-500'
                        }`}
                        style={{
                          width: `${Math.min(100, (currentPrice / alert.targetPrice) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            No Price Alerts Set
          </h4>
          <p className="text-gray-600 mb-4">
            Create your first price alert to get notified when {productName || 'this product'} goes on sale.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Create Your First Alert
          </button>
        </div>
      )}
    </div>
  );
}