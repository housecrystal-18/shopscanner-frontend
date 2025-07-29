#!/usr/bin/env node

/**
 * Production Environment Validation Script
 * Validates that all required environment variables and configurations
 * are properly set for production deployment.
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class ProductionValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = 0;
    this.total = 0;
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  check(description, condition, errorMessage, isWarning = false) {
    this.total++;
    
    if (condition) {
      this.passed++;
      this.log(`✓ ${description}`, 'green');
      return true;
    } else {
      if (isWarning) {
        this.warnings.push(errorMessage);
        this.log(`⚠ ${description}`, 'yellow');
      } else {
        this.errors.push(errorMessage);
        this.log(`✗ ${description}`, 'red');
      }
      return false;
    }
  }

  async validateEnvironmentVariables() {
    this.log('\n📋 Validating Environment Variables...', 'bold');
    
    // Load .env.production if it exists
    const envPath = path.join(process.cwd(), '.env.production');
    let envVars = {};
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        if (line && !line.startsWith('#')) {
          const [key, value] = line.split('=', 2);
          if (key && value) {
            envVars[key.trim()] = value.trim();
          }
        }
      });
    }

    // Required environment variables
    const requiredVars = [
      {
        key: 'VITE_API_URL',
        description: 'Production API URL configured',
        validator: (value) => value && value.startsWith('https://') && !value.includes('localhost'),
        error: 'VITE_API_URL must be a production HTTPS URL'
      },
      {
        key: 'VITE_STRIPE_PUBLISHABLE_KEY',
        description: 'Stripe live publishable key configured',
        validator: (value) => value && value.startsWith('pk_live_'),
        error: 'VITE_STRIPE_PUBLISHABLE_KEY must be a live Stripe key (pk_live_...)'
      },
      {
        key: 'VITE_APP_NAME',
        description: 'Application name configured',
        validator: (value) => value && value.length > 0,
        error: 'VITE_APP_NAME is required'
      }
    ];

    // Optional but recommended variables
    const optionalVars = [
      {
        key: 'VITE_SENTRY_DSN',
        description: 'Error monitoring (Sentry) configured',
        validator: (value) => value && value.startsWith('https://'),
        error: 'Consider configuring Sentry for error monitoring'
      },
      {
        key: 'VITE_GA_TRACKING_ID',
        description: 'Google Analytics configured',
        validator: (value) => value && (value.startsWith('G-') || value.startsWith('UA-')),
        error: 'Consider configuring Google Analytics for user tracking'
      }
    ];

    // Check required variables
    for (const varConfig of requiredVars) {
      const value = envVars[varConfig.key] || process.env[varConfig.key];
      this.check(
        varConfig.description,
        varConfig.validator(value),
        varConfig.error
      );
    }

    // Check optional variables (warnings only)
    for (const varConfig of optionalVars) {
      const value = envVars[varConfig.key] || process.env[varConfig.key];
      this.check(
        varConfig.description,
        varConfig.validator(value),
        varConfig.error,
        true // isWarning
      );
    }
  }

  async validateFileStructure() {
    this.log('\n📁 Validating File Structure...', 'bold');

    const requiredFiles = [
      {
        path: 'src/lib/stripe.ts',
        description: 'Stripe configuration file exists'
      },
      {
        path: 'src/lib/webhook-handler.ts',
        description: 'Webhook handler implemented'
      },
      {
        path: 'src/components/payment/CheckoutForm.tsx',
        description: 'Checkout form component exists'
      },
      {
        path: 'src/components/notifications/WebhookNotifications.tsx',
        description: 'Webhook notifications component exists'
      },
      {
        path: '.env.production',
        description: 'Production environment file exists'
      }
    ];

    for (const file of requiredFiles) {
      const exists = fs.existsSync(path.join(process.cwd(), file.path));
      this.check(
        file.description,
        exists,
        `Required file missing: ${file.path}`
      );
    }
  }

  async validateStripeConfiguration() {
    this.log('\n💳 Validating Stripe Configuration...', 'bold');

    const stripeConfigPath = path.join(process.cwd(), 'src/lib/stripe.ts');
    
    if (fs.existsSync(stripeConfigPath)) {
      const stripeConfig = fs.readFileSync(stripeConfigPath, 'utf8');
      
      // Check for test keys in production code
      this.check(
        'No test Stripe keys in production code',
        !stripeConfig.includes('pk_test_') && !stripeConfig.includes('sk_test_'),
        'Production code should not contain test Stripe keys',
        true
      );

      // Check for proper error handling
      this.check(
        'Stripe error handling implemented',
        stripeConfig.includes('try') && stripeConfig.includes('catch'),
        'Stripe operations should include proper error handling'
      );

      // Check for webhook configuration
      this.check(
        'Webhook configuration present',
        stripeConfig.includes('webhook') || fs.existsSync(path.join(process.cwd(), 'src/lib/webhook-handler.ts')),
        'Webhook handling should be implemented for production'
      );
    }
  }

  async validateBuildConfiguration() {
    this.log('\n🔧 Validating Build Configuration...', 'bold');

    // Check if build succeeds
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      this.check(
        'Build script configured',
        packageJson.scripts && packageJson.scripts.build,
        'Build script must be configured in package.json'
      );

      this.check(
        'Production preview script configured',
        packageJson.scripts && packageJson.scripts.preview,
        'Preview script should be configured for production testing',
        true
      );
    }

    // Check for dist directory after build
    const distExists = fs.existsSync(path.join(process.cwd(), 'dist'));
    this.check(
      'Build output directory exists',
      distExists,
      'Run "npm run build" to generate production build',
      true
    );
  }

  async validateSecurity() {
    this.log('\n🔒 Validating Security Configuration...', 'bold');

    // Check for HTTPS configuration
    const envPath = path.join(process.cwd(), '.env.production');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      this.check(
        'HTTPS enforced for API URLs',
        envContent.includes('https://') && !envContent.includes('http://'),
        'All API URLs should use HTTPS in production'
      );

      this.check(
        'No sensitive data in environment file',
        !envContent.includes('password') && !envContent.includes('secret'),
        'Environment file should not contain sensitive data',
        true
      );
    }

    // Check for proper CSP configuration
    const indexHtmlPath = path.join(process.cwd(), 'index.html');
    if (fs.existsSync(indexHtmlPath)) {
      const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
      
      this.check(
        'Content Security Policy configured',
        indexHtml.includes('Content-Security-Policy') || indexHtml.includes('CSP'),
        'Consider implementing Content Security Policy for enhanced security',
        true
      );
    }
  }

  async validateDocumentation() {
    this.log('\n📚 Validating Documentation...', 'bold');

    const requiredDocs = [
      {
        file: 'WEBHOOK_SETUP.md',
        description: 'Webhook setup documentation exists'
      },
      {
        file: 'PRODUCTION_CHECKLIST.md',
        description: 'Production checklist exists'
      },
      {
        file: 'PRODUCTION_KEYS_MIGRATION.md',
        description: 'Keys migration guide exists'
      }
    ];

    for (const doc of requiredDocs) {
      const exists = fs.existsSync(path.join(process.cwd(), doc.file));
      this.check(
        doc.description,
        exists,
        `Documentation missing: ${doc.file}`,
        true
      );
    }
  }

  async run() {
    this.log('🚀 Production Environment Validation', 'bold');
    this.log('=====================================\n', 'bold');

    await this.validateEnvironmentVariables();
    await this.validateFileStructure();
    await this.validateStripeConfiguration();
    await this.validateBuildConfiguration();
    await this.validateSecurity();
    await this.validateDocumentation();

    // Summary
    this.log('\n📊 Validation Summary', 'bold');
    this.log('===================', 'bold');
    
    this.log(`\nTotal Checks: ${this.total}`);
    this.log(`Passed: ${this.passed}`, 'green');
    this.log(`Errors: ${this.errors.length}`, this.errors.length > 0 ? 'red' : 'green');
    this.log(`Warnings: ${this.warnings.length}`, this.warnings.length > 0 ? 'yellow' : 'green');

    if (this.errors.length > 0) {
      this.log('\n❌ Critical Issues Found:', 'red');
      this.errors.forEach((error, index) => {
        this.log(`${index + 1}. ${error}`, 'red');
      });
    }

    if (this.warnings.length > 0) {
      this.log('\n⚠️  Warnings:', 'yellow');
      this.warnings.forEach((warning, index) => {
        this.log(`${index + 1}. ${warning}`, 'yellow');
      });
    }

    if (this.errors.length === 0) {
      this.log('\n✅ Production environment validation passed!', 'green');
      if (this.warnings.length > 0) {
        this.log('Consider addressing warnings for optimal production deployment.', 'yellow');
      }
      return true;
    } else {
      this.log('\n❌ Production environment validation failed!', 'red');
      this.log('Please fix the critical issues before deploying to production.', 'red');
      return false;
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new ProductionValidator();
  validator.run().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Validation failed with error:', error);
    process.exit(1);
  });
}

module.exports = ProductionValidator;