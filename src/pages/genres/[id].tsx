// Individual Genre Page - Show content filtered by specific genre
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import MovieCard from '@/components/MovieCard'
import { EnhancedMovie } from '@/lib/movieApi'

interface GenrePageState {
  content: EnhancedMovie[]
  loading: boolean
  error: string | null
  currentPage: number
  totalPages: number
  totalResults: number
  sortBy: string
  contentType: 'movie' | 'tv' | 'all'
}

interface FilterState {
  year: string
  minRating: string
  maxRating: string
  sortBy: string
}

export default function GenrePage() {
  const router = useRouter()
  const { id, name, type } = router.query

  const [genreState, setGenreState] = useState<GenrePageState>({
    content: [],
    loading: true,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    sortBy: 'popularity.desc',
    contentType: (type === 'tv' ? 'tv' : 'movie') // Default to movie for 'all' or invalid types
  })

  const [filters, setFilters] = useState<FilterState>({
    year: '',
    minRating: '',
    maxRating: '',
    sortBy: 'popularity.desc'
  })

  const [showFilters, setShowFilters] = useState(false)

  // Fetch content for the genre
  const fetchGenreContent = async (page: number = 1, newFilters?: Partial<FilterState>) => {
    if (!id) return

    setGenreState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const currentFilters = { ...filters, ...newFilters }
      const params = new URLSearchParams({
        type: genreState.contentType,
        genre_id: id as string,
        page: page.toString(),
        sort_by: currentFilters.sortBy
      })

      // Add optional filters
      if (currentFilters.year) params.append('year', currentFilters.year)
      if (currentFilters.minRating) params.append('vote_average_gte', currentFilters.minRating)
      if (currentFilters.maxRating) params.append('vote_average_lte', currentFilters.maxRating)

      const response = await fetch(`/api/discover?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch genre content')
      }

      const data = await response.json()

      setGenreState(prev => ({
        ...prev,
        content: data.results || [],
        currentPage: data.page || 1,
        totalPages: data.total_pages || 1,
        totalResults: data.total_results || 0,
        loading: false
      }))
    } catch (error) {
      console.error('Genre content fetch error:', error)
      setGenreState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load content. Please try again.'
      }))
    }
  }

  // Load content when component mounts or dependencies change
  useEffect(() => {
    if (id) {
      fetchGenreContent(1)
    }
  }, [id])

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    fetchGenreContent(1, updatedFilters)
  }

  // Handle content type change
  const handleContentTypeChange = (newType: 'movie' | 'tv') => {
    setGenreState(prev => ({ ...prev, contentType: newType }))
    // Fetch new content immediately when type changes
    setTimeout(() => fetchGenreContent(1), 0)
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    fetchGenreContent(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Sort options
  const sortOptions = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'popularity.asc', label: 'Least Popular' },
    { value: 'vote_average.desc', label: 'Highest Rated (TMDB)' },
    { value: 'vote_average.asc', label: 'Lowest Rated (TMDB)' },
    { value: 'release_date.desc', label: 'Newest First' },
    { value: 'release_date.asc', label: 'Oldest First' }
  ]

  // Rating filter options
  const ratingOptions = [
    { value: '', label: 'Any Rating' },
    { value: '9', label: '9+ Stars (Excellent)' },
    { value: '8', label: '8+ Stars (Very Good)' },
    { value: '7', label: '7+ Stars (Good)' },
    { value: '6', label: '6+ Stars (Above Average)' },
    { value: '5', label: '5+ Stars (Average)' },
    { value: '4', label: '4+ Stars (Below Average)' }
  ]

  // Generate year options (last 50 years)
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 51 }, (_, i) => currentYear - i)

  const genreName = (name as string) || 'Unknown Genre'
  const genreIcon = getGenreIcon(genreName)

  return (
    <>
      <Head>
        <title>{genreName} {genreState.contentType === 'movie' ? 'Movies' : 'TV Shows'} - Movie Discovery App</title>
        <meta
          name="description"
          content={`Discover the best ${genreName.toLowerCase()} ${genreState.contentType === 'movie' ? 'movies' : 'TV shows'}. Browse, filter, and find your next favorite.`}
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
              <Link href="/" className="hover:text-blue-600">Home</Link>
              <span>›</span>
              <Link href="/genres" className="hover:text-blue-600">Genres</Link>
              <span>›</span>
              <span className="text-gray-900 font-medium">{genreName}</span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                  <span className="text-3xl mr-3">{genreIcon}</span>
                  {genreName}
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  {genreState.totalResults.toLocaleString()} {genreState.contentType === 'movie' ? 'movies' : 'TV shows'} found
                </p>
              </div>

              {/* Content Type Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handleContentTypeChange('movie')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    genreState.contentType === 'movie'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Movies
                </button>
                <button
                  onClick={() => handleContentTypeChange('tv')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    genreState.contentType === 'tv'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  TV Shows
                </button>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                </svg>
                Filters
              </button>

              {/* Quick Sort */}
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Expandable Filters */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                    <select
                      value={filters.year}
                      onChange={(e) => handleFilterChange({ year: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Any Year</option>
                      {yearOptions.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Rating (TMDB)</label>
                    <select
                      value={filters.minRating}
                      onChange={(e) => handleFilterChange({ minRating: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {ratingOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Rating</label>
                    <select
                      value={filters.maxRating}
                      onChange={(e) => handleFilterChange({ maxRating: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Any Rating</option>
                      {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                        <option key={rating} value={rating}>Under {rating} Stars</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setFilters({ year: '', minRating: '', maxRating: '', sortBy: 'popularity.desc' })
                      fetchGenreContent(1, { year: '', minRating: '', maxRating: '', sortBy: 'popularity.desc' })
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Loading State */}
          {genreState.loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading {genreName.toLowerCase()} content...</span>
            </div>
          )}

          {/* Error State */}
          {genreState.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error Loading Content</h3>
                  <p className="text-sm text-red-700 mt-1">{genreState.error}</p>
                  <button
                    onClick={() => fetchGenreContent(genreState.currentPage)}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Content Grid */}
          {!genreState.loading && !genreState.error && genreState.content.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 mb-8">
                {genreState.content.map((item, index) => (
                  <MovieCard
                    key={item.id}
                    movie={item}
                    priority={index < 6}
                    showType={false}
                  />
                ))}
              </div>

              {/* Pagination */}
              {genreState.totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => handlePageChange(genreState.currentPage - 1)}
                    disabled={genreState.currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <span className="px-4 py-2 text-sm text-gray-700">
                    Page {genreState.currentPage} of {genreState.totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(genreState.currentPage + 1)}
                    disabled={genreState.currentPage === genreState.totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!genreState.loading && !genreState.error && genreState.content.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">{genreIcon}</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No {genreName.toLowerCase()} content found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or check back later for new content.
              </p>
              <button
                onClick={() => {
                  setFilters({ year: '', minRating: '', maxRating: '', sortBy: 'popularity.desc' })
                  fetchGenreContent(1, { year: '', minRating: '', maxRating: '', sortBy: 'popularity.desc' })
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// Genre icon helper function
function getGenreIcon(genreName: string) {
  const icons: { [key: string]: string } = {
    'Action': '💥',
    'Adventure': '🗺️',
    'Animation': '🎨',
    'Comedy': '😂',
    'Crime': '🔍',
    'Documentary': '📹',
    'Drama': '🎭',
    'Family': '👨‍👩‍👧‍👦',
    'Fantasy': '🧙‍♂️',
    'History': '📜',
    'Horror': '👻',
    'Music': '🎵',
    'Mystery': '🕵️',
    'Romance': '💕',
    'Science Fiction': '🚀',
    'TV Movie': '📺',
    'Thriller': '😱',
    'War': '⚔️',
    'Western': '🤠'
  }
  return icons[genreName] || '🎬'
}
