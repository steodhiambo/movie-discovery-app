// TMDB API integration with proper error handling and rate limiting

// Types for TMDB API responses
export interface TMDBMovie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  adult: boolean
  original_language: string
  original_title: string
  popularity: number
  video: boolean
}

export interface TMDBTVShow {
  id: number
  name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  adult: boolean
  original_language: string
  original_name: string
  popularity: number
  origin_country: string[]
}

export interface TMDBSearchResult {
  page: number
  results: (TMDBMovie | TMDBTVShow)[]
  total_pages: number
  total_results: number
}

export interface TMDBGenre {
  id: number
  name: string
}

export interface TMDBMovieDetails extends TMDBMovie {
  belongs_to_collection: any
  budget: number
  genres: TMDBGenre[]
  homepage: string
  imdb_id: string
  production_companies: any[]
  production_countries: any[]
  revenue: number
  runtime: number
  spoken_languages: any[]
  status: string
  tagline: string
  credits?: {
    cast: any[]
    crew: any[]
  }
  videos?: {
    results: any[]
  }
  similar?: TMDBSearchResult
}

// Configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'

// Rate limiting - TMDB allows 40 requests per 10 seconds
class RateLimiter {
  private requests: number[] = []
  private readonly maxRequests = 35 // Leave some buffer
  private readonly timeWindow = 10000 // 10 seconds

  canMakeRequest(): boolean {
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.timeWindow)
    return this.requests.length < this.maxRequests
  }

  recordRequest(): void {
    this.requests.push(Date.now())
  }

  async waitIfNeeded(): Promise<void> {
    if (!this.canMakeRequest()) {
      const oldestRequest = Math.min(...this.requests)
      const waitTime = this.timeWindow - (Date.now() - oldestRequest) + 100 // Add small buffer
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
    this.recordRequest()
  }
}

const rateLimiter = new RateLimiter()

// Error classes
export class TMDBError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message)
    this.name = 'TMDBError'
  }
}

// API Client
class TMDBClient {
  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    if (!TMDB_API_KEY) {
      throw new TMDBError('TMDB API key is not configured')
    }

    await rateLimiter.waitIfNeeded()

    const url = new URL(`${TMDB_BASE_URL}${endpoint}`)
    url.searchParams.append('api_key', TMDB_API_KEY)

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString())
      }
    })

    try {
      const response = await fetch(url.toString())

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new TMDBError(
          errorData.status_message || `HTTP ${response.status}: ${response.statusText}`,
          response.status
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof TMDBError) {
        throw error
      }
      throw new TMDBError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Search for movies and TV shows
  async searchMulti(query: string, page: number = 1): Promise<TMDBSearchResult> {
    if (!query.trim()) {
      throw new TMDBError('Search query cannot be empty')
    }
    return this.makeRequest<TMDBSearchResult>('/search/multi', { query: query.trim(), page })
  }

  // Search movies only
  async searchMovies(query: string, page: number = 1): Promise<TMDBSearchResult> {
    if (!query.trim()) {
      throw new TMDBError('Search query cannot be empty')
    }
    return this.makeRequest<TMDBSearchResult>('/search/movie', { query: query.trim(), page })
  }

  // Search TV shows only
  async searchTV(query: string, page: number = 1): Promise<TMDBSearchResult> {
    if (!query.trim()) {
      throw new TMDBError('Search query cannot be empty')
    }
    return this.makeRequest<TMDBSearchResult>('/search/tv', { query: query.trim(), page })
  }

  // Get trending content
  async getTrending(mediaType: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'day'): Promise<TMDBSearchResult> {
    return this.makeRequest<TMDBSearchResult>(`/trending/${mediaType}/${timeWindow}`)
  }

  // Get popular movies
  async getPopularMovies(page: number = 1): Promise<TMDBSearchResult> {
    return this.makeRequest<TMDBSearchResult>('/movie/popular', { page })
  }

  // Get popular TV shows
  async getPopularTV(page: number = 1): Promise<TMDBSearchResult> {
    return this.makeRequest<TMDBSearchResult>('/tv/popular', { page })
  }

  // Get top rated movies
  async getTopRatedMovies(page: number = 1): Promise<TMDBSearchResult> {
    return this.makeRequest<TMDBSearchResult>('/movie/top_rated', { page })
  }

  // Get top rated TV shows
  async getTopRatedTV(page: number = 1): Promise<TMDBSearchResult> {
    return this.makeRequest<TMDBSearchResult>('/tv/top_rated', { page })
  }

  // Get movie details
  async getMovieDetails(movieId: number, appendToResponse?: string): Promise<TMDBMovieDetails> {
    const params: Record<string, any> = {}
    if (appendToResponse) {
      params.append_to_response = appendToResponse
    }
    return this.makeRequest<TMDBMovieDetails>(`/movie/${movieId}`, params)
  }

  // Get TV show details
  async getTVDetails(tvId: number, appendToResponse?: string): Promise<any> {
    const params: Record<string, any> = {}
    if (appendToResponse) {
      params.append_to_response = appendToResponse
    }
    return this.makeRequest<any>(`/tv/${tvId}`, params)
  }

  // Discover movies with filters
  async discoverMovies(filters: {
    page?: number
    genre?: number
    year?: number
    sortBy?: string
    minRating?: number
  } = {}): Promise<TMDBSearchResult> {
    const params: Record<string, any> = {
      page: filters.page || 1
    }

    if (filters.genre) params.with_genres = filters.genre
    if (filters.year) params.year = filters.year
    if (filters.sortBy) params.sort_by = filters.sortBy
    if (filters.minRating) params['vote_average.gte'] = filters.minRating

    return this.makeRequest<TMDBSearchResult>('/discover/movie', params)
  }

  // Discover TV shows with filters
  async discoverTV(filters: {
    page?: number
    genre?: number
    year?: number
    sortBy?: string
    minRating?: number
  } = {}): Promise<TMDBSearchResult> {
    const params: Record<string, any> = {
      page: filters.page || 1
    }

    if (filters.genre) params.with_genres = filters.genre
    if (filters.year) params.first_air_date_year = filters.year
    if (filters.sortBy) params.sort_by = filters.sortBy
    if (filters.minRating) params['vote_average.gte'] = filters.minRating

    return this.makeRequest<TMDBSearchResult>('/discover/tv', params)
  }

  // Get movie genres
  async getMovieGenres(): Promise<{ genres: TMDBGenre[] }> {
    return this.makeRequest<{ genres: TMDBGenre[] }>('/genre/movie/list')
  }

  // Get TV genres
  async getTVGenres(): Promise<{ genres: TMDBGenre[] }> {
    return this.makeRequest<{ genres: TMDBGenre[] }>('/genre/tv/list')
  }

  // Helper methods for image URLs
  getImageUrl(path: string | null, size: string = 'w500'): string | null {
    if (!path) return null
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`
  }

  getBackdropUrl(path: string | null, size: string = 'w1280'): string | null {
    if (!path) return null
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`
  }

  // Get available image sizes
  getImageSizes() {
    return {
      poster: ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original'],
      backdrop: ['w300', 'w780', 'w1280', 'original'],
      profile: ['w45', 'w185', 'h632', 'original']
    }
  }
}

// Export singleton instance
export const tmdbApi = new TMDBClient()
export default tmdbApi
