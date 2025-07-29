import { useEffect, useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  CreditCard, 
  Bell,
  X 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  autoHide?: boolean;
  duration?: number;
}

export function WebhookNotifications() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  useEffect(() => {
    // Subscription events
    const handleSubscriptionUpdated = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { status, planName } = customEvent.detail;
      
      if (status === 'active') {
        addNotification({
          id: `sub-${Date.now()}`,
          type: 'success',
          title: 'Subscription Activated',
          message: `Your ${planName} subscription is now active!`,
          autoHide: true,
          duration: 5000,
        });
        
        toast.success(`${planName} subscription activated!`);
      }
    };

    const handleSubscriptionCanceled = (event: Event) => {
      const customEvent = event as CustomEvent;
      addNotification({
        id: `sub-cancel-${Date.now()}`,
        type: 'warning',
        title: 'Subscription Canceled',
        message: 'Your subscription has been canceled. You\'ll continue to have access until the end of your billing period.',
        action: {
          label: 'Reactivate',
          onClick: () => window.location.href = '/pricing',
        },
      });
      
      toast.error('Subscription canceled');
    };

    // Payment events
    const handlePaymentSucceeded = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { amount, currency } = customEvent.detail;
      
      addNotification({
        id: `payment-success-${Date.now()}`,
        type: 'success',
        title: 'Payment Successful',
        message: `Your payment of ${currency} ${amount} has been processed successfully.`,
        autoHide: true,
        duration: 4000,
      });
    };

    const handlePaymentFailed = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { amount, currency } = customEvent.detail;
      
      addNotification({
        id: `payment-failed-${Date.now()}`,
        type: 'error',
        title: 'Payment Failed',
        message: `Your payment of ${currency} ${amount} could not be processed. Please update your payment method.`,
        action: {
          label: 'Update Payment',
          onClick: () => window.location.href = '/subscription',
        },
      });
      
      toast.error('Payment failed - please update your payment method');
    };

    // Invoice events
    const handleInvoicePaid = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { amountPaid } = customEvent.detail;
      
      addNotification({
        id: `invoice-paid-${Date.now()}`,
        type: 'success',
        title: 'Invoice Paid',
        message: `Your invoice for $${amountPaid} has been paid successfully.`,
        autoHide: true,
        duration: 4000,
      });
    };

    const handleInvoicePaymentFailed = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { amountDue } = customEvent.detail;
      
      addNotification({
        id: `invoice-failed-${Date.now()}`,
        type: 'error',
        title: 'Invoice Payment Failed',
        message: `We couldn't process your payment of $${amountDue}. Please update your payment method to avoid service interruption.`,
        action: {
          label: 'Pay Now',
          onClick: () => window.location.href = '/subscription',
        },
      });
      
      toast.error('Invoice payment failed');
    };

    const handleUpcomingInvoice = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { amountDue, dueDate } = customEvent.detail;
      const formattedDate = new Date(dueDate).toLocaleDateString();
      
      addNotification({
        id: `invoice-upcoming-${Date.now()}`,
        type: 'info',
        title: 'Upcoming Payment',
        message: `Your next payment of $${amountDue} is due on ${formattedDate}.`,
        action: {
          label: 'View Billing',
          onClick: () => window.location.href = '/subscription',
        },
      });
    };

    // Add event listeners
    window.addEventListener('subscription_updated', handleSubscriptionUpdated);
    window.addEventListener('subscription_canceled', handleSubscriptionCanceled);
    window.addEventListener('payment_succeeded', handlePaymentSucceeded);
    window.addEventListener('payment_failed', handlePaymentFailed);
    window.addEventListener('invoice_paid', handleInvoicePaid);
    window.addEventListener('invoice_payment_failed', handleInvoicePaymentFailed);
    window.addEventListener('invoice_upcoming', handleUpcomingInvoice);

    return () => {
      window.removeEventListener('subscription_updated', handleSubscriptionUpdated);
      window.removeEventListener('subscription_canceled', handleSubscriptionCanceled);
      window.removeEventListener('payment_succeeded', handlePaymentSucceeded);
      window.removeEventListener('payment_failed', handlePaymentFailed);
      window.removeEventListener('invoice_paid', handleInvoicePaid);
      window.removeEventListener('invoice_payment_failed', handleInvoicePaymentFailed);
      window.removeEventListener('invoice_upcoming', handleUpcomingInvoice);
    };
  }, []);

  const addNotification = (notification: NotificationData) => {
    setNotifications(prev => [...prev, notification]);
    
    if (notification.autoHide) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration || 3000);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: NotificationData['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Bell className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBorderColor = (type: NotificationData['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-200';
      case 'error':
        return 'border-red-200';
      case 'warning':
        return 'border-yellow-200';
      case 'info':
        return 'border-blue-200';
      default:
        return 'border-gray-200';
    }
  };

  const getBackgroundColor = (type: NotificationData['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50';
      case 'error':
        return 'bg-red-50';
      case 'warning':
        return 'bg-yellow-50';
      case 'info':
        return 'bg-blue-50';
      default:
        return 'bg-gray-50';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            ${getBackgroundColor(notification.type)}
            ${getBorderColor(notification.type)}
            border rounded-lg p-4 shadow-lg animate-slide-in-right
          `}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon(notification.type)}
            </div>
            
            <div className="ml-3 flex-1">
              <h4 className="text-sm font-semibold text-gray-900">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-700 mt-1">
                {notification.message}
              </p>
              
              {notification.action && (
                <button
                  onClick={() => {
                    notification.action!.onClick();
                    removeNotification(notification.id);
                  }}
                  className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  {notification.action.label}
                </button>
              )}
            </div>
            
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// CSS animation classes (add to your global CSS)
const styles = `
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}
`;