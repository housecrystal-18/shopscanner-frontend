import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  permission: NotificationPermission;
}

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isSubscribed: false,
    isLoading: true,
    permission: 'default'
  });

  const { isAuthenticated, user } = useAuth();

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setState(prev => ({
          ...prev,
          isSupported: false,
          isLoading: false
        }));
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        setState(prev => ({
          ...prev,
          isSupported: true,
          isSubscribed: !!subscription,
          isLoading: false,
          permission: Notification.permission
        }));
      } catch (error) {
        console.error('Error checking push notification support:', error);
        setState(prev => ({
          ...prev,
          isSupported: false,
          isLoading: false
        }));
      }
    };

    checkSupport();
  }, []);

  // Request permission for notifications
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported || !isAuthenticated) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      
      setState(prev => ({
        ...prev,
        permission
      }));

      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [state.isSupported, isAuthenticated]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported || !isAuthenticated || state.permission !== 'granted') {
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Get the VAPID public key from your backend
      const vapidResponse = await api.get('/api/push/vapid-key');
      const vapidPublicKey = vapidResponse.data.publicKey;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      // Send subscription to backend
      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: arrayBufferToBase64(subscription.getKey('auth')!)
        }
      };

      await api.post('/api/push/subscribe', {
        subscription: subscriptionData,
        userId: user?.id
      });

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        isLoading: false
      }));

      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [state.isSupported, state.permission, isAuthenticated, user?.id]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported || !isAuthenticated) {
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        
        // Remove subscription from backend
        await api.delete('/api/push/unsubscribe', {
          data: { userId: user?.id }
        });
      }

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        isLoading: false
      }));

      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [state.isSupported, isAuthenticated, user?.id]);

  // Send a test notification
  const sendTestNotification = useCallback(async (): Promise<boolean> => {
    if (!state.isSubscribed || !isAuthenticated) {
      return false;
    }

    try {
      await api.post('/api/push/test', {
        userId: user?.id,
        message: 'Test notification from Shop Scanner!'
      });

      return true;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  }, [state.isSubscribed, isAuthenticated, user?.id]);

  // Configure notification preferences
  const updatePreferences = useCallback(async (preferences: {
    priceAlerts?: boolean;
    wishlistUpdates?: boolean;
    newFeatures?: boolean;
    weeklyDigest?: boolean;
  }): Promise<boolean> => {
    if (!isAuthenticated) {
      return false;
    }

    try {
      await api.put('/api/push/preferences', {
        userId: user?.id,
        preferences
      });

      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  }, [isAuthenticated, user?.id]);

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    updatePreferences
  };
}

// Helper functions
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}