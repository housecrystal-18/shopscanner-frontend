import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ScanLine, Heart, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

export function MobileNavigation() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Don't show on auth pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  const navigation = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
    },
    {
      name: 'Search',
      href: '/products',
      icon: Search,
    },
    {
      name: 'Scan',
      href: '/scan',
      icon: ScanLine,
      requiresAuth: true,
    },
    {
      name: 'Wishlist',
      href: '/wishlist',
      icon: Heart,
      requiresAuth: true,
    },
    {
      name: 'Profile',
      href: isAuthenticated ? '/profile' : '/login',
      icon: User,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom z-50">
      <div className="grid grid-cols-5 py-2">
        {navigation.map((item) => {
          // Skip auth-required items for non-authenticated users
          if (item.requiresAuth && !isAuthenticated) {
            return <div key={item.name} />; // Empty div to maintain grid
          }

          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-3 text-xs transition-colors',
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-600 hover:text-primary-600'
              )}
            >
              <item.icon className={cn(
                'h-6 w-6 mb-1',
                isActive ? 'text-primary-600' : 'text-gray-400'
              )} />
              <span className={cn(
                'font-medium',
                isActive ? 'text-primary-600' : 'text-gray-600'
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}