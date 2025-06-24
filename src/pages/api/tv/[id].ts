// API route for TV show details
import { NextApiRequest, NextApiResponse } from 'next'
import { tmdbApi } from '@/lib/tmdb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid TV show ID' })
  }

  const tvId = parseInt(id)
  if (isNaN(tvId)) {
    return res.status(400).json({ error: 'Invalid TV show ID' })
  }

  try {
    // Get detailed TV show information with cast, crew, videos, and similar shows
    const showDetails = await tmdbApi.getTVDetails(tvId, 'credits,videos,similar,recommendations')
    
    res.status(200).json({
      show: showDetails
    })
  } catch (error) {
    console.error('Failed to load TV show details:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid API key')) {
        return res.status(401).json({ error: 'API key not configured properly' })
      } else if (error.message.includes('404')) {
        return res.status(404).json({ error: 'TV show not found' })
      }
    }
    
    res.status(500).json({ error: 'Failed to load TV show details' })
  }
}
