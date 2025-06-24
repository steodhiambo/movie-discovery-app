// SearchBar component with real-time search and debouncing
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'

interface SearchBarProps {
  onSearch?: (query: string) => void
  placeholder?: string
  initialValue?: string
  showFilters?: boolean
  className?: string
}

export default function SearchBar({
  onSearch,
  placeholder = "Search movies and TV shows...",
  initialValue = "",
  showFilters = false,
  className = ""
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Debounce search to avoid too many API calls
  const debounceSearch = useCallback(
    debounce((searchQuery: string) => {
      if (onSearch) {
        onSearch(searchQuery)
      } else if (searchQuery.trim()) {
        // Navigate to search page if no onSearch handler provided
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      }
      setIsLoading(false)
    }, 500),
    [onSearch, router]
  )

  useEffect(() => {
    if (query.trim().length > 0) {
      setIsLoading(true)
      debounceSearch(query)
    } else {
      setIsLoading(false)
    }
  }, [query, debounceSearch])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setIsLoading(true)
      if (onSearch) {
        onSearch(query.trim())
      } else {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      }
    }
  }

  const handleClear = () => {
    setQuery('')
    if (onSearch) {
      onSearch('')
    }
  }

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Search Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />

          {/* Loading Spinner or Clear Button */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            ) : query ? (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : null}
          </div>
        </div>

        {/* Search Button (hidden but functional for form submission) */}
        <button type="submit" className="sr-only">
          Search
        </button>
      </form>

      {/* Quick Search Suggestions (optional) */}
      {showFilters && (
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">Popular:</span>
          {['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi'].map((genre) => (
            <button
              key={genre}
              onClick={() => setQuery(genre)}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors duration-200"
            >
              {genre}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}
