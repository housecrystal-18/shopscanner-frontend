import React, { useState } from 'react';
import { 
  Bell, 
  BellOff, 
  Smartphone, 
  TrendingDown, 
  Heart, 
  Sparkles,
  Mail,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { toast } from 'react-hot-toast';

interface NotificationPreferences {
  priceAlerts: boolean;
  wishlistUpdates: boolean;
  newFeatures: boolean;
  weeklyDigest: boolean;
}

export function NotificationSettings() {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    updatePreferences
  } = usePushNotifications();

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    priceAlerts: true,
    wishlistUpdates: true,
    newFeatures: false,
    weeklyDigest: true
  });

  const [isUpdatingPreferences, setIsUpdatingPreferences] = useState(false);

  const handleEnableNotifications = async () => {
    try {
      const permissionGranted = await requestPermission();
      
      if (!permissionGranted) {
        toast.error('Permission denied. Please enable notifications in your browser settings.');
        return;
      }

      const subscribed = await subscribe();
      
      if (subscribed) {
        toast.success('Push notifications enabled successfully!');
      } else {
        toast.error('Failed to enable push notifications. Please try again.');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast.error('Failed to enable notifications.');
    }
  };

  const handleDisableNotifications = async () => {
    try {
      const unsubscribed = await unsubscribe();
      
      if (unsubscribed) {
        toast.success('Push notifications disabled.');
      } else {
        toast.error('Failed to disable push notifications.');
      }
    } catch (error) {
      console.error('Error disabling notifications:', error);
      toast.error('Failed to disable notifications.');
    }
  };

  const handleTestNotification = async () => {
    try {
      const sent = await sendTestNotification();
      
      if (sent) {
        toast.success('Test notification sent! Check your device.');
      } else {
        toast.error('Failed to send test notification.');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Failed to send test notification.');
    }
  };

  const handlePreferenceChange = async (key: keyof NotificationPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    setIsUpdatingPreferences(true);
    
    try {
      await updatePreferences(newPreferences);
      toast.success('Notification preferences updated');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
      // Revert the change
      setPreferences(preferences);
    } finally {
      setIsUpdatingPreferences(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <BellOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Push Notifications Not Supported
          </h3>
          <p className="text-gray-600">
            Your browser doesn't support push notifications, or you're browsing in private mode.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Bell className="h-6 w-6 text-primary-600 mr-2" />
              Push Notifications
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Get notified about price drops, wishlist updates, and more
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {isSubscribed && (
              <button
                onClick={handleTestNotification}
                disabled={isLoading}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
              >
                Send Test
              </button>
            )}
            
            <button
              onClick={isSubscribed ? handleDisableNotifications : handleEnableNotifications}
              disabled={isLoading || permission === 'denied'}
              className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                isSubscribed
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {isLoading ? 'Loading...' : isSubscribed ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              isSubscribed ? 'bg-green-100' : permission === 'denied' ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              {isSubscribed ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : permission === 'denied' ? (
                <X className="h-5 w-5 text-red-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-gray-600" />
              )}
            </div>
            
            <div>
              <p className="font-medium text-gray-900">
                {isSubscribed ? 'Enabled' : permission === 'denied' ? 'Blocked' : 'Disabled'}
              </p>
              <p className="text-sm text-gray-600">
                {isSubscribed 
                  ? 'You\'ll receive push notifications for your selected preferences'
                  : permission === 'denied'
                    ? 'Notifications are blocked. Please enable them in your browser settings.'
                    : 'Enable push notifications to stay updated on price drops and wishlist changes'
                }
              </p>
            </div>
          </div>
          
          <Smartphone className="h-8 w-8 text-gray-400" />
        </div>

        {permission === 'denied' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">Notifications Blocked</p>
                <p>
                  To enable notifications, click the lock icon in your address bar and allow notifications,
                  then refresh this page.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preferences */}
      {isSubscribed && (
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Notification Preferences
          </h3>
          
          <div className="space-y-4">
            {/* Price Alerts */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Price Drop Alerts</p>
                  <p className="text-sm text-gray-600">
                    Get notified when items on your wishlist drop in price
                  </p>
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.priceAlerts}
                  onChange={(e) => handlePreferenceChange('priceAlerts', e.target.checked)}
                  disabled={isUpdatingPreferences}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* Wishlist Updates */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Heart className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Wishlist Updates</p>
                  <p className="text-sm text-gray-600">
                    Notifications about availability changes and restocks
                  </p>
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.wishlistUpdates}
                  onChange={(e) => handlePreferenceChange('wishlistUpdates', e.target.checked)}
                  disabled={isUpdatingPreferences}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* New Features */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">New Features</p>
                  <p className="text-sm text-gray-600">
                    Be the first to know about new Shop Scanner features
                  </p>
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.newFeatures}
                  onChange={(e) => handlePreferenceChange('newFeatures', e.target.checked)}
                  disabled={isUpdatingPreferences}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* Weekly Digest */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Weekly Digest</p>
                  <p className="text-sm text-gray-600">
                    Weekly summary of your savings and wishlist activity
                  </p>
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.weeklyDigest}
                  onChange={(e) => handlePreferenceChange('weeklyDigest', e.target.checked)}
                  disabled={isUpdatingPreferences}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Privacy Note</p>
                <p>
                  We only send notifications you've opted into. You can disable notifications
                  at any time, and we never share your notification preferences with third parties.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}