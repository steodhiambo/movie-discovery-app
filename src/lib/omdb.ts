// OMDB API integration with proper error handling and rate limiting

// Types for OMDB API responses
export interface OMDBRating {
  Source: string
  Value: string
}

export interface OMDBSearchResult {
  Title: string
  Year: string
  imdbID: string
  Type: 'movie' | 'series' | 'episode'
  Poster: string
}

export interface OMDBSearchResponse {
  Search: OMDBSearchResult[]
  totalResults: string
  Response: 'True' | 'False'
  Error?: string
}

export interface OMDBMovieDetails {
  Title: string
  Year: string
  Rated: string
  Released: string
  Runtime: string
  Genre: string
  Director: string
  Writer: string
  Actors: string
  Plot: string
  Language: string
  Country: string
  Awards: string
  Poster: string
  Ratings: OMDBRating[]
  Metascore: string
  imdbRating: string
  imdbVotes: string
  imdbID: string
  Type: 'movie' | 'series' | 'episode'
  DVD?: string
  BoxOffice?: string
  Production?: string
  Website?: string
  Response: 'True' | 'False'
  Error?: string
  // Series specific
  totalSeasons?: string
  // Episode specific
  seriesID?: string
  Season?: string
  Episode?: string
}

// Configuration
const OMDB_API_KEY = process.env.OMDB_API_KEY || process.env.NEXT_PUBLIC_OMDB_API_KEY
const OMDB_BASE_URL = 'https://www.omdbapi.com' // Using HTTPS

// Rate limiting - OMDB free tier allows 1000 requests per day
class OMDBRateLimiter {
  private requests: number[] = []
  private readonly maxRequestsPerDay = 950 // Leave some buffer
  private readonly dayInMs = 24 * 60 * 60 * 1000

  canMakeRequest(): boolean {
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.dayInMs)
    return this.requests.length < this.maxRequestsPerDay
  }

  recordRequest(): void {
    this.requests.push(Date.now())
  }

  getRemainingRequests(): number {
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.dayInMs)
    return this.maxRequestsPerDay - this.requests.length
  }
}

const omdbRateLimiter = new OMDBRateLimiter()

// Error classes
export class OMDBError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message)
    this.name = 'OMDBError'
  }
}

