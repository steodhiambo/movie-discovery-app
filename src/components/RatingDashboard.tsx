// Comprehensive rating dashboard for detailed rating analysis
import { useState } from 'react'
import { EnhancedMovie } from '@/lib/movieApi'
import { RatingComparison, MultiRatingDisplay } from './RatingDisplay'

interface RatingDashboardProps {
  movie: EnhancedMovie
  className?: string
}

export default function RatingDashboard({ movie, className = "" }: RatingDashboardProps) {
  const [activeView, setActiveView] = useState<'overview' | 'comparison' | 'details'>('overview')

  const { ratings } = movie

  if (!ratings) {
    return (
      <div className={`bg-white rounded-lg p-6 shadow-sm ${className}`}>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ratings</h2>
        <p className="text-gray-500">No rating information available for this title.</p>
      </div>
    )
  }

  // Calculate rating statistics
  const getStatistics = () => {
    const availableRatings = []
    
    if (ratings.tmdb?.score > 0) availableRatings.push(ratings.tmdb.score)
    if (ratings.imdb?.score > 0) availableRatings.push(ratings.imdb.score)
    if (ratings.rottenTomatoes?.critics.score > 0) availableRatings.push(ratings.rottenTomatoes.critics.score / 10)
    if (ratings.metacritic?.score > 0) availableRatings.push(ratings.metacritic.score / 10)

    if (availableRatings.length === 0) return null

    const average = availableRatings.reduce((sum, rating) => sum + rating, 0) / availableRatings.length
    const highest = Math.max(...availableRatings)
    const lowest = Math.min(...availableRatings)
    const variance = availableRatings.reduce((sum, rating) => sum + Math.pow(rating - average, 2), 0) / availableRatings.length

    return {
      average: average.toFixed(1),
      highest: highest.toFixed(1),
      lowest: lowest.toFixed(1),
      variance: variance.toFixed(2),
      sources: availableRatings.length,
      consensus: variance < 1 ? 'High' : variance < 2 ? 'Medium' : 'Low'
    }
  }

  const stats = getStatistics()

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Rating Analysis</h2>
          {movie.aggregatedScore && (
            <div className="flex items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full">
              <span className="text-lg font-bold mr-2">{movie.aggregatedScore.toFixed(1)}</span>
              <span className="text-sm opacity-90">Aggregated</span>
            </div>
          )}
        </div>

        {/* View Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveView('overview')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeView === 'overview'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveView('comparison')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeView === 'comparison'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Comparison
          </button>
          <button
            onClick={() => setActiveView('details')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeView === 'details'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Details
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeView === 'overview' && (
          <div className="space-y-6">
            {/* Quick Rating Display */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">All Ratings</h3>
              <MultiRatingDisplay
                movie={movie}
                layout="horizontal"
                size="lg"
                showAggregated={true}
              />
            </div>

            {/* Statistics */}
            {stats && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.average}</div>
                    <div className="text-sm text-blue-800">Average</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.highest}</div>
                    <div className="text-sm text-green-800">Highest</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{stats.lowest}</div>
                    <div className="text-sm text-orange-800">Lowest</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{stats.consensus}</div>
                    <div className="text-sm text-purple-800">Consensus</div>
                  </div>
                </div>
              </div>
            )}

            {/* Source Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Rating Sources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ratings.tmdb && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <span className="text-lg mr-2">🎬</span>
                      <span className="font-medium">TMDB</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Community-driven movie database with user ratings
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {ratings.tmdb.votes.toLocaleString()} votes
                    </div>
                  </div>
                )}

                {ratings.imdb && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <span className="text-lg mr-2">⭐</span>
                      <span className="font-medium">IMDb</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Internet Movie Database - industry standard
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {ratings.imdb.votes} votes
                    </div>
                  </div>
                )}

                {ratings.rottenTomatoes && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <span className="text-lg mr-2">🍅</span>
                      <span className="font-medium">Rotten Tomatoes</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Professional critics aggregated score
                    </div>
                  </div>
                )}

                {ratings.metacritic && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <span className="text-lg mr-2">📊</span>
                      <span className="font-medium">Metacritic</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Weighted average of critic reviews
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeView === 'comparison' && (
          <div>
            <RatingComparison movie={movie} />
          </div>
        )}

        {activeView === 'details' && (
          <div className="space-y-6">
            {/* Detailed Breakdown */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Breakdown</h3>
              
              {ratings.tmdb && (
                <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blue-900">TMDB Rating</span>
                    <span className="text-2xl font-bold text-blue-600">{ratings.tmdb.score.toFixed(1)}/10</span>
                  </div>
                  <div className="text-sm text-blue-800">
                    Based on {ratings.tmdb.votes.toLocaleString()} user votes
                  </div>
                  <div className="mt-2 bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(ratings.tmdb.score / 10) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {ratings.imdb && (
                <div className="mb-6 p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-yellow-900">IMDb Rating</span>
                    <span className="text-2xl font-bold text-yellow-600">{ratings.imdb.score.toFixed(1)}/10</span>
                  </div>
                  <div className="text-sm text-yellow-800">
                    Based on {ratings.imdb.votes} votes
                  </div>
                  <div className="mt-2 bg-yellow-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(ratings.imdb.score / 10) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {ratings.rottenTomatoes && (
                <div className="mb-6 p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-red-900">Rotten Tomatoes</span>
                    <span className="text-2xl font-bold text-red-600">{ratings.rottenTomatoes.critics.score}%</span>
                  </div>
                  <div className="text-sm text-red-800">
                    Critics Score - {ratings.rottenTomatoes.critics.score >= 60 ? 'Fresh' : 'Rotten'}
                  </div>
                  <div className="mt-2 bg-red-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${ratings.rottenTomatoes.critics.score}%` }}
                    />
                  </div>
                </div>
              )}

              {ratings.metacritic && (
                <div className="mb-6 p-4 border border-green-200 rounded-lg bg-green-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-green-900">Metacritic</span>
                    <span className="text-2xl font-bold text-green-600">{ratings.metacritic.score}/100</span>
                  </div>
                  <div className="text-sm text-green-800">
                    Metascore - {ratings.metacritic.score >= 75 ? 'Universal Acclaim' : ratings.metacritic.score >= 50 ? 'Mixed Reviews' : 'Generally Unfavorable'}
                  </div>
                  <div className="mt-2 bg-green-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${ratings.metacritic.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Aggregation Methodology */}
            {movie.aggregatedScore && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Aggregation Methodology</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• IMDb: 35% weight (most trusted by users)</p>
                  <p>• TMDB: 25% weight (community-driven)</p>
                  <p>• Rotten Tomatoes: 25% weight (professional critics)</p>
                  <p>• Metacritic: 15% weight (weighted critic reviews)</p>
                </div>
                <div className="mt-3 text-sm font-medium text-purple-600">
                  Final Score: {movie.aggregatedScore.toFixed(1)}/10
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
