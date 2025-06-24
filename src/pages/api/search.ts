// API route for search functionality
import { NextApiRequest, NextApiResponse } from 'next'
import { movieApi } from '@/lib/movieApi'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { q, page, type, enhanced } = req.query

  if (!q || typeof q !== 'string' || q.trim().length === 0) {
    return res.status(400).json({ error: 'Search query is required' })
  }

  try {
    const searchParams = {
      query: q.trim(),
      page: page && typeof page === 'string' ? parseInt(page) : 1,
      type: (type as 'all' | 'movie' | 'tv') || 'all',
      includeOMDBData: enhanced === 'true'
    }

    // Validate page number
    if (isNaN(searchParams.page) || searchParams.page < 1) {
      searchParams.page = 1
    }

    const searchResults = await movieApi.search(searchParams)

    res.status(200).json(searchResults)
  } catch (error) {
    console.error('Search API error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid API key')) {
        return res.status(401).json({ error: 'TMDB API key is not configured properly' })
      } else if (error.message.includes('Network')) {
        return res.status(503).json({ error: 'Network error. Please try again.' })
      }
    }
    
    res.status(500).json({ error: 'Search failed. Please try again.' })
  }
}
