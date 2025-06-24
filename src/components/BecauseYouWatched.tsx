// "Because You Watched" recommendation section component
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { EnhancedMovie } from '@/lib/movieApi'
import { Recommendation } from '@/lib/recommendationEngine'
import { tmdbApi } from '@/lib/tmdb'
import RecommendationCard from './RecommendationCard'

interface BecauseYouWatchedProps {
  basedOnMovie: EnhancedMovie
  recommendations: Recommendation[]
  className?: string
  maxItems?: number
}

export default function BecauseYouWatched({
  basedOnMovie,
  recommendations,
  className = "",
  maxItems = 6
}: BecauseYouWatchedProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const posterUrl = tmdbApi.getImageUrl(basedOnMovie.poster_path, 'w154')

  const displayedRecommendations = isExpanded 
    ? recommendations 
    : recommendations.slice(0, maxItems)

  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          {/* Base Movie Poster */}
          <div className="relative w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={`${basedOnMovie.title} poster`}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4zM3 8v10a2 2 0 002 2h14a2 2 0 002-2V8H3z" />
                </svg>
              </div>
            )}
          </div>

          {/* Title and Description */}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              🎯 Because you watched
            </h2>
            <h3 className="text-lg font-semibold text-blue-600 mb-2">
              {basedOnMovie.title}
            </h3>
            <p className="text-gray-600 text-sm">
              {recommendations.length} personalized recommendations based on your viewing preferences
            </p>
          </div>

          {/* Expand/Collapse Button */}
          {recommendations.length > maxItems && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              {isExpanded ? (
                <>
                  <span>Show Less</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </>
              ) : (
                <>
                  <span>Show All ({recommendations.length})</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {displayedRecommendations.map((recommendation, index) => (
            <RecommendationCard
              key={recommendation.movie.id}
              recommendation={recommendation}
              size="sm"
              showReasons={false}
              priority={index < 6}
            />
          ))}
        </div>

        {/* Show More Button (Alternative) */}
        {!isExpanded && recommendations.length > maxItems && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsExpanded(true)}
              className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <span>Show {recommendations.length - maxItems} More Recommendations</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

interface RecommendationSectionProps {
  title: string
  subtitle?: string
  icon?: string
  recommendations: Recommendation[]
  layout?: 'grid' | 'horizontal'
  size?: 'sm' | 'md' | 'lg'
  showReasons?: boolean
  maxItems?: number
  className?: string
}

export function RecommendationSection({
  title,
  subtitle,
  icon = '🎬',
  recommendations,
  layout = 'grid',
  size = 'md',
  showReasons = true,
  maxItems = 12,
  className = ""
}: RecommendationSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const displayedRecommendations = isExpanded 
    ? recommendations 
    : recommendations.slice(0, maxItems)

  if (recommendations.length === 0) {
    return null
  }

  const gridCols = {
    sm: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8',
    md: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
    lg: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <span className="text-2xl mr-3">{icon}</span>
              {title}
            </h2>
            {subtitle && (
              <p className="text-gray-600 text-sm mt-1">{subtitle}</p>
            )}
          </div>

          {recommendations.length > maxItems && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              {isExpanded ? 'Show Less' : `Show All (${recommendations.length})`}
              <svg className={`w-4 h-4 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {layout === 'horizontal' ? (
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {displayedRecommendations.map((recommendation, index) => (
              <div key={recommendation.movie.id} className="flex-shrink-0">
                <RecommendationCard
                  recommendation={recommendation}
                  size={size}
                  showReasons={showReasons}
                  priority={index < 6}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className={`grid ${gridCols[size]} gap-4`}>
            {displayedRecommendations.map((recommendation, index) => (
              <RecommendationCard
                key={recommendation.movie.id}
                recommendation={recommendation}
                size={size}
                showReasons={showReasons}
                priority={index < 6}
              />
            ))}
          </div>
        )}

        {/* Show More Button */}
        {!isExpanded && recommendations.length > maxItems && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsExpanded(true)}
              className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <span>Show {recommendations.length - maxItems} More</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
