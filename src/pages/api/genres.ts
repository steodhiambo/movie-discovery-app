// API route for fetching genres
import { NextApiRequest, NextApiResponse } from 'next'

const TMDB_API_KEY = process.env.TMDB_API_KEY || 'your-api-key-here'
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

// Cache for genres to avoid repeated API calls
let genreCache: {
  movie?: { data: any; timestamp: number }
  tv?: { data: any; timestamp: number }
} = {}

const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { type } = req.query

  // Validate type parameter
  if (!type || (type !== 'movie' && type !== 'tv')) {
    return res.status(400).json({ error: 'Invalid type parameter. Must be "movie" or "tv"' })
  }

  try {
    const mediaType = type as 'movie' | 'tv'
    
    // Check cache first
    const cached = genreCache[mediaType]
    const now = Date.now()
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log(`Returning cached ${mediaType} genres`)
      return res.status(200).json(cached.data)
    }

    // Fetch from TMDB API
    console.log(`Fetching ${mediaType} genres from TMDB...`)
    const response = await fetch(
      `${TMDB_BASE_URL}/genre/${mediaType}/list?api_key=${TMDB_API_KEY}&language=en-US`
    )

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key')
      } else if (response.status === 404) {
        throw new Error('Genres not found')
      } else {
        throw new Error(`TMDB API error: ${response.status}`)
      }
    }

    const genresData = await response.json()

    // Validate response structure
    if (!genresData.genres || !Array.isArray(genresData.genres)) {
      throw new Error('Invalid response format from TMDB')
    }

    // Cache the result
    genreCache[mediaType] = {
      data: genresData,
      timestamp: now
    }

    console.log(`Successfully fetched ${genresData.genres.length} ${mediaType} genres`)
    res.status(200).json(genresData)

  } catch (error) {
    console.error('Genres API error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid API key')) {
        return res.status(401).json({ error: 'TMDB API key is not configured properly' })
      } else if (error.message.includes('not found')) {
        return res.status(404).json({ error: 'Genres not found' })
      } else if (error.message.includes('Network')) {
        return res.status(503).json({ error: 'Network error. Please try again.' })
      }
    }
    
    res.status(500).json({ error: 'Failed to load genres. Please try again.' })
  }
}

// Helper function to clear cache (useful for development)
export function clearGenreCache() {
  genreCache = {}
  console.log('Genre cache cleared')
}
