// TV show detail page with comprehensive information
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { tmdbApi } from '@/lib/tmdb'
import CastCrew, { SimilarContent } from '@/components/CastCrew'

interface TVShowDetailState {
  show: any | null // TV show details from TMDB
  loading: boolean
  error: string | null
}

export default function TVShowDetail() {
  const router = useRouter()
  const { id } = router.query
  
  const [state, setState] = useState<TVShowDetailState>({
    show: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadTVShowDetails(parseInt(id))
    }
  }, [id])

  const loadTVShowDetails = async (showId: number) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      console.log('Loading TV show details for ID:', showId)

      // Call our API route instead of TMDB directly
      const response = await fetch(`/api/tv/${showId}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('TV show details loaded:', data.show?.name)

      setState({
        show: data.show,
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('Failed to load TV show details:', error)
      let errorMessage = 'Failed to load TV show details'

      if (error instanceof Error) {
        errorMessage = error.message
        if (error.message.includes('API key not configured')) {
          errorMessage = 'API key not configured properly. Please check your TMDB API key in .env.local'
        } else if (error.message.includes('404')) {
          errorMessage = 'TV show not found'
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
            <p className="text-gray-600">Loading TV show details...</p>
          </div>
        </div>
      </>
    )
  }

  if (state.error || !state.show) {
    return (
      <>
        <Head>
          <title>TV Show Not Found - Movie Discovery App</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">TV Show Not Found</h1>
            <p className="text-gray-600 mb-6">{state.error || 'The TV show you\'re looking for could not be found.'}</p>
            <div className="space-x-4">
              <Link
                href="/search"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Search TV Shows
              </Link>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  const show = state.show
  const posterUrl = tmdbApi.getImageUrl(show.poster_path, 'w500')
  const backdropUrl = tmdbApi.getBackdropUrl(show.backdrop_path, 'w1280')
  const firstAirYear = show.first_air_date ? new Date(show.first_air_date).getFullYear() : null

  return (
    <>
      <Head>
        <title>{show.name} ({firstAirYear}) - Movie Discovery App</title>
        <meta name="description" content={show.overview || `Details for ${show.name}`} />
        <meta property="og:title" content={`${show.name} (${firstAirYear})`} />
        <meta property="og:description" content={show.overview} />
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
              alt={`${show.name} backdrop`}
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
          {/* TV Show Header */}
          <div className={`${backdropUrl ? '-mt-32 sm:-mt-40 md:-mt-48' : 'pt-8'} relative z-10 px-4 sm:px-0`}>
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Poster */}
              <div className="flex-shrink-0">
                <div className="w-48 sm:w-56 md:w-64 mx-auto lg:mx-0">
                  {posterUrl ? (
                    <Image
                      src={posterUrl}
                      alt={`${show.name} poster`}
                      width={256}
                      height={384}
                      className="rounded-lg shadow-xl w-full h-auto"
                      priority
                    />
                  ) : (
                    <div className="w-full aspect-[2/3] bg-gray-300 rounded-lg flex items-center justify-center">
                      <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* TV Show Info */}
              <div className="flex-1 text-white lg:text-gray-900 text-center lg:text-left">
                <div className="mb-6">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 leading-tight">
                    {show.name}
                    {firstAirYear && (
                      <span className="block sm:inline text-xl sm:text-2xl lg:text-3xl font-normal sm:ml-2 text-gray-200 lg:text-gray-600">
                        ({firstAirYear})
                      </span>
                    )}
                  </h1>

                  {show.tagline && (
                    <p className="text-base sm:text-lg italic text-gray-200 lg:text-gray-600 mb-4 max-w-2xl mx-auto lg:mx-0">
                      {show.tagline}
                    </p>
                  )}
                </div>

                {/* Quick Info */}
                <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
                  {show.number_of_seasons && (
                    <span className="bg-gray-800 md:bg-gray-200 text-white md:text-gray-800 px-2 py-1 rounded">
                      {show.number_of_seasons} Season{show.number_of_seasons !== 1 ? 's' : ''}
                    </span>
                  )}
                  {show.number_of_episodes && (
                    <span className="bg-gray-800 md:bg-gray-200 text-white md:text-gray-800 px-2 py-1 rounded">
                      {show.number_of_episodes} Episodes
                    </span>
                  )}
                  {show.status && (
                    <span className={`px-2 py-1 rounded text-xs ${
                      show.status === 'Ended' 
                        ? 'bg-red-600 md:bg-red-100 text-white md:text-red-800'
                        : 'bg-green-600 md:bg-green-100 text-white md:text-green-800'
                    }`}>
                      {show.status}
                    </span>
                  )}
                  {show.genres && show.genres.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {show.genres.slice(0, 3).map((genre: any) => (
                        <span key={genre.id} className="bg-blue-600 md:bg-blue-100 text-white md:text-blue-800 px-2 py-1 rounded text-xs">
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ratings */}
                <div className="flex flex-wrap items-center gap-6 mb-6">
                  {show.vote_average > 0 && (
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      <span className="font-semibold">{show.vote_average.toFixed(1)}</span>
                      <span className="text-gray-400 md:text-gray-600 ml-1">TMDB</span>
                    </div>
                  )}
                </div>

                {/* Overview */}
                {show.overview && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Overview</h3>
                    <p className="text-gray-200 md:text-gray-700 leading-relaxed">{show.overview}</p>
                  </div>
                )}

                {/* Air Dates */}
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {show.first_air_date && (
                      <div>
                        <span className="text-gray-400 md:text-gray-600">First Aired:</span>
                        <span className="ml-2 font-medium">{new Date(show.first_air_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {show.last_air_date && (
                      <div>
                        <span className="text-gray-400 md:text-gray-600">Last Aired:</span>
                        <span className="ml-2 font-medium">{new Date(show.last_air_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                    + Add to Watchlist
                  </button>
                  <button className="bg-gray-600 hover:bg-gray-700 md:bg-gray-200 md:hover:bg-gray-300 text-white md:text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors">
                    ♡ Mark as Watched
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Cast and Crew */}
            {(show.credits?.cast || show.credits?.crew) && (
              <CastCrew
                cast={show.credits.cast}
                crew={show.credits.crew}
                maxCast={10}
                maxCrew={6}
              />
            )}

            {/* Similar TV Shows */}
            {(show.similar?.results || show.recommendations?.results) && (
              <SimilarContent
                similar={show.similar?.results}
                recommendations={show.recommendations?.results}
                type="tv"
                maxItems={6}
              />
            )}

            {/* Additional TV Show Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Show Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {show.created_by && show.created_by.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Created By</h4>
                    <p className="text-gray-600">
                      {show.created_by.map((creator: any) => creator.name).join(', ')}
                    </p>
                  </div>
                )}
                {show.networks && show.networks.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Networks</h4>
                    <p className="text-gray-600">
                      {show.networks.map((network: any) => network.name).join(', ')}
                    </p>
                  </div>
                )}
                {show.episode_run_time && show.episode_run_time.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Episode Runtime</h4>
                    <p className="text-gray-600">{show.episode_run_time[0]} minutes</p>
                  </div>
                )}
                {show.production_companies && show.production_companies.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Production Companies</h4>
                    <p className="text-gray-600">
                      {show.production_companies.slice(0, 3).map((company: any) => company.name).join(', ')}
                    </p>
                  </div>
                )}
                {show.spoken_languages && show.spoken_languages.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Languages</h4>
                    <p className="text-gray-600">
                      {show.spoken_languages.map((lang: any) => lang.english_name || lang.name).join(', ')}
                    </p>
                  </div>
                )}
                {show.vote_count > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Vote Count</h4>
                    <p className="text-gray-600">{show.vote_count.toLocaleString()} votes</p>
                  </div>
                )}
              </div>

              {/* Seasons Information */}
              {show.seasons && show.seasons.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Seasons</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {show.seasons.slice(0, 8).map((season: any) => (
                      <div key={season.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="relative w-12 h-16 flex-shrink-0">
                          {season.poster_path ? (
                            <Image
                              src={tmdbApi.getImageUrl(season.poster_path, 'w185') || ''}
                              alt={`${season.name} poster`}
                              fill
                              className="object-cover rounded"
                              sizes="48px"
                            />
                          ) : (
                            <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="font-medium text-sm text-gray-900 truncate">{season.name}</h5>
                          <p className="text-xs text-gray-600">
                            {season.episode_count} episode{season.episode_count !== 1 ? 's' : ''}
                          </p>
                          {season.air_date && (
                            <p className="text-xs text-gray-500">
                              {new Date(season.air_date).getFullYear()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
