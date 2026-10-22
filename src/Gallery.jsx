
import { useCallback, useMemo, useReducer, useState } from 'react'
import useFetchPhotos from './useFetchPhotos'

const STORAGE_KEY = 'celebrare-favourite-photos'

function getSavedFavourites() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    const parsed = saved ? JSON.parse(saved) : []

    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function favouritesReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_FAVOURITE':
      return state.includes(action.id)
        ? state.filter((id) => id !== action.id)
        : [...state, action.id]

    default:
      return state
  }
}

export default function Gallery() {
  const { photos, loading, error } = useFetchPhotos()

  const [search, setSearch] = useState('')
  const [favourites, dispatch] = useReducer(
    favouritesReducer,
    undefined,
    getSavedFavourites
  )

  const handleSearch = useCallback((event) => {
    setSearch(event.target.value)
  }, [])

  const filteredPhotos = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    return photos.filter((photo) =>
      photo.author.toLowerCase().includes(keyword)
    )
  }, [photos, search])

  const toggleFavourite = (id) => {
    dispatch({ type: 'TOGGLE_FAVOURITE', id })

    const updated = favourites.includes(id)
      ? favourites.filter((item) => item !== id)
      : [...favourites, id]

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {
      console.error('Unable to save favourites in localStorage.')
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-600">
            Celebrare · React Assignment
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
            Discover the Gallery
          </h1>

          <p className="mt-3 max-w-xl text-slate-500">
            Explore beautiful photographs and save your favourites.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="search"
              value={search}
              onChange={handleSearch}
              placeholder="Search by author name..."
              aria-label="Search photos by author"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200 sm:max-w-md"
            />

            <p className="text-sm text-slate-500">
              {filteredPhotos.length} photos found
            </p>

            <p className="text-sm font-medium text-violet-700 sm:ml-auto">
              ♥ {favourites.length} favourites
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        {loading && (
          <div
            className="flex min-h-64 flex-col items-center justify-center gap-4"
            role="status"
          >
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
            <p className="text-slate-600">Loading beautiful photos...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-semibold text-red-700">{error}</p>
            <p className="mt-2 text-sm text-red-600">
              Check your internet connection and refresh the page.
            </p>
          </div>
        )}

        {!loading && !error && filteredPhotos.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-lg font-semibold">No photos found</p>
            <p className="mt-2 text-slate-500">
              Try searching with another author name.
            </p>
          </div>
        )}

        {!loading && !error && filteredPhotos.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredPhotos.map((photo) => {
              const isFavourite = favourites.includes(photo.id)

              return (
                <article
                  key={photo.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative overflow-hidden bg-slate-100">
                    <img
                      src={photo.download_url}
                      alt={`Photograph by ${photo.author}`}
                      loading="lazy"
                      className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <button
                      type="button"
                      onClick={() => toggleFavourite(photo.id)}
                      aria-label={
                        isFavourite
                          ? `Remove ${photo.author} from favourites`
                          : `Add ${photo.author} to favourites`
                      }
                      aria-pressed={isFavourite}
                      className={`absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl shadow-md transition hover:scale-110 ${
                        isFavourite
                          ? 'text-red-500'
                          : 'text-slate-400 hover:text-red-500'
                      }`}
                    >
                      {isFavourite ? '♥' : '♡'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                        Photographer
                      </p>
                      <h2 className="mt-1 truncate font-semibold text-slate-800">
                        {photo.author}
                      </h2>
                    </div>

                    <span className="shrink-0 rounded-lg bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700">
                      #{photo.id}
                    </span>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <footer className="border-t border-slate-200 bg-white px-5 py-6 text-center text-sm text-slate-500">
        Built with React, Vite and Tailwind CSS
      </footer>
    </main>
  )
}
