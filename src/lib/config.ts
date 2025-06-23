// API configuration and constants

// Environment variables
export const API_CONFIG = {
  TMDB: {
    API_KEY: process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY,
    BASE_URL: 'https://api.themoviedb.org/3',
    IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
    RATE_LIMIT: {
      MAX_REQUESTS: 35, // Leave buffer from 40/10s limit
      TIME_WINDOW: 10000 // 10 seconds
    }
  },
  OMDB: {
    API_KEY: process.env.OMDB_API_KEY || process.env.NEXT_PUBLIC_OMDB_API_KEY,
    BASE_URL: 'https://www.omdbapi.com',
    RATE_LIMIT: {
      MAX_REQUESTS: 950, // Leave buffer from 1000/day limit
      TIME_WINDOW: 24 * 60 * 60 * 1000 // 24 hours
    }
  }
}

// Cache configuration
export const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  SEARCH_TTL: 2 * 60 * 1000, // 2 minutes for search results
  DETAILS_TTL: 15 * 60 * 1000, // 15 minutes for movie details
  TRENDING_TTL: 30 * 60 * 1000, // 30 minutes for trending
  CLEANUP_INTERVAL: 10 * 60 * 1000 // 10 minutes
}

// Image sizes
export const IMAGE_SIZES = {
  POSTER: ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original'],
  BACKDROP: ['w300', 'w780', 'w1280', 'original'],
  PROFILE: ['w45', 'w185', 'h632', 'original']
}

// Default image size mappings
export const DEFAULT_IMAGE_SIZES = {
  POSTER_SMALL: 'w185',
  POSTER_MEDIUM: 'w342',
  POSTER_LARGE: 'w500',
  BACKDROP_SMALL: 'w780',
  BACKDROP_LARGE: 'w1280',
  PROFILE: 'w185'
}

// API endpoints
export const ENDPOINTS = {
  TMDB: {
    SEARCH_MULTI: '/search/multi',
    SEARCH_MOVIE: '/search/movie',
    SEARCH_TV: '/search/tv',
    TRENDING: '/trending',
    MOVIE_DETAILS: '/movie',
    TV_DETAILS: '/tv',
    DISCOVER_MOVIE: '/discover/movie',
    DISCOVER_TV: '/discover/tv',
    GENRE_MOVIE: '/genre/movie/list',
    GENRE_TV: '/genre/tv/list',
    POPULAR_MOVIES: '/movie/popular',
    POPULAR_TV: '/tv/popular',
    TOP_RATED_MOVIES: '/movie/top_rated',
    TOP_RATED_TV: '/tv/top_rated'
  }
}

// Error messages
export const ERROR_MESSAGES = {
  API_KEY_MISSING: 'API key is not configured',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please try again later.',
  NETWORK_ERROR: 'Network error occurred',
  INVALID_RESPONSE: 'Invalid response from API',
  SEARCH_QUERY_EMPTY: 'Search query cannot be empty',
  MOVIE_NOT_FOUND: 'Movie not found',
  INVALID_ID: 'Invalid movie/TV show ID'
}

// Validation helpers
export const validateApiKeys = () => {
  const errors: string[] = []
  
  if (!API_CONFIG.TMDB.API_KEY) {
    errors.push('TMDB API key is missing')
  }
  
  if (!API_CONFIG.OMDB.API_KEY) {
    errors.push('OMDB API key is missing')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Check if we're in development mode
export const isDevelopment = process.env.NODE_ENV === 'development'

// Debug logging helper
export const debugLog = (message: string, data?: any) => {
  if (isDevelopment) {
    console.log(`[MovieAPI] ${message}`, data || '')
  }
}

export default API_CONFIG
