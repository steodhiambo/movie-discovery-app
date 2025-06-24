// MovieCard component for displaying movie/TV show information
import Image from 'next/image'
import Link from 'next/link'
import { EnhancedMovie } from '@/lib/movieApi'
import { tmdbApi } from '@/lib/tmdb'
import { MultiRatingDisplay } from './RatingDisplay'

interface MovieCardProps {
  movie: EnhancedMovie
  showType?: boolean
  className?: string
  priority?: boolean
}

export default function MovieCard({
  movie,
  showType = true,
  className = "",
  priority = false
}: MovieCardProps) {
  const posterUrl = tmdbApi.getImageUrl(movie.poster_path, 'w342')
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : null
  const isMovie = !movie.title.includes('TV') // Simple heuristic, can be improved
  const mediaType = isMovie ? 'movie' : 'tv'

  return (
    <Link
      href={`/${mediaType}/${movie.id}`}
      className={`group block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden ${className}`}
    >
      <div className="relative aspect-[2/3] bg-gray-200">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={`${movie.title} poster`}
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

        {/* Rating Badge */}
        {movie.vote_average > 0 && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded-full text-xs font-medium">
            ⭐ {movie.vote_average.toFixed(1)}
          </div>
        )}

        {/* Media Type Badge */}
        {showType && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium uppercase">
            {mediaType}
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
          {movie.title}
        </h3>

        {/* Release Year */}
        {releaseYear && (
          <p className="text-gray-500 text-xs mb-2">
            {releaseYear}
          </p>
        )}

        {/* Overview */}
        {movie.overview && (
          <p className="text-gray-600 text-xs line-clamp-3 mb-3">
            {movie.overview}
          </p>
        )}

        {/* Multi-Source Ratings */}
        <div className="mb-3">
          <MultiRatingDisplay
            movie={movie}
            layout="compact"
            size="sm"
            showAggregated={movie.dataSource === 'tmdb+omdb'}
          />
        </div>

        {/* Additional Info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          {/* Popularity Indicator */}
          {movie.popularity > 100 && (
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
              🔥 Popular
            </span>
          )}
        </div>

        {/* Data Source Indicator */}
        {movie.dataSource === 'tmdb+omdb' && (
          <div className="mt-2 flex items-center text-xs text-green-600">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Enhanced Data
          </div>
        )}
      </div>
    </Link>
  )
}

// Utility CSS classes for line clamping (add to globals.css if not using Tailwind)
export const movieCardStyles = `
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
