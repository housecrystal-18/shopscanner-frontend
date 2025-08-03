# Railway Backend Setup Guide

This guide walks through setting up the Shop Scan Pro backend on Railway to support the frontend application.

## Quick Start

1. **Deploy to Railway**
   ```bash
   # Clone starter template
   git clone https://github.com/railwayapp/examples.git
   cd examples/express-postgres
   
   # Or create new Express app
   mkdir shopscanner-backend
   cd shopscanner-backend
   npm init -y
   ```

2. **Install Dependencies**
   ```bash
   npm install express cors helmet morgan dotenv
   npm install bcryptjs jsonwebtoken stripe
   npm install pg sequelize sequelize-cli
   npm install --save-dev nodemon
   ```

3. **Environment Variables**
   Set these in Railway dashboard:
   ```env
   NODE_ENV=production
   JWT_SECRET=your_secure_jwt_secret_here
   DATABASE_URL=postgresql://user:pass@host:port/db
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   FRONTEND_URL=https://shopscannerpro.com
   PORT=3001
   ```

## Backend Structure

```
shopscanner-backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── subscriptionController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── rateLimit.js
│   │   └── validation.js
│   ├── models/
│   │   ├── User.js
│   │   ├── ScanHistory.js
│   │   └── UsageTracking.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── subscription.js
│   │   └── user.js
│   └── utils/
│       ├── database.js
│       └── stripe.js
├── package.json
└── server.js
```

## Minimal Server Implementation

**server.js**
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', require('./src/routes/auth'));
app.use('/subscription', require('./src/routes/subscription'));
app.use('/user', require('./src/routes/user'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'shopscanner-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**src/routes/auth.js**
```javascript
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Mock user storage (replace with database)
const users = [];

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, selectedPlan = 'free' } = req.body;
    
    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User already exists'
        }
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = {
      id: 'user_' + Date.now(),
      name,
      email,
      password: hashedPassword,
      plan: selectedPlan,
      subscriptionStatus: selectedPlan === 'free' ? 'active' : 'trial',
      trialEndsAt: selectedPlan !== 'free' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
      createdAt: new Date()
    };
    
    users.push(user);
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          plan: user.plan,
          subscriptionStatus: user.subscriptionStatus,
          trialEndsAt: user.trialEndsAt
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          plan: user.plan,
          subscriptionStatus: user.subscriptionStatus
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
});

// Get current user
router.get('/me', (req, res) => {
  // TODO: Add auth middleware
  res.json({
    success: true,
    data: {
      user: {
        id: 'demo_user',
        name: 'Demo User',
        email: 'demo@example.com',
        plan: 'monthly',
        subscriptionStatus: 'active'
      }
    }
  });
});

module.exports = router;
```

**src/routes/subscription.js**
```javascript
const express = require('express');
const router = express.Router();

// Get subscription details
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      plan: 'monthly',
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
      usage: {
        scansUsed: 25,
        scansAllowed: -1,
        resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    }
  });
});

// Track usage
router.post('/usage', (req, res) => {
  const { feature, metadata } = req.body;
  
  res.json({
    success: true,
    data: {
      usage: {
        scansUsed: 26,
        scansAllowed: -1,
        resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    }
  });
});

// Cancel subscription
router.post('/cancel', (req, res) => {
  res.json({
    success: true,
    data: {
      subscription: {
        plan: 'monthly',
        status: 'active',
        cancelAtPeriodEnd: true,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      message: 'Subscription will cancel on ' + new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
    }
  });
});

module.exports = router;
```

**src/routes/user.js**
```javascript
const express = require('express');
const router = express.Router();

// Get scan history
router.get('/scan-history', (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  
  res.json({
    success: true,
    data: {
      scans: [
        {
          id: 'scan123',
          url: 'https://example.com/product',
          productName: 'iPhone 15 Pro',
          authenticity_score: 85,
          price: '$999.99',
          createdAt: new Date().toISOString()
        }
      ],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 1,
        totalPages: 1
      }
    }
  });
});

// Save scan history
router.post('/scan-history', (req, res) => {
  res.json({
    success: true,
    data: {
      id: 'scan_' + Date.now(),
      ...req.body
    }
  });
});

module.exports = router;
```

## Deployment Steps

1. **Create Railway Project**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Create new project
   railway create shopscanner-backend
   ```

2. **Deploy Backend**
   ```bash
   # Initialize git repo
   git init
   git add .
   git commit -m "Initial backend setup"
   
   # Connect to Railway
   railway link
   
   # Deploy
   railway up
   ```

3. **Add Database**
   - Go to Railway dashboard
   - Add PostgreSQL service
   - Copy DATABASE_URL to environment variables

4. **Configure Environment**
   - Add all environment variables listed above
   - Test deployment with `railway status`

## Testing the Backend

```bash
# Test health endpoint
curl https://shopscanner-production.up.railway.app/health

# Test registration
curl -X POST https://shopscanner-production.up.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","selectedPlan":"monthly"}'

# Test login
curl -X POST https://shopscanner-production.up.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Next Steps

1. ✅ Set up basic Express server with auth endpoints
2. ✅ Deploy to Railway with PostgreSQL
3. ⏳ Implement database models with Sequelize
4. ⏳ Add Stripe integration for subscriptions
5. ⏳ Implement user data persistence
6. ⏳ Add comprehensive error handling
7. ⏳ Set up monitoring and logging

## Frontend Integration

Once the backend is deployed, the frontend will automatically connect using:
- Base URL: `https://shopscanner-production.up.railway.app`
- API endpoints match the BACKEND_API_SPEC.md
- JWT authentication in Authorization headers
- Mock API disabled (`VITE_MOCK_API=false`)

The transition should be seamless as the frontend is already configured to use the Railway backend URL.