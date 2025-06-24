// Enhanced movie card specifically for trending content
import Image from 'next/image'
import Link from 'next/link'
import { EnhancedMovie } from '@/lib/movieApi'
import { tmdbApi } from '@/lib/tmdb'
import { WatchlistButtonCompact } from './WatchlistButtons'
import { MultiRatingDisplay } from './RatingDisplay'

interface TrendingCardProps {
  movie: EnhancedMovie
  rank: number
  showType?: boolean
  className?: string
  priority?: boolean
}

export default function TrendingCard({
  movie,
  rank,
  showType = true,
  className = "",
  priority = false
}: TrendingCardProps) {
  const posterUrl = tmdbApi.getImageUrl(movie.poster_path, 'w342')
  const title = movie.title || (movie as any).name || 'Unknown Title'
  const releaseDate = movie.release_date || (movie as any).first_air_date
  const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : null

  // Determine media type - if it has 'title' it's a movie, if 'name' it's TV
  const mediaType = movie.title ? 'movie' : 'tv'

  // Format popularity for display
  const formatPopularity = (popularity: number) => {
    if (popularity >= 1000) {
      return `${(popularity / 1000).toFixed(1)}K`
    }
    return Math.round(popularity).toString()
  }

  return (
    <div className={`group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${className}`}>
      {/* Trending Rank Badge */}
      <div className="absolute top-3 left-3 z-20">
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg">
          #{rank}
        </div>
      </div>

      {/* Watchlist Button */}
      <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <WatchlistButtonCompact movie={movie} />
      </div>

      <Link href={`/${mediaType}/${movie.id}`} className="block">
        {/* Poster Image */}
        <div className="relative aspect-[2/3] bg-gray-200 overflow-hidden">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={`${title} poster`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              priority={priority}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-300">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4zM3 8v10a2 2 0 002 2h14a2 2 0 002-2V8H3z" />
              </svg>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Rating Badge */}
          {movie.vote_average > 0 && (
            <div className="absolute bottom-3 left-3 bg-black/75 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
              ⭐ {movie.vote_average.toFixed(1)}
            </div>
          )}

          {/* Media Type Badge */}
          {showType && (
            <div className="absolute bottom-3 right-3 bg-blue-500/90 text-white px-2 py-1 rounded-full text-xs font-medium uppercase backdrop-blur-sm">
              {mediaType}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
            {title}
          </h3>

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            {releaseYear && (
              <span className="bg-gray-100 px-2 py-1 rounded-full">
                {releaseYear}
              </span>
            )}
            <div className="flex items-center space-x-1">
              <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-medium">{formatPopularity(movie.popularity)}</span>
            </div>
          </div>

          {/* Multi-Source Ratings */}
          <div className="mb-3">
            <MultiRatingDisplay
              movie={movie}
              layout="compact"
              size="sm"
              showAggregated={movie.dataSource === 'tmdb+omdb'}
            />
          </div>

          {/* Overview */}
          {movie.overview && (
            <p className="text-gray-600 text-xs line-clamp-3 leading-relaxed mb-3">
              {movie.overview}
            </p>
          )}

          {/* Enhanced Data Indicator */}
          {movie.dataSource === 'tmdb+omdb' && (
            <div className="flex items-center text-xs text-green-600">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Enhanced Data
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}

// Utility CSS classes for line clamping (add to globals.css if not using Tailwind)
export const trendingCardStyles = `
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`
