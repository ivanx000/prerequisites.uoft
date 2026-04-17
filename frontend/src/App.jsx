import React from 'react'
import { useLazyQuery } from '@apollo/client'
import SearchBar from './components/SearchBar'
import FlowVisualizer from './components/FlowVisualizer'
import { GET_COURSE } from './graphql/queries'
import bgVideo from './assets/14471921_3840_2160_30fps.mp4'

// Timing constants (ms)
const EXIT_LANDING_MS = 320   // how long landing takes to exit before tree mounts
const EXIT_TREE_MS    = 200   // how long tree takes to exit before landing mounts

export default function App() {
  const [queriedCode, setQueriedCode]     = React.useState(null)
  // 'landing' | 'exit-landing' | 'tree' | 'exit-tree'
  const [viewState, setViewState]         = React.useState('landing')
  const [displayCourse, setDisplayCourse] = React.useState(null)
  // Incremented each time we return to landing — forces CSS re-animation
  const [landingKey, setLandingKey]       = React.useState(0)

  const [fetchCourse, { loading, error, data }] = useLazyQuery(GET_COURSE, {
    fetchPolicy: 'cache-first',
  })

  const course = data?.course

  // When a course result arrives, animate landing out then show tree
  React.useEffect(() => {
    if (!course) return
    setDisplayCourse(course)
    setViewState('exit-landing')
    const t = setTimeout(() => setViewState('tree'), EXIT_LANDING_MS)
    return () => clearTimeout(t)
  }, [course?.code])

  function handleSearch(code) {
    const normalized = (code || '').trim().toUpperCase()
    if (!normalized) return
    setQueriedCode(normalized)
    setViewState('landing') // reset in case of re-search from landing
    fetchCourse({ variables: { code: normalized } })
  }

  function handleBack() {
    setViewState('exit-tree')
    const t = setTimeout(() => {
      setViewState('landing')
      setLandingKey(k => k + 1)
      setQueriedCode(null)
    }, EXIT_TREE_MS)
    return () => clearTimeout(t)
  }

  const exitingLanding = viewState === 'exit-landing'
  const showTree       = viewState === 'tree' || viewState === 'exit-tree'
  const exitingTree    = viewState === 'exit-tree'

  // ── Shared fixed background ───────────────────────────────────────────────
  const BgLayers = () => (
    <>
      <video
        autoPlay loop muted playsInline src={bgVideo}
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
      />
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.52)', zIndex: 1 }} />
    </>
  )

  // ── Tree view ─────────────────────────────────────────────────────────────
  if (showTree) {
    return (
      <div style={{ position: 'relative', minHeight: '100vh' }}>
        <BgLayers />

        {/* Back button — fixed top-left, just a left arrow */}
        <button
          onClick={handleBack}
          aria-label="Go back"
          style={{
            position: 'fixed',
            top: 20,
            left: 20,
            zIndex: 10,
            width: 40,
            height: 40,
            background: 'rgba(255,255,255,0.88)',
            color: '#002A5C',
            border: '1.5px solid #4a90d9',
            borderRadius: '50%',
            fontSize: '18px',
            lineHeight: 1,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ←
        </button>

        {/* Tree — pops in on enter, fades out on exit */}
        <div
          className={exitingTree ? '' : 'tree-pop'}
          style={{
            position: 'relative',
            zIndex: 2,
            opacity: exitingTree ? 0 : 1,
            transition: exitingTree ? `opacity ${EXIT_TREE_MS}ms ease` : 'none',
          }}
        >
          {displayCourse && <FlowVisualizer courseData={displayCourse} />}
        </div>
      </div>
    )
  }

  // ── Landing page ──────────────────────────────────────────────────────────
  return (
    <div className="font-sans" style={{ position: 'relative', minHeight: '100vh' }}>
      <BgLayers />
      <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '0 1.5rem' }}>

          <div style={{ flexShrink: 0, height: 'calc(50vh - 110px)' }} />

          <div style={{ width: '100%', maxWidth: '700px', margin: '0 auto' }}>

            {/* Title — fades out on exit, fades in on enter */}
            <h1
              className={landingKey > 0 && !exitingLanding ? 'title-fade-in' : ''}
              style={{
                fontWeight: 800,
                lineHeight: 1.15,
                textAlign: 'left',
                marginBottom: '1.25rem',
                opacity: exitingLanding ? 0 : 1,
                transition: exitingLanding ? 'opacity 0.18s ease' : 'none',
              }}
            >
              <span style={{ display: 'block', fontSize: 'clamp(1.4rem, 2.6vw, 2.2rem)', color: '#000000' }}>
                Explore course prerequisites
              </span>
              <span style={{ display: 'block', fontSize: 'clamp(1.4rem, 2.6vw, 2.2rem)', color: '#000000' }}>
                at the{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #4a90d9 0%, #0033a0 60%, #00205b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 8px rgba(74, 144, 217, 0.65))',
                }}>
                  University of Toronto
                </span>
              </span>
            </h1>

            {/* Search bar — slides up off-screen on exit, slides down on enter */}
            <div
              key={landingKey}
              className={landingKey > 0 && !exitingLanding ? 'search-slide-down' : ''}
              style={{
                transform: exitingLanding ? 'translateY(-110vh)' : 'translateY(0)',
                transition: exitingLanding ? `transform ${EXIT_LANDING_MS}ms cubic-bezier(0.4, 0, 1, 1)` : 'none',
              }}
            >
              <SearchBar onSearch={handleSearch} landing />
            </div>
          </div>

          {loading && (
            <p style={{ marginTop: '2rem', color: 'rgba(0,0,0,0.45)', fontSize: '0.875rem' }}>
              Loading <span style={{ fontFamily: 'monospace' }}>{queriedCode}</span>…
            </p>
          )}
          {!loading && error && (
            <p style={{ marginTop: '2rem', color: '#dc2626', fontSize: '0.875rem' }}>
              Could not load course. Please try again.
            </p>
          )}
          {!loading && !error && data && !course && (
            <p style={{ marginTop: '2rem', color: 'rgba(0,0,0,0.45)', fontSize: '0.875rem' }}>
              Course <span style={{ fontFamily: 'monospace', color: '#b45309' }}>{queriedCode}</span> was not found.
            </p>
          )}

        </main>
      </div>
    </div>
  )
}
