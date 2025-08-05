import React from 'react';
import { Link } from 'react-router-dom';
import { ScanLine, Shield, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function HomePage() {
  // Safely get auth context with fallback
  let isAuthenticated = false;
  try {
    const auth = useAuth();
    isAuthenticated = auth.isAuthenticated;
  } catch (error) {
    // AuthProvider not ready yet, use defaults
    isAuthenticated = false;
  }

  const features = [
    {
      icon: ScanLine,
      title: 'Scan & Verify',
      description: 'Instantly scan product barcodes to verify authenticity and compare prices across platforms.',
    },
    {
      icon: Shield,
      title: 'Store Analysis',
      description: 'Analyze online stores to detect potential fraud and protect yourself from fake products.',
    },
    {
      icon: TrendingUp,
      title: 'Smart Insights',
      description: 'Get detailed product analytics and authenticity scores to make informed decisions.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-black/20" />
        <div className="container relative">
          <div className="py-20 md:py-28 text-center">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Shop Smarter with
                <span className="block text-primary-200 mt-2">Product Intelligence</span>
              </h1>
              <p className="text-lg md:text-xl text-primary-100 mb-10 leading-relaxed max-w-2xl mx-auto">
                Scan products, verify authenticity, and analyze stores to protect yourself from fake products and scams.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                {isAuthenticated ? (
                  <Link
                    to="/scan"
                    className="bg-white text-primary-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg inline-flex items-center space-x-3"
                  >
                    <ScanLine className="h-5 w-5" />
                    <span>Start Scanning</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="bg-white text-primary-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg inline-flex items-center space-x-3"
                    >
                      <span>Get Started Free</span>
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                    <Link
                      to="/pricing"
                      className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
                    >
                      View Pricing
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to shop safely
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Powerful tools to verify product authenticity and protect yourself from online fraud.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors duration-200">
                  <feature.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-lg md:text-xl text-gray-600">
              Three simple steps to verify any product
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                step: '01',
                title: 'Scan Product',
                description: 'Use your camera to scan any product barcode or enter the product URL',
              },
              {
                step: '02',
                title: 'Analyze Data',
                description: 'Our AI analyzes the product across multiple platforms and databases',
              },
              {
                step: '03',
                title: 'Get Results',
                description: 'Receive authenticity scores, price comparisons, and safety ratings',
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="w-18 h-18 bg-primary-600 text-white rounded-xl flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-9 left-[55%] w-[90%] h-0.5 bg-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-primary-600 text-white">
        <div className="container text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to start shopping smarter?
            </h2>
            <p className="text-lg md:text-xl text-primary-100 mb-8 leading-relaxed">
              Join thousands of users who trust Shop Scan Pro to verify products and protect them from fraud.
            </p>
            {!isAuthenticated && (
              <Link
                to="/register"
                className="bg-white text-primary-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg inline-flex items-center space-x-3"
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}