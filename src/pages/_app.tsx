import '@/styles/globals.css'
import { WatchlistProvider } from '@/context/WatchlistContext'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WatchlistProvider>
      <Component {...pageProps} />
    </WatchlistProvider>
  )
}