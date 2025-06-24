// Time window selector for trending content
import { useState } from 'react'

interface TimeWindowSelectorProps {
  value: 'day' | 'week'
  onChange: (timeWindow: 'day' | 'week') => void
  loading?: boolean
  className?: string
}

export default function TimeWindowSelector({
  value,
  onChange,
  loading = false,
  className = ""
}: TimeWindowSelectorProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleChange = async (newValue: 'day' | 'week') => {
    if (newValue === value || loading) return

    setIsAnimating(true)
    onChange(newValue)
    
    // Reset animation after a short delay
    setTimeout(() => setIsAnimating(false), 300)
  }

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <span className="text-sm font-medium text-gray-700 flex items-center">
        <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        Trending:
      </span>
      
      <div className="relative">
        <div className={`flex bg-gray-100 rounded-lg p-1 transition-all duration-300 ${
          isAnimating ? 'scale-105' : 'scale-100'
        } ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
          <button
            onClick={() => handleChange('day')}
            disabled={loading}
            className={`relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              value === 'day'
                ? 'bg-white text-blue-600 shadow-sm transform scale-105'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Today
            </span>
            {value === 'day' && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
            )}
          </button>
          
          <button
            onClick={() => handleChange('week')}
            disabled={loading}
            className={`relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              value === 'week'
                ? 'bg-white text-blue-600 shadow-sm transform scale-105'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              This Week
            </span>
            {value === 'week' && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
          </div>
        )}
      </div>
    </div>
  )
}

// Content type tabs component
interface ContentTypeTabsProps {
  value: 'all' | 'movies' | 'tv'
  onChange: (type: 'all' | 'movies' | 'tv') => void
  counts?: {
    all: number
    movies: number
    tv: number
  }
  className?: string
}

export function ContentTypeTabs({
  value,
  onChange,
  counts,
  className = ""
}: ContentTypeTabsProps) {
  const tabs = [
    { 
      key: 'all' as const, 
      label: 'All Content', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5m14 14H5" />
        </svg>
      )
    },
    { 
      key: 'movies' as const, 
      label: 'Movies', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4zM3 8v10a2 2 0 002 2h14a2 2 0 002-2V8H3z" />
        </svg>
      )
    },
    { 
      key: 'tv' as const, 
      label: 'TV Shows', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    }
  ]

  return (
    <div className={`flex space-x-1 bg-gray-100 rounded-lg p-1 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            value === tab.key
              ? 'bg-white text-blue-600 shadow-sm transform scale-105'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <span className="flex items-center">
            {tab.icon}
            <span className="ml-2">{tab.label}</span>
            {counts && counts[tab.key] > 0 && (
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                value === tab.key 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {counts[tab.key]}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  )
}
