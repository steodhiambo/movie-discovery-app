// TMDB API integration - placeholder
// TODO: Implement TMDB API client

const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

export const tmdbApi = {
  // TODO: Add TMDB API methods
  getTrending: () => {
    console.log('TMDB getTrending - to be implemented')
  },
  
  searchMovies: (query: string) => {
    console.log('TMDB searchMovies - to be implemented', query)
  },
  
  getMovieDetails: (id: string) => {
    console.log('TMDB getMovieDetails - to be implemented', id)
  }
}
