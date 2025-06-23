// API Integration Test - Run this to verify API setup
import { movieApi, tmdbApi, omdbApi, validateApiKeys } from './index'

export async function testApiIntegration() {
  console.log('🧪 Testing Movie Discovery API Integration...\n')

  // 1. Validate API keys
  console.log('1. Validating API Keys...')
  const validation = validateApiKeys()
  if (!validation.isValid) {
    console.error('❌ API Key validation failed:')
    validation.errors.forEach(error => console.error(`   - ${error}`))
    return false
  }
  console.log('✅ API keys are configured\n')

  try {
    // 2. Test TMDB API
    console.log('2. Testing TMDB API...')
    const trendingMovies = await tmdbApi.getTrending('movie', 'day')
    console.log(`✅ TMDB: Found ${trendingMovies.results.length} trending movies`)
    
    if (trendingMovies.results.length > 0) {
      const firstMovie = trendingMovies.results[0]
      console.log(`   Sample: "${firstMovie.title || firstMovie.name}" (ID: ${firstMovie.id})`)
    }

    // 3. Test TMDB search
    console.log('\n3. Testing TMDB Search...')
    const searchResults = await tmdbApi.searchMovies('Inception')
    console.log(`✅ TMDB Search: Found ${searchResults.results.length} results for "Inception"`)

    // 4. Test OMDB API (if we can make requests)
    console.log('\n4. Testing OMDB API...')
    if (omdbApi.canMakeRequest()) {
      try {
        const omdbResult = await omdbApi.getByTitle('Inception', 2010, 'movie')
        console.log(`✅ OMDB: Found "${omdbResult.Title}" (${omdbResult.Year})`)
        console.log(`   IMDB Rating: ${omdbResult.imdbRating}, RT: ${omdbResult.Ratings?.find(r => r.Source === 'Rotten Tomatoes')?.Value || 'N/A'}`)
      } catch (error) {
        console.log(`⚠️  OMDB: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    } else {
      console.log('⚠️  OMDB: Rate limit reached, skipping test')
    }

    // 5. Test unified Movie API
    console.log('\n5. Testing Unified Movie API...')
    const enhancedSearch = await movieApi.search({
      query: 'The Dark Knight',
      includeOMDBData: false // Skip OMDB to avoid rate limits in testing
    })
    console.log(`✅ Movie API: Found ${enhancedSearch.results.length} results`)
    
    if (enhancedSearch.results.length > 0) {
      const movie = enhancedSearch.results[0]
      console.log(`   Sample: "${movie.title}" (TMDB: ${movie.vote_average}/10)`)
    }

    // 6. Test image URL generation
    console.log('\n6. Testing Image URL Generation...')
    if (trendingMovies.results.length > 0) {
      const movie = trendingMovies.results[0]
      if (movie.poster_path) {
        const posterUrl = tmdbApi.getImageUrl(movie.poster_path, 'w500')
        console.log(`✅ Image URL: ${posterUrl}`)
      }
    }

    console.log('\n🎉 All API tests completed successfully!')
    return true

  } catch (error) {
    console.error('\n❌ API test failed:', error)
    return false
  }
}

// Helper function to run tests in development
export async function runApiTests() {
  if (process.env.NODE_ENV === 'development') {
    return await testApiIntegration()
  } else {
    console.log('API tests are only available in development mode')
    return false
  }
}

export default testApiIntegration
