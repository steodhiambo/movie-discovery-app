// Search results page with real-time search and filtering
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import SearchBar from '@/components/SearchBar'
import MovieCard from '@/components/MovieCard'
import { movieApi, EnhancedMovie } from '@/lib/movieApi'

interface SearchState {
  results: EnhancedMovie[]
  loading: boolean
  error: string | null
  page: number
  totalPages: number
  totalResults: number
  query: string
}

export default function Search() {
  const router = useRouter()
  const { q: queryParam, page: pageParam } = router.query

  const [searchState, setSearchState] = useState<SearchState>({
    results: [],
    loading: false,
    error: null,
    page: 1,
    totalPages: 0,
    totalResults: 0,
    query: ''
  })

  const [filters, setFilters] = useState({
    type: 'all' as 'all' | 'movie' | 'tv',
    includeOMDB: false
  })

  // Initialize search from URL params
  useEffect(() => {
    if (queryParam && typeof queryParam === 'string') {
      const page = pageParam && typeof pageParam === 'string' ? parseInt(pageParam) : 1
      setSearchState(prev => ({ ...prev, query: queryParam, page }))
      performSearch(queryParam, page)
    }
  }, [queryParam, pageParam])

  const performSearch = async (query: string, page: number = 1) => {
    if (!query.trim()) {
      setSearchState(prev => ({ ...prev, results: [], loading: false }))
      return
    }

    setSearchState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const searchResults = await movieApi.search({
        query: query.trim(),
        page,
        type: filters.type,
        includeOMDBData: filters.includeOMDB
      })

      setSearchState(prev => ({
        ...prev,
        results: searchResults.results,
        loading: false,
        page: searchResults.page,
        totalPages: searchResults.totalPages,
        totalResults: searchResults.totalResults,
        query: query.trim()
      }))

      // Update URL without triggering navigation
      const newUrl = `/search?q=${encodeURIComponent(query.trim())}${page > 1 ? `&page=${page}` : ''}`
      if (router.asPath !== newUrl) {
        router.replace(newUrl, undefined, { shallow: true })
      }

    } catch (error) {
      console.error('Search error:', error)
      setSearchState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Search failed. Please try again.'
      }))
    }
  }

  const handleSearch = (query: string) => {
    performSearch(query, 1)
  }

  const handlePageChange = (newPage: number) => {
    if (searchState.query) {
      performSearch(searchState.query, newPage)
    }
  }

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
    if (searchState.query) {
      performSearch(searchState.query, 1)
    }
  }

  return (
    <>
      <Head>
        <title>
          {searchState.query
            ? `Search: ${searchState.query} - Movie Discovery App`
            : 'Search - Movie Discovery App'
          }
        </title>
        <meta
          name="description"
          content={searchState.query
            ? `Search results for "${searchState.query}" - Find movies and TV shows`
            : 'Search for movies and TV shows'
          }
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Search Movies & TV Shows
              </h1>
              <button
                onClick={() => router.push('/')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Home
              </button>
            </div>

            {/* Search Bar */}
            <SearchBar
              onSearch={handleSearch}
              initialValue={searchState.query}
              showFilters={true}
              className="mb-4"
            />

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <label className="text-gray-700 font-medium">Type:</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange({ ...filters, type: e.target.value as any })}
                  className="border border-gray-300 rounded px-2 py-1 text-gray-700"
                >
                  <option value="all">All</option>
                  <option value="movie">Movies</option>
                  <option value="tv">TV Shows</option>
                </select>
              </div>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.includeOMDB}
                  onChange={(e) => handleFilterChange({ ...filters, includeOMDB: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-gray-700">Enhanced data (slower)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Loading State */}
          {searchState.loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Searching...</span>
            </div>
          )}

          {/* Error State */}
          {searchState.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Search Error</h3>
                  <p className="text-sm text-red-700 mt-1">{searchState.error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Results Header */}
          {!searchState.loading && searchState.query && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {searchState.totalResults > 0
                  ? `Found ${searchState.totalResults.toLocaleString()} results for "${searchState.query}"`
                  : `No results found for "${searchState.query}"`
                }
              </h2>
              {searchState.totalResults > 0 && (
                <p className="text-gray-600 text-sm mt-1">
                  Showing page {searchState.page} of {searchState.totalPages}
                </p>
              )}
            </div>
          )}

          {/* Results Grid */}
          {!searchState.loading && searchState.results.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
                {searchState.results.map((movie, index) => (
                  <MovieCard
                    key={`${movie.id}-${movie.title}`}
                    movie={movie}
                    priority={index < 6} // Prioritize first 6 images
                  />
                ))}
              </div>

              {/* Pagination */}
              {searchState.totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => handlePageChange(searchState.page - 1)}
                    disabled={searchState.page <= 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, searchState.totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, searchState.page - 2) + i
                    if (pageNum > searchState.totalPages) return null

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          pageNum === searchState.page
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  <button
                    onClick={() => handlePageChange(searchState.page + 1)}
                    disabled={searchState.page >= searchState.totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!searchState.loading && !searchState.error && searchState.query && searchState.results.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search terms or filters.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => handleSearch('')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Clear Search
                </button>
              </div>
            </div>
          )}

          {/* Initial State */}
          {!searchState.loading && !searchState.query && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Start your search</h3>
              <p className="mt-1 text-sm text-gray-500">
                Search for your favorite movies and TV shows above.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
