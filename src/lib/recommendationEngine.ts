// Recommendation Engine - AI-powered content suggestions based on user preferences
import { EnhancedMovie } from './movieApi'

export interface UserPreferences {
  favoriteGenres: { id: number; name: string; weight: number }[]
  preferredRatingRange: { min: number; max: number }
  preferredYearRange: { min: number; max: number }
  averageRating: number
  totalWatched: number
  preferredLanguages: string[]
  actorPreferences: string[]
  directorPreferences: string[]
}

export interface RecommendationReason {
  type: 'genre' | 'rating' | 'actor' | 'director' | 'similar' | 'trending' | 'year'
  description: string
  confidence: number
}

export interface Recommendation {
  movie: EnhancedMovie
  score: number
  reasons: RecommendationReason[]
  category: 'because_you_watched' | 'genre_match' | 'highly_rated' | 'trending' | 'similar_taste'
  basedOn?: EnhancedMovie // The movie this recommendation is based on
}

export class RecommendationEngine {
  private watchlist: EnhancedMovie[] = []
  private preferences: UserPreferences | null = null

  constructor(watchlist: EnhancedMovie[] = []) {
    this.watchlist = watchlist
    this.preferences = this.analyzePreferences()
  }

  // Analyze user's watchlist to extract preferences
  private analyzePreferences(): UserPreferences | null {
    if (!this.watchlist || !Array.isArray(this.watchlist) || this.watchlist.length === 0) return null

    // Analyze genres
    const genreCount: { [key: number]: { name: string; count: number; totalRating: number } } = {}
    let totalRating = 0
    let ratingCount = 0
    const years: number[] = []
    const languages: string[] = []
    const actors: string[] = []
    const directors: string[] = []

    this.watchlist.forEach(movie => {
      // Genre analysis
      movie.genre_ids?.forEach(genreId => {
        if (!genreCount[genreId]) {
          genreCount[genreId] = { name: this.getGenreName(genreId), count: 0, totalRating: 0 }
        }
        genreCount[genreId].count++
        genreCount[genreId].totalRating += movie.vote_average || 0
      })

      // Rating analysis
      if (movie.vote_average) {
        totalRating += movie.vote_average
        ratingCount++
      }

      // Year analysis
      if (movie.release_date) {
        const year = new Date(movie.release_date).getFullYear()
        if (year > 1900) years.push(year)
      }

      // Language analysis (if available)
      if ((movie as any).original_language) {
        languages.push((movie as any).original_language)
      }

      // Actor/Director analysis (if available from OMDB)
      if (movie.actors) {
        actors.push(...movie.actors.split(', ').slice(0, 3)) // Top 3 actors
      }
      if (movie.director) {
        directors.push(movie.director)
      }
    })

    // Calculate favorite genres with weights
    const favoriteGenres = Object.entries(genreCount)
      .map(([id, data]) => ({
        id: parseInt(id),
        name: data.name,
        weight: (data.count / this.watchlist.length) * (data.totalRating / data.count / 10)
      }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5) // Top 5 genres

    // Calculate preferred rating range
    const ratings = this.watchlist.map(m => m.vote_average || 0).filter(r => r > 0)
    const avgRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 7
    const minRating = Math.max(avgRating - 1.5, 0)
    const maxRating = 10

    // Calculate preferred year range
    const sortedYears = years.sort((a, b) => b - a)
    const recentYears = sortedYears.slice(0, Math.ceil(sortedYears.length * 0.7)) // 70% most recent
    const minYear = Math.min(...recentYears) || new Date().getFullYear() - 10
    const maxYear = new Date().getFullYear()

    // Get most common languages, actors, directors
    const topLanguages = this.getTopItems(languages, 3)
    const topActors = this.getTopItems(actors, 10)
    const topDirectors = this.getTopItems(directors, 5)

    return {
      favoriteGenres,
      preferredRatingRange: { min: minRating, max: maxRating },
      preferredYearRange: { min: minYear, max: maxYear },
      averageRating: avgRating,
      totalWatched: this.watchlist.length,
      preferredLanguages: topLanguages,
      actorPreferences: topActors,
      directorPreferences: topDirectors
    }
  }

  // Get top occurring items from array
  private getTopItems(items: string[], limit: number): string[] {
    const counts: { [key: string]: number } = {}
    items.forEach(item => {
      const normalized = item.trim().toLowerCase()
      counts[normalized] = (counts[normalized] || 0) + 1
    })

    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([item]) => item)
  }

  // Get genre name by ID (simplified mapping)
  private getGenreName(genreId: number): string {
    const genreMap: { [key: number]: string } = {
      28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
      99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
      27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
      10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
    }
    return genreMap[genreId] || 'Unknown'
  }

