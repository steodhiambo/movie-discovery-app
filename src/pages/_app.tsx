import '@/styles/globals.css'
import { WatchlistProvider } from '@/context/WatchlistContext'
import Navigation, { Footer } from '@/components/Navigation'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WatchlistProvider>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </WatchlistProvider>
  )
}