// API route for discovering content by genre and filters
import { NextApiRequest, NextApiResponse } from 'next'

const TMDB_API_KEY = process.env.TMDB_API_KEY || 'your-api-key-here'
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const {
    type,
    genre_id,
    page = '1',
    sort_by = 'popularity.desc',
    year,
    vote_average_gte,
    vote_average_lte,
    with_runtime_gte,
    with_runtime_lte
  } = req.query

  // Validate required parameters
  if (!type || (type !== 'movie' && type !== 'tv')) {
    return res.status(400).json({ error: 'Invalid type parameter. Must be "movie" or "tv"' })
  }

  if (!genre_id) {
    return res.status(400).json({ error: 'Genre ID is required' })
  }

  try {
    const mediaType = type as 'movie' | 'tv'
    
    // Build query parameters
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      language: 'en-US',
      page: page as string,
      sort_by: sort_by as string,
      with_genres: genre_id as string,
      include_adult: 'false'
    })

    // Add optional filters
    if (year) {
      if (mediaType === 'movie') {
        params.append('year', year as string)
      } else {
        params.append('first_air_date_year', year as string)
      }
    }

    if (vote_average_gte) {
      params.append('vote_average.gte', vote_average_gte as string)
    }

    if (vote_average_lte) {
      params.append('vote_average.lte', vote_average_lte as string)
    }

    if (with_runtime_gte && mediaType === 'movie') {
      params.append('with_runtime.gte', with_runtime_gte as string)
    }

    if (with_runtime_lte && mediaType === 'movie') {
      params.append('with_runtime.lte', with_runtime_lte as string)
    }

    // Fetch from TMDB API
    console.log(`Discovering ${mediaType} content for genre ${genre_id}...`)
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/${mediaType}?${params.toString()}`
    )

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key')
      } else if (response.status === 404) {
        throw new Error('Content not found')
      } else {
        throw new Error(`TMDB API error: ${response.status}`)
      }
    }

    const discoverData = await response.json()

    // Validate response structure
    if (!discoverData.results || !Array.isArray(discoverData.results)) {
      throw new Error('Invalid response format from TMDB')
    }

    // Transform the data to match our EnhancedMovie interface
    const transformedResults = discoverData.results.map((item: any) => ({
      ...item,
      title: item.title || item.name, // Normalize title field
      release_date: item.release_date || item.first_air_date, // Normalize date field
      dataSource: 'tmdb'
    }))

    const result = {
      ...discoverData,
      results: transformedResults,
      filters: {
        type: mediaType,
        genre_id: genre_id as string,
        sort_by: sort_by as string,
        page: parseInt(page as string),
        ...(year && { year: year as string }),
        ...(vote_average_gte && { vote_average_gte: parseFloat(vote_average_gte as string) }),
        ...(vote_average_lte && { vote_average_lte: parseFloat(vote_average_lte as string) })
      }
    }

    console.log(`Successfully discovered ${transformedResults.length} ${mediaType} items for genre ${genre_id}`)
    res.status(200).json(result)

  } catch (error) {
    console.error('Discover API error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid API key')) {
        return res.status(401).json({ error: 'TMDB API key is not configured properly' })
      } else if (error.message.includes('not found')) {
        return res.status(404).json({ error: 'Content not found for the specified criteria' })
      } else if (error.message.includes('Network')) {
        return res.status(503).json({ error: 'Network error. Please try again.' })
      }
    }
    
    res.status(500).json({ error: 'Failed to discover content. Please try again.' })
  }
}
