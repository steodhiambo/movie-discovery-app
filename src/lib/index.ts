// Main API exports for the Movie Discovery App

// Primary API client (recommended for most use cases)
export { movieApi as default, movieApi } from './movieApi'
export type { EnhancedMovie, SearchOptions, MovieApiError } from './movieApi'

// Individual API clients (for specific use cases)
export { tmdbApi } from './tmdb'
export type { 
  TMDBMovie, 
  TMDBTVShow, 
  TMDBSearchResult, 
  TMDBGenre, 
  TMDBMovieDetails,
  TMDBError 
} from './tmdb'

export { omdbApi } from './omdb'
export type { 
  OMDBRating, 
  OMDBSearchResult, 
  OMDBSearchResponse, 
  OMDBMovieDetails,
  OMDBError 
} from './omdb'

// Utilities
export { apiCache } from './cache'
export { API_CONFIG, CACHE_CONFIG, IMAGE_SIZES, validateApiKeys } from './config'

// Quick start example:
/*
import movieApi from '@/lib'

// Search for movies with enhanced data
const results = await movieApi.search({
  query: 'Inception',
  includeOMDBData: true
})

// Get movie details
const movie = await movieApi.getMovieDetails(27205)

// Get trending movies
const trending = await movieApi.getTrending('movie', 'week')
*/
