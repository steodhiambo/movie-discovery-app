// Watchlist page for managing saved movies and TV shows
import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useWatchlist, WatchlistItem } from '@/context/WatchlistContext'
import { tmdbApi } from '@/lib/tmdb'

type FilterType = 'all' | 'movies' | 'tv' | 'watched' | 'unwatched'
type SortType = 'added_date' | 'title' | 'rating' | 'release_date'

export default function WatchlistPage() {
  const { state, removeFromWatchlist, toggleWatched, clearWatchlist, getWatchlistStats } = useWatchlist()
  const [filter, setFilter] = useState<FilterType>('all')
  const [sort, setSort] = useState<SortType>('added_date')
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const stats = getWatchlistStats()

  // Filter items based on selected filter
  const filteredItems = state.items.filter(item => {
    switch (filter) {
      case 'movies':
        return item.media_type === 'movie'
      case 'tv':
        return item.media_type === 'tv'
      case 'watched':
        return item.watched
      case 'unwatched':
        return !item.watched
      default:
        return true
    }
  })

  // Sort items based on selected sort
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sort) {
      case 'title':
        const titleA = a.title || a.name || ''
        const titleB = b.title || b.name || ''
        return titleA.localeCompare(titleB)
      case 'rating':
        return b.vote_average - a.vote_average
      case 'release_date':
        const dateA = a.release_date || a.first_air_date || ''
        const dateB = b.release_date || b.first_air_date || ''
        return dateB.localeCompare(dateA)
      case 'added_date':
      default:
        return new Date(b.added_date).getTime() - new Date(a.added_date).getTime()
    }
  })

  const handleClearWatchlist = () => {
    clearWatchlist()
    setShowClearConfirm(false)
  }

  if (state.loading) {
    return (
      <>
        <Head>
          <title>My Watchlist - Movie Discovery App</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your watchlist...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>My Watchlist ({stats.total}) - Movie Discovery App</title>
        <meta name="description" content="Manage your personal movie and TV show watchlist" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Watchlist</h1>
                <p className="text-gray-600 mt-1">
                  {stats.total} {stats.total === 1 ? 'item' : 'items'} • {stats.watched} watched • {stats.unwatched} to watch
                </p>
              </div>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                ← Back to Home
              </Link>
            </div>

            {/* Filters and Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-4">
                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'all', label: 'All', count: stats.total },
                    { key: 'movies', label: 'Movies', count: state.items.filter(i => i.media_type === 'movie').length },
                    { key: 'tv', label: 'TV Shows', count: state.items.filter(i => i.media_type === 'tv').length },
                    { key: 'unwatched', label: 'To Watch', count: stats.unwatched },
                    { key: 'watched', label: 'Watched', count: stats.watched }
                  ].map(({ key, label, count }) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key as FilterType)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                        filter === key
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {label} ({count})
                    </button>
                  ))}
                </div>

                {/* Sort Dropdown */}
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortType)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 bg-white"
                >
                  <option value="added_date">Recently Added</option>
                  <option value="title">Title A-Z</option>
                  <option value="rating">Highest Rated</option>
                  <option value="release_date">Release Date</option>
                </select>
              </div>

              {/* Clear Watchlist */}
              {stats.total > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                  >
                    Clear All
                  </button>
                  
                  {showClearConfirm && (
                    <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border p-4 z-10 min-w-64">
                      <p className="text-sm text-gray-900 mb-3">Clear your entire watchlist?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleClearWatchlist}
                          className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Yes, Clear All
                        </button>
                        <button
                          onClick={() => setShowClearConfirm(false)}
                          className="px-3 py-1.5 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {sortedItems.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedItems.map((item) => (
                <WatchlistCard
                  key={`${item.id}-${item.media_type}`}
                  item={item}
                  onRemove={() => removeFromWatchlist(item.id)}
                  onToggleWatched={() => toggleWatched(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// Empty state component
function EmptyState({ filter }: { filter: FilterType }) {
  const getEmptyMessage = () => {
    switch (filter) {
      case 'movies':
        return { title: 'No movies in watchlist', subtitle: 'Add some movies to get started!' }
      case 'tv':
        return { title: 'No TV shows in watchlist', subtitle: 'Add some TV shows to get started!' }
      case 'watched':
        return { title: 'No watched items', subtitle: 'Mark items as watched to see them here.' }
      case 'unwatched':
        return { title: 'No unwatched items', subtitle: 'All caught up! Add more content to watch.' }
      default:
        return { title: 'Your watchlist is empty', subtitle: 'Start building your watchlist by adding movies and TV shows!' }
    }
  }

  const { title, subtitle } = getEmptyMessage()

  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{subtitle}</p>
      <Link
        href="/search"
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
      >
        🔍 Discover Movies & TV Shows
      </Link>
    </div>
  )
}

// Individual watchlist item card
function WatchlistCard({ 
  item, 
  onRemove, 
  onToggleWatched 
}: { 
  item: WatchlistItem
  onRemove: () => void
  onToggleWatched: () => void
}) {
  const title = item.title || item.name || 'Unknown Title'
  const posterUrl = tmdbApi.getImageUrl(item.poster_path, 'w342')
  const releaseDate = item.release_date || item.first_air_date
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null
  const addedDate = new Date(item.added_date).toLocaleDateString()

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <Link href={`/${item.media_type}/${item.id}`} className="block">
        <div className="relative aspect-[2/3] bg-gray-200">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={`${title} poster`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4zM3 8v10a2 2 0 002 2h14a2 2 0 002-2V8H3z" />
              </svg>
            </div>
          )}
          
          {/* Status Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              item.media_type === 'movie' 
                ? 'bg-blue-600 text-white' 
                : 'bg-purple-600 text-white'
            }`}>
              {item.media_type === 'movie' ? 'Movie' : 'TV'}
            </span>
            {item.watched && (
              <span className="bg-green-600 text-white px-2 py-1 text-xs font-medium rounded-full">
                ✓ Watched
              </span>
            )}
          </div>

          {/* Rating */}
          {item.vote_average > 0 && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded-full text-xs">
              ⭐ {item.vote_average.toFixed(1)}
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/${item.media_type}/${item.id}`}>
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-blue-600 transition-colors">
            {title}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <span>{year}</span>
          <span>Added {addedDate}</span>
        </div>

        {item.overview && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {item.overview}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onToggleWatched}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              item.watched
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            {item.watched ? '✓ Watched' : 'Mark Watched'}
          </button>
          <button
            onClick={onRemove}
            className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
