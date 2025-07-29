import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  structuredData?: object;
}

const DEFAULT_TITLE = 'Shop Scanner - Product Authenticity & Price Comparison';
const DEFAULT_DESCRIPTION = 'Verify product authenticity and compare prices across platforms with Shop Scanner. Scan barcodes, detect counterfeit products, and find the best deals with AI-powered analysis.';
const DEFAULT_KEYWORDS = 'product authenticity, price comparison, barcode scanner, counterfeit detection, shopping, deals, product verification, AI analysis';
const DEFAULT_IMAGE = '/images/og-image.jpg';
const SITE_URL = 'https://shopscanner.com';

export function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  structuredData
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | Shop Scanner` : DEFAULT_TITLE;
  const fullUrl = url ? `${SITE_URL}${url}` : SITE_URL;
  const fullImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  // Generate structured data for the page
  const generateStructuredData = () => {
    if (structuredData) {
      return structuredData;
    }

    // Default organization structured data
    const organizationData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Shop Scanner',
      description: DEFAULT_DESCRIPTION,
      url: SITE_URL,
      logo: `${SITE_URL}/images/logo.png`,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-555-123-4567',
        contactType: 'customer service',
        email: 'support@shopscanner.com'
      },
      sameAs: [
        'https://twitter.com/shopscanner',
        'https://facebook.com/shopscanner',
        'https://linkedin.com/company/shopscanner'
      ]
    };

    // Website structured data
    const websiteData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Shop Scanner',
      url: SITE_URL,
      description: DEFAULT_DESCRIPTION,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };

    return [organizationData, websiteData];
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#3B82F6" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="Shop Scanner" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@shopscanner" />
      <meta name="twitter:creator" content="@shopscanner" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      
      {/* Article Meta Tags */}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      
      {/* Apple Touch Icons */}
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      
      {/* PWA Meta Tags */}
      <meta name="application-name" content="Shop Scanner" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Shop Scanner" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
      <meta name="msapplication-TileColor" content="#3B82F6" />
      <meta name="msapplication-tap-highlight" content="no" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(generateStructuredData())}
      </script>
    </Helmet>
  );
}

// Predefined SEO configurations for common pages
export const SEOConfigs = {
  home: {
    title: 'Product Authenticity & Price Comparison',
    description: 'Verify product authenticity and compare prices across platforms with Shop Scanner. Scan barcodes, detect counterfeit products, and find the best deals with AI-powered analysis.',
    keywords: 'product authenticity, price comparison, barcode scanner, counterfeit detection, shopping, deals',
    url: '/'
  },
  
  scanner: {
    title: 'Barcode Scanner - Verify Product Authenticity',
    description: 'Use our advanced barcode scanner to verify product authenticity and detect counterfeit items. Get instant authenticity scores and detailed product analysis.',
    keywords: 'barcode scanner, product authenticity, counterfeit detection, product verification',
    url: '/scan'
  },
  
  products: {
    title: 'Product Search & Price Comparison',
    description: 'Search and compare products across multiple platforms. Find the best deals and verify authenticity with detailed product analysis.',
    keywords: 'product search, price comparison, product deals, shopping comparison',
    url: '/products'
  },
  
  wishlist: {
    title: 'My Wishlist - Track Products & Prices',
    description: 'Track your favorite products and get price alerts when deals become available. Never miss a great deal again.',
    keywords: 'wishlist, price tracking, product alerts, deal notifications',
    url: '/wishlist'
  },
  
  pricing: {
    title: 'Pricing Plans - Shop Scanner Premium',
    description: 'Choose the perfect plan for your needs. Get unlimited scans, advanced authenticity analysis, and priority support with Shop Scanner Premium.',
    keywords: 'pricing plans, premium features, subscription, unlimited scans',
    url: '/pricing'
  },
  
  support: {
    title: 'Help & Support Center',
    description: 'Get help with Shop Scanner. Browse our help articles, contact support, or track your existing tickets.',
    keywords: 'support, help center, customer service, troubleshooting',
    url: '/support'
  },
  
  login: {
    title: 'Sign In to Your Account',
    description: 'Sign in to Shop Scanner to access your account, view scan history, and manage your subscriptions.',
    keywords: 'login, sign in, account access',
    url: '/login'
  },
  
  register: {
    title: 'Create Your Account',
    description: 'Join Shop Scanner today and start verifying product authenticity. Create your free account and get started with 10 free scans.',
    keywords: 'register, sign up, create account, free trial',
    url: '/register'
  },
  
  terms: {
    title: 'Terms of Service',
    description: 'Read our Terms of Service to understand your rights and responsibilities when using Shop Scanner.',
    keywords: 'terms of service, legal, user agreement',
    url: '/terms'
  },
  
  privacy: {
    title: 'Privacy Policy',
    description: 'Learn how Shop Scanner protects your privacy and handles your personal information.',
    keywords: 'privacy policy, data protection, privacy rights',
    url: '/privacy'
  }
};