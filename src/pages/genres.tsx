// Genre Discovery Page - Browse content by genre
import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'

interface Genre {
  id: number
  name: string
}

interface GenreWithStats extends Genre {
  movieCount?: number
  tvCount?: number
  popularMovies?: any[]
  popularTvShows?: any[]
}

interface GenresState {
  movieGenres: GenreWithStats[]
  tvGenres: GenreWithStats[]
  loading: boolean
  error: string | null
  activeTab: 'movies' | 'tv' | 'all'
}

export default function GenresPage() {
  const router = useRouter()
  const [genresState, setGenresState] = useState<GenresState>({
    movieGenres: [],
    tvGenres: [],
    loading: true,
    error: null,
    activeTab: 'all'
  })

  // Fetch genres data
  const fetchGenres = async () => {
    setGenresState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Fetch both movie and TV genres in parallel
      const [movieGenresResponse, tvGenresResponse] = await Promise.all([
        fetch('/api/genres?type=movie'),
        fetch('/api/genres?type=tv')
      ])

      if (!movieGenresResponse.ok || !tvGenresResponse.ok) {
        throw new Error('Failed to fetch genres')
      }

      const [movieGenresData, tvGenresData] = await Promise.all([
        movieGenresResponse.json(),
        tvGenresResponse.json()
      ])

      setGenresState(prev => ({
        ...prev,
        movieGenres: movieGenresData.genres || [],
        tvGenres: tvGenresData.genres || [],
        loading: false
      }))
    } catch (error) {
      console.error('Genres fetch error:', error)
      setGenresState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load genres. Please try again.'
      }))
    }
  }

  // Load genres on mount
  useEffect(() => {
    fetchGenres()
  }, [])

  // Handle tab change
  const handleTabChange = (tab: 'movies' | 'tv' | 'all') => {
    setGenresState(prev => ({ ...prev, activeTab: tab }))
  }

  // Get current genres based on active tab
  const getCurrentGenres = () => {
    switch (genresState.activeTab) {
      case 'movies':
        return genresState.movieGenres
      case 'tv':
        return genresState.tvGenres
      case 'all':
        // Combine and deduplicate genres
        const allGenres = [...genresState.movieGenres, ...genresState.tvGenres]
        const uniqueGenres = allGenres.reduce((acc, genre) => {
          const existing = acc.find(g => g.name === genre.name)
          if (!existing) {
            acc.push(genre)
          }
          return acc
        }, [] as GenreWithStats[])
        return uniqueGenres.sort((a, b) => a.name.localeCompare(b.name))
      default:
        return []
    }
  }

  const currentGenres = getCurrentGenres()

  // Genre icons mapping
  const getGenreIcon = (genreName: string) => {
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

  return (
    <>
      <Head>
        <title>Browse by Genre - Movie Discovery App</title>
        <meta
          name="description"
          content="Discover movies and TV shows by genre. Browse Action, Comedy, Drama, Horror, and more."
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  🎭 Browse by Genre
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  Discover content by your favorite genres
                </p>
              </div>
              <button
                onClick={() => router.push('/')}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors text-sm sm:text-base self-start sm:self-auto"
              >
                ← Back to Home
              </button>
            </div>

            {/* Content Type Tabs */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleTabChange('all')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  genresState.activeTab === 'all'
                    ? 'bg-white text-blue-600 shadow-sm transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                All Genres
              </button>
              <button
                onClick={() => handleTabChange('movies')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  genresState.activeTab === 'movies'
                    ? 'bg-white text-blue-600 shadow-sm transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Movie Genres
              </button>
              <button
                onClick={() => handleTabChange('tv')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  genresState.activeTab === 'tv'
                    ? 'bg-white text-blue-600 shadow-sm transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                TV Genres
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Loading State */}
          {genresState.loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading genres...</span>
            </div>
          )}

          {/* Error State */}
          {genresState.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error Loading Genres</h3>
                  <p className="text-sm text-red-700 mt-1">{genresState.error}</p>
                  <button
                    onClick={fetchGenres}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Genres Grid */}
          {!genresState.loading && !genresState.error && currentGenres.length > 0 && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {genresState.activeTab === 'all' && 'All Genres'}
                  {genresState.activeTab === 'movies' && 'Movie Genres'}
                  {genresState.activeTab === 'tv' && 'TV Show Genres'}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {currentGenres.length} genres available
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                {currentGenres.map((genre) => (
                  <Link
                    key={`${genre.id}-${genresState.activeTab}`}
                    href={`/genres/${genre.id}?name=${encodeURIComponent(genre.name)}&type=${genresState.activeTab === 'all' ? 'movie' : genresState.activeTab}`}
                    className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:scale-105"
                  >
                    <div className="p-6 text-center">
                      <div className="text-4xl mb-3">
                        {getGenreIcon(genre.name)}
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-2 group-hover:text-blue-600 transition-colors duration-200">
                        {genre.name}
                      </h3>
                      <div className="text-xs text-gray-500">
                        Explore {genre.name.toLowerCase()} content
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* Empty State */}
          {!genresState.loading && !genresState.error && currentGenres.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4zM3 8v10a2 2 0 002 2h14a2 2 0 002-2V8H3z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No genres available</h3>
              <p className="mt-1 text-sm text-gray-500">
                Unable to load genre information at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
