// Watchlist Context for global state management
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'

export interface WatchlistItem {
  id: number
  title: string
  name?: string // For TV shows
  poster_path: string | null
  release_date?: string
  first_air_date?: string
  vote_average: number
  overview: string
  media_type: 'movie' | 'tv'
  added_date: string
  watched: boolean
  watched_date?: string
}

interface WatchlistState {
  items: WatchlistItem[]
  loading: boolean
}

type WatchlistAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_WATCHLIST'; payload: WatchlistItem[] }
  | { type: 'ADD_ITEM'; payload: WatchlistItem }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'TOGGLE_WATCHED'; payload: { id: number; watched: boolean } }
  | { type: 'CLEAR_WATCHLIST' }

interface WatchlistContextType {
  state: WatchlistState
  addToWatchlist: (item: Omit<WatchlistItem, 'added_date' | 'watched'>) => void
  removeFromWatchlist: (id: number) => void
  toggleWatched: (id: number) => void
  isInWatchlist: (id: number) => boolean
  isWatched: (id: number) => boolean
  clearWatchlist: () => void
  getWatchlistStats: () => { total: number; watched: number; unwatched: number }
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined)

const watchlistReducer = (state: WatchlistState, action: WatchlistAction): WatchlistState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }

    case 'LOAD_WATCHLIST':
      return { ...state, items: action.payload, loading: false }

    case 'ADD_ITEM':
      // Check if item already exists
      if (state.items.some(item => item.id === action.payload.id && item.media_type === action.payload.media_type)) {
        return state
      }
      return { ...state, items: [...state.items, action.payload] }

    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(item => item.id !== action.payload) }

    case 'TOGGLE_WATCHED':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? {
                ...item,
                watched: action.payload.watched,
                watched_date: action.payload.watched ? new Date().toISOString() : undefined
              }
            : item
        )
      }

    case 'CLEAR_WATCHLIST':
      return { ...state, items: [] }

    default:
      return state
  }
}

const STORAGE_KEY = 'movie-discovery-watchlist'

export const WatchlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(watchlistReducer, {
    items: [],
    loading: true
  })

  // Load watchlist from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const items = JSON.parse(stored) as WatchlistItem[]
        dispatch({ type: 'LOAD_WATCHLIST', payload: items })
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    } catch (error) {
      console.error('Failed to load watchlist from localStorage:', error)
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    if (!state.loading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
      } catch (error) {
        console.error('Failed to save watchlist to localStorage:', error)
      }
    }
  }, [state.items, state.loading])

  const addToWatchlist = (item: Omit<WatchlistItem, 'added_date' | 'watched'>) => {
    const watchlistItem: WatchlistItem = {
      ...item,
      added_date: new Date().toISOString(),
      watched: false
    }
    dispatch({ type: 'ADD_ITEM', payload: watchlistItem })
  }

  const removeFromWatchlist = (id: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }

  const toggleWatched = (id: number) => {
    const item = state.items.find(item => item.id === id)
    if (item) {
      dispatch({ type: 'TOGGLE_WATCHED', payload: { id, watched: !item.watched } })
    }
  }

  const isInWatchlist = (id: number) => {
    return state.items.some(item => item.id === id)
  }

  const isWatched = (id: number) => {
    const item = state.items.find(item => item.id === id)
    return item?.watched || false
  }

  const clearWatchlist = () => {
    dispatch({ type: 'CLEAR_WATCHLIST' })
  }

  const getWatchlistStats = () => {
    const total = state.items.length
    const watched = state.items.filter(item => item.watched).length
    const unwatched = total - watched
    return { total, watched, unwatched }
  }

  const value: WatchlistContextType = {
    state,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatched,
    isInWatchlist,
    isWatched,
    clearWatchlist,
    getWatchlistStats
  }

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  )
}

export const useWatchlist = () => {
  const context = useContext(WatchlistContext)
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider')
  }
  return context
}

export default WatchlistContext
