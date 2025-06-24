// Unified Movie API client that combines TMDB and OMDB data
import { tmdbApi, TMDBMovie, TMDBTVShow, TMDBSearchResult, TMDBError } from './tmdb'
import { omdbApi, OMDBMovieDetails, OMDBError } from './omdb'

// Enhanced movie data combining both APIs
export interface EnhancedMovie {
  // TMDB data
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  popularity: number
  
  // OMDB data (when available)
  imdbId?: string
  imdbRating?: string
  imdbVotes?: string
  rottenTomatoesRating?: string
  rottenTomatoesAudienceRating?: string
  metacriticRating?: string
  awards?: string
  boxOffice?: string
  runtime?: string
  director?: string
  actors?: string
  plot?: string

  // Enhanced rating data
  ratings?: {
    tmdb: { score: number; votes: number; outOf: 10 }
    imdb?: { score: number; votes: string; outOf: 10 }
    rottenTomatoes?: {
      critics: { score: number; outOf: 100 }
      audience?: { score: number; outOf: 100 }
    }
    metacritic?: { score: number; outOf: 100 }
  }

  // Combined/computed fields
  combinedRating?: number
  aggregatedScore?: number
  dataSource: 'tmdb' | 'tmdb+omdb'
}

export interface SearchOptions {
  query: string
  page?: number
  includeOMDBData?: boolean
  year?: number
  type?: 'movie' | 'tv' | 'all'
}

export interface MovieApiError extends Error {
  source: 'tmdb' | 'omdb' | 'combined'
  originalError: Error
}

class MovieApiClient {
  // Search with enhanced data
  async search(options: SearchOptions): Promise<{
    results: EnhancedMovie[]
    page: number
    totalPages: number
    totalResults: number
  }> {
    try {
      // Get TMDB results first
      const tmdbResults = await tmdbApi.searchMulti(options.query, options.page || 1)
      
      // Filter by type if specified
      let filteredResults = tmdbResults.results
      if (options.type && options.type !== 'all') {
        filteredResults = tmdbResults.results.filter(item => {
          if (options.type === 'movie') return 'title' in item
          if (options.type === 'tv') return 'name' in item
          return true
        })
      }

      // Convert to enhanced format
      const enhancedResults: EnhancedMovie[] = await Promise.all(
        filteredResults.map(async (item) => {
          const enhanced = this.convertTMDBToEnhanced(item)
          
          // Optionally enhance with OMDB data
          if (options.includeOMDBData && enhanced.title) {
            try {
              const omdbData = await this.getOMDBDataForMovie(enhanced.title, enhanced.release_date)
              if (omdbData) {
                return this.mergeOMDBData(enhanced, omdbData)
              }
            } catch (error) {
              // Continue without OMDB data if it fails
              console.warn(`Failed to get OMDB data for ${enhanced.title}:`, error)
            }
          }
          
          return enhanced
        })
      )

      return {
        results: enhancedResults,
        page: tmdbResults.page,
        totalPages: tmdbResults.total_pages,
        totalResults: tmdbResults.total_results
      }
    } catch (error) {
      throw this.createMovieApiError(error as Error, 'tmdb')
    }
  }

  // Get detailed movie information with both APIs
  async getMovieDetails(tmdbId: number, includeOMDBData: boolean = true): Promise<EnhancedMovie> {
    try {
      // Get TMDB details
      const tmdbDetails = await tmdbApi.getMovieDetails(tmdbId, 'credits,videos,similar')
      const enhanced = this.convertTMDBToEnhanced(tmdbDetails)

      // Enhance with OMDB data if requested
      if (includeOMDBData && enhanced.title) {
        try {
          const omdbData = await this.getOMDBDataForMovie(enhanced.title, enhanced.release_date)
          if (omdbData) {
            return this.mergeOMDBData(enhanced, omdbData)
          }
        } catch (error) {
          console.warn(`Failed to get OMDB data for movie ${tmdbId}:`, error)
        }
      }

      return enhanced
    } catch (error) {
      throw this.createMovieApiError(error as Error, 'tmdb')
    }
  }

