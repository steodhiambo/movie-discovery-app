// Recommendation card component with explanation and confidence indicators
import Image from 'next/image'
import Link from 'next/link'
import { Recommendation } from '@/lib/recommendationEngine'
import { tmdbApi } from '@/lib/tmdb'
import { WatchlistButtonCompact } from './WatchlistButtons'
import { MultiRatingDisplay } from './RatingDisplay'

interface RecommendationCardProps {
  recommendation: Recommendation
  showReasons?: boolean
  size?: 'sm' | 'md' | 'lg'
  layout?: 'vertical' | 'horizontal'
  priority?: boolean
  className?: string
}

export default function RecommendationCard({
  recommendation,
  showReasons = true,
  size = 'md',
  layout = 'vertical',
  priority = false,
  className = ""
}: RecommendationCardProps) {
  const { movie, score, reasons, category } = recommendation
  const posterUrl = tmdbApi.getImageUrl(movie.poster_path, 'w342')
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : null

  // Get category styling
  const getCategoryConfig = () => {
    switch (category) {
      case 'because_you_watched':
        return {
          name: 'Because You Watched',
          icon: '🎯',
          bgColor: 'bg-blue-500',
          textColor: 'text-white'
        }
      case 'genre_match':
        return {
          name: 'Genre Match',
          icon: '🎭',
          bgColor: 'bg-green-500',
          textColor: 'text-white'
        }
      case 'highly_rated':
        return {
          name: 'Highly Rated',
          icon: '⭐',
          bgColor: 'bg-yellow-500',
          textColor: 'text-black'
        }
      case 'trending':
        return {
          name: 'Trending',
          icon: '🔥',
          bgColor: 'bg-red-500',
          textColor: 'text-white'
        }
      case 'similar_taste':
        return {
          name: 'Similar Taste',
          icon: '💫',
          bgColor: 'bg-purple-500',
          textColor: 'text-white'
        }
      default:
        return {
          name: 'Recommended',
          icon: '👍',
          bgColor: 'bg-gray-500',
          textColor: 'text-white'
        }
    }
  }

  const categoryConfig = getCategoryConfig()

  // Size configurations
  const sizeConfig = {
    sm: {
      cardClass: 'max-w-xs',
      imageAspect: 'aspect-[2/3]',
      titleClass: 'text-sm font-semibold',
      textClass: 'text-xs',
      padding: 'p-3'
    },
    md: {
      cardClass: 'max-w-sm',
      imageAspect: 'aspect-[2/3]',
      titleClass: 'text-base font-semibold',
      textClass: 'text-sm',
      padding: 'p-4'
    },
    lg: {
      cardClass: 'max-w-md',
      imageAspect: 'aspect-[2/3]',
      titleClass: 'text-lg font-semibold',
      textClass: 'text-base',
      padding: 'p-6'
    }
  }

  const config = sizeConfig[size]

  if (layout === 'horizontal') {
    return (
      <div className={`group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${className}`}>
        <div className="flex">
          {/* Poster */}
          <div className="relative w-24 h-36 flex-shrink-0">
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={`${movie.title} poster`}
                fill
                className="object-cover"
                priority={priority}
                sizes="96px"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-300">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4zM3 8v10a2 2 0 002 2h14a2 2 0 002-2V8H3z" />
                </svg>
              </div>
            )}

            {/* Confidence Score */}
            <div className="absolute top-2 right-2 bg-black/75 text-white text-xs px-1.5 py-0.5 rounded-full">
              {Math.round(score * 100)}%
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between mb-2">
              <Link href={`/movie/${movie.id}`} className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
                  {movie.title}
                </h3>
              </Link>
              <WatchlistButtonCompact movie={movie} />
            </div>

            {/* Category Badge */}
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-2 ${categoryConfig.bgColor} ${categoryConfig.textColor}`}>
              <span className="mr-1">{categoryConfig.icon}</span>
              {categoryConfig.name}
            </div>

            {/* Ratings */}
            <div className="mb-2">
              <MultiRatingDisplay
                movie={movie}
                layout="compact"
                size="sm"
                showAggregated={false}
              />
            </div>

            {/* Reasons */}
            {showReasons && reasons.length > 0 && (
              <div className="space-y-1">
                {reasons.slice(0, 2).map((reason, index) => (
                  <div key={index} className="text-xs text-gray-600 flex items-center">
                    <div className="w-1 h-1 bg-blue-500 rounded-full mr-2"></div>
                    {reason.description}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:scale-105 ${config.cardClass} ${className}`}>
      {/* Category Badge */}
      <div className="absolute top-3 left-3 z-10">
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryConfig.bgColor} ${categoryConfig.textColor}`}>
          <span className="mr-1">{categoryConfig.icon}</span>
          {size !== 'sm' && categoryConfig.name}
        </div>
      </div>

      {/* Confidence Score */}
      <div className="absolute top-3 right-3 z-10 bg-black/75 text-white text-xs px-2 py-1 rounded-full font-medium">
        {Math.round(score * 100)}%
      </div>

      {/* Watchlist Button */}
      <div className="absolute top-12 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <WatchlistButtonCompact movie={movie} />
      </div>

      <Link href={`/movie/${movie.id}`} className="block">
        {/* Poster Image */}
        <div className={`relative ${config.imageAspect} bg-gray-200 overflow-hidden`}>
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

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className={config.padding}>
          {/* Title */}
          <h3 className={`${config.titleClass} text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200`}>
            {movie.title}
          </h3>

          {/* Year and Rating */}
          <div className="flex items-center justify-between mb-3">
            {releaseYear && (
              <span className="bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600">
                {releaseYear}
              </span>
            )}
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

          {/* Reasons */}
          {showReasons && reasons.length > 0 && (
            <div className="space-y-1">
              {reasons.slice(0, size === 'lg' ? 3 : 2).map((reason, index) => (
                <div key={index} className={`${config.textClass} text-gray-600 flex items-center`}>
                  <div className="w-1 h-1 bg-blue-500 rounded-full mr-2 flex-shrink-0"></div>
                  <span className="line-clamp-1">{reason.description}</span>
                </div>
              ))}
            </div>
          )}

          {/* Overview (for large size) */}
          {size === 'lg' && movie.overview && (
            <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed mt-3">
              {movie.overview}
            </p>
          )}
        </div>
      </Link>
    </div>
  )
}

// Utility CSS classes for line clamping
export const recommendationCardStyles = `
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

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