// API Client
class OMDBClient {
  private async makeRequest<T>(params: Record<string, any>): Promise<T> {
    if (!OMDB_API_KEY) {
      throw new OMDBError('OMDB API key is not configured')
    }

    if (!omdbRateLimiter.canMakeRequest()) {
      throw new OMDBError('OMDB API rate limit exceeded. Please try again later.')
    }

    const url = new URL(OMDB_BASE_URL)
    url.searchParams.append('apikey', OMDB_API_KEY)

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString())
      }
    })

    try {
      const response = await fetch(url.toString())

      if (!response.ok) {
        throw new OMDBError(`HTTP ${response.status}: ${response.statusText}`, response.status)
      }

      const data = await response.json()
      omdbRateLimiter.recordRequest()

      // OMDB returns errors in the response body
      if (data.Response === 'False') {
        throw new OMDBError(data.Error || 'OMDB API returned an error')
      }

      return data
    } catch (error) {
      if (error instanceof OMDBError) {
        throw error
      }
      throw new OMDBError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Search by title
  async searchByTitle(title: string, year?: number, type?: 'movie' | 'series' | 'episode', page: number = 1): Promise<OMDBSearchResponse> {
    if (!title.trim()) {
      throw new OMDBError('Search title cannot be empty')
    }

    const params: Record<string, any> = {
      s: title.trim(),
      page
    }

    if (year) params.y = year
    if (type) params.type = type

    return this.makeRequest<OMDBSearchResponse>(params)
  }

  // Get details by IMDB ID
  async getByImdbId(imdbId: string, plot: 'short' | 'full' = 'short'): Promise<OMDBMovieDetails> {
    if (!imdbId.trim()) {
      throw new OMDBError('IMDB ID cannot be empty')
    }

    return this.makeRequest<OMDBMovieDetails>({
      i: imdbId.trim(),
      plot
    })
  }

  // Get details by title
  async getByTitle(
    title: string,
    year?: number,
    type?: 'movie' | 'series' | 'episode',
    plot: 'short' | 'full' = 'short'
  ): Promise<OMDBMovieDetails> {
    if (!title.trim()) {
      throw new OMDBError('Title cannot be empty')
    }

    const params: Record<string, any> = {
      t: title.trim(),
      plot
    }

    if (year) params.y = year
    if (type) params.type = type

    return this.makeRequest<OMDBMovieDetails>(params)
  }

  // Get episode details
  async getEpisode(seriesTitle: string, season: number, episode: number): Promise<OMDBMovieDetails> {
    if (!seriesTitle.trim()) {
      throw new OMDBError('Series title cannot be empty')
    }

    return this.makeRequest<OMDBMovieDetails>({
      t: seriesTitle.trim(),
      Season: season,
      Episode: episode
    })
  }

  // Helper method to extract and format ratings
  extractRatings(omdbData: OMDBMovieDetails) {
    const ratings = {
      imdb: null as { score: string; votes?: string } | null,
      rottenTomatoes: null as { score: string } | null,
      metacritic: null as { score: string } | null
    }

    // IMDB rating from main fields
    if (omdbData.imdbRating && omdbData.imdbRating !== 'N/A') {
      ratings.imdb = {
        score: omdbData.imdbRating,
        votes: omdbData.imdbVotes !== 'N/A' ? omdbData.imdbVotes : undefined
      }
    }

    // Ratings from Ratings array
    if (omdbData.Ratings) {
      omdbData.Ratings.forEach(rating => {
        switch (rating.Source) {
          case 'Rotten Tomatoes':
            ratings.rottenTomatoes = { score: rating.Value }
            break
          case 'Metacritic':
            ratings.metacritic = { score: rating.Value }
            break
          case 'Internet Movie Database':
            if (!ratings.imdb) {
              ratings.imdb = { score: rating.Value }
            }
            break
        }
      })
    }

    return ratings
  }

  // Helper method to format OMDB data for consistent use
  formatMovieData(omdbData: OMDBMovieDetails) {
    return {
      title: omdbData.Title,
      year: omdbData.Year,
      rated: omdbData.Rated !== 'N/A' ? omdbData.Rated : null,
      released: omdbData.Released !== 'N/A' ? omdbData.Released : null,
      runtime: omdbData.Runtime !== 'N/A' ? omdbData.Runtime : null,
      genre: omdbData.Genre !== 'N/A' ? omdbData.Genre : null,
      director: omdbData.Director !== 'N/A' ? omdbData.Director : null,
      writer: omdbData.Writer !== 'N/A' ? omdbData.Writer : null,
      actors: omdbData.Actors !== 'N/A' ? omdbData.Actors : null,
      plot: omdbData.Plot !== 'N/A' ? omdbData.Plot : null,
      language: omdbData.Language !== 'N/A' ? omdbData.Language : null,
      country: omdbData.Country !== 'N/A' ? omdbData.Country : null,
      awards: omdbData.Awards !== 'N/A' ? omdbData.Awards : null,
      poster: omdbData.Poster !== 'N/A' ? omdbData.Poster : null,
      ratings: this.extractRatings(omdbData),
      metascore: omdbData.Metascore !== 'N/A' ? omdbData.Metascore : null,
      imdbId: omdbData.imdbID,
      type: omdbData.Type,
      dvd: omdbData.DVD !== 'N/A' ? omdbData.DVD : null,
      boxOffice: omdbData.BoxOffice !== 'N/A' ? omdbData.BoxOffice : null,
      production: omdbData.Production !== 'N/A' ? omdbData.Production : null,
      website: omdbData.Website !== 'N/A' ? omdbData.Website : null,
      totalSeasons: omdbData.totalSeasons,
      seriesID: omdbData.seriesID,
      season: omdbData.Season,
      episode: omdbData.Episode
    }
  }

  // Get remaining API requests for the day
  getRemainingRequests(): number {
    return omdbRateLimiter.getRemainingRequests()
  }

  // Check if we can make more requests
  canMakeRequest(): boolean {
    return omdbRateLimiter.canMakeRequest()
  }
}

// Export singleton instance
export const omdbApi = new OMDBClient()
export default omdbApi
