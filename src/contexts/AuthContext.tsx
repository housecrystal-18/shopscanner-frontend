import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, authAPI } from '../lib/api';
import { isTokenExpired } from '../lib/utils';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    type: 'buyer' | 'seller' | 'both';
    businessName?: string;
  }) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('auth-token');
        const storedUser = localStorage.getItem('user-data');

        if (storedToken && storedUser && !isTokenExpired(storedToken)) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          // Token expired or invalid, clear storage
          localStorage.removeItem('auth-token');
          localStorage.removeItem('user-data');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user-data');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authAPI.login({ email, password });
      
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        
        // Store in localStorage
        localStorage.setItem('auth-token', newToken);
        localStorage.setItem('user-data', JSON.stringify(userData));
        
        // Update state
        setToken(newToken);
        setUser(userData);
        
        toast.success(`Welcome back, ${userData.name}!`);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    type: 'buyer' | 'seller' | 'both';
    businessName?: string;
  }): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(data);
      
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        
        // Store in localStorage
        localStorage.setItem('auth-token', newToken);
        localStorage.setItem('user-data', JSON.stringify(userData));
        
        // Update state
        setToken(newToken);
        setUser(userData);
        
        toast.success(`Welcome to Shop Scanner, ${userData.name}!`);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user-data');
    
    // Clear state
    setToken(null);
    setUser(null);
    
    toast.success('Logged out successfully');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user-data', JSON.stringify(updatedUser));
    }
  };

  // Check for token expiration periodically
  useEffect(() => {
    if (!token) return;

    const checkTokenExpiration = () => {
      if (isTokenExpired(token)) {
        logout();
        toast.error('Session expired. Please log in again.');
      }
    };

    // Check immediately
    checkTokenExpiration();

    // Check every 5 minutes
    const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [token]);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}