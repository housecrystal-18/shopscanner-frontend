import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CreditCard, 
  DollarSign, 
  Clock, 
  X,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { monitoring } from '../../lib/monitoring';

interface PaymentAlert {
  id: string;
  type: 'payment_failed' | 'subscription_at_risk' | 'invoice_overdue' | 'high_failure_rate';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

export function PaymentAlerts() {
  const [alerts, setAlerts] = useState<PaymentAlert[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Listen for payment failure events
    const handlePaymentFailed = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { error, amount, currency } = customEvent.detail;
      
      addAlert({
        id: `payment-failed-${Date.now()}`,
        type: 'payment_failed',
        severity: 'high',
        title: 'Payment Processing Failed',
        message: `Your payment${amount ? ` of ${currency} ${amount}` : ''} could not be processed. ${error || 'Please try again or update your payment method.'}`,
        timestamp: new Date(),
        actionUrl: '/subscription',
        actionLabel: 'Update Payment Method'
      });
    };

    const handleSubscriptionCanceled = (event: Event) => {
      const customEvent = event as CustomEvent;
      
      addAlert({
        id: `subscription-canceled-${Date.now()}`,
        type: 'subscription_at_risk',
        severity: 'medium',
        title: 'Subscription Canceled',
        message: 'Your subscription has been canceled. You\'ll retain access until the end of your billing period.',
        timestamp: new Date(),
        actionUrl: '/pricing',
        actionLabel: 'Reactivate Subscription'
      });
    };

    const handleInvoicePaymentFailed = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { amountDue, hostedUrl } = customEvent.detail;
      
      addAlert({
        id: `invoice-failed-${Date.now()}`,
        type: 'invoice_overdue',
        severity: 'critical',
        title: 'Invoice Payment Failed',
        message: `We couldn't process your payment of $${amountDue}. To avoid service interruption, please update your payment method.`,
        timestamp: new Date(),
        actionUrl: hostedUrl || '/subscription',
        actionLabel: 'Pay Invoice'
      });
    };

    // Monitor for high failure rates (multiple failures in short time)
    let failureCount = 0;
    let lastFailureTime = 0;
    
    const handleMultipleFailures = () => {
      const now = Date.now();
      if (now - lastFailureTime < 300000) { // 5 minutes
        failureCount++;
        if (failureCount >= 3) {
          addAlert({
            id: `high-failure-rate-${Date.now()}`,
            type: 'high_failure_rate',
            severity: 'critical',
            title: 'Multiple Payment Failures Detected',
            message: 'We\'ve detected multiple payment failures. This may indicate an issue with your payment method or account.',
            timestamp: new Date(),
            actionUrl: '/subscription',
            actionLabel: 'Contact Support'
          });
          failureCount = 0; // Reset after alert
        }
      } else {
        failureCount = 1;
      }
      lastFailureTime = now;
    };

    // Wrapper to track failure frequency
    const trackingPaymentFailedHandler = (event: Event) => {
      handlePaymentFailed(event);
      handleMultipleFailures();
    };

    // Add event listeners
    window.addEventListener('payment_failed', trackingPaymentFailedHandler);
    window.addEventListener('subscription_canceled', handleSubscriptionCanceled);
    window.addEventListener('invoice_payment_failed', handleInvoicePaymentFailed);

