// Trending Dashboard - Discover what's popular right now
import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import TrendingCard from '@/components/TrendingCard'
import TimeWindowSelector, { ContentTypeTabs } from '@/components/TimeWindowSelector'
import { EnhancedMovie } from '@/lib/movieApi'

interface TrendingState {
  all: EnhancedMovie[]
  movies: EnhancedMovie[]
  tv: EnhancedMovie[]
  loading: boolean
  error: string | null
  timeWindow: 'day' | 'week'
  activeTab: 'all' | 'movies' | 'tv'
}

export default function TrendingDashboard() {
  const router = useRouter()
  const [trendingState, setTrendingState] = useState<TrendingState>({
    all: [],
    movies: [],
    tv: [],
    loading: true,
    error: null,
    timeWindow: 'day',
    activeTab: 'all'
  })

  // Fetch trending content
  const fetchTrending = async (timeWindow: 'day' | 'week') => {
    setTrendingState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Fetch all three categories in parallel
      const [allResponse, moviesResponse, tvResponse] = await Promise.all([
        fetch(`/api/trending?media_type=all&time_window=${timeWindow}`),
        fetch(`/api/trending?media_type=movie&time_window=${timeWindow}`),
        fetch(`/api/trending?media_type=tv&time_window=${timeWindow}`)
      ])

      if (!allResponse.ok || !moviesResponse.ok || !tvResponse.ok) {
        throw new Error('Failed to fetch trending content')
      }

      const [allData, moviesData, tvData] = await Promise.all([
        allResponse.json(),
        moviesResponse.json(),
        tvResponse.json()
      ])

      setTrendingState(prev => ({
        ...prev,
        all: allData.results || [],
        movies: moviesData.results || [],
        tv: tvData.results || [],
        loading: false,
        timeWindow
      }))
    } catch (error) {
      console.error('Trending fetch error:', error)
      setTrendingState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load trending content. Please try again.'
      }))
    }
  }

  // Load trending content on mount
  useEffect(() => {
    fetchTrending('day')
  }, [])

  // Handle time window change
  const handleTimeWindowChange = (newTimeWindow: 'day' | 'week') => {
    if (newTimeWindow !== trendingState.timeWindow) {
      fetchTrending(newTimeWindow)
    }
  }

  // Handle tab change
  const handleTabChange = (tab: 'all' | 'movies' | 'tv') => {
    setTrendingState(prev => ({ ...prev, activeTab: tab }))
  }

  // Get current content based on active tab
  const getCurrentContent = () => {
    switch (trendingState.activeTab) {
      case 'movies':
        return trendingState.movies
      case 'tv':
        return trendingState.tv
      default:
        return trendingState.all
    }
  }

  const currentContent = getCurrentContent()

  return (
    <>
      <Head>
        <title>Trending Now - Movie Discovery App</title>
        <meta
          name="description"
          content="Discover what's trending in movies and TV shows. See daily and weekly popular content."
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  🔥 Trending Now
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  Discover what's popular in movies and TV shows
                </p>
              </div>
              <button
                onClick={() => router.push('/')}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors text-sm sm:text-base self-start sm:self-auto"
              >
                ← Back to Home
              </button>
            </div>

            {/* Time Window Selector */}
            <TimeWindowSelector
              value={trendingState.timeWindow}
              onChange={handleTimeWindowChange}
              loading={trendingState.loading}
              className="mb-4 sm:mb-6"
            />

            {/* Content Type Tabs */}
            <ContentTypeTabs
              value={trendingState.activeTab}
              onChange={handleTabChange}
              counts={{
                all: trendingState.all.length,
                movies: trendingState.movies.length,
                tv: trendingState.tv.length
              }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Loading State */}
          {trendingState.loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading trending content...</span>
            </div>
          )}

          {/* Error State */}
          {trendingState.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error Loading Content</h3>
                  <p className="text-sm text-red-700 mt-1">{trendingState.error}</p>
                  <button
                    onClick={() => fetchTrending(trendingState.timeWindow)}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Content Grid */}
          {!trendingState.loading && !trendingState.error && currentContent.length > 0 && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {trendingState.activeTab === 'all' && 'All Trending Content'}
                  {trendingState.activeTab === 'movies' && 'Trending Movies'}
                  {trendingState.activeTab === 'tv' && 'Trending TV Shows'}
                  <span className="text-gray-500 text-base font-normal ml-2">
                    ({trendingState.timeWindow === 'day' ? 'Today' : 'This Week'})
                  </span>
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {currentContent.length} trending {trendingState.activeTab === 'all' ? 'items' : trendingState.activeTab}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                {currentContent.map((item, index) => (
                  <TrendingCard
                    key={`${item.id}-${trendingState.activeTab}`}
                    movie={item}
                    rank={index + 1}
                    priority={index < 6}
                    showType={trendingState.activeTab === 'all'}
                  />
                ))}
              </div>
            </>
          )}

          {/* Empty State */}
          {!trendingState.loading && !trendingState.error && currentContent.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No trending content</h3>
              <p className="mt-1 text-sm text-gray-500">
                Unable to load trending content at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
