// Comprehensive rating display components for multi-source ratings
import { useState } from 'react'
import { EnhancedMovie } from '@/lib/movieApi'

interface RatingBadgeProps {
  source: 'tmdb' | 'imdb' | 'rottenTomatoes' | 'metacritic'
  score: number
  outOf: number
  votes?: string | number
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
}

export function RatingBadge({
  source,
  score,
  outOf,
  votes,
  className = "",
  size = 'md',
  showTooltip = true
}: RatingBadgeProps) {
  const [showTooltipState, setShowTooltipState] = useState(false)

  // Get source-specific styling and info
  const getSourceConfig = () => {
    switch (source) {
      case 'tmdb':
        return {
          name: 'TMDB',
          icon: '🎬',
          bgColor: 'bg-blue-500',
          textColor: 'text-white',
          description: 'The Movie Database user rating'
        }
      case 'imdb':
        return {
          name: 'IMDb',
          icon: '⭐',
          bgColor: 'bg-yellow-500',
          textColor: 'text-black',
          description: 'Internet Movie Database rating'
        }
      case 'rottenTomatoes':
        return {
          name: 'RT',
          icon: score >= 60 ? '🍅' : '🤢',
          bgColor: score >= 60 ? 'bg-red-500' : 'bg-green-500',
          textColor: 'text-white',
          description: 'Rotten Tomatoes critics score'
        }
      case 'metacritic':
        return {
          name: 'MC',
          icon: '📊',
          bgColor: score >= 75 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500',
          textColor: score >= 50 ? 'text-white' : 'text-white',
          description: 'Metacritic score'
        }
      default:
        return {
          name: 'N/A',
          icon: '❓',
          bgColor: 'bg-gray-500',
          textColor: 'text-white',
          description: 'Unknown rating source'
        }
    }
  }

  const config = getSourceConfig()
  
  // Size configurations
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  }

  // Format score display
  const formatScore = () => {
    if (outOf === 100) {
      return `${Math.round(score)}%`
    }
    return score.toFixed(1)
  }

  // Format votes display
  const formatVotes = () => {
    if (!votes) return ''
    if (typeof votes === 'string') return votes
    if (votes >= 1000000) return `${(votes / 1000000).toFixed(1)}M`
    if (votes >= 1000) return `${(votes / 1000).toFixed(1)}K`
    return votes.toString()
  }

  return (
    <div className="relative inline-block">
      <div
        className={`
          inline-flex items-center rounded-full font-medium transition-all duration-200
          ${config.bgColor} ${config.textColor} ${sizeClasses[size]}
          ${showTooltip ? 'cursor-help hover:scale-105' : ''}
          ${className}
        `}
        onMouseEnter={() => showTooltip && setShowTooltipState(true)}
        onMouseLeave={() => showTooltip && setShowTooltipState(false)}
      >
        <span className="mr-1">{config.icon}</span>
        <span className="font-bold">{formatScore()}</span>
        {size !== 'sm' && (
          <span className="ml-1 text-xs opacity-75">
            {config.name}
          </span>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && showTooltipState && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
            <div className="font-medium">{config.description}</div>
            <div className="text-gray-300">
              Score: {formatScore()}{outOf !== 100 && ` / ${outOf}`}
            </div>
            {votes && (
              <div className="text-gray-300">
                Votes: {formatVotes()}
              </div>
            )}
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  )
}

interface MultiRatingDisplayProps {
  movie: EnhancedMovie
  layout?: 'horizontal' | 'vertical' | 'compact'
  size?: 'sm' | 'md' | 'lg'
  showAggregated?: boolean
  className?: string
}

export function MultiRatingDisplay({
  movie,
  layout = 'horizontal',
  size = 'md',
  showAggregated = true,
  className = ""
}: MultiRatingDisplayProps) {
  const { ratings } = movie

  if (!ratings) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        No ratings available
      </div>
    )
  }

  const layoutClasses = {
    horizontal: 'flex flex-wrap items-center gap-2',
    vertical: 'flex flex-col gap-2',
    compact: 'flex items-center gap-1'
  }

  return (
    <div className={`${layoutClasses[layout]} ${className}`}>
      {/* Aggregated Score */}
      {showAggregated && movie.aggregatedScore && movie.aggregatedScore > 0 && (
        <div className="flex items-center">
          <div className={`
            bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-bold
            ${size === 'sm' ? 'text-xs px-2 py-1' : size === 'lg' ? 'text-lg px-4 py-2' : 'text-sm px-3 py-1.5'}
          `}>
            <span className="mr-1">🏆</span>
            {movie.aggregatedScore.toFixed(1)}
          </div>
          {layout !== 'compact' && (
            <span className="text-xs text-gray-500 ml-2">Aggregated</span>
          )}
        </div>
      )}

      {/* TMDB Rating */}
      {ratings.tmdb && ratings.tmdb.score > 0 && (
        <RatingBadge
          source="tmdb"
          score={ratings.tmdb.score}
          outOf={ratings.tmdb.outOf}
          votes={ratings.tmdb.votes}
          size={size}
        />
      )}

      {/* IMDB Rating */}
      {ratings.imdb && ratings.imdb.score > 0 && (
        <RatingBadge
          source="imdb"
          score={ratings.imdb.score}
          outOf={ratings.imdb.outOf}
          votes={ratings.imdb.votes}
          size={size}
        />
      )}

      {/* Rotten Tomatoes Rating */}
      {ratings.rottenTomatoes && ratings.rottenTomatoes.critics.score > 0 && (
        <RatingBadge
          source="rottenTomatoes"
          score={ratings.rottenTomatoes.critics.score}
          outOf={ratings.rottenTomatoes.critics.outOf}
          size={size}
        />
      )}

      {/* Metacritic Rating */}
      {ratings.metacritic && ratings.metacritic.score > 0 && (
        <RatingBadge
          source="metacritic"
          score={ratings.metacritic.score}
          outOf={ratings.metacritic.outOf}
          size={size}
        />
      )}
    </div>
  )
}

