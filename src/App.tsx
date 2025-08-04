import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Layout components
import { Layout } from './components/layout/Layout';
import { AuthLayout } from './components/layout/AuthLayout';

// Page components
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ScannerPage } from './pages/ScannerPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { WishlistPage } from './pages/WishlistPage';
import { ProfilePage } from './pages/ProfilePage';
import { DashboardPage } from './pages/seller/DashboardPage';
import { StoreAnalysisPage } from './pages/StoreAnalysisPage';
import { PricingPage } from './pages/PricingPage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { SupportPage } from './pages/SupportPage';
import { BlogListPage } from './pages/blog/BlogListPage';
import { BlogPostPage } from './pages/blog/BlogPostPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Providers
import { AuthProvider } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';

// Protected route component
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Webhook notifications
import { WebhookNotifications } from './components/notifications/WebhookNotifications';

// Monitoring and alerts
import { PaymentAlerts } from './components/monitoring/PaymentAlerts';
import { monitoring } from './lib/monitoring';

// Offline functionality
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { useOfflineSync } from './hooks/useOfflineSync';

// PWA functionality
import { InstallPrompt } from './components/pwa/InstallPrompt';

// Support functionality
import { HelpWidget } from './components/support/HelpWidget';

// Analytics
import { useAnalytics } from './hooks/useAnalytics';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  console.log('App component is rendering');
  
  // Initialize offline sync
  useOfflineSync();

  // Initialize analytics
  const analytics = useAnalytics();

  // Initialize monitoring in production
  useEffect(() => {
    if (import.meta.env.PROD) {
      monitoring.initialize().catch(console.error);
    }
  }, []);

  // Track route changes for analytics
  useEffect(() => {
    analytics.page();
  }, [analytics]);

  // Debug current location
  useEffect(() => {
    console.log('Current URL:', window.location.href);
    console.log('Current hash:', window.location.hash);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SubscriptionProvider>
          <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public routes with auth layout */}
              <Route path="/login" element={
                <AuthLayout>
                  <LoginPage />
                </AuthLayout>
              } />
              <Route path="/register" element={
                <AuthLayout>
                  <RegisterPage />
                </AuthLayout>
              } />

              {/* Public routes with main layout */}
              <Route path="/" element={
                <Layout>
                  <HomePage />
                </Layout>
              } />
              
              <Route path="/products" element={
                <Layout>
                  <ProductsPage />
                </Layout>
              } />
              
              <Route path="/products/:id" element={
                <Layout>
                  <ProductDetailPage />
                </Layout>
              } />
              
              <Route path="/pricing" element={
                <Layout>
                  <PricingPage />
                </Layout>
              } />
              
              <Route path="/support" element={
                <Layout>
                  <SupportPage />
                </Layout>
              } />
              
              <Route path="/test" element={
                <Layout>
                  <div style={{padding: '50px', textAlign: 'center'}}>
                    <h1 style={{fontSize: '48px', color: 'red'}}>TEST ROUTE WORKS!</h1>
                    <p>If you see this, React Router is working</p>
                  </div>
                </Layout>
              } />
              
              <Route path="/blog" element={
                <Layout>
                  <BlogListPage />
                </Layout>
              } />
              
              <Route path="/blog/:slug" element={
                <Layout>
                  <BlogPostPage />
                </Layout>
              } />

              {/* Protected routes */}
              <Route path="/scan" element={
                <ProtectedRoute>
                  <Layout>
                    <ScannerPage />
                  </Layout>
                </ProtectedRoute>
              } />

              <Route path="/analyze" element={
                <ProtectedRoute>
                  <Layout>
                    <StoreAnalysisPage />
                  </Layout>
                </ProtectedRoute>
              } />

              <Route path="/wishlist" element={
                <ProtectedRoute>
                  <Layout>
                    <WishlistPage />
                  </Layout>
                </ProtectedRoute>
              } />

              <Route path="/profile" element={
                <ProtectedRoute>
                  <Layout>
                    <ProfilePage />
                  </Layout>
                </ProtectedRoute>
              } />

              <Route path="/subscription" element={
                <ProtectedRoute>
                  <Layout>
                    <SubscriptionPage />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Seller routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute requiredUserType="business">
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Catch all route */}
              <Route path="/404" element={
                <Layout>
                  <NotFoundPage />
                </Layout>
              } />
              
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>

            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#ffffff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#ffffff',
                  },
                },
              }}
            />

            {/* Webhook-based notifications */}
            <WebhookNotifications />

            {/* Payment failure alerts */}
            <PaymentAlerts />

            {/* Offline indicator */}
            <OfflineIndicator />

            {/* PWA Install Prompt */}
            <InstallPrompt />

            {/* Help Widget */}
            <HelpWidget />
          </div>
          </Router>
        </SubscriptionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
