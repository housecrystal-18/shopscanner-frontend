import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ScanLine,
  LogOut,
  Shield,
  Brain
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Safely get auth context with fallback
  let isAuthenticated = false;
  let user = null;
  let logout = () => {};
  
  try {
    const auth = useAuth();
    isAuthenticated = auth.isAuthenticated;
    user = auth.user;
    logout = auth.logout;
  } catch (error) {
    // AuthProvider not ready yet, use defaults
    console.warn('AuthProvider not ready, using defaults');
  }

  const navigation = [
    { name: 'Products', href: '/products', icon: ShoppingBag, requiresAuth: false },
    { name: 'Scan', href: '/scan', icon: ScanLine, requiresAuth: true },
    { name: 'AI Analysis', href: '/ai-analysis', icon: Brain, requiresAuth: true },
    { name: 'Analyze', href: '/analyze', icon: Shield, requiresAuth: true },
    { name: 'Pricing', href: '/pricing', icon: null },
  ];

  const userNavigation = [
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Subscription', href: '/subscription', icon: Shield },
    { name: 'Wishlist', href: '/wishlist', icon: Heart },
    ...(user?.type === 'business' 
      ? [{ name: 'Dashboard', href: '/dashboard', icon: ShoppingBag }] 
      : []
    ),
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-tr from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <ScanLine className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900 hidden sm:block">Shop Scan Pro</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              if (item.requiresAuth && !isAuthenticated) return null;
              
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Desktop User Menu */}
                <div className="hidden md:flex items-center space-x-1">
                  {userNavigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={cn(
                          'p-2 rounded-lg transition-all duration-200',
                          isActive
                            ? 'text-primary-600 bg-primary-50'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        )}
                        title={item.name}
                      >
                        <item.icon className="h-4 w-4" />
                      </Link>
                    );
                  })}
                  
                  <div className="w-px h-6 bg-gray-200 mx-2" />
                  
                  <button
                    onClick={logout}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                    title="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>

                {/* Mobile User Indicator */}
                <div className="md:hidden flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-tr from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-sm">
                    <span className="text-white text-sm font-semibold">
                      {user?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
                >
                  Get started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-sm">
          <div className="container py-4 space-y-1">
            {/* Navigation Links */}
            {navigation.map((item) => {
              if (item.requiresAuth && !isAuthenticated) return null;
              
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200',
                    isActive
                      ? 'text-primary-700 bg-primary-50 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  {item.icon && <item.icon className="h-5 w-5" />}
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* User Links */}
            {isAuthenticated && (
              <>
                <div className="border-t border-gray-100 my-4" />
                {userNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200',
                        isActive
                          ? 'text-primary-700 bg-primary-50 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-all duration-200 w-full"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign out</span>
                </button>
              </>
            )}

            {/* Auth Links for non-authenticated users */}
            {!isAuthenticated && (
              <>
                <div className="border-t border-gray-100 my-4" />
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-all duration-200 text-center shadow-sm"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}