import React from 'react'
import { useLazyQuery } from '@apollo/client'
import SearchBar from './components/SearchBar'
import FlowVisualizer from './components/FlowVisualizer'
import { GET_COURSE } from './graphql/queries'
import bgVideo from './assets/14471921_3840_2160_30fps.mp4'

export default function App() {
  const [queriedCode, setQueriedCode] = React.useState(null)

  const [fetchCourse, { loading, error, data }] = useLazyQuery(GET_COURSE, {
    fetchPolicy: 'cache-first',
  })

  function handleSearch(code) {
    const normalized = (code || '').trim().toUpperCase()
    if (!normalized) return
    setQueriedCode(normalized)
    fetchCourse({ variables: { code: normalized } })
  }

  const course = data?.course
  const hasCourse = !!course

  return (
    <div className="font-sans" style={{ position: 'relative', minHeight: '100vh' }}>

      {/* ── Video background ──────────────────────────────────────────────── */}
      <video
        autoPlay
        loop
        muted
        playsInline
        src={bgVideo}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      />

      {/* ── Gradient overlay ─────────────────────────────────────────────── */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(255, 255, 255, 0.78)',
          zIndex: 1,
        }}
      />

      {/* ── Content layer ────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: '0 1.5rem',
          }}
        >
          {/* Spacer — collapses when a course is found, sliding everything up */}
          <div
            style={{
              flexShrink: 0,
              height: hasCourse ? '0' : 'calc(30vh - 80px)',
              transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />

          {/* Search + heading */}
          <div style={{ width: '100%', maxWidth: '640px', margin: '0 auto' }}>
            {/* Heading — fades out and collapses once a result appears */}
            <h1
              style={{
                fontSize: 'clamp(2rem, 4.2vw, 3.6rem)',
                fontWeight: 700,
                color: '#000000',
                textAlign: 'center',
                lineHeight: 1.15,
                opacity: hasCourse ? 0 : 1,
                maxHeight: hasCourse ? '0' : '120px',
                marginBottom: hasCourse ? 0 : '2rem',
                overflow: 'hidden',
                transition: 'opacity 0.4s ease, max-height 0.6s ease, margin-bottom 0.4s ease',
              }}
            >
              Explore Course Prerequisites
            </h1>

            <SearchBar onSearch={handleSearch} landing />
          </div>

          {/* Status messages */}
          {loading && (
            <p
              style={{
                textAlign: 'center',
                marginTop: '2rem',
                color: 'rgba(0,0,0,0.45)',
                fontSize: '0.875rem',
              }}
            >
              Loading <span style={{ fontFamily: 'monospace' }}>{queriedCode}</span>…
            </p>
          )}

          {!loading && error && (
            <p
              style={{
                textAlign: 'center',
                marginTop: '2rem',
                color: '#dc2626',
                fontSize: '0.875rem',
              }}
            >
              Could not load course. Please try again.
            </p>
          )}

          {!loading && !error && data && !course && (
            <p
              style={{
                textAlign: 'center',
                marginTop: '2rem',
                color: 'rgba(0,0,0,0.45)',
                fontSize: '0.875rem',
              }}
            >
              Course{' '}
              <span style={{ fontFamily: 'monospace', color: '#b45309' }}>{queriedCode}</span>{' '}
              was not found.
            </p>
          )}

          {/* FlowVisualizer — fades in when course is ready */}
          <div
            style={{
              width: '100%',
              maxWidth: '960px',
              margin: '1.5rem auto 0',
              opacity: hasCourse ? 1 : 0,
              maxHeight: hasCourse ? '640px' : '0',
              overflow: 'hidden',
              transition: 'opacity 0.5s ease 0.3s, max-height 0.6s ease 0.2s',
            }}
          >
            {course && (
              <>
                <div style={{ marginBottom: '0.75rem' }}>
                  <p
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      color: '#b45309',
                    }}
                  >
                    {course.code}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'rgba(0,0,0,0.6)', marginTop: '0.25rem' }}>
                    {course.name}
                  </p>
                </div>
                <FlowVisualizer courseData={course} />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