interface RatingComparisonProps {
  movie: EnhancedMovie
  className?: string
}

export function RatingComparison({ movie, className = "" }: RatingComparisonProps) {
  const { ratings } = movie

  if (!ratings) return null

  // Calculate max score for bar visualization
  const getBarWidth = (score: number, outOf: number) => {
    return (score / outOf) * 100
  }

  const ratingItems = [
    {
      source: 'tmdb' as const,
      name: 'TMDB',
      score: ratings.tmdb?.score || 0,
      outOf: ratings.tmdb?.outOf || 10,
      color: 'bg-blue-500'
    },
    ...(ratings.imdb ? [{
      source: 'imdb' as const,
      name: 'IMDb',
      score: ratings.imdb.score,
      outOf: ratings.imdb.outOf,
      color: 'bg-yellow-500'
    }] : []),
    ...(ratings.rottenTomatoes ? [{
      source: 'rottenTomatoes' as const,
      name: 'Rotten Tomatoes',
      score: ratings.rottenTomatoes.critics.score,
      outOf: ratings.rottenTomatoes.critics.outOf,
      color: ratings.rottenTomatoes.critics.score >= 60 ? 'bg-red-500' : 'bg-green-500'
    }] : []),
    ...(ratings.metacritic ? [{
      source: 'metacritic' as const,
      name: 'Metacritic',
      score: ratings.metacritic.score,
      outOf: ratings.metacritic.outOf,
      color: ratings.metacritic.score >= 75 ? 'bg-green-500' : ratings.metacritic.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
    }] : [])
  ].filter(item => item.score > 0)

  if (ratingItems.length === 0) return null

  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Comparison</h3>
      
      <div className="space-y-3">
        {ratingItems.map((item) => (
          <div key={item.source} className="flex items-center">
            <div className="w-20 text-sm font-medium text-gray-700">
              {item.name}
            </div>
            <div className="flex-1 mx-3">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${item.color}`}
                  style={{ width: `${getBarWidth(item.score, item.outOf)}%` }}
                />
              </div>
            </div>
            <div className="w-16 text-sm font-bold text-gray-900 text-right">
              {item.outOf === 100 ? `${Math.round(item.score)}%` : item.score.toFixed(1)}
            </div>
          </div>
        ))}
      </div>

      {/* Aggregated Score */}
      {movie.aggregatedScore && movie.aggregatedScore > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Aggregated Score</span>
            <div className="flex items-center">
              <span className="text-lg font-bold text-purple-600 mr-2">
                {movie.aggregatedScore.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500">/ 10</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
