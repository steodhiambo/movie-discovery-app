import { useState, useEffect } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import SearchBar from '@/components/SearchBar'
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
      const response = await fetch('/api/trending?type=movie&timeWindow=day&enhanced=false')

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const trending = await response.json()
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

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
                🎬 Movie Discovery
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Discover amazing movies and TV shows, search your favorites, and build your personal watchlist
              </p>

              {/* Search Bar */}
              <div className="mt-8 max-w-2xl mx-auto">
                <SearchBar
                  placeholder="Search for movies and TV shows..."
                  showFilters={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Trending Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">🔥 Trending Today</h2>
            <Link
              href="/search"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View All →
            </Link>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading trending content...</span>
            </div>
          )}

          {/* Error State - Simple and Clean */}
          {error && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4zM3 8v10a2 2 0 002 2h14a2 2 0 002-2V8H3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No trending content available</h3>
              <p className="text-gray-600 mb-4">Try using the search feature to discover movies and TV shows</p>
              <Link
                href="/search"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Start Searching
              </Link>
            </div>
          )}

          {/* Trending Movies Grid */}
          {!loading && !error && trendingMovies.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
              {trendingMovies.map((movie, index) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  priority={index < 6}
                  showType={false}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Links Section */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">🚀 Quick Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                href="/search"
                className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg p-6 transition-all duration-200 transform hover:scale-105"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🔍</span>
                  <div>
                    <h3 className="font-semibold text-lg">Search</h3>
                    <p className="text-blue-100 text-sm">Find movies & TV shows</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/watchlist"
                className="group bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg p-6 transition-all duration-200 transform hover:scale-105"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📝</span>
                  <div>
                    <h3 className="font-semibold text-lg">My Watchlist</h3>
                    <p className="text-purple-100 text-sm">
                      {(() => {
                        const stats = getWatchlistStats()
                        return stats.total > 0
                          ? `${stats.total} items • ${stats.unwatched} to watch`
                          : 'Save movies & TV shows'
                      })()}
                    </p>
                  </div>
                </div>
              </Link>

              <div className="group bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-6 opacity-50">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🎭</span>
                  <div>
                    <h3 className="font-semibold text-lg">Genres</h3>
                    <p className="text-orange-100 text-sm">Coming soon...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
