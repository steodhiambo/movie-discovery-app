// Generic detail page - redirects to specific movie or TV pages
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function GenericDetail() {
  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    if (id) {
      // This is a fallback page - redirect to search or home
      // In practice, users should land on /movie/[id] or /tv/[id] directly
      router.replace('/search')
    }
  }, [id, router])

  return (
    <>
      <Head>
        <title>Redirecting... - Movie Discovery App</title>
        <meta name="description" content="Redirecting to search page" />
      </Head>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    </>
  )
}