  // Get trending movies with enhanced data
  async getTrending(
    mediaType: 'all' | 'movie' | 'tv' = 'movie',
    timeWindow: 'day' | 'week' = 'day',
    includeOMDBData: boolean = false
  ): Promise<EnhancedMovie[]> {
    try {
      const tmdbResults = await tmdbApi.getTrending(mediaType, timeWindow)
      
      return Promise.all(
        tmdbResults.results.map(async (item) => {
          const enhanced = this.convertTMDBToEnhanced(item)
          
          if (includeOMDBData && enhanced.title) {
            try {
              const omdbData = await this.getOMDBDataForMovie(enhanced.title, enhanced.release_date)
              if (omdbData) {
                return this.mergeOMDBData(enhanced, omdbData)
              }
            } catch (error) {
              console.warn(`Failed to get OMDB data for ${enhanced.title}:`, error)
            }
          }
          
          return enhanced
        })
      )
    } catch (error) {
      throw this.createMovieApiError(error as Error, 'tmdb')
    }
  }

  // Helper: Convert TMDB data to enhanced format
  private convertTMDBToEnhanced(tmdbItem: TMDBMovie | TMDBTVShow | any): EnhancedMovie {
    const isMovie = 'title' in tmdbItem

    // Create basic ratings structure for TMDB-only data
    const tmdbRatings = {
      tmdb: {
        score: tmdbItem.vote_average || 0,
        votes: tmdbItem.vote_count || 0,
        outOf: 10
      }
    }

    return {
      id: tmdbItem.id,
      title: isMovie ? tmdbItem.title : tmdbItem.name,
      overview: tmdbItem.overview,
      poster_path: tmdbItem.poster_path,
      backdrop_path: tmdbItem.backdrop_path,
      release_date: isMovie ? tmdbItem.release_date : tmdbItem.first_air_date,
      vote_average: tmdbItem.vote_average,
      vote_count: tmdbItem.vote_count,
      genre_ids: tmdbItem.genre_ids || [],
      popularity: tmdbItem.popularity,
      ratings: tmdbRatings,
      aggregatedScore: tmdbItem.vote_average || 0,
      dataSource: 'tmdb'
    }
  }

  // Helper: Get OMDB data for a movie
  private async getOMDBDataForMovie(title: string, releaseDate: string): Promise<OMDBMovieDetails | null> {
    try {
      const year = releaseDate ? new Date(releaseDate).getFullYear() : undefined
      return await omdbApi.getByTitle(title, year, 'movie')
    } catch (error) {
      // Try without year if the first attempt fails
      if (error instanceof OMDBError && year) {
        try {
          return await omdbApi.getByTitle(title, undefined, 'movie')
        } catch (secondError) {
          return null
        }
      }
      return null
    }
  }

  // Helper: Merge OMDB data into enhanced movie
  private mergeOMDBData(enhanced: EnhancedMovie, omdbData: OMDBMovieDetails): EnhancedMovie {
    const omdbRatings = omdbApi.extractRatings(omdbData)

    // Create structured ratings object
    const structuredRatings = {
      tmdb: {
        score: enhanced.vote_average,
        votes: enhanced.vote_count,
        outOf: 10
      },
      ...(omdbRatings.imdb && {
        imdb: {
          score: parseFloat(omdbRatings.imdb.score) || 0,
          votes: omdbRatings.imdb.votes || '0',
          outOf: 10
        }
      }),
      ...(omdbRatings.rottenTomatoes && {
        rottenTomatoes: {
          critics: {
            score: parseInt(omdbRatings.rottenTomatoes.score?.replace('%', '') || '0') || 0,
            outOf: 100
          }
        }
      }),
      ...(omdbRatings.metacritic && {
        metacritic: {
          score: parseInt(omdbRatings.metacritic.score || '0') || 0,
          outOf: 100
        }
      })
    }

    return {
      ...enhanced,
      imdbId: omdbData.imdbID,
      imdbRating: omdbRatings.imdb?.score,
      imdbVotes: omdbRatings.imdb?.votes,
      rottenTomatoesRating: omdbRatings.rottenTomatoes?.score,
      metacriticRating: omdbRatings.metacritic?.score,
      awards: omdbData.Awards !== 'N/A' ? omdbData.Awards : undefined,
      boxOffice: omdbData.BoxOffice !== 'N/A' ? omdbData.BoxOffice : undefined,
      runtime: omdbData.Runtime !== 'N/A' ? omdbData.Runtime : undefined,
      director: omdbData.Director !== 'N/A' ? omdbData.Director : undefined,
      actors: omdbData.Actors !== 'N/A' ? omdbData.Actors : undefined,
      plot: omdbData.Plot !== 'N/A' ? omdbData.Plot : enhanced.overview,
      ratings: structuredRatings,
      combinedRating: this.calculateCombinedRating(enhanced.vote_average, omdbRatings.imdb?.score),
      aggregatedScore: this.calculateAggregatedScore(structuredRatings),
      dataSource: 'tmdb+omdb'
    }
  }

