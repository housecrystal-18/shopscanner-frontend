/**
 * Stripe Webhook Handler for Frontend Integration
 * Handles real-time subscription and payment events from Stripe
 */

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
}

export interface SubscriptionEventData {
  id: string;
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
  current_period_start: number;
  current_period_end: number;
  customer: string;
  items: {
    data: Array<{
      price: {
        id: string;
        nickname?: string;
      };
    }>;
  };
}

export interface PaymentIntentEventData {
  id: string;
  status: 'succeeded' | 'failed' | 'requires_action' | 'canceled';
  amount: number;
  currency: string;
  customer: string;
}

export interface InvoiceEventData {
  id: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
  amount_paid: number;
  amount_due: number;
  customer: string;
  subscription: string;
  hosted_invoice_url: string;
  invoice_pdf: string;
}

/**
 * Webhook event types we handle
 */
export const WEBHOOK_EVENTS = {
  // Subscription events
  SUBSCRIPTION_CREATED: 'customer.subscription.created',
  SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  
  // Payment events
  PAYMENT_SUCCEEDED: 'payment_intent.succeeded',
  PAYMENT_FAILED: 'payment_intent.payment_failed',
  
  // Invoice events
  INVOICE_PAID: 'invoice.paid',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
  INVOICE_UPCOMING: 'invoice.upcoming',
  
  // Customer events
  CUSTOMER_UPDATED: 'customer.updated',
  CUSTOMER_DELETED: 'customer.deleted',
  
  // Payment method events
  PAYMENT_METHOD_ATTACHED: 'payment_method.attached',
  PAYMENT_METHOD_DETACHED: 'payment_method.detached',
} as const;

/**
 * Webhook event handlers
 */
export class WebhookEventHandler {
  /**
   * Process a Stripe webhook event
   */
  static async processEvent(event: StripeWebhookEvent): Promise<void> {
    console.log(`Processing webhook event: ${event.type}`, event.id);

    try {
      switch (event.type) {
        case WEBHOOK_EVENTS.SUBSCRIPTION_CREATED:
        case WEBHOOK_EVENTS.SUBSCRIPTION_UPDATED:
          await this.handleSubscriptionEvent(event.data.object as SubscriptionEventData);
          break;
          
        case WEBHOOK_EVENTS.SUBSCRIPTION_DELETED:
          await this.handleSubscriptionCanceled(event.data.object as SubscriptionEventData);
          break;
          
        case WEBHOOK_EVENTS.PAYMENT_SUCCEEDED:
          await this.handlePaymentSucceeded(event.data.object as PaymentIntentEventData);
          break;
          
        case WEBHOOK_EVENTS.PAYMENT_FAILED:
          await this.handlePaymentFailed(event.data.object as PaymentIntentEventData);
          break;
          
        case WEBHOOK_EVENTS.INVOICE_PAID:
          await this.handleInvoicePaid(event.data.object as InvoiceEventData);
          break;
          
        case WEBHOOK_EVENTS.INVOICE_PAYMENT_FAILED:
          await this.handleInvoicePaymentFailed(event.data.object as InvoiceEventData);
          break;
          
        case WEBHOOK_EVENTS.INVOICE_UPCOMING:
          await this.handleUpcomingInvoice(event.data.object as InvoiceEventData);
          break;
          
        default:
          console.log(`Unhandled webhook event type: ${event.type}`);
      }
    } catch (error) {
      console.error(`Error processing webhook event ${event.type}:`, error);
      throw error;
    }
  }

  /**
   * Handle subscription created/updated events
   */
  private static async handleSubscriptionEvent(subscription: SubscriptionEventData): Promise<void> {
    // Update subscription status in local storage or context
    const subscriptionData = {
      id: subscription.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      planId: subscription.items.data[0]?.price.id,
      planName: subscription.items.data[0]?.price.nickname,
    };

    // Store in localStorage for immediate access
    localStorage.setItem('subscription_status', JSON.stringify(subscriptionData));

    // Dispatch custom event for real-time UI updates
    window.dispatchEvent(new CustomEvent('subscription_updated', {
      detail: subscriptionData
    }));

    console.log('Subscription updated:', subscriptionData);
  }

  /**
   * Handle subscription cancellation
   */
  private static async handleSubscriptionCanceled(subscription: SubscriptionEventData): Promise<void> {
    const subscriptionData = {
      id: subscription.id,
      status: 'canceled',
      canceledAt: new Date(),
    };

    localStorage.setItem('subscription_status', JSON.stringify(subscriptionData));

    window.dispatchEvent(new CustomEvent('subscription_canceled', {
      detail: subscriptionData
    }));

    console.log('Subscription canceled:', subscriptionData);
  }

