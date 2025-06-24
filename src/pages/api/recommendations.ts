// API route for generating personalized recommendations
import { NextApiRequest, NextApiResponse } from 'next'
import { RecommendationEngine, Recommendation } from '@/lib/recommendationEngine'
import { movieApi } from '@/lib/movieApi'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { 
    watchlist_ids, 
    category = 'all',
    limit = '20',
    page = '1'
  } = req.query

  try {
    const limitNum = parseInt(limit as string) || 20
    const pageNum = parseInt(page as string) || 1

    // Parse watchlist IDs
    let watchlistIds: number[] = []
    if (watchlist_ids) {
      try {
        watchlistIds = JSON.parse(watchlist_ids as string)
      } catch {
        watchlistIds = (watchlist_ids as string).split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
      }
    }

    // Get watchlist movies with enhanced data
    let validWatchlistMovies = []
    if (watchlistIds.length > 0) {
      const watchlistMovies = await Promise.all(
        watchlistIds.slice(0, 50).map(async (id) => { // Limit to 50 for performance
          try {
            return await movieApi.getMovieDetails(id, true)
          } catch {
            return null
          }
        })
      )
      validWatchlistMovies = watchlistMovies.filter(movie => movie !== null)
    }

    // Initialize recommendation engine
    const engine = new RecommendationEngine(validWatchlistMovies)

    // Get candidate movies for recommendations
    const candidateMovies = await getCandidateMovies(category as string, validWatchlistMovies)

    // Generate recommendations
    const allRecommendations = engine.generateRecommendations(candidateMovies, limitNum * 3)

    // Filter by category if specified
    let filteredRecommendations = allRecommendations
    if (category !== 'all') {
      filteredRecommendations = allRecommendations.filter(rec => rec.category === category)
    }

    // Paginate results
    const startIndex = (pageNum - 1) * limitNum
    const endIndex = startIndex + limitNum
    const paginatedRecommendations = filteredRecommendations.slice(startIndex, endIndex)

    // Get user preferences for additional context
    const preferences = engine.getPreferences()

    const response = {
      recommendations: paginatedRecommendations,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredRecommendations.length,
        totalPages: Math.ceil(filteredRecommendations.length / limitNum)
      },
      preferences,
      categories: getCategoryStats(allRecommendations),
      watchlistSize: validWatchlistMovies.length
    }

    res.status(200).json(response)

  } catch (error) {
    console.error('Recommendations API error:', error)
    res.status(500).json({ error: 'Failed to generate recommendations. Please try again.' })
  }
}

// Get candidate movies for recommendations
async function getCandidateMovies(category: string, watchlistMovies: any[]): Promise<any[]> {
  const candidates: any[] = []

  try {
    // Get trending movies
    const trendingResponse = await fetch(`${process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3'}/trending/movie/week?api_key=${process.env.TMDB_API_KEY}`)
    if (trendingResponse.ok) {
      const trendingData = await trendingResponse.json()
      candidates.push(...(trendingData.results || []))
    }

    // Get popular movies
    const popularResponse = await fetch(`${process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3'}/movie/popular?api_key=${process.env.TMDB_API_KEY}`)
    if (popularResponse.ok) {
      const popularData = await popularResponse.json()
      candidates.push(...(popularData.results || []))
    }

    // Get top rated movies
    const topRatedResponse = await fetch(`${process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3'}/movie/top_rated?api_key=${process.env.TMDB_API_KEY}`)
    if (topRatedResponse.ok) {
      const topRatedData = await topRatedResponse.json()
      candidates.push(...(topRatedData.results || []))
    }

    // If user has watchlist, get similar movies
    if (watchlistMovies.length > 0) {
      for (const movie of watchlistMovies.slice(0, 5)) { // Limit to 5 for performance
        try {
          const similarResponse = await fetch(`${process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3'}/movie/${movie.id}/similar?api_key=${process.env.TMDB_API_KEY}`)
          if (similarResponse.ok) {
            const similarData = await similarResponse.json()
            candidates.push(...(similarData.results || []))
          }
        } catch (error) {
          console.error(`Error fetching similar movies for ${movie.id}:`, error)
        }
      }
    }

    // Remove duplicates and convert to enhanced format
    const uniqueCandidates = candidates.reduce((acc, movie) => {
      if (!acc.find((m: any) => m.id === movie.id)) {
        acc.push({
          id: movie.id,
          title: movie.title,
          overview: movie.overview,
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          release_date: movie.release_date,
          vote_average: movie.vote_average,
          vote_count: movie.vote_count,
          genre_ids: movie.genre_ids || [],
          popularity: movie.popularity,
          original_language: movie.original_language,
          dataSource: 'tmdb'
        })
      }
      return acc
    }, [])

    return uniqueCandidates

  } catch (error) {
    console.error('Error fetching candidate movies:', error)
    return []
  }
}

// Get statistics about recommendation categories
function getCategoryStats(recommendations: Recommendation[]) {
  const stats = {
    because_you_watched: 0,
    genre_match: 0,
    highly_rated: 0,
    trending: 0,
    similar_taste: 0
  }

  recommendations.forEach(rec => {
    stats[rec.category]++
  })

  return stats
}
