// Cast and Crew component for movie/TV detail pages
import Image from 'next/image'
import { tmdbApi } from '@/lib/tmdb'

interface CastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
}

interface CrewMember {
  id: number
  name: string
  job: string
  department: string
  profile_path: string | null
}

interface CastCrewProps {
  cast?: CastMember[]
  crew?: CrewMember[]
  maxCast?: number
  maxCrew?: number
}

export default function CastCrew({ 
  cast = [], 
  crew = [], 
  maxCast = 10, 
  maxCrew = 6 
}: CastCrewProps) {
  const displayCast = cast.slice(0, maxCast)
  const displayCrew = crew
    .filter(member => ['Director', 'Producer', 'Writer', 'Screenplay', 'Executive Producer'].includes(member.job))
    .slice(0, maxCrew)

  if (displayCast.length === 0 && displayCrew.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      {/* Cast Section */}
      {displayCast.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center sm:text-left">Cast</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {displayCast.map((actor) => (
              <div key={actor.id} className="text-center group">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 transition-transform duration-200 group-hover:scale-105">
                  {actor.profile_path ? (
                    <Image
                      src={tmdbApi.getImageUrl(actor.profile_path, 'w185') || ''}
                      alt={actor.name}
                      fill
                      className="object-cover rounded-full shadow-md"
                      sizes="(max-width: 640px) 64px, 80px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center shadow-md">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <h4 className="font-semibold text-xs sm:text-sm text-gray-900 mb-1 line-clamp-2 leading-tight">{actor.name}</h4>
                <p className="text-xs text-gray-600 line-clamp-2 leading-tight">{actor.character}</p>
              </div>
            ))}
          </div>
          {cast.length > maxCast && (
            <div className="text-center mt-6">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                View All Cast ({cast.length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Crew Section */}
      {displayCrew.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center sm:text-left">Key Crew</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {displayCrew.map((member) => (
              <div key={`${member.id}-${member.job}`} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0">
                  {member.profile_path ? (
                    <Image
                      src={tmdbApi.getImageUrl(member.profile_path, 'w185') || ''}
                      alt={member.name}
                      fill
                      className="object-cover rounded-full shadow-md"
                      sizes="(max-width: 640px) 48px, 56px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center shadow-md">
                      <svg className="w-6 h-6 sm:w-7 sm:h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-sm sm:text-base text-gray-900 truncate">{member.name}</h4>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{member.job}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Similar Content Component
interface SimilarContentProps {
  similar?: any[]
  recommendations?: any[]
  type: 'movie' | 'tv'
  maxItems?: number
}

export function SimilarContent({ 
  similar = [], 
  recommendations = [], 
  type,
  maxItems = 6 
}: SimilarContentProps) {
  // Combine and deduplicate similar and recommended content
  const allContent = [...similar, ...recommendations]
  const uniqueContent = allContent.filter((item, index, self) => 
    index === self.findIndex(t => t.id === item.id)
  ).slice(0, maxItems)

  if (uniqueContent.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center sm:text-left">You Might Also Like</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {uniqueContent.map((item) => {
          const title = item.title || item.name
          const posterUrl = tmdbApi.getImageUrl(item.poster_path, 'w342')
          const releaseDate = item.release_date || item.first_air_date
          const year = releaseDate ? new Date(releaseDate).getFullYear() : null

          return (
            <a
              key={item.id}
              href={`/${type}/${item.id}`}
              className="group block hover:scale-105 transition-all duration-200 hover:shadow-lg"
            >
              <div className="relative aspect-[2/3] bg-gray-200 rounded-lg overflow-hidden mb-3 shadow-md group-hover:shadow-lg transition-shadow duration-200">
                {posterUrl ? (
                  <Image
                    src={posterUrl}
                    alt={`${title} poster`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4zM3 8v10a2 2 0 002 2h14a2 2 0 002-2V8H3z" />
                    </svg>
                  </div>
                )}
                {item.vote_average > 0 && (
                  <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-black bg-opacity-80 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium">
                    ⭐ {item.vote_average.toFixed(1)}
                  </div>
                )}
              </div>
              <h4 className="font-semibold text-xs sm:text-sm text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 leading-tight">
                {title}
              </h4>
              {year && (
                <p className="text-xs text-gray-600 mt-1">{year}</p>
              )}
            </a>
          )
        })}
      </div>
    </div>
  )
}
