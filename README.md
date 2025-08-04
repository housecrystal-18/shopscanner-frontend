# Shop Scanner Frontend

A comprehensive React-based web application for product authenticity verification and price comparison. Built with TypeScript, Vite, and modern web technologies.

## 🚀 Features

### Core Functionality
- **Product Scanning**: Barcode scanning with camera integration
- **Authenticity Verification**: AI-powered authenticity scoring
- **Price Comparison**: Multi-platform price analysis
- **Wishlist Management**: Track favorite products and price alerts

### Premium Features
- **Advanced Analytics**: Detailed product and store analysis
- **Unlimited Scans**: No limits for premium users
- **Priority Support**: Dedicated customer support
- **Offline Mode**: Full PWA functionality

### Technical Features
- **Progressive Web App (PWA)**: Installable with offline capabilities
- **Real-time Notifications**: Push notifications for price alerts
- **Secure Payments**: Stripe integration for subscriptions
- **Analytics Tracking**: Comprehensive user behavior analysis

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **State Management**: React Query, Context API
- **Authentication**: JWT tokens with secure storage
- **Payments**: Stripe integration
- **Analytics**: Google Analytics 4, Mixpanel, PostHog
- **Deployment**: Docker, Nginx

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Docker (for containerized deployment)

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/your-org/shopscanner-frontend.git
cd shopscanner-frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

### 4. Start development server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔧 Environment Configuration

Copy `.env.example` to `.env.local` and configure the following:

### Required Variables
- `VITE_API_BASE_URL`: Backend API URL
- `VITE_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key

### Optional Variables
- `VITE_GA4_MEASUREMENT_ID`: Google Analytics 4 ID
- `VITE_MIXPANEL_TOKEN`: Mixpanel project token
- `VITE_POSTHOG_KEY`: PostHog project key
- `VITE_VAPID_PUBLIC_KEY`: Push notification public key

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── common/         # Common UI components
│   ├── layout/         # Layout components
│   ├── product/        # Product-related components
│   └── ...
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── pages/              # Page components
├── styles/             # Global styles
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🐳 Docker Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Using the deployment script
```bash
# Build and deploy
./deploy.sh deploy latest production

# Build only
./deploy.sh build

# Health check
./deploy.sh health

# Rollback
./deploy.sh rollback
```

## 🔒 Security Features

- **Rate Limiting**: Client-side and server-side rate limiting
- **Content Security Policy**: Strict CSP headers
- **Secure Authentication**: JWT with refresh tokens
- **Input Validation**: Comprehensive form validation
- **Error Boundaries**: Graceful error handling

## 📱 PWA Features

- **Offline Support**: Service worker caching
- **Push Notifications**: Real-time alerts
- **Install Prompts**: Native app-like installation
- **Background Sync**: Offline data synchronization

## 📊 Analytics & Monitoring

- **User Analytics**: Track user behavior and engagement
- **Performance Monitoring**: Real-time performance metrics
- **Error Tracking**: Automated error reporting
- **Revenue Analytics**: Subscription and revenue tracking

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Light/dark theme support
- **Loading States**: Skeleton screens and loading indicators
- **Accessibility**: WCAG 2.1 compliant
- **Internationalization**: Multi-language support ready

## 🐳 Docker Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Using the deployment script
```bash
# Build and deploy
./deploy.sh deploy latest production

# Build only
./deploy.sh build

# Health check
./deploy.sh health

# Rollback
./deploy.sh rollback
```

## 🔧 Configuration

### Feature Flags
Control features via environment variables:
- `VITE_ENABLE_ANALYTICS` - Enable analytics tracking
- `VITE_ENABLE_PWA` - Enable PWA features
- `VITE_ENABLE_PUSH_NOTIFICATIONS` - Enable push notifications
- `VITE_ENABLE_OFFLINE_MODE` - Enable offline functionality

### Rate Limiting
Configure rate limits for different user tiers:
- Free: 10 scans/minute
- Premium: 100 scans/minute
- Enterprise: Custom limits

## 📈 Performance

- **Bundle Size**: Optimized with code splitting
- **Loading Speed**: < 3s first contentful paint
- **Lighthouse Score**: 95+ across all metrics
- **Core Web Vitals**: Excellent ratings

## 🆘 Support

- **Issues**: Report bugs on GitHub Issues
- **Support**: Contact support@shopscanner.com

---

Made with ❤️ by the Shop Scanner team
# Force GitHub webhook trigger
