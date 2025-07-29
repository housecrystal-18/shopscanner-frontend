# Production Monitoring and Alerting Setup Guide

This guide covers the comprehensive monitoring and alerting system for Shop Scanner's payment infrastructure.

## Overview

The monitoring system provides:
- **Real-time payment failure detection**
- **Performance monitoring** for payment processing
- **Error tracking** with Sentry integration
- **Automated alerting** for critical issues
- **Dashboard visualization** of system health

## Components

### 1. Monitoring Service (`src/lib/monitoring.ts`)
Central monitoring service that:
- Initializes error tracking (Sentry)
- Monitors Web Vitals and API performance
- Tracks payment processing metrics
- Handles error aggregation and alerting

### 2. Payment Alerts (`src/components/monitoring/PaymentAlerts.tsx`)
Real-time alert system that:
- Displays payment failure notifications
- Shows subscription status changes
- Provides quick action buttons for resolution
- Tracks multiple failure patterns

### 3. Monitoring Dashboard (`MonitoringDashboard`)
Administrative dashboard showing:
- System health status
- Error rates and queue sizes
- Service availability
- Performance metrics

## Setup Instructions

### Step 1: Configure Environment Variables

Add these variables to your production environment:

```bash
# Error Tracking (Sentry)
VITE_SENTRY_DSN=https://your-sentry-dsn@o123456.ingest.sentry.io/1234567

# Monitoring Flags
VITE_ENABLE_MONITORING=true

# Alert Webhook (Optional)
VITE_ALERT_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### Step 2: Sentry Configuration

1. **Create Sentry Project**:
   - Go to [Sentry.io](https://sentry.io)
   - Create new project for "JavaScript"
   - Copy the DSN to `VITE_SENTRY_DSN`

2. **Configure Sentry Settings**:
   ```javascript
   // Automatically configured in monitoring.ts
   Sentry.init({
     dsn: process.env.VITE_SENTRY_DSN,
     environment: 'production',
     tracesSampleRate: 0.1, // 10% performance monitoring
     beforeSend(event) {
       // Filter non-critical errors
       if (event.level === 'info' || event.level === 'debug') {
         return null;
       }
       return event;
     }
   });
   ```

### Step 3: Payment Event Monitoring

The system automatically monitors these payment events:

#### Critical Events (Immediate Alerts)
- `payment_failed` - Payment processing failures
- `invoice_payment_failed` - Recurring payment failures
- `webhook_failure` - Stripe webhook delivery issues

#### Warning Events (Tracked, Not Alerted)
- `subscription_canceled` - User-initiated cancellations
- `payment_retry` - Automatic payment retries

#### Performance Events
- `payment.processing_time` - Payment processing duration
- `api.response_time` - API response times
- `web_vitals.*` - Core Web Vitals metrics

### Step 4: Alerting Configuration

#### Slack Integration
```bash
# Set up Slack webhook for alerts
VITE_ALERT_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
```

#### Email Alerts (Custom Implementation)
```javascript
// Add to monitoring.ts sendAlert method
const alertEndpoint = 'https://api.yourdomain.com/alerts';
await fetch(alertEndpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    severity: 'critical',
    message: alertData.message,
    timestamp: alertData.timestamp
  })
});
```

### Step 5: Dashboard Access

#### Admin Dashboard
- Navigate to `/subscription` → "Monitoring" tab
- View real-time system health
- Monitor error rates and performance

#### Sentry Dashboard
- Access detailed error tracking at sentry.io
- View error frequency and impact
- Track performance issues

## Monitoring Metrics

### Payment Health Metrics

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| Payment Success Rate | % of successful payments | < 95% |
| Average Processing Time | Payment processing duration | > 10 seconds |
| Error Rate | Payment errors per hour | > 5 errors |
| Webhook Delivery Rate | Successful webhook deliveries | < 99% |

### Performance Metrics

| Metric | Description | Target |
|--------|-------------|---------|
| Largest Contentful Paint (LCP) | Page loading performance | < 2.5s |
| First Input Delay (FID) | Interactivity | < 100ms |
| Cumulative Layout Shift (CLS) | Visual stability | < 0.1 |
| API Response Time | Backend performance | < 500ms |

### Error Categories

#### Critical Errors (Immediate Action Required)
- Payment processing failures
- Stripe API authentication issues
- Database connection failures
- Webhook signature verification failures

#### High Priority Errors (Address Within 1 Hour)
- Multiple payment retries
- High API error rates
- Performance degradation
- Customer support escalations

#### Medium Priority Errors (Address Within 24 Hours)
- Subscription downgrades
- Failed email deliveries
- Non-critical API warnings
- Usage limit notifications

## Alert Response Procedures

### Payment Failure Alert Response

1. **Immediate Actions (< 5 minutes)**:
   - Check Stripe Dashboard for service status
   - Verify API key configuration
   - Review recent deployments

2. **Investigation (< 15 minutes)**:
   - Check Sentry for detailed error logs
   - Review payment processing metrics
   - Identify affected customer count

3. **Resolution (< 30 minutes)**:
   - Apply hotfix if code issue identified
   - Contact Stripe support if service issue
   - Communicate with affected customers

### High Error Rate Alert Response

1. **Assessment**:
   - Determine error pattern (geographic, payment method, etc.)
   - Check correlation with recent changes
   - Estimate customer impact

2. **Mitigation**:
   - Enable circuit breaker if available
   - Rollback recent changes if necessary
   - Implement temporary workarounds

3. **Communication**:
   - Update status page
   - Notify customer support team
   - Prepare customer communications

## Monitoring Best Practices

### 1. Proactive Monitoring
- Set up synthetic transaction monitoring
- Monitor business metrics alongside technical metrics
- Track customer-reported issues

### 2. Alert Fatigue Prevention
- Use appropriate alert thresholds
- Implement alert grouping and deduplication
- Regular review and tuning of alerts

### 3. Performance Optimization
- Monitor Core Web Vitals continuously
- Track payment funnel conversion rates
- Optimize based on real user metrics

### 4. Security Monitoring
- Monitor for suspicious payment patterns
- Track API rate limiting and abuse
- Alert on authentication failures

## Testing the Monitoring System

### Manual Testing

1. **Trigger Test Alerts**:
   ```javascript
   // In browser console (development only)
   window.dispatchEvent(new CustomEvent('payment_failed', {
     detail: { error: 'Test payment failure', amount: 29.99 }
   }));
   ```

2. **Performance Testing**:
   ```javascript
   // Test slow API responses
   monitoring.recordMetric({
     name: 'api.response_time',
     value: 5000, // 5 seconds (slow)
     unit: 'ms',
     timestamp: new Date()
   });
   ```

### Automated Testing

```javascript
// Add to your test suite
describe('Monitoring System', () => {
  it('should trigger alerts for payment failures', () => {
    const mockPaymentFailure = {
      type: 'payment_failed',
      error: 'Card declined'
    };
    
    window.dispatchEvent(new CustomEvent('payment_failed', {
      detail: mockPaymentFailure
    }));
    
    // Assert alert is displayed
    expect(screen.getByText('Payment Processing Failed')).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Common Issues

1. **Sentry Not Receiving Events**:
   - Verify DSN configuration
   - Check Content Security Policy settings
   - Ensure environment is set to 'production'

2. **Alerts Not Firing**:
   - Check webhook URL configuration
   - Verify event listeners are attached
   - Review alert threshold settings

3. **Performance Metrics Missing**:
   - Ensure PerformanceObserver is supported
   - Check browser compatibility
   - Verify metric recording logic

### Debug Commands

```javascript
// Check monitoring status
console.log(monitoring.getHealthStatus());

// Manually trigger error tracking
monitoring.recordPaymentError({
  type: 'payment_failed',
  errorMessage: 'Debug test error',
  timestamp: new Date()
});

// View metrics buffer
console.log(monitoring.metricsBuffer);
```

## Maintenance

### Regular Tasks

1. **Weekly Review**:
   - Review error trends in Sentry
   - Check alert effectiveness
   - Update monitoring thresholds if needed

2. **Monthly Analysis**:
   - Analyze payment failure patterns
   - Review performance trends
   - Update monitoring strategy

3. **Quarterly Updates**:
   - Review and update alert procedures
   - Test disaster recovery procedures
   - Update monitoring documentation

### Scaling Considerations

As your application grows:
- Implement log aggregation (ELK stack, Splunk)
- Add custom metrics collection (DataDog, New Relic)
- Implement automated incident response
- Set up multi-region monitoring

## Support Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Web Vitals Guide](https://web.dev/vitals/)
- [Stripe Monitoring Best Practices](https://stripe.com/docs/monitoring)
- [Performance Monitoring Guide](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API)

---

**Note**: This monitoring system is designed for production use. Ensure all sensitive configuration is properly secured and never committed to version control.