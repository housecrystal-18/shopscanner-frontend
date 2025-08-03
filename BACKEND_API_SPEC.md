# Shop Scan Pro - Backend API Specification

This document defines the API endpoints that the Railway backend needs to implement to support the Shop Scan Pro frontend.

## Base URL
**Production:** `https://shopscanner-production.up.railway.app`
**Development:** `http://localhost:3001`

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## API Endpoints

### 🔐 Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "selectedPlan": "monthly" | "annual" | "free"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user123",
      "name": "John Doe",
      "email": "john@example.com",
      "plan": "monthly",
      "trialEndsAt": "2025-09-09T00:00:00Z",
      "subscriptionStatus": "trial"
    },
    "token": "jwt_token_here"
  }
}
```

#### POST /api/auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user123",
      "name": "John Doe",
      "email": "john@example.com",
      "plan": "monthly",
      "subscriptionStatus": "active"
    },
    "token": "jwt_token_here"
  }
}
```

#### GET /api/auth/me
Get current authenticated user information.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user123",
      "name": "John Doe",
      "email": "john@example.com",
      "plan": "monthly",
      "subscriptionStatus": "active",
      "trialEndsAt": null,
      "subscriptionEndsAt": "2025-10-02T00:00:00Z"
    }
  }
}
```

#### POST /api/auth/logout
Logout user and invalidate token.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 💳 Subscription Management Endpoints

#### GET /api/subscription
Get user's current subscription details.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "plan": "monthly",
    "status": "active",
    "currentPeriodEnd": "2025-10-02T00:00:00Z",
    "cancelAtPeriodEnd": false,
    "usage": {
      "scansUsed": 25,
      "scansAllowed": -1,
      "resetDate": "2025-10-02T00:00:00Z"
    },
    "stripeCustomerId": "cus_stripe123",
    "stripeSubscriptionId": "sub_stripe123"
  }
}
```

#### POST /api/subscription/usage
Track feature usage for billing/limits.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "feature": "scan" | "analysis" | "price_tracking",
  "metadata": {
    "url": "https://example.com/product",
    "productId": "prod123"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "usage": {
      "scansUsed": 26,
      "scansAllowed": -1,
      "resetDate": "2025-10-02T00:00:00Z"
    }
  }
}
```

#### POST /api/subscription/upgrade
Upgrade or change subscription plan.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "planId": "monthly" | "annual",
  "paymentMethodId": "pm_stripe123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "plan": "annual",
      "status": "active",
      "currentPeriodEnd": "2026-08-02T00:00:00Z"
    },
    "clientSecret": "pi_stripe123_secret" // For 3D Secure if needed
  }
}
```

#### POST /api/subscription/cancel
Cancel subscription (effective at period end).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "reason": "too_expensive" | "not_using" | "found_alternative" | "other",
  "feedback": "Optional feedback text",
  "immediate": false
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "plan": "monthly",
      "status": "active",
      "cancelAtPeriodEnd": true,
      "currentPeriodEnd": "2025-10-02T00:00:00Z"
    },
    "message": "Subscription will cancel on 2025-10-02"
  }
}
```

### 🛒 Product & Analysis Endpoints

#### POST /api/analyze-product
**Note:** This endpoint is already implemented via Vercel serverless functions.

Analyze a product URL or image for authenticity and pricing.

**Request Body:**
```json
{
  "url": "https://example.com/product",
  "image": "base64_image_data", // Optional
  "userLocation": "US" // Optional
}
```

#### POST /api/scrape-product
**Note:** This endpoint is already implemented via Vercel serverless functions.

Scrape product information from e-commerce sites.

**Request Body:**
```json
{
  "url": "https://example.com/product",
  "platform": "amazon" | "ebay" | "etsy" // Optional
}
```

### 📊 User Data Endpoints

#### GET /api/user/scan-history
Get user's scan history with pagination.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `sortBy` (default: 'createdAt')
- `order` (default: 'desc')

**Response (200):**
```json
{
  "success": true,
  "data": {
    "scans": [
      {
        "id": "scan123",
        "url": "https://example.com/product",
        "productName": "iPhone 15 Pro",
        "authenticity_score": 85,
        "price": "$999.99",
        "createdAt": "2025-08-02T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

#### POST /api/user/scan-history
Save a new scan to user's history.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "url": "https://example.com/product",
  "productName": "iPhone 15 Pro",
  "authenticity_score": 85,
  "price": "$999.99",
  "analysis_data": {
    "risk_level": "low",
    "detected_issues": [],
    "recommendations": ["Safe to purchase"]
  }
}
```

#### GET /api/user/price-tracking
Get user's price tracking list.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tracked_products": [
      {
        "id": "track123",
        "url": "https://example.com/product",
        "productName": "iPhone 15 Pro",
        "currentPrice": "$999.99",
        "targetPrice": "$899.99",
        "priceHistory": [
          {"date": "2025-08-01", "price": "$1099.99"},
          {"date": "2025-08-02", "price": "$999.99"}
        ],
        "createdAt": "2025-07-15T00:00:00Z"
      }
    ]
  }
}
```

### 🔗 Webhook Endpoints

#### POST /api/webhooks/stripe
Handle Stripe webhook events for subscription updates.

**Headers:** 
- `Stripe-Signature: webhook_signature`

**Request Body:** Stripe webhook payload

**Response (200):**
```json
{
  "received": true
}
```

## Error Responses

All endpoints return consistent error responses:

**400 Bad Request:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": ["Email is required"]
    }
  }
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

**429 Too Many Requests:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

## Database Schema Requirements

### Users Table
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  plan ENUM('free', 'monthly', 'annual') DEFAULT 'free',
  subscription_status ENUM('trial', 'active', 'cancelled', 'expired') DEFAULT 'trial',
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  trial_ends_at TIMESTAMP,
  subscription_ends_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Scan History Table
```sql
CREATE TABLE scan_history (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  product_name VARCHAR(500),
  authenticity_score INT,
  price VARCHAR(50),
  analysis_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Usage Tracking Table
```sql
CREATE TABLE usage_tracking (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  feature VARCHAR(100) NOT NULL,
  count INT DEFAULT 1,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Price Tracking Table
```sql
CREATE TABLE price_tracking (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  product_name VARCHAR(500),
  current_price VARCHAR(50),
  target_price VARCHAR(50),
  price_history JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Security Requirements

1. **JWT Token Validation:** All protected endpoints must validate JWT tokens
2. **Rate Limiting:** Implement rate limiting per user/IP
3. **Input Validation:** Validate all input data
4. **CORS:** Configure CORS for frontend domain
5. **HTTPS Only:** All endpoints must use HTTPS in production
6. **Environment Variables:** Sensitive data in environment variables only

## Next Steps for Backend Implementation

1. Set up Railway project with Node.js/Express backend
2. Implement authentication endpoints with JWT
3. Set up database (PostgreSQL recommended)
4. Implement subscription management with Stripe
5. Add user data persistence endpoints
6. Set up webhook handlers
7. Deploy to Railway with environment variables