  /**
   * Handle successful payment
   */
  private static async handlePaymentSucceeded(paymentIntent: PaymentIntentEventData): Promise<void> {
    const paymentData = {
      id: paymentIntent.id,
      status: 'succeeded',
      amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency.toUpperCase(),
    };

    window.dispatchEvent(new CustomEvent('payment_succeeded', {
      detail: paymentData
    }));

    console.log('Payment succeeded:', paymentData);
  }

  /**
   * Handle failed payment
   */
  private static async handlePaymentFailed(paymentIntent: PaymentIntentEventData): Promise<void> {
    const paymentData = {
      id: paymentIntent.id,
      status: 'failed',
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
    };

    window.dispatchEvent(new CustomEvent('payment_failed', {
      detail: paymentData
    }));

    console.log('Payment failed:', paymentData);
  }

  /**
   * Handle invoice paid
   */
  private static async handleInvoicePaid(invoice: InvoiceEventData): Promise<void> {
    const invoiceData = {
      id: invoice.id,
      status: 'paid',
      amountPaid: invoice.amount_paid / 100,
      pdfUrl: invoice.invoice_pdf,
      hostedUrl: invoice.hosted_invoice_url,
    };

    window.dispatchEvent(new CustomEvent('invoice_paid', {
      detail: invoiceData
    }));

    console.log('Invoice paid:', invoiceData);
  }

  /**
   * Handle failed invoice payment
   */
  private static async handleInvoicePaymentFailed(invoice: InvoiceEventData): Promise<void> {
    const invoiceData = {
      id: invoice.id,
      status: 'payment_failed',
      amountDue: invoice.amount_due / 100,
      hostedUrl: invoice.hosted_invoice_url,
    };

    window.dispatchEvent(new CustomEvent('invoice_payment_failed', {
      detail: invoiceData
    }));

    console.log('Invoice payment failed:', invoiceData);
  }

  /**
   * Handle upcoming invoice (billing cycle renewal)
   */
  private static async handleUpcomingInvoice(invoice: InvoiceEventData): Promise<void> {
    const invoiceData = {
      id: invoice.id,
      amountDue: invoice.amount_due / 100,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    };

    window.dispatchEvent(new CustomEvent('invoice_upcoming', {
      detail: invoiceData
    }));

    console.log('Upcoming invoice:', invoiceData);
  }
}

/**
 * Initialize webhook event listeners
 * Call this in your main app component
 */
export function initializeWebhookListeners(): () => void {
  const handleSubscriptionUpdated = (event: Event) => {
    const customEvent = event as CustomEvent;
    console.log('Subscription updated:', customEvent.detail);
    // Update your React context or state management here
  };

  const handleSubscriptionCanceled = (event: Event) => {
    const customEvent = event as CustomEvent;
    console.log('Subscription canceled:', customEvent.detail);
    // Handle subscription cancellation UI updates
  };

  const handlePaymentSucceeded = (event: Event) => {
    const customEvent = event as CustomEvent;
    console.log('Payment succeeded:', customEvent.detail);
    // Show success notification
  };

  const handlePaymentFailed = (event: Event) => {
    const customEvent = event as CustomEvent;
    console.log('Payment failed:', customEvent.detail);
    // Show failure notification and retry options
  };

  const handleInvoicePaid = (event: Event) => {
    const customEvent = event as CustomEvent;
    console.log('Invoice paid:', customEvent.detail);
    // Update billing history
  };

  const handleInvoicePaymentFailed = (event: Event) => {
    const customEvent = event as CustomEvent;
    console.log('Invoice payment failed:', customEvent.detail);
    // Show payment retry notification
  };

  const handleUpcomingInvoice = (event: Event) => {
    const customEvent = event as CustomEvent;
    console.log('Upcoming invoice:', customEvent.detail);
    // Show upcoming billing notification
  };

  // Add event listeners
  window.addEventListener('subscription_updated', handleSubscriptionUpdated);
  window.addEventListener('subscription_canceled', handleSubscriptionCanceled);
  window.addEventListener('payment_succeeded', handlePaymentSucceeded);
  window.addEventListener('payment_failed', handlePaymentFailed);
  window.addEventListener('invoice_paid', handleInvoicePaid);
  window.addEventListener('invoice_payment_failed', handleInvoicePaymentFailed);
  window.addEventListener('invoice_upcoming', handleUpcomingInvoice);

  // Return cleanup function
  return () => {
    window.removeEventListener('subscription_updated', handleSubscriptionUpdated);
    window.removeEventListener('subscription_canceled', handleSubscriptionCanceled);
    window.removeEventListener('payment_succeeded', handlePaymentSucceeded);
    window.removeEventListener('payment_failed', handlePaymentFailed);
    window.removeEventListener('invoice_paid', handleInvoicePaid);
    window.removeEventListener('invoice_payment_failed', handleInvoicePaymentFailed);
    window.removeEventListener('invoice_upcoming', handleUpcomingInvoice);
  };
}