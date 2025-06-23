// OMDB API integration - placeholder
// TODO: Implement OMDB API client

const OMDB_API_KEY = process.env.OMDB_API_KEY
const OMDB_BASE_URL = 'http://www.omdbapi.com'

export const omdbApi = {
  // TODO: Add OMDB API methods
  searchMovies: (query: string) => {
    console.log('OMDB searchMovies - to be implemented', query)
  },
  
  getMovieDetails: (id: string) => {
    console.log('OMDB getMovieDetails - to be implemented', id)
  }
}
