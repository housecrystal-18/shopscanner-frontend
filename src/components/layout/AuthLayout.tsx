import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ScanLine } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <Link to="/" className="flex items-center space-x-2">
              <ScanLine className="h-10 w-10 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">Shop Scan Pro</span>
            </Link>
          </div>

          {children}
        </div>
      </div>

      {/* Right side - Image/Illustration */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-700">
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          
          {/* Overlay content */}
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="text-center text-white">
              <ScanLine className="h-24 w-24 mx-auto mb-6 opacity-80" />
              <h2 className="text-3xl font-bold mb-4">
                Smart Shopping Starts Here
              </h2>
              <p className="text-xl opacity-90 max-w-md mx-auto">
                Paste a URL, upload a screenshot, or scan a QR/barcode to gain the skills to verify authenticity, evaluate sellers, and find trustworthy deals.
              </p>
              
              {/* Feature highlights */}
              <div className="mt-8 space-y-4 text-left max-w-sm mx-auto">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full" />
                  <span>Instant barcode scanning</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full" />
                  <span>Explore market value trends for related products</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full" />
                  <span>Smart wishlist management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full" />
                  <span>Seller marketplace access</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-white bg-opacity-10 rounded-full" />
          <div className="absolute bottom-20 left-10 w-20 h-20 bg-white bg-opacity-10 rounded-full" />
          <div className="absolute top-1/3 left-20 w-4 h-4 bg-white bg-opacity-20 rounded-full" />
          <div className="absolute bottom-1/3 right-20 w-6 h-6 bg-white bg-opacity-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}