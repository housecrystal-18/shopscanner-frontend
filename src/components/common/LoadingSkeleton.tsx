import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({ 
  className = '', 
  variant = 'text', 
  width, 
  height,
  lines = 1 
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  const variantClasses = {
    text: 'h-4',
    rectangular: 'rounded-lg',
    circular: 'rounded-full'
  };

  const style = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? undefined : '100%')
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses[variant]} ${
              index === lines - 1 ? 'w-3/4' : 'w-full'
            }`}
            style={{ height: height || 16 }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

// Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <Skeleton variant="rectangular" height={200} className="mb-4" />
      <Skeleton variant="text" className="mb-2" height={20} />
      <Skeleton variant="text" lines={2} className="mb-3" />
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width={80} height={24} />
        <Skeleton variant="rectangular" width={100} height={36} />
      </div>
    </div>
  );
}

// Wishlist Item Skeleton
export function WishlistItemSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-start space-x-4">
        <Skeleton variant="rectangular" width={80} height={80} />
        <div className="flex-1">
          <Skeleton variant="text" height={20} className="mb-2" />
          <Skeleton variant="text" lines={2} className="mb-3" />
          <div className="flex items-center justify-between">
            <Skeleton variant="text" width={100} height={18} />
            <div className="flex space-x-2">
              <Skeleton variant="rectangular" width={80} height={32} />
              <Skeleton variant="rectangular" width={80} height={32} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Profile Form Skeleton
export function ProfileFormSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton variant="circular" width={80} height={80} />
          <div className="flex-1">
            <Skeleton variant="text" height={20} className="mb-2" />
            <Skeleton variant="rectangular" width={120} height={36} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index}>
              <Skeleton variant="text" height={16} className="mb-2" />
              <Skeleton variant="rectangular" height={40} />
            </div>
          ))}
        </div>
        
        <div className="flex justify-end">
          <Skeleton variant="rectangular" width={120} height={40} />
        </div>
      </div>
    </div>
  );
}

// Analytics Dashboard Skeleton
export function AnalyticsDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton variant="rectangular" width={28} height={28} />
            <div>
              <Skeleton variant="text" width={200} height={24} className="mb-1" />
              <Skeleton variant="text" width={300} height={16} />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Skeleton variant="rectangular" width={40} height={40} />
            <Skeleton variant="rectangular" width={150} height={40} />
            <Skeleton variant="rectangular" width={100} height={40} />
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Skeleton variant="rectangular" width={48} height={48} className="mr-4" />
              <div className="flex-1">
                <Skeleton variant="text" width={120} height={16} className="mb-2" />
                <Skeleton variant="text" width={80} height={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <Skeleton variant="text" width={150} height={20} className="mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 7 }).map((_, chartIndex) => (
                <div key={chartIndex} className="flex items-center justify-between">
                  <Skeleton variant="text" width={60} height={16} />
                  <div className="flex items-center space-x-4">
                    <Skeleton variant="text" width={40} height={16} />
                    <Skeleton variant="text" width={60} height={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Support Tickets Skeleton
export function SupportTicketsSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Skeleton variant="rectangular" width={24} height={24} />
            <div>
              <Skeleton variant="text" width={180} height={20} className="mb-1" />
              <Skeleton variant="text" width={250} height={14} />
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <Skeleton variant="rectangular" height={40} className="flex-1" />
          <Skeleton variant="rectangular" width={150} height={40} />
          <Skeleton variant="rectangular" width={150} height={40} />
        </div>
      </div>

      {/* Tickets */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-start space-x-3 mb-3">
                  <Skeleton variant="rectangular" width={32} height={32} />
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <Skeleton variant="text" width={200} height={18} />
                      <Skeleton variant="rectangular" width={60} height={20} />
                    </div>
                    <div className="flex items-center space-x-4">
                      <Skeleton variant="text" width={80} height={14} />
                      <Skeleton variant="text" width={60} height={14} />
                      <Skeleton variant="text" width={150} height={14} />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Skeleton variant="rectangular" width={80} height={20} />
                    <Skeleton variant="text" width={100} height={14} />
                  </div>
                  <Skeleton variant="text" width={120} height={14} />
                </div>
              </div>
              
              <Skeleton variant="rectangular" width={60} height={32} className="ml-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}