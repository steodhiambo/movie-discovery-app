// Recommendations Dashboard - Personalized content discovery
import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useWatchlist } from '@/context/WatchlistContext'
import { Recommendation, UserPreferences } from '@/lib/recommendationEngine'
import { RecommendationSection } from '@/components/BecauseYouWatched'
import RecommendationCard from '@/components/RecommendationCard'

interface RecommendationsState {
  recommendations: Recommendation[]
  preferences: UserPreferences | null
  categories: {
    because_you_watched: number
    genre_match: number
    highly_rated: number
    trending: number
    similar_taste: number
  }
  loading: boolean
  error: string | null
  activeCategory: 'all' | 'because_you_watched' | 'genre_match' | 'highly_rated' | 'trending' | 'similar_taste'
}

export default function RecommendationsPage() {
  const router = useRouter()
  const { watchlist } = useWatchlist()
  
  const [recommendationsState, setRecommendationsState] = useState<RecommendationsState>({
    recommendations: [],
    preferences: null,
    categories: {
      because_you_watched: 0,
      genre_match: 0,
      highly_rated: 0,
      trending: 0,
      similar_taste: 0
    },
    loading: true,
    error: null,
    activeCategory: 'all'
  })

  // Fetch recommendations
  const fetchRecommendations = async (category: string = 'all') => {
    setRecommendationsState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const watchlistIds = (watchlist && Array.isArray(watchlist)) ? watchlist.map(movie => movie.id) : []
      const params = new URLSearchParams({
        watchlist_ids: JSON.stringify(watchlistIds),
        category,
        limit: '50'
      })

      const response = await fetch(`/api/recommendations?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations')
      }

      const data = await response.json()

      setRecommendationsState(prev => ({
        ...prev,
        recommendations: data.recommendations || [],
        preferences: data.preferences,
        categories: data.categories || prev.categories,
        loading: false,
        activeCategory: category as any
      }))
    } catch (error) {
      console.error('Recommendations fetch error:', error)
      setRecommendationsState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load recommendations. Please try again.'
      }))
    }
  }

  // Load recommendations on mount and when watchlist changes
  useEffect(() => {
    if (watchlist && Array.isArray(watchlist)) {
      fetchRecommendations()
    }
  }, [watchlist])

  // Handle category change
  const handleCategoryChange = (category: RecommendationsState['activeCategory']) => {
    if (category !== recommendationsState.activeCategory) {
      fetchRecommendations(category)
    }
  }

  // Group recommendations by category
  const getRecommendationsByCategory = () => {
    if (recommendationsState.activeCategory === 'all') {
      return {
        because_you_watched: recommendationsState.recommendations.filter(r => r.category === 'because_you_watched'),
        genre_match: recommendationsState.recommendations.filter(r => r.category === 'genre_match'),
        highly_rated: recommendationsState.recommendations.filter(r => r.category === 'highly_rated'),
        trending: recommendationsState.recommendations.filter(r => r.category === 'trending'),
        similar_taste: recommendationsState.recommendations.filter(r => r.category === 'similar_taste')
      }
    } else {
      return {
        [recommendationsState.activeCategory]: recommendationsState.recommendations
      }
    }
  }

  const categorizedRecommendations = getRecommendationsByCategory()

  // Category configurations
  const categoryConfigs = {
    all: { name: 'All Recommendations', icon: '🎬', description: 'Personalized suggestions across all categories' },
    because_you_watched: { name: 'Because You Watched', icon: '🎯', description: 'Based on movies in your watchlist' },
    genre_match: { name: 'Genre Matches', icon: '🎭', description: 'Movies in your favorite genres' },
    highly_rated: { name: 'Highly Rated', icon: '⭐', description: 'Top-rated movies you might enjoy' },
    trending: { name: 'Trending Now', icon: '🔥', description: 'Popular movies everyone is watching' },
    similar_taste: { name: 'Similar Taste', icon: '💫', description: 'For viewers with similar preferences' }
  }

  return (
    <>
      <Head>
        <title>Personalized Recommendations - Movie Discovery App</title>
        <meta
          name="description"
          content="Discover personalized movie recommendations based on your watchlist and viewing preferences."
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  🤖 Personalized Recommendations
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  Discover movies tailored to your taste
                  {watchlist && watchlist.length > 0 && ` • Based on ${watchlist.length} movies in your watchlist`}
                </p>
              </div>
              <button
                onClick={() => router.push('/')}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors text-sm sm:text-base self-start sm:self-auto"
              >
                ← Back to Home
              </button>
            </div>

            {/* User Preferences Summary */}
            {recommendationsState.preferences && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Your Preferences</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Favorite Genres:</span>
                    <div className="text-blue-600">
                      {recommendationsState.preferences.favoriteGenres.slice(0, 3).map(g => g.name).join(', ')}
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Avg Rating:</span>
                    <div className="text-blue-600">{recommendationsState.preferences.averageRating.toFixed(1)}/10</div>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Movies Watched:</span>
                    <div className="text-blue-600">{recommendationsState.preferences.totalWatched}</div>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Preferred Years:</span>
                    <div className="text-blue-600">
                      {recommendationsState.preferences.preferredYearRange.min}-{recommendationsState.preferences.preferredYearRange.max}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryConfigs).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => handleCategoryChange(key as any)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    recommendationsState.activeCategory === key
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <span className="mr-2">{config.icon}</span>
                  {config.name}
                  {key !== 'all' && recommendationsState.categories[key as keyof typeof recommendationsState.categories] > 0 && (
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                      recommendationsState.activeCategory === key 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {recommendationsState.categories[key as keyof typeof recommendationsState.categories]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Loading State */}
          {recommendationsState.loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Generating personalized recommendations...</span>
            </div>
          )}

          {/* Error State */}
          {recommendationsState.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error Loading Recommendations</h3>
                  <p className="text-sm text-red-700 mt-1">{recommendationsState.error}</p>
                  <button
                    onClick={() => fetchRecommendations(recommendationsState.activeCategory)}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty Watchlist State */}
          {!recommendationsState.loading && !recommendationsState.error && (!watchlist || watchlist.length === 0) && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start Building Your Watchlist</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Add movies to your watchlist to get personalized recommendations based on your taste.
              </p>
              <div className="space-x-4">
                <button
                  onClick={() => router.push('/search')}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Movies
                </button>
                <button
                  onClick={() => router.push('/trending')}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Browse Trending
                </button>
              </div>
            </div>
          )}

          {/* Recommendations Content */}
          {!recommendationsState.loading && !recommendationsState.error && watchlist && watchlist.length > 0 && (
            <div className="space-y-8">
              {/* All Categories View */}
              {recommendationsState.activeCategory === 'all' && (
                <>
                  {(categorizedRecommendations.because_you_watched?.length || 0) > 0 && (
                    <RecommendationSection
                      title="Because You Watched"
                      subtitle="Based on movies in your watchlist"
                      icon="🎯"
                      recommendations={categorizedRecommendations.because_you_watched || []}
                      size="md"
                      maxItems={6}
                    />
                  )}

                  {(categorizedRecommendations.genre_match?.length || 0) > 0 && (
                    <RecommendationSection
                      title="Your Favorite Genres"
                      subtitle="Movies in genres you love"
                      icon="🎭"
                      recommendations={categorizedRecommendations.genre_match || []}
                      size="md"
                      maxItems={6}
                    />
                  )}

                  {(categorizedRecommendations.highly_rated?.length || 0) > 0 && (
                    <RecommendationSection
                      title="Highly Rated for You"
                      subtitle="Top-rated movies matching your taste"
                      icon="⭐"
                      recommendations={categorizedRecommendations.highly_rated || []}
                      size="md"
                      maxItems={6}
                    />
                  )}

                  {(categorizedRecommendations.trending?.length || 0) > 0 && (
                    <RecommendationSection
                      title="Trending Now"
                      subtitle="Popular movies you might enjoy"
                      icon="🔥"
                      recommendations={categorizedRecommendations.trending || []}
                      size="md"
                      maxItems={6}
                    />
                  )}

                  {(categorizedRecommendations.similar_taste?.length || 0) > 0 && (
                    <RecommendationSection
                      title="Similar Taste"
                      subtitle="For viewers with preferences like yours"
                      icon="💫"
                      recommendations={categorizedRecommendations.similar_taste || []}
                      size="md"
                      maxItems={6}
                    />
                  )}
                </>
              )}

              {/* Single Category View */}
              {recommendationsState.activeCategory !== 'all' && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                      <span className="text-3xl mr-3">
                        {categoryConfigs[recommendationsState.activeCategory].icon}
                      </span>
                      {categoryConfigs[recommendationsState.activeCategory].name}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {categoryConfigs[recommendationsState.activeCategory].description}
                    </p>
                  </div>

                  {recommendationsState.recommendations.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                      {recommendationsState.recommendations.map((recommendation, index) => (
                        <RecommendationCard
                          key={recommendation.movie.id}
                          recommendation={recommendation}
                          size="md"
                          showReasons={true}
                          priority={index < 6}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-4">
                        {categoryConfigs[recommendationsState.activeCategory].icon}
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No {categoryConfigs[recommendationsState.activeCategory].name.toLowerCase()} found
                      </h3>
                      <p className="text-gray-600">
                        Try adding more movies to your watchlist or explore other categories.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
