import { useState, useEffect } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'

import MovieCard from '@/components/MovieCard'
import { movieApi, EnhancedMovie } from '@/lib/movieApi'
import { useWatchlist } from '@/context/WatchlistContext'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const [trendingMovies, setTrendingMovies] = useState<EnhancedMovie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { getWatchlistStats } = useWatchlist()

  useEffect(() => {
    loadTrendingContent()
  }, [])

  const loadTrendingContent = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Loading trending content...')

      // Call our trending API route
      const response = await fetch('/api/trending?media_type=movie&time_window=day&enhanced=false')

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const trendingData = await response.json()
      const trending = trendingData.results || []
      console.log('Trending content loaded:', trending.length, 'movies')

      setTrendingMovies(trending.slice(0, 12)) // Show top 12
      setError(null)
    } catch (err) {
      console.error('Failed to load trending content:', err)
      let errorMessage = 'Unable to load trending content'

      if (err instanceof Error) {
        errorMessage = err.message
        if (err.message.includes('TMDB API key is not configured')) {
          errorMessage = 'API configuration issue. Please check the API setup.'
        }
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }
  return (
    <>
      <Head>
        <title>Movie Discovery App - Discover Amazing Movies & TV Shows</title>
        <meta name="description" content="Discover trending movies and TV shows, search your favorites, and build your personal watchlist" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                Discover Your Next
                <span className="block text-yellow-300">Favorite Movie</span>
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
                AI-powered recommendations, trending content, and smart watchlist management
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/trending"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                >
                  🔥 Explore Trending
                </Link>
                <Link
                  href="/recommendations"
                  className="inline-flex items-center justify-center px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-lg transition-colors"
                >
                  🤖 Get Recommendations
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Trending Section */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                🔥 Trending Now
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover what&apos;s popular today and join millions of viewers worldwide
              </p>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
                <span className="mt-4 text-gray-600 font-medium">Loading trending content...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4zM3 8v10a2 2 0 002 2h14a2 2 0 002-2V8H3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to load trending content</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  We&apos;re having trouble fetching the latest trending movies. Please try again or explore other sections.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Try Again
                  </button>
                  <Link
                    href="/search"
                    className="inline-flex items-center px-6 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search Movies
                  </Link>
                </div>
              </div>
            )}

            {/* Trending Movies Grid */}
            {!loading && !error && trendingMovies.length > 0 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12">
                  {trendingMovies.map((movie, index) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      priority={index < 6}
                      showType={false}
                      className="transform hover:scale-105 transition-transform duration-200"
                    />
                  ))}
                </div>

                <div className="text-center">
                  <Link
                    href="/trending"
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <span>View All Trending Movies</span>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-slate-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Explore & Discover
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Everything you need to find your next favorite movie or TV show
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Watchlist Feature */}
              <Link
                href="/watchlist"
                className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">My Watchlist</h3>
                <p className="text-gray-600 mb-4">
                  {(() => {
                    const stats = getWatchlistStats()
                    return stats.total > 0
                      ? `${stats.total} movies saved • ${stats.unwatched} to watch`
                      : 'Save and organize your must-watch movies and TV shows'
                  })()}
                </p>
                <div className="flex items-center text-purple-600 font-medium group-hover:text-purple-700">
                  <span>Manage Watchlist</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </Link>

              {/* Genres Feature */}
              <Link
                href="/genres"
                className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4zM3 8v10a2 2 0 002 2h14a2 2 0 002-2V8H3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Browse Genres</h3>
                <p className="text-gray-600 mb-4">
                  Explore movies by category - Action, Comedy, Drama, Horror, Sci-Fi, and many more
                </p>
                <div className="flex items-center text-green-600 font-medium group-hover:text-green-700">
                  <span>Explore Genres</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </Link>

              {/* AI Recommendations Feature */}
              <Link
                href="/recommendations"
                className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">AI Recommendations</h3>
                <p className="text-gray-600 mb-4">
                  Get personalized movie suggestions powered by AI based on your viewing preferences
                </p>
                <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                  <span>Get Recommendations</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