  // Generate recommendations based on user preferences
  generateRecommendations(
    candidateMovies: EnhancedMovie[],
    limit: number = 20
  ): Recommendation[] {
    if (!candidateMovies || !Array.isArray(candidateMovies)) {
      return []
    }

    if (!this.preferences || !this.watchlist || this.watchlist.length === 0) {
      return this.generateTrendingRecommendations(candidateMovies, limit)
    }

    const recommendations: Recommendation[] = []

    candidateMovies.forEach(movie => {
      // Skip movies already in watchlist
      if (this.watchlist.some(w => w.id === movie.id)) return

      const score = this.calculateRecommendationScore(movie)
      const reasons = this.generateReasons(movie)
      const category = this.determineCategory(movie, reasons)

      if (score > 0.3) { // Minimum threshold
        recommendations.push({
          movie,
          score,
          reasons,
          category
        })
      }
    })

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  // Calculate recommendation score for a movie
  private calculateRecommendationScore(movie: EnhancedMovie): number {
    if (!this.preferences) return 0

    let score = 0
    let maxScore = 0

    // Genre matching (40% weight)
    const genreWeight = 0.4
    maxScore += genreWeight
    if (movie.genre_ids && movie.genre_ids.length > 0) {
      const genreScore = movie.genre_ids.reduce((sum, genreId) => {
        const preference = this.preferences!.favoriteGenres.find(g => g.id === genreId)
        return sum + (preference ? preference.weight : 0)
      }, 0) / movie.genre_ids.length
      score += genreScore * genreWeight
    }

    // Rating matching (25% weight)
    const ratingWeight = 0.25
    maxScore += ratingWeight
    if (movie.vote_average) {
      const { min, max } = this.preferences.preferredRatingRange
      if (movie.vote_average >= min && movie.vote_average <= max) {
        const ratingScore = Math.min(movie.vote_average / 10, 1)
        score += ratingScore * ratingWeight
      }
    }

    // Year preference (15% weight)
    const yearWeight = 0.15
    maxScore += yearWeight
    if (movie.release_date) {
      const year = new Date(movie.release_date).getFullYear()
      const { min, max } = this.preferences.preferredYearRange
      if (year >= min && year <= max) {
        score += yearWeight
      }
    }

    // Popularity boost (10% weight)
    const popularityWeight = 0.1
    maxScore += popularityWeight
    if (movie.popularity) {
      const popularityScore = Math.min(movie.popularity / 1000, 1)
      score += popularityScore * popularityWeight
    }

    // Actor/Director matching (10% weight)
    const peopleWeight = 0.1
    maxScore += peopleWeight
    let peopleScore = 0
    if (movie.actors && this.preferences.actorPreferences.length > 0) {
      const movieActors = movie.actors.toLowerCase().split(', ')
      const matchingActors = movieActors.filter(actor => 
        this.preferences!.actorPreferences.some(pref => actor.includes(pref))
      )
      peopleScore += matchingActors.length / movieActors.length * 0.7
    }
    if (movie.director && this.preferences.directorPreferences.length > 0) {
      const matchingDirector = this.preferences.directorPreferences.some(pref => 
        movie.director!.toLowerCase().includes(pref)
      )
      if (matchingDirector) peopleScore += 0.3
    }
    score += Math.min(peopleScore, 1) * peopleWeight

    return Math.min(score / maxScore, 1) // Normalize to 0-1
  }

  // Generate reasons for recommendation
  private generateReasons(movie: EnhancedMovie): RecommendationReason[] {
    const reasons: RecommendationReason[] = []

    if (!this.preferences) return reasons

    // Genre reasons
    if (movie.genre_ids) {
      const matchingGenres = movie.genre_ids
        .map(id => this.preferences!.favoriteGenres.find(g => g.id === id))
        .filter(Boolean)
      
      if (matchingGenres.length > 0) {
        const topGenre = matchingGenres.sort((a, b) => b!.weight - a!.weight)[0]!
        reasons.push({
          type: 'genre',
          description: `You enjoy ${topGenre.name} movies`,
          confidence: topGenre.weight
        })
      }
    }

    // Rating reasons
    if (movie.vote_average && movie.vote_average >= this.preferences.preferredRatingRange.min) {
      reasons.push({
        type: 'rating',
        description: `Highly rated (${movie.vote_average.toFixed(1)}/10)`,
        confidence: Math.min(movie.vote_average / 10, 1)
      })
    }

    return reasons.slice(0, 3) // Limit to top 3 reasons
  }

  // Determine recommendation category
  private determineCategory(movie: EnhancedMovie, reasons: RecommendationReason[]): Recommendation['category'] {
    if (reasons.some(r => r.type === 'genre' && r.confidence > 0.7)) {
      return 'genre_match'
    }
    if (movie.vote_average && movie.vote_average >= 8) {
      return 'highly_rated'
    }
    if (movie.popularity && movie.popularity > 500) {
      return 'trending'
    }
    return 'similar_taste'
  }

  // Generate trending recommendations for new users
  private generateTrendingRecommendations(
    candidateMovies: EnhancedMovie[],
    limit: number
  ): Recommendation[] {
    return candidateMovies
      .filter(movie => movie.popularity && movie.popularity > 100)
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, limit)
      .map(movie => ({
        movie,
        score: Math.min((movie.popularity || 0) / 1000, 1),
        reasons: [{
          type: 'trending',
          description: 'Currently trending',
          confidence: 0.8
        }],
        category: 'trending' as const
      }))
  }

  // Get user preferences
  getPreferences(): UserPreferences | null {
    return this.preferences
  }

  // Update watchlist and recalculate preferences
  updateWatchlist(newWatchlist: EnhancedMovie[]): void {
    this.watchlist = newWatchlist
    this.preferences = this.analyzePreferences()
  }
}
