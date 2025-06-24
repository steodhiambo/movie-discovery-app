// API route for movie details
import { NextApiRequest, NextApiResponse } from 'next'
import { tmdbApi } from '@/lib/tmdb'
import { movieApi } from '@/lib/movieApi'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id, enhanced } = req.query

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid movie ID' })
  }

  const movieId = parseInt(id)
  if (isNaN(movieId)) {
    return res.status(400).json({ error: 'Invalid movie ID' })
  }

  try {
    // Get detailed movie information with cast, crew, videos, and similar movies
    const movieDetails = await tmdbApi.getMovieDetails(movieId, 'credits,videos,similar,recommendations')
    
    let enhancedMovie = null
    if (enhanced === 'true') {
      try {
        enhancedMovie = await movieApi.getMovieDetails(movieId, true)
      } catch (enhancedError) {
        console.warn('Could not get enhanced movie data:', enhancedError)
      }
    }

    res.status(200).json({
      movie: movieDetails,
      enhanced: enhancedMovie
    })
  } catch (error) {
    console.error('Failed to load movie details:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid API key')) {
        return res.status(401).json({ error: 'API key not configured properly' })
      } else if (error.message.includes('404')) {
        return res.status(404).json({ error: 'Movie not found' })
      }
    }
    
    res.status(500).json({ error: 'Failed to load movie details' })
  }
}
