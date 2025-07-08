#  Movie Discovery App

A modern, AI-powered movie discovery platform built with React Next.js, featuring trending content, personalized recommendations, and smart watchlist management.

![React Next.js](https://img.shields.io/badge/React_Next.js-13+-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-18+-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3+-38B2AC?style=flat-square&logo=tailwind-css)

##  Features

###  **Core Features**
- **Trending Dashboard** - Discover what's popular right now
- **Advanced Search** - Find movies by title, genre, year, and more
- **Smart Watchlist** - Save and organize your must-watch movies
- **AI Recommendations** - Personalized suggestions based on your preferences
- **Genre Filtering** - Browse movies by category
- **Multi-Source Ratings** - IMDB, Rotten Tomatoes, and TMDB ratings

###  **User Experience**
- **Responsive Design** - Perfect on desktop, tablet, and mobile
- **Professional UI** - Clean, modern interface
- **Fast Performance** - Optimized with React Next.js and React
- **Accessibility** - WCAG compliant design
- **Progressive Enhancement** - Works without JavaScript

###  **Technical Features**
- **Server-Side Rendering** - Fast initial page loads
- **API Integration** - TMDB and OMDB APIs
- **Local Storage** - Persistent watchlist data
- **Error Handling** - Graceful error states
- **TypeScript** - Type-safe development

##  Quick Start

### Prerequisites
- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/steodhiambo/movie-discovery-app.git
   cd movie-discovery-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Add your API keys to `.env.local`:
   ```env
   TMDB_API_KEY=your_tmdb_api_key_here
   OMDB_API_KEY=your_omdb_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

##  Project Structure

```
movie-discovery-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── MovieCard.tsx
│   │   ├── Navigation.tsx
│   │   └── SearchBar.tsx
│   ├── context/            # React Context providers
│   │   └── WatchlistContext.tsx
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   │   └── movieApi.ts
│   ├── pages/              # React Next.js pages
│   │   ├── api/            # API routes
│   │   ├── index.tsx       # Homepage
│   │   ├── trending.tsx    # Trending page
│   │   └── search.tsx      # Search page
│   ├── styles/             # Global styles
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── public/                 # Static assets
├── tests/                  # Test files
└── docs/                   # Documentation
```

##  API Configuration

### TMDB API
1. Create account at [TMDB](https://www.themoviedb.org/)
2. Generate API key in your account settings
3. Add to `.env.local` as `TMDB_API_KEY`

### OMDB API
1. Get free API key from [OMDB](http://www.omdbapi.com/)
2. Add to `.env.local` as `OMDB_API_KEY`

##  Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # Run TypeScript checks

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

##  Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms
- **Netlify**: Use `npm run build` and deploy `out/` folder
- **AWS**: Use AWS Amplify or S3 + CloudFront
- **Docker**: Use included Dockerfile

##  Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Acknowledgments
- [TMDB](https://www.themoviedb.org/) for movie data
- [OMDB](http://www.omdbapi.com/) for additional ratings
- [React Next.js](https://nextjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Vercel](https://vercel.com/) for hosting

## Support

-  Email: support@moviediscovery.app
-  Issues: [GitHub Issues](https://github.com/yourusername/movie-discovery-app/issues)
-  Discussions: [GitHub Discussions](https://github.com/yourusername/movie-discovery-app/discussions)

---

<div align="center">
  <p>Made  by the Movie Discovery Team</p>
  <p> Star this repo if you find it helpful!</p>
</div>
