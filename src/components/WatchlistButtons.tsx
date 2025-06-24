// Watchlist action buttons for movie and TV detail pages
import { useState } from 'react'
import { useWatchlist } from '@/context/WatchlistContext'

interface WatchlistButtonsProps {
  id: number
  title: string
  name?: string
  poster_path: string | null
  release_date?: string
  first_air_date?: string
  vote_average: number
  overview: string
  media_type: 'movie' | 'tv'
  className?: string
}

export default function WatchlistButtons({
  id,
  title,
  name,
  poster_path,
  release_date,
  first_air_date,
  vote_average,
  overview,
  media_type,
  className = ""
}: WatchlistButtonsProps) {
  const { addToWatchlist, removeFromWatchlist, toggleWatched, isInWatchlist, isWatched } = useWatchlist()
  const [isAnimating, setIsAnimating] = useState(false)

  const inWatchlist = isInWatchlist(id)
  const watched = isWatched(id)

  const handleAddToWatchlist = () => {
    setIsAnimating(true)
    addToWatchlist({
      id,
      title: title || name || '',
      name,
      poster_path,
      release_date,
      first_air_date,
      vote_average,
      overview,
      media_type
    })
    setTimeout(() => setIsAnimating(false), 300)
  }

  const handleRemoveFromWatchlist = () => {
    setIsAnimating(true)
    removeFromWatchlist(id)
    setTimeout(() => setIsAnimating(false), 300)
  }

  const handleToggleWatched = () => {
    setIsAnimating(true)
    toggleWatched(id)
    setTimeout(() => setIsAnimating(false), 300)
  }

  return (
    <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 ${className}`}>
      {/* Add/Remove Watchlist Button */}
      {inWatchlist ? (
        <button
          onClick={handleRemoveFromWatchlist}
          disabled={isAnimating}
          className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          {isAnimating ? 'Removing...' : 'Remove from Watchlist'}
        </button>
      ) : (
        <button
          onClick={handleAddToWatchlist}
          disabled={isAnimating}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {isAnimating ? 'Adding...' : 'Add to Watchlist'}
        </button>
      )}

      {/* Mark as Watched Button */}
      {inWatchlist && (
        <button
          onClick={handleToggleWatched}
          disabled={isAnimating}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center ${
            watched
              ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white'
              : 'bg-gray-600 hover:bg-gray-700 lg:bg-gray-200 lg:hover:bg-gray-300 disabled:bg-gray-400 text-white lg:text-gray-800'
          }`}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {watched ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            )}
          </svg>
          {isAnimating 
            ? (watched ? 'Updating...' : 'Marking...') 
            : (watched ? '✓ Watched' : 'Mark as Watched')
          }
        </button>
      )}

      {/* Quick Stats (if in watchlist) */}
      {inWatchlist && (
        <div className="flex items-center text-sm text-gray-600 lg:text-gray-400 px-3">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          In Watchlist
        </div>
      )}
    </div>
  )
}

// Compact version for use in movie cards
export function WatchlistButtonCompact({
  id,
  title,
  name,
  poster_path,
  release_date,
  first_air_date,
  vote_average,
  overview,
  media_type,
  className = ""
}: WatchlistButtonsProps) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()
  const [isAnimating, setIsAnimating] = useState(false)

  const inWatchlist = isInWatchlist(id)

  const handleToggleWatchlist = () => {
    setIsAnimating(true)
    if (inWatchlist) {
      removeFromWatchlist(id)
    } else {
      addToWatchlist({
        id,
        title: title || name || '',
        name,
        poster_path,
        release_date,
        first_air_date,
        vote_average,
        overview,
        media_type
      })
    }
    setTimeout(() => setIsAnimating(false), 300)
  }

  return (
    <button
      onClick={handleToggleWatchlist}
      disabled={isAnimating}
      className={`p-2 rounded-full transition-all duration-200 ${
        inWatchlist
          ? 'bg-red-600 hover:bg-red-700 text-white'
          : 'bg-blue-600 hover:bg-blue-700 text-white'
      } ${className}`}
      title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
    >
      {isAnimating ? (
        <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
      ) : inWatchlist ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      )}
    </button>
  )
}
