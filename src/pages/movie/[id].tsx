// Movie detail page with comprehensive information
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { movieApi, EnhancedMovie } from '@/lib/movieApi'
import { tmdbApi, TMDBMovieDetails } from '@/lib/tmdb'
import CastCrew, { SimilarContent } from '@/components/CastCrew'

interface MovieDetailState {
  movie: TMDBMovieDetails | null
  enhancedMovie: EnhancedMovie | null
  loading: boolean
  error: string | null
}

export default function MovieDetail() {
  const router = useRouter()
  const { id } = router.query
  
  const [state, setState] = useState<MovieDetailState>({
    movie: null,
    enhancedMovie: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadMovieDetails(parseInt(id))
    }
  }, [id])

  const loadMovieDetails = async (movieId: number) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      console.log('Loading movie details for ID:', movieId)

      // Call our API route instead of TMDB directly
      const response = await fetch(`/api/movie/${movieId}?enhanced=true`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Movie details loaded:', data.movie?.title)

      setState({
        movie: data.movie,
        enhancedMovie: data.enhanced,
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('Failed to load movie details:', error)
      let errorMessage = 'Failed to load movie details'

      if (error instanceof Error) {
        errorMessage = error.message
        // Check for specific API errors
        if (error.message.includes('Invalid API key')) {
          errorMessage = 'API key not configured properly. Please check your TMDB API key in .env.local'
        } else if (error.message.includes('404')) {
          errorMessage = 'Movie not found'
        } else if (error.message.includes('Network')) {
          errorMessage = 'Network error. Please check your internet connection.'
        }
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
    }
  }

  if (state.loading) {
    return (
      <>
        <Head>
          <title>Loading... - Movie Discovery App</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading movie details...</p>
          </div>
        </div>
      </>
    )
  }

  if (state.error || !state.movie) {
    return (
      <>
        <Head>
          <title>Movie Details - Movie Discovery App</title>
        </Head>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4zM3 8v10a2 2 0 002 2h14a2 2 0 002-2V8H3z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Movie Details</h1>

              {state.error ? (
                <div className="mb-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-medium text-red-800 mb-2">Unable to Load Movie Details</h3>
                    <p className="text-red-700 text-sm">{state.error}</p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">🎬 Movie Detail Features</h4>
                    <p className="text-blue-700 text-sm mb-3">
                      Once API keys are configured, you'll see:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-600">
                      <div className="flex items-center">
                        <span className="mr-2">🖼️</span>
                        High-quality posters and backdrops
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">⭐</span>
                        Multiple rating sources (TMDB, IMDb, RT)
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">👥</span>
                        Cast and crew information
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">📝</span>
                        Plot, genres, runtime, and details
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">🎭</span>
                        Similar movie recommendations
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">📊</span>
                        Budget, revenue, and production info
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 mb-6">Movie ID: {id}</p>
              )}

              <div className="space-x-4">
                <Link
                  href="/search"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  🔍 Search Movies
                </Link>
                <Link
                  href="/api-test"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  🧪 Test API Setup
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  🏠 Go Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  const movie = state.movie
  const enhanced = state.enhancedMovie
  const posterUrl = tmdbApi.getImageUrl(movie.poster_path, 'w500')
  const backdropUrl = tmdbApi.getBackdropUrl(movie.backdrop_path, 'w1280')
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : null

  return (
    <>
      <Head>
        <title>{movie.title} ({releaseYear}) - Movie Discovery App</title>
        <meta name="description" content={movie.overview || `Details for ${movie.title}`} />
        <meta property="og:title" content={`${movie.title} (${releaseYear})`} />
        <meta property="og:description" content={movie.overview} />
        {posterUrl && <meta property="og:image" content={posterUrl} />}
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Back Navigation */}
        <div className="relative z-20 p-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black/50 hover:bg-black/70 rounded-lg transition-colors duration-200 backdrop-blur-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        {/* Hero Section with Backdrop */}
        {backdropUrl && (
          <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] bg-gray-900">
            <Image
              src={backdropUrl}
              alt={`${movie.title} backdrop`}
              fill
              className="object-cover opacity-60"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-gray-900/20" />

            {/* Mobile overlay for better text readability */}
            <div className="absolute inset-0 bg-black/30 md:bg-transparent" />
          </div>
        )}

        {/* Main Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Movie Header */}
          <div className={`${backdropUrl ? '-mt-32 sm:-mt-40 md:-mt-48' : 'pt-8'} relative z-10 px-4 sm:px-0`}>
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Poster */}
              <div className="flex-shrink-0">
                <div className="w-48 sm:w-56 md:w-64 mx-auto lg:mx-0">
                  {posterUrl ? (
                    <Image
                      src={posterUrl}
                      alt={`${movie.title} poster`}
                      width={256}
                      height={384}
                      className="rounded-lg shadow-xl w-full h-auto"
                      priority
                    />
                  ) : (
                    <div className="w-full aspect-[2/3] bg-gray-300 rounded-lg flex items-center justify-center">
                      <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4zM3 8v10a2 2 0 002 2h14a2 2 0 002-2V8H3z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Movie Info */}
              <div className="flex-1 text-white lg:text-gray-900 text-center lg:text-left">
                <div className="mb-6">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 leading-tight">
                    {movie.title}
                    {releaseYear && (
                      <span className="block sm:inline text-xl sm:text-2xl lg:text-3xl font-normal sm:ml-2 text-gray-200 lg:text-gray-600">
                        ({releaseYear})
                      </span>
                    )}
                  </h1>

                  {movie.tagline && (
                    <p className="text-base sm:text-lg italic text-gray-200 lg:text-gray-600 mb-4 max-w-2xl mx-auto lg:mx-0">
                      {movie.tagline}
                    </p>
                  )}
                </div>

                {/* Quick Info */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6 text-sm">
                  {movie.runtime && (
                    <span className="bg-black/50 lg:bg-gray-200 text-white lg:text-gray-800 px-3 py-1.5 rounded-full font-medium">
                      {movie.runtime} min
                    </span>
                  )}
                  {movie.genres && movie.genres.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                      {movie.genres.slice(0, 3).map(genre => (
                        <span key={genre.id} className="bg-blue-600 lg:bg-blue-100 text-white lg:text-blue-800 px-3 py-1.5 rounded-full text-xs font-medium">
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ratings */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 mb-6">
                  {movie.vote_average > 0 && (
                    <div className="flex items-center bg-black/30 lg:bg-transparent px-3 py-2 lg:px-0 lg:py-0 rounded-lg">
                      <span className="text-yellow-400 mr-2 text-lg">★</span>
                      <div className="text-center lg:text-left">
                        <span className="font-bold text-lg">{movie.vote_average.toFixed(1)}</span>
                        <span className="text-gray-300 lg:text-gray-600 ml-1 text-sm">TMDB</span>
                      </div>
                    </div>
                  )}
                  {enhanced?.imdbRating && (
                    <div className="flex items-center bg-black/30 lg:bg-transparent px-3 py-2 lg:px-0 lg:py-0 rounded-lg">
                      <span className="text-orange-400 mr-2 text-lg">★</span>
                      <div className="text-center lg:text-left">
                        <span className="font-bold text-lg">{enhanced.imdbRating}</span>
                        <span className="text-gray-300 lg:text-gray-600 ml-1 text-sm">IMDb</span>
                      </div>
                    </div>
                  )}
                  {enhanced?.rottenTomatoesRating && (
                    <div className="flex items-center bg-black/30 lg:bg-transparent px-3 py-2 lg:px-0 lg:py-0 rounded-lg">
                      <span className="text-red-400 mr-2 text-lg">🍅</span>
                      <div className="text-center lg:text-left">
                        <span className="font-bold text-lg">{enhanced.rottenTomatoesRating}</span>
                        <span className="text-gray-300 lg:text-gray-600 ml-1 text-sm">RT</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Overview */}
                {movie.overview && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3 text-center lg:text-left">Overview</h3>
                    <p className="text-gray-200 lg:text-gray-700 leading-relaxed text-center lg:text-left max-w-3xl mx-auto lg:mx-0">
                      {movie.overview}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add to Watchlist
                  </button>
                  <button className="bg-gray-600 hover:bg-gray-700 lg:bg-gray-200 lg:hover:bg-gray-300 text-white lg:text-gray-800 px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Mark as Watched
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Cast and Crew */}
            {(movie.credits?.cast || movie.credits?.crew) && (
              <CastCrew
                cast={movie.credits.cast}
                crew={movie.credits.crew}
                maxCast={10}
                maxCrew={6}
              />
            )}

            {/* Similar Movies */}
            {(movie.similar?.results || movie.recommendations?.results) && (
              <SimilarContent
                similar={movie.similar?.results}
                recommendations={movie.recommendations?.results}
                type="movie"
                maxItems={6}
              />
            )}

            {/* Additional Movie Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Movie Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {movie.release_date && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Release Date</h4>
                    <p className="text-gray-600">{new Date(movie.release_date).toLocaleDateString()}</p>
                  </div>
                )}
                {movie.budget > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Budget</h4>
                    <p className="text-gray-600">${movie.budget.toLocaleString()}</p>
                  </div>
                )}
                {movie.revenue > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Revenue</h4>
                    <p className="text-gray-600">${movie.revenue.toLocaleString()}</p>
                  </div>
                )}
                {movie.production_companies && movie.production_companies.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Production Companies</h4>
                    <p className="text-gray-600">
                      {movie.production_companies.slice(0, 3).map((company: any) => company.name).join(', ')}
                    </p>
                  </div>
                )}
                {movie.spoken_languages && movie.spoken_languages.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Languages</h4>
                    <p className="text-gray-600">
                      {movie.spoken_languages.map((lang: any) => lang.english_name || lang.name).join(', ')}
                    </p>
                  </div>
                )}
                {movie.vote_count > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Vote Count</h4>
                    <p className="text-gray-600">{movie.vote_count.toLocaleString()} votes</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
