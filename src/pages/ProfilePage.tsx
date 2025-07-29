import React from 'react';
import { User, Bell } from 'lucide-react';
import { NotificationSettings } from '../components/notifications/NotificationSettings';

export function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <User className="h-8 w-8 text-primary-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          </div>
          
          <div className="space-y-8">
            {/* Notification Settings */}
            <NotificationSettings />
            
            {/* Additional profile sections can be added here */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center py-8">
                <p className="text-gray-600">Additional profile settings will be implemented here.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}