  // Helper: Calculate combined rating from TMDB and IMDB
  private calculateCombinedRating(tmdbRating: number, imdbRating?: string): number {
    if (!imdbRating) return tmdbRating

    const imdbScore = parseFloat(imdbRating)
    if (isNaN(imdbScore)) return tmdbRating

    // Convert TMDB (0-10) and IMDB (0-10) to a weighted average
    // TMDB weight: 0.4, IMDB weight: 0.6 (IMDB generally more trusted)
    return Math.round((tmdbRating * 0.4 + imdbScore * 0.6) * 10) / 10
  }

  // Helper: Calculate aggregated score from all available ratings
  private calculateAggregatedScore(ratings: any): number {
    const scores: { value: number; weight: number }[] = []

    // TMDB rating (weight: 0.25)
    if (ratings.tmdb?.score > 0) {
      scores.push({ value: ratings.tmdb.score, weight: 0.25 })
    }

    // IMDB rating (weight: 0.35 - most trusted)
    if (ratings.imdb?.score > 0) {
      scores.push({ value: ratings.imdb.score, weight: 0.35 })
    }

    // Rotten Tomatoes critics (weight: 0.25, convert from 100 to 10 scale)
    if (ratings.rottenTomatoes?.critics?.score > 0) {
      scores.push({
        value: ratings.rottenTomatoes.critics.score / 10,
        weight: 0.25
      })
    }

    // Metacritic (weight: 0.15, convert from 100 to 10 scale)
    if (ratings.metacritic?.score > 0) {
      scores.push({
        value: ratings.metacritic.score / 10,
        weight: 0.15
      })
    }

    if (scores.length === 0) return 0

    // Calculate weighted average
    const totalWeight = scores.reduce((sum, score) => sum + score.weight, 0)
    const weightedSum = scores.reduce((sum, score) => sum + (score.value * score.weight), 0)

    return Math.round((weightedSum / totalWeight) * 10) / 10
  }

  // Helper: Create standardized error
  private createMovieApiError(error: Error, source: 'tmdb' | 'omdb' | 'combined'): MovieApiError {
    const movieError = new Error(error.message) as MovieApiError
    movieError.source = source
    movieError.originalError = error
    movieError.name = 'MovieApiError'
    return movieError
  }

  // Get API status and rate limits
  getApiStatus() {
    return {
      omdb: {
        remainingRequests: omdbApi.getRemainingRequests(),
        canMakeRequest: omdbApi.canMakeRequest()
      }
    }
  }

  // Helper methods for image URLs
  getImageUrl(path: string | null, size: string = 'w500'): string | null {
    return tmdbApi.getImageUrl(path, size)
  }

  getBackdropUrl(path: string | null, size: string = 'w1280'): string | null {
    return tmdbApi.getBackdropUrl(path, size)
  }
}

// Export singleton instance
export const movieApi = new MovieApiClient()
export default movieApi
