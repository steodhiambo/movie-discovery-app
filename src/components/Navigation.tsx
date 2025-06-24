// Professional Navigation Header Component
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useWatchlist } from '@/context/WatchlistContext'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const { getWatchlistStats } = useWatchlist()
  const watchlistStats = getWatchlistStats()

  const navigation = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Trending', href: '/trending', icon: '🔥' },
    { name: 'Genres', href: '/genres', icon: '🎭' },
    { name: 'Search', href: '/search', icon: '🔍' },
    { name: 'For You', href: '/recommendations', icon: '🤖' },
    { 
      name: 'Watchlist', 
      href: '/watchlist', 
      icon: '❤️',
      badge: watchlistStats.total > 0 ? watchlistStats.total : null
    }
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return router.pathname === '/'
    }
    return router.pathname.startsWith(href)
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">🎬</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">MovieDiscover</h1>
              <p className="text-xs text-gray-500 -mt-1">AI-Powered Discovery</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </span>
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="grid grid-cols-2 gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`relative flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

// Breadcrumb Component for better navigation
interface BreadcrumbProps {
  items: Array<{
    name: string
    href?: string
    current?: boolean
  }>
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={item.name} className="flex items-center">
            {index > 0 && (
              <svg className="w-4 h-4 text-gray-400 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            {item.href && !item.current ? (
              <Link
                href={item.href}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                {item.name}
              </Link>
            ) : (
              <span
                className={`text-sm font-medium ${
                  item.current ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// Page Header Component for consistent page layouts
interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: string
  breadcrumb?: Array<{
    name: string
    href?: string
    current?: boolean
  }>
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  icon,
  breadcrumb,
  actions,
  className = ""
}: PageHeaderProps) {
  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {breadcrumb && (
          <div className="mb-4">
            <Breadcrumb items={breadcrumb} />
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
              {icon && <span className="text-3xl mr-3">{icon}</span>}
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-lg text-gray-600">{subtitle}</p>
            )}
          </div>
          
          {actions && (
            <div className="flex items-center space-x-4">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Footer Component
export function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">🎬</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">MovieDiscover</h3>
                <p className="text-sm text-slate-400">AI-Powered Movie Discovery</p>
              </div>
            </div>
            <p className="text-slate-300 max-w-md">
              Discover your next favorite movie with our AI-powered recommendation engine. 
              Explore trending films, build your watchlist, and get personalized suggestions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Explore</h4>
            <ul className="space-y-2">
              <li><Link href="/trending" className="text-slate-300 hover:text-white transition-colors">Trending</Link></li>
              <li><Link href="/genres" className="text-slate-300 hover:text-white transition-colors">Genres</Link></li>
              <li><Link href="/search" className="text-slate-300 hover:text-white transition-colors">Search</Link></li>
              <li><Link href="/recommendations" className="text-slate-300 hover:text-white transition-colors">Recommendations</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Features</h4>
            <ul className="space-y-2">
              <li><span className="text-slate-300">AI Recommendations</span></li>
              <li><span className="text-slate-300">Smart Watchlist</span></li>
              <li><span className="text-slate-300">Multi-Source Ratings</span></li>
              <li><span className="text-slate-300">Genre Discovery</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center">
          <p className="text-slate-400">
            © 2024 MovieDiscover. Built with ❤️ for movie lovers.
          </p>
        </div>
      </div>
    </footer>
  )
}
