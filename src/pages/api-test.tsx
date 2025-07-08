// API Test Page - Test the API integration
import { useState } from 'react'
import Head from 'next/head'
import { validateApiKeys } from '../lib/config'

export default function ApiTestPage() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const runTests = async () => {
    setIsLoading(true)
    setTestResults([])
    
    const results: string[] = []
    
    try {
      // 1. Validate API keys
      results.push('🧪 Testing Movie Discovery API Integration...')
      results.push('')
      
      results.push('1. Validating API Keys...')
      const validation = validateApiKeys()
      if (!validation.isValid) {
        results.push('❌ API Key validation failed:')
        validation.errors.forEach(error => results.push(`   - ${error}`))
        setTestResults([...results])
        setIsLoading(false)
        return
      }
      results.push('✅ API keys are configured')
      results.push('')
      
      // 2. Test TMDB API
      results.push('2. Testing TMDB API...')
      setTestResults([...results])
      
      const { tmdbApi } = await import('../lib/tmdb')
      const trendingMovies = await tmdbApi.getTrending('movie', 'day')
      results.push(`✅ TMDB: Found ${trendingMovies.results.length} trending movies`)
      
      if (trendingMovies.results.length > 0) {
        const firstMovie = trendingMovies.results[0]
        results.push(`   Sample: "${(firstMovie as any).title || (firstMovie as any).name}" (ID: ${firstMovie.id})`)
      }
      results.push('')
      setTestResults([...results])
      
      // 3. Test TMDB search
      results.push('3. Testing TMDB Search...')
      setTestResults([...results])
      
      const searchResults = await tmdbApi.searchMovies('Inception')
      results.push(`✅ TMDB Search: Found ${searchResults.results.length} results for "Inception"`)
      results.push('')
      setTestResults([...results])
      
      // 4. Test OMDB API (if we can make requests)
      results.push('4. Testing OMDB API...')
      setTestResults([...results])
      
      const { omdbApi } = await import('../lib/omdb')
      if (omdbApi.canMakeRequest()) {
        try {
          const omdbResult = await omdbApi.getByTitle('Inception', 2010, 'movie')
          results.push(`✅ OMDB: Found "${omdbResult.Title}" (${omdbResult.Year})`)
          const rtRating = omdbResult.Ratings?.find(r => r.Source === 'Rotten Tomatoes')?.Value || 'N/A'
          results.push(`   IMDB Rating: ${omdbResult.imdbRating}, RT: ${rtRating}`)
        } catch (error) {
          results.push(`⚠️  OMDB: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      } else {
        results.push('⚠️  OMDB: Rate limit reached, skipping test')
      }
      results.push('')
      setTestResults([...results])
      
      // 5. Test unified Movie API
      results.push('5. Testing Unified Movie API...')
      setTestResults([...results])
      
      const { movieApi } = await import('../lib/movieApi')
      const enhancedSearch = await movieApi.search({
        query: 'The Dark Knight',
        includeOMDBData: false // Skip OMDB to avoid rate limits in testing
      })
      results.push(`✅ Movie API: Found ${enhancedSearch.results.length} results`)
      
      if (enhancedSearch.results.length > 0) {
        const movie = enhancedSearch.results[0]
        results.push(`   Sample: "${movie.title}" (TMDB: ${movie.vote_average}/10)`)
      }
      results.push('')
      setTestResults([...results])
      
      // 6. Test image URL generation
      results.push('6. Testing Image URL Generation...')
      if (trendingMovies.results.length > 0) {
        const movie = trendingMovies.results[0]
        if (movie.poster_path) {
          const posterUrl = tmdbApi.getImageUrl(movie.poster_path, 'w500')
          results.push(`✅ Image URL: ${posterUrl}`)
        }
      }
      results.push('')
      
      results.push('🎉 All API tests completed successfully!')
      
    } catch (error) {
      results.push('')
      results.push(`❌ API test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    
    setTestResults(results)
    setIsLoading(false)
  }

  return (
    <>
      <Head>
        <title>API Test - Movie Discovery App</title>
        <meta name="description" content="Test API integration" />
      </Head>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              API Integration Test
            </h1>
            
            <div className="mb-6">
              <button
                onClick={runTests}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                {isLoading ? 'Running Tests...' : 'Run API Tests'}
              </button>
            </div>
            
            {testResults.length > 0 && (
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto max-h-96">
                {testResults.map((line, index) => (
                  <div key={index} className="whitespace-pre-wrap">
                    {line}
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6 text-sm text-gray-600">
              <p><strong>Note:</strong> Make sure you have added your API keys to <code>.env.local</code>:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>TMDB_API_KEY - Get from <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">TMDB</a></li>
                <li>OMDB_API_KEY - Get from <a href="http://www.omdbapi.com/apikey.aspx" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OMDB</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
