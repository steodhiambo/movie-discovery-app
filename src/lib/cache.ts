// Simple in-memory cache for API responses
interface CacheItem<T> {
  data: T
  timestamp: number
  expiresAt: number
}

class ApiCache {
  private cache = new Map<string, CacheItem<any>>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes default

  // Set cache item with TTL
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now()
    const timeToLive = ttl || this.defaultTTL
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + timeToLive
    })
  }

  // Get cache item if not expired
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  // Check if key exists and is not expired
  has(key: string): boolean {
    return this.get(key) !== null
  }

  // Delete specific key
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  // Clear all cache
  clear(): void {
    this.cache.clear()
  }

  // Clean up expired items
  cleanup(): void {
    const now = Date.now()
    const entries = Array.from(this.cache.entries())
    for (const [key, item] of entries) {
      if (now > item.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  // Get cache stats
  getStats() {
    const now = Date.now()
    let expired = 0
    let active = 0

    const values = Array.from(this.cache.values())
    for (const item of values) {
      if (now > item.expiresAt) {
        expired++
      } else {
        active++
      }
    }

    return {
      total: this.cache.size,
      active,
      expired
    }
  }

  // Generate cache key for API calls
  generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&')
    
    return `${prefix}:${sortedParams}`
  }
}

// Export singleton instance
export const apiCache = new ApiCache()

// Cleanup expired items every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    apiCache.cleanup()
  }, 10 * 60 * 1000)
}

export default apiCache
