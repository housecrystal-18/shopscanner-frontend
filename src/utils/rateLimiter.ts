// Rate limiting utilities for client-side protection
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private storage: Map<string, RateLimitEntry> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const entry = this.storage.get(key);

    if (!entry) {
      this.storage.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs
      });
      return true;
    }

    if (now > entry.resetTime) {
      // Reset the window
      this.storage.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs
      });
      return true;
    }

    if (entry.count >= this.config.maxRequests) {
      return false;
    }

    entry.count++;
    this.storage.set(key, entry);
    return true;
  }

  getRemainingRequests(key: string): number {
    const entry = this.storage.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return this.config.maxRequests;
    }
    return Math.max(0, this.config.maxRequests - entry.count);
  }

  getResetTime(key: string): number {
    const entry = this.storage.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return Date.now() + this.config.windowMs;
    }
    return entry.resetTime;
  }

  reset(key: string): void {
    this.storage.delete(key);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.storage.entries()) {
      if (now > entry.resetTime) {
        this.storage.delete(key);
      }
    }
  }
}

// Rate limiter instances for different operations
export const scanRateLimiter = new RateLimiter({
  maxRequests: 10, // 10 scans per minute for free users
  windowMs: 60 * 1000 // 1 minute
});

export const apiRequestLimiter = new RateLimiter({
  maxRequests: 100, // 100 API requests per minute
  windowMs: 60 * 1000 // 1 minute
});

export const authRateLimiter = new RateLimiter({
  maxRequests: 5, // 5 auth attempts per 15 minutes
  windowMs: 15 * 60 * 1000 // 15 minutes
});

export const contactFormLimiter = new RateLimiter({
  maxRequests: 3, // 3 contact form submissions per hour
  windowMs: 60 * 60 * 1000 // 1 hour
});

// Rate limiting middleware for API calls
export function withRateLimit<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  limiter: RateLimiter,
  keyGenerator: (...args: Parameters<T>) => string = () => 'default'
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args);
    
    if (!limiter.isAllowed(key)) {
      const resetTime = limiter.getResetTime(key);
      const waitTime = Math.ceil((resetTime - Date.now()) / 1000);
      
      throw new Error(
        `Rate limit exceeded. Please try again in ${waitTime} seconds.`
      );
    }

    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      // Optionally don't count failed requests against the limit
      throw error;
    }
  }) as T;
}

// Utility to get user identifier for rate limiting
export function getUserRateLimitKey(userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }
  
  // Fallback to IP-based identification (simplified)
  return 'ip:unknown';
}

// React hook for rate limiting
export function useRateLimit(
  limiter: RateLimiter,
  key: string = 'default'
) {
  const checkLimit = () => {
    return limiter.isAllowed(key);
  };

  const getRemainingRequests = () => {
    return limiter.getRemainingRequests(key);
  };

  const getResetTime = () => {
    return limiter.getResetTime(key);
  };

  const reset = () => {
    limiter.reset(key);
  };

  return {
    checkLimit,
    getRemainingRequests,
    getResetTime,
    reset
  };
}

// Rate limiting validation function
export function validateRateLimit(limiter: RateLimiter, key: string): {
  isAllowed: boolean;
  waitTime?: number;
  message?: string;
} {
  const isAllowed = limiter.isAllowed(key);
  
  if (!isAllowed) {
    const resetTime = limiter.getResetTime(key);
    const waitTime = Math.ceil((resetTime - Date.now()) / 1000);
    
    return {
      isAllowed: false,
      waitTime,
      message: `Rate limit exceeded. Please try again in ${waitTime} seconds.`
    };
  }
  
  return { isAllowed: true };
}

// Export rate limiting configurations for different user tiers
export const RateLimitConfigs = {
  free: {
    scans: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 per minute
    api: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 per minute
    searches: { maxRequests: 20, windowMs: 60 * 1000 } // 20 per minute
  },
  premium: {
    scans: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 per minute
    api: { maxRequests: 1000, windowMs: 60 * 1000 }, // 1000 per minute
    searches: { maxRequests: 200, windowMs: 60 * 1000 } // 200 per minute
  },
  unlimited: {
    scans: { maxRequests: 1000, windowMs: 60 * 1000 }, // 1000 per minute
    api: { maxRequests: 10000, windowMs: 60 * 1000 }, // 10000 per minute
    searches: { maxRequests: 2000, windowMs: 60 * 1000 } // 2000 per minute
  }
};