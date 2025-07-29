# Production Stripe Keys Migration Guide

This guide covers the process of migrating from Stripe test keys to live production keys for the Shop Scanner application.

## Prerequisites

- Stripe account activated for live payments
- Business verification completed in Stripe Dashboard
- Bank account connected for payouts
- SSL certificate configured for production domain

## Step 1: Obtain Live Stripe Keys

### From Stripe Dashboard

1. Log into [Stripe Dashboard](https://dashboard.stripe.com/)
2. Toggle from "Test mode" to "Live mode" (switch in left sidebar)
3. Navigate to **Developers → API keys**
4. Copy the following keys:
   - **Publishable key**: `pk_live_...` (for frontend)
   - **Secret key**: `sk_live_...` (for backend)

### Webhook Endpoint Secret

1. Navigate to **Developers → Webhooks**
2. Select your production webhook endpoint
3. Click "Reveal signing secret"
4. Copy the webhook secret: `whsec_...`

## Step 2: Update Environment Variables

### Frontend Environment Variables

Update `.env.production`:

```bash
# Replace test key with live key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_LIVE_KEY_HERE

# Ensure production API URL
VITE_API_URL=https://api.shopscanner.com
```

### Backend Environment Variables

Update your production backend with:

```bash
# Replace with live keys
STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_WEBHOOK_SECRET_HERE

# Production configuration
NODE_ENV=production
DATABASE_URL=your_production_database_url
```

## Step 3: Update Stripe Configuration

### Product and Price IDs

Live mode requires separate product and price IDs. Update `src/lib/stripe.ts`:

```typescript
// Production Stripe Product IDs (replace with actual values)
export const STRIPE_PRICE_IDS = {
  premium_monthly: 'price_live_premium_monthly_id',
  premium_annual: 'price_live_premium_annual_id',
  free: 'free', // Free tier doesn't need Stripe ID
};

// Live mode publishable key
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_PUBLISHABLE_KEY?.startsWith('pk_live_')) {
  console.warn('⚠️  Using test Stripe key in production mode');
}
```

### Create Production Products

In Stripe Dashboard (Live mode):

1. **Create Products**:
   - Premium Monthly ($29/month)
   - Premium Annual ($290/year)

2. **Configure Billing**:
   - Set billing intervals
   - Configure trial periods (if applicable)
   - Set up metered usage (if needed)

3. **Copy Product/Price IDs** to your environment configuration

## Step 4: Update Payment Configuration

### Tax Settings

Configure tax collection in Stripe Dashboard:

1. Navigate to **Settings → Tax**
2. Enable automatic tax calculation
3. Configure tax rates for your jurisdictions
4. Update checkout flow to collect tax information

### Customer Portal

Configure the customer portal for subscription management:

1. Navigate to **Settings → Billing → Customer portal**
2. Enable features:
   - Update payment methods
   - Download invoices
   - Cancel subscriptions
   - View billing history

## Step 5: Security Measures

### Environment Variable Security

```bash
# Use environment variable validation
if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_')) {
  throw new Error('Production requires live Stripe secret key');
}

if (!process.env.VITE_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_live_')) {
  throw new Error('Production requires live Stripe publishable key');
}
```

### Webhook Security

Update webhook handler to use live endpoint secret:

```javascript
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!endpointSecret?.startsWith('whsec_')) {
  throw new Error('Invalid webhook endpoint secret');
}
```

## Step 6: Test in Production

### Test Scenarios

1. **Subscription Creation**
   ```bash
   # Test with real credit card (use your own)
   # Use small amounts: $0.50 for testing
   ```

2. **Payment Processing**
   - Test successful payments
   - Test declined cards
   - Test expired cards
   - Test insufficient funds

3. **Webhook Delivery**
   - Monitor webhook events in Stripe Dashboard
   - Verify real-time UI updates
   - Test failure scenarios

### Validation Checklist

- [ ] Live keys configured correctly
- [ ] Webhook endpoints responding
- [ ] Payment processing successful
- [ ] Subscription management working
- [ ] Tax calculation correct (if applicable)
- [ ] Customer portal accessible
- [ ] Invoice generation working
- [ ] Refund processing functional

## Step 7: Rollback Plan

### Emergency Rollback

If issues occur, immediately:

1. **Revert to test keys** temporarily
2. **Notify users** of maintenance
3. **Fix issues** in staging environment
4. **Re-deploy** with corrected configuration

### Rollback Script

```bash
#!/bin/bash
echo "Rolling back to test Stripe keys..."

# Update environment variables
export VITE_STRIPE_PUBLISHABLE_KEY="pk_test_TYooMQauvdEDq54NiTphI7jx"
export STRIPE_SECRET_KEY="sk_test_your_test_secret_key"

# Restart services
npm run build
pm2 restart all

echo "Rollback complete. System using test keys."
```

## Step 8: Monitoring and Alerts

### Key Metrics to Monitor

1. **Payment Success Rate**
   - Target: >95%
   - Alert if <90%

2. **Webhook Delivery Rate**
   - Target: >99%
   - Alert if <95%

3. **API Response Times**
   - Target: <500ms
   - Alert if >1000ms

4. **Error Rates**
   - Target: <0.1%
   - Alert if >0.5%

### Stripe Dashboard Monitoring

Monitor in Stripe Dashboard:
- Payment volume and success rates
- Webhook delivery status
- Dispute and chargeback rates
- Customer satisfaction metrics

## Step 9: Business Configuration

### Payout Schedule

Configure automatic payouts:
1. Navigate to **Settings → Payouts**
2. Set payout schedule (daily/weekly/monthly)
3. Configure minimum payout amount
4. Verify bank account details

### Business Information

Ensure complete business profile:
- Business name and address
- Tax identification numbers
- Business type and description
- Support contact information

## Step 10: Legal and Compliance

### Update Terms of Service

Ensure terms reflect:
- Live payment processing
- Subscription billing terms
- Cancellation and refund policies
- Customer data handling

### Privacy Policy Updates

Update privacy policy for:
- Payment data processing
- Stripe data sharing
- Customer information retention
- GDPR compliance (if applicable)

## Common Issues and Solutions

### Issue: "Invalid API Key"
**Solution**: Verify key format and ensure no extra spaces

### Issue: "Webhook signature verification failed"
**Solution**: Check webhook secret matches Stripe dashboard

### Issue: "No such price"
**Solution**: Ensure price IDs are from live mode, not test mode

### Issue: "Customer portal not accessible"
**Solution**: Configure customer portal settings in Stripe Dashboard

## Support and Resources

- [Stripe Go-Live Checklist](https://stripe.com/docs/development/production-checklist)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)
- Stripe Support: support@stripe.com

## Verification Commands

```bash
# Check environment variables
echo "Publishable Key: $VITE_STRIPE_PUBLISHABLE_KEY"
echo "Secret Key format: ${STRIPE_SECRET_KEY:0:7}..."

# Test API connectivity
curl -u sk_live_...: https://api.stripe.com/v1/payment_intents \
  -X POST \
  -d amount=50 \
  -d currency=usd \
  -d automatic_payment_methods[enabled]=true

# Verify webhook endpoint
curl -X POST https://yourdomain.com/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

---

**⚠️ IMPORTANT**: Never commit live Stripe keys to version control. Always use environment variables and secure deployment practices.