    return () => {
      window.removeEventListener('payment_failed', trackingPaymentFailedHandler);
      window.removeEventListener('subscription_canceled', handleSubscriptionCanceled);
      window.removeEventListener('invoice_payment_failed', handleInvoicePaymentFailed);
    };
  }, []);

  const addAlert = (alert: PaymentAlert) => {
    setAlerts(prev => {
      // Avoid duplicate alerts
      const exists = prev.some(a => a.type === alert.type && a.message === alert.message);
      if (exists) return prev;
      
      // Keep only the 5 most recent alerts
      const newAlerts = [alert, ...prev].slice(0, 5);
      return newAlerts;
    });

    // Auto-dismiss low severity alerts after 10 seconds
    if (alert.severity === 'low') {
      setTimeout(() => {
        dismissAlert(alert.id);
      }, 10000);
    }

    // Record in monitoring system
    const monitoringType = alert.type === 'subscription_at_risk' ? 'subscription_cancelled' as const :
                          alert.type === 'high_failure_rate' ? 'payment_failed' as const :
                          alert.type;
    
    monitoring.recordPaymentError({
      type: monitoringType,
      errorMessage: alert.message,
      timestamp: alert.timestamp,
      metadata: alert.metadata
    });
  };

  const dismissAlert = (id: string) => {
    setDismissed(prev => new Set([...prev, id]));
  };

  const retryPayment = () => {
    // Trigger payment retry flow
    window.location.href = '/subscription';
  };

  const getAlertIcon = (type: PaymentAlert['type']) => {
    switch (type) {
      case 'payment_failed':
        return <CreditCard className="h-5 w-5" />;
      case 'subscription_at_risk':
        return <RefreshCw className="h-5 w-5" />;
      case 'invoice_overdue':
        return <DollarSign className="h-5 w-5" />;
      case 'high_failure_rate':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getAlertColors = (severity: PaymentAlert['severity']) => {
    switch (severity) {
      case 'low':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'high':
        return 'border-orange-200 bg-orange-50 text-orange-800';
      case 'critical':
        return 'border-red-200 bg-red-50 text-red-800';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const visibleAlerts = alerts.filter(alert => !dismissed.has(alert.id));

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {visibleAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`
            border rounded-lg p-4 shadow-lg animate-slide-in-right
            ${getAlertColors(alert.severity)}
          `}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getAlertIcon(alert.type)}
            </div>
            
            <div className="ml-3 flex-1">
              <h4 className="text-sm font-semibold">
                {alert.title}
              </h4>
              <p className="text-sm mt-1">
                {alert.message}
              </p>
              
              <div className="flex items-center mt-2 text-xs opacity-75">
                <Clock className="h-3 w-3 mr-1" />
                {alert.timestamp.toLocaleTimeString()}
              </div>
              
              {alert.actionUrl && alert.actionLabel && (
                <div className="mt-3 flex space-x-2">
                  <a
                    href={alert.actionUrl}
                    className="inline-flex items-center text-xs font-medium hover:underline"
                  >
                    {alert.actionLabel}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                  
                  {alert.type === 'payment_failed' && (
                    <button
                      onClick={retryPayment}
                      className="inline-flex items-center text-xs font-medium hover:underline"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Retry Payment
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <button
              onClick={() => dismissAlert(alert.id)}
              className="flex-shrink-0 ml-2 opacity-50 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Monitoring Dashboard Component
export function MonitoringDashboard() {
  const [healthStatus, setHealthStatus] = useState<any>(null);

  useEffect(() => {
    const updateHealthStatus = () => {
      setHealthStatus(monitoring.getHealthStatus());
    };

    updateHealthStatus();
    const interval = setInterval(updateHealthStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!healthStatus) {
    return <div className="text-sm text-gray-500">Loading monitoring status...</div>;
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="text-lg font-semibold mb-4">Monitoring Status</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            healthStatus.isHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {healthStatus.isHealthy ? '✅ Healthy' : '❌ Unhealthy'}
          </div>
          <p className="text-xs text-gray-500 mt-1">Overall Status</p>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">
            {healthStatus.metrics.errorsInQueue}
          </div>
          <p className="text-xs text-gray-500">Errors in Queue</p>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">
            {healthStatus.metrics.metricsInBuffer}
          </div>
          <p className="text-xs text-gray-500">Metrics Buffered</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-900">Services</h4>
        {Object.entries(healthStatus.services).map(([service, status]) => (
          <div key={service} className="flex justify-between items-center text-sm">
            <span className="capitalize">{service.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
            <span className={status ? 'text-green-600' : 'text-red-600'}>
              {status ? '✅ Active' : '❌ Inactive'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}