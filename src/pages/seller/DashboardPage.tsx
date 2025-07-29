import React from 'react';
import { BarChart3 } from 'lucide-react';

export function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <BarChart3 className="h-8 w-8 text-primary-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-600">Seller dashboard interface will be implemented here.</p>
        </div>
      </div>
    </div>
  );
}