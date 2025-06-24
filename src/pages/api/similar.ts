// API route for fetching similar movies to a specific movie
import { NextApiRequest, NextApiResponse } from 'next'
import { movieApi } from '@/lib/movieApi'

const TMDB_API_KEY = process.env.TMDB_API_KEY || 'your-api-key-here'
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { movie_id, enhanced = 'false', limit = '20' } = req.query

  if (!movie_id) {
    return res.status(400).json({ error: 'Movie ID is required' })
  }

  try {
    const movieIdNum = parseInt(movie_id as string)
    const includeEnhanced = enhanced === 'true'
    const limitNum = parseInt(limit as string) || 20

    // Get similar movies from TMDB
    const similarResponse = await fetch(
      `${TMDB_BASE_URL}/movie/${movieIdNum}/similar?api_key=${TMDB_API_KEY}&language=en-US&page=1`
    )

    if (!similarResponse.ok) {
      if (similarResponse.status === 404) {
        return res.status(404).json({ error: 'Movie not found' })
      }
      throw new Error(`TMDB API error: ${similarResponse.status}`)
    }

    const similarData = await similarResponse.json()

    if (!similarData.results || !Array.isArray(similarData.results)) {
      throw new Error('Invalid response format from TMDB')
    }

    // Limit results
    const limitedResults = similarData.results.slice(0, limitNum)

    // Enhance with OMDB data if requested
    let enhancedResults = limitedResults
    if (includeEnhanced && limitedResults.length > 0) {
      try {
        enhancedResults = await Promise.all(
          limitedResults.slice(0, 10).map(async (movie: any) => { // Limit enhanced to 10 for performance
            try {
              const enhanced = await movieApi.getMovieDetails(movie.id, true)
              return enhanced
            } catch (error) {
              console.error(`Failed to enhance movie ${movie.id}:`, error)
              // Return basic TMDB data if enhancement fails
              return {
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
                dataSource: 'tmdb'
              }
            }
          })
        )
      } catch (error) {
        console.error('Error enhancing similar movies:', error)
        enhancedResults = limitedResults
      }
    }

    // Also get recommendations from TMDB
    const recommendationsResponse = await fetch(
      `${TMDB_BASE_URL}/movie/${movieIdNum}/recommendations?api_key=${TMDB_API_KEY}&language=en-US&page=1`
    )

    let recommendations = []
    if (recommendationsResponse.ok) {
      const recommendationsData = await recommendationsResponse.json()
      recommendations = recommendationsData.results?.slice(0, 10) || []
    }

    // Get the original movie details for context
    let originalMovie = null
    try {
      originalMovie = await movieApi.getMovieDetails(movieIdNum, includeEnhanced)
    } catch (error) {
      console.error('Error fetching original movie:', error)
    }

    const response = {
      original_movie: originalMovie,
      similar: enhancedResults,
      recommendations: recommendations,
      total_results: similarData.total_results,
      page: similarData.page,
      total_pages: Math.min(similarData.total_pages, Math.ceil(limitNum / 20)),
      enhanced: includeEnhanced
    }

    res.status(200).json(response)

  } catch (error) {
    console.error('Similar movies API error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: 'Movie not found' })
      } else if (error.message.includes('Network')) {
        return res.status(503).json({ error: 'Network error. Please try again.' })
      }
    }
    
    res.status(500).json({ error: 'Failed to fetch similar movies. Please try again.' })
  }
}
