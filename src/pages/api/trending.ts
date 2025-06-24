// API route for trending content
import { NextApiRequest, NextApiResponse } from 'next'
import { movieApi } from '@/lib/movieApi'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { media_type, time_window, enhanced } = req.query

  try {
    const mediaType = (media_type as 'all' | 'movie' | 'tv') || 'movie'
    const timeWindow = (time_window as 'day' | 'week') || 'day'
    const includeEnhanced = enhanced === 'true'

    const trendingContent = await movieApi.getTrending(mediaType, timeWindow, includeEnhanced)

    // Return in the format expected by the frontend
    res.status(200).json({
      results: trendingContent,
      media_type: mediaType,
      time_window: timeWindow
    })


  } catch (error) {
    console.error('Trending API error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid API key')) {
        return res.status(401).json({ error: 'TMDB API key is not configured properly' })
      } else if (error.message.includes('Network')) {
        return res.status(503).json({ error: 'Network error. Please try again.' })
      }
    }
    
    res.status(500).json({ error: 'Failed to load trending content. Please try again.' })
  }
}
