# Stripe Webhook Configuration Guide

This guide covers how to set up Stripe webhooks for production deployment to handle real-time subscription and payment events.

## Prerequisites

- Stripe account with live API keys
- Backend server capable of receiving webhook endpoints
- SSL certificate for webhook URL validation

## Step 1: Create Webhook Endpoint in Stripe Dashboard

1. Log into your [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers → Webhooks**
3. Click **"Add endpoint"**
4. Enter your webhook URL: `https://yourdomain.com/api/webhooks/stripe`
5. Select the following events to listen for:

### Required Events

#### Subscription Events
- `customer.subscription.created` - New subscription created
- `customer.subscription.updated` - Subscription plan changed or status updated
- `customer.subscription.deleted` - Subscription canceled

#### Payment Events
- `payment_intent.succeeded` - Successful payment
- `payment_intent.payment_failed` - Failed payment

#### Invoice Events
- `invoice.paid` - Invoice successfully paid
- `invoice.payment_failed` - Invoice payment failed
- `invoice.upcoming` - Upcoming invoice (7 days before due)

#### Customer Events
- `customer.updated` - Customer information updated
- `customer.deleted` - Customer deleted

#### Payment Method Events
- `payment_method.attached` - New payment method added
- `payment_method.detached` - Payment method removed

## Step 2: Backend Webhook Handler

Create a webhook endpoint in your backend that:

1. Verifies the webhook signature using Stripe's signature verification
2. Processes the event and updates your database
3. Forwards relevant events to your frontend via WebSocket or Server-Sent Events

### Example Node.js/Express Handler

```javascript
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

app.post('/api/webhooks/stripe', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`⚠️  Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      // Update subscription in database
      // Forward to frontend via WebSocket
      break;
    
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Update payment status
      // Send confirmation to frontend
      break;
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});
```

## Step 3: Frontend Integration

The frontend webhook integration is already implemented in:

- `src/lib/webhook-handler.ts` - Event processing logic
- `src/components/notifications/WebhookNotifications.tsx` - UI notifications
- `src/contexts/SubscriptionContext.tsx` - Real-time subscription updates

### Testing Webhook Events

Use the Stripe CLI to test webhook events locally:

```bash
# Install Stripe CLI
npm install -g stripe

# Login to your Stripe account
stripe login

# Forward webhook events to your local server
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# Test specific events
stripe trigger customer.subscription.updated
stripe trigger payment_intent.succeeded
```

## Step 4: Production Configuration

### Environment Variables

Add these environment variables to your production deployment:

```bash
# Backend Environment Variables
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend Environment Variables  
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Webhook URL Configuration

- **Development**: `https://localhost:3001/api/webhooks/stripe`
- **Production**: `https://yourdomain.com/api/webhooks/stripe`

### Security Considerations

1. **Always verify webhook signatures** to ensure events are from Stripe
2. **Use HTTPS** for all webhook URLs
3. **Implement idempotency** to handle duplicate events
4. **Rate limit** webhook endpoints to prevent abuse
5. **Log all webhook events** for debugging and audit purposes

## Step 5: Monitoring and Alerting

### Webhook Monitoring

Monitor webhook delivery in the Stripe Dashboard:
- Check delivery success rates
- Review failed webhook attempts
- Monitor response times

### Error Handling

Implement proper error handling for:
- Network failures
- Database connection issues
- Invalid event data
- Processing timeouts

### Alerting Setup

Set up alerts for:
- High webhook failure rates
- Payment processing errors
- Subscription status issues
- Critical system errors

## Step 6: Testing in Production

### Test Scenarios

1. **Subscription Creation**
   - Create new subscription
   - Verify webhook delivery
   - Check frontend updates

2. **Payment Processing**
   - Process successful payment
   - Test failed payment scenarios
   - Verify notification delivery

3. **Subscription Changes**
   - Upgrade/downgrade plans
   - Cancel subscription
   - Test billing cycle updates

### Verification Checklist

- [ ] Webhook endpoints configured in Stripe Dashboard
- [ ] Backend webhook handler implemented and deployed
- [ ] Environment variables configured
- [ ] SSL certificates in place
- [ ] Webhook signature verification working
- [ ] Frontend receives real-time updates
- [ ] Notifications display correctly
- [ ] Error handling implemented
- [ ] Monitoring and alerting configured
- [ ] Test transactions successful

## Troubleshooting

### Common Issues

1. **Webhook signature verification fails**
   - Check webhook secret is correct
   - Ensure raw request body is used for verification
   - Verify endpoint URL matches Stripe configuration

2. **Events not received**
   - Check webhook URL is accessible from internet
   - Verify SSL certificate is valid
   - Check firewall and security group settings

3. **Frontend not updating**
   - Verify WebSocket/SSE connection to backend
   - Check browser console for JavaScript errors
   - Ensure event listeners are properly attached

### Debug Tools

- Stripe Dashboard webhook logs
- Browser developer tools network tab
- Backend server logs
- Application monitoring tools (e.g., Sentry, LogRocket)

## Support

For additional support:
- [Stripe Webhook Documentation](https://stripe.com/docs/webhooks)
- [Stripe Support](https://support.stripe.com/)
- Internal development team