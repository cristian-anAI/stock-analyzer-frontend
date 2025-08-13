// Cache service for API data
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CacheService {
  private cache = new Map<string, CacheEntry<any>>();

  // Cache durations in milliseconds
  private readonly CACHE_DURATIONS = {
    stocks: 5 * 60 * 1000,      // 5 minutos
    cryptos: 3 * 60 * 1000,     // 3 minutos
    positions: 2 * 60 * 1000,   // 2 minutos
    summary: 1 * 60 * 1000,     // 1 minuto
  };

  set<T>(key: string, data: T, customTTL?: number): void {
    const ttl = customTTL || this.getCacheDuration(key);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    
    this.cache.set(key, entry);
    
    // Clean expired entries periodically
    this.cleanExpiredEntries();
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }
    
    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  private getCacheDuration(key: string): number {
    if (key.includes('stocks')) return this.CACHE_DURATIONS.stocks;
    if (key.includes('cryptos')) return this.CACHE_DURATIONS.cryptos;
    if (key.includes('positions')) return this.CACHE_DURATIONS.positions;
    if (key.includes('summary')) return this.CACHE_DURATIONS.summary;
    
    return 5 * 60 * 1000; // Default 5 minutes
  }

  private cleanExpiredEntries(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    for (const [key, entry] of entries) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache stats for debugging
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  // Get cache info for a specific key
  getInfo(key: string): { exists: boolean; age?: number; ttl?: number; expiresIn?: number } {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return { exists: false };
    }
    
    const age = Date.now() - entry.timestamp;
    const expiresIn = entry.ttl - age;
    
    return {
      exists: true,
      age,
      ttl: entry.ttl,
      expiresIn: Math.max(0, expiresIn),
    };
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Export cache keys for consistency
export const CACHE_KEYS = {
  STOCKS_ALL: 'stocks:all',
  STOCKS_BY_SCORE: 'stocks:by-score',
  CRYPTOS_ALL: 'cryptos:all',
  CRYPTOS_BY_SCORE: 'cryptos:by-score',
  POSITIONS_AUTOTRADER: 'positions:autotrader',
  POSITIONS_MANUAL: 'positions:manual',
  AUTOTRADER_SUMMARY: 'autotrader:summary',
  STOCK_DETAIL: (symbol: string) => `stock:${symbol}`,
  CRYPTO_DETAIL: (symbol: string) => `crypto:${symbol}`,
} as const;