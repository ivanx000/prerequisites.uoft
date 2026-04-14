import React, { useState } from 'react'
import { useLazyQuery } from '@apollo/client'
import SearchBar from './components/SearchBar'
import FlowVisualizer from './components/FlowVisualizer'
import { GET_COURSE } from './graphql/queries'

export default function App() {
  const [view, setView] = useState('landing') // 'landing' | 'results'
  const [queriedCode, setQueriedCode] = useState(null)

  const [fetchCourse, { loading, error, data }] = useLazyQuery(GET_COURSE, {
    fetchPolicy: 'cache-first',
  })

  function handleSearch(code) {
    const normalized = (code || '').trim().toUpperCase()
    if (!normalized) return
    setQueriedCode(normalized)
    fetchCourse({ variables: { code: normalized } })
    setView('results')
  }

  function handleHome() {
    setView('landing')
  }

  const course = data?.course

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: '#ffffff' }}>
      {/* Navigation Bar */}
      <nav
        className="w-full py-4 px-8"
        style={{ backgroundColor: '#00205b' }}
      >
        <div className="flex items-center justify-between pl-2">
          <h1
            className="text-white font-bold text-lg cursor-pointer select-none"
            onClick={handleHome}
          >
            University of Toronto
          </h1>

          {view === 'results' && (
            <div className="w-80">
              <SearchBar onSearch={handleSearch} />
            </div>
          )}
        </div>
      </nav>

      {view === 'landing' ? (
        /* ── Landing page ─────────────────────────────────────────────────── */
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 w-full">
          <div className="w-full max-w-2xl text-center">
            <h1
              className="font-bold leading-tight mb-8 text-center"
              style={{
                fontSize: 'clamp(2rem, 4.2vw, 3.6rem)',
                color: '#000000',
                textAlign: 'center',
              }}
            >
              Explore Course Prerequisites
            </h1>

            <div className="w-full">
              <SearchBar onSearch={handleSearch} landing />
            </div>
          </div>
        </main>
      ) : (
        /* ── Results page ─────────────────────────────────────────────────── */
        <main
          className="flex-1 flex flex-col px-6 py-6"
          style={{ backgroundColor: '#030712' }}
        >
          {/* Loading state */}
          {loading && (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-gray-400 text-sm">
                Loading <span className="font-mono text-yellow-400">{queriedCode}</span>…
              </span>
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-red-400 text-sm">
                Could not load course. Please try again.
              </span>
            </div>
          )}

          {/* Not found state */}
          {!loading && !error && data && !course && (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-gray-400 text-sm">
                Course <span className="font-mono text-yellow-400">{queriedCode}</span> was not found.
              </span>
            </div>
          )}

          {/* Course found — show visualizer */}
          {!loading && course && (
            <>
              <div className="mb-4">
                <p className="font-mono font-bold text-yellow-400 text-lg leading-none">
                  {course.code}
                </p>
                <p className="text-gray-300 text-sm mt-1">{course.name}</p>
                {course.description && (
                  <p className="text-gray-500 text-xs mt-2 max-w-2xl leading-relaxed">
                    {course.description}
                  </p>
                )}
              </div>
              <FlowVisualizer courseData={course} />
            </>
          )}
        </main>
      )}
    </div>
  )
}
