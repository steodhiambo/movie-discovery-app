// Movie/Show detail page - placeholder
// TODO: Implement movie/show detail page

import Head from 'next/head'
import { useRouter } from 'next/router'

export default function MovieDetail() {
  const router = useRouter()
  const { id } = router.query

  return (
    <>
      <Head>
        <title>Movie Details - Movie Discovery App</title>
        <meta name="description" content="Movie and TV show details" />
      </Head>
      <main>
        <h1>Movie/Show Details</h1>
        <p>ID: {id}</p>
        <p>Detail page functionality - to be implemented</p>
      </main>
    </>
  )
}
