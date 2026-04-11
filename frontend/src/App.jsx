import React, { useState } from 'react'
import { useLazyQuery } from '@apollo/client'
import SearchBar from './components/SearchBar'
import FlowVisualizer from './components/FlowVisualizer'
import { GET_COURSE } from './graphql/queries'

// ── Building silhouettes background ──────────────────────────────────────────
function BuildingSilhouettes() {
  const color = 'rgba(150, 130, 235, 0.38)'
  const colorFaint = 'rgba(150, 130, 235, 0.22)'

  // Tower outline path with crenellated battlements at top
  const tower = (x, ytop, width, merlon_h, merlon_count) => {
    const x2 = x + width
    const unit = width / merlon_count
    const mw = unit * 0.56   // merlon width
    const cw = unit * 0.44   // crenel width
    let d = `M${x},900 L${x},${ytop} `
    let cx = x
    for (let i = 0; i < merlon_count; i++) {
      d += `L${cx},${ytop - merlon_h} L${cx + mw},${ytop - merlon_h} L${cx + mw},${ytop} `
      cx += mw + cw
      if (i < merlon_count - 1) d += `L${cx},${ytop} `
    }
    d += `L${x2},${ytop} L${x2},900 Z`
    return d
  }

  // Gothic pointed arch window path
  const arch = (x, y, w, h) =>
    `M${x},${y + h} L${x},${y + h * 0.5} Q${x + w / 2},${y - 3} ${x + w},${y + h * 0.5} L${x + w},${y + h}`

  // Windows for a tower: cols × rows
  const windows = (cols, rows, prefix) =>
    rows.flatMap(y => cols.map(x => (
      <path key={`${prefix}-${x}-${y}`} d={arch(x, y, 14, 26)} stroke={colorFaint} strokeWidth="0.8" />
    )))

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ══ RIGHT CLUSTER ══ */}

      {/* Tall primary tower */}
      <path d={tower(1058, 165, 92, 24, 4)} stroke={color} strokeWidth="1.5" />
      {windows([1068, 1091, 1114], [215, 270, 325, 380, 435, 490, 548], 'rA')}

      {/* Secondary tower (right) */}
      <path d={tower(1180, 305, 60, 18, 3)} stroke={color} strokeWidth="1.2" />
      {windows([1189, 1210], [345, 395, 445, 498, 548], 'rB')}

      {/* Slender far-right tower */}
      <path d={tower(1270, 370, 46, 14, 2)} stroke={color} strokeWidth="1" />
      {windows([1279], [410, 455, 505, 555], 'rC')}

      {/* Connecting body */}
      <rect x="872" y="455" width="186" height="445" stroke={color} strokeWidth="1.3" />
      {[492, 548, 608, 668].flatMap(y =>
        [886, 912, 938, 966, 992].map(x => (
          <rect key={`rD-${x}-${y}`} x={x} y={y} width="15" height="24" rx="7"
            stroke={colorFaint} strokeWidth="0.8" />
        ))
      )}
      <line x1="872" y1="490" x2="1058" y2="490" stroke={color} strokeWidth="1" />
      <line x1="1150" y1="455" x2="1180" y2="455" stroke={color} strokeWidth="1" />

      {/* Left flanking tower */}
      <path d={tower(802, 385, 70, 18, 3)} stroke={color} strokeWidth="1.2" />
      {windows([814, 838], [425, 472, 522, 572, 622], 'rE')}
      <line x1="802" y1="455" x2="872" y2="455" stroke={color} strokeWidth="1" />

      {/* ══ LEFT CLUSTER ══ */}

      {/* Tall primary tower */}
      <path d={tower(290, 165, 92, 24, 4)} stroke={color} strokeWidth="1.5" />
      {windows([300, 323, 346], [215, 270, 325, 380, 435, 490, 548], 'lA')}

      {/* Secondary tower (left) */}
      <path d={tower(200, 305, 60, 18, 3)} stroke={color} strokeWidth="1.2" />
      {windows([209, 230], [345, 395, 445, 498, 548], 'lB')}

      {/* Slender far-left tower */}
      <path d={tower(124, 370, 46, 14, 2)} stroke={color} strokeWidth="1" />
      {windows([133], [410, 455, 505, 555], 'lC')}

      {/* Connecting body */}
      <rect x="382" y="455" width="186" height="445" stroke={color} strokeWidth="1.3" />
      {[492, 548, 608, 668].flatMap(y =>
        [394, 420, 446, 472, 498].map(x => (
          <rect key={`lD-${x}-${y}`} x={x} y={y} width="15" height="24" rx="7"
            stroke={colorFaint} strokeWidth="0.8" />
        ))
      )}
      <line x1="382" y1="490" x2="568" y2="490" stroke={color} strokeWidth="1" />
      <line x1="260" y1="455" x2="290" y2="455" stroke={color} strokeWidth="1" />

      {/* Right flanking tower */}
      <path d={tower(568, 385, 70, 18, 3)} stroke={color} strokeWidth="1.2" />
      {windows([580, 604], [425, 472, 522, 572, 622], 'lE')}
      <line x1="568" y1="455" x2="638" y2="455" stroke={color} strokeWidth="1" />
    </svg>
  )
}

// ── Logo icon ─────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: 'rgba(123, 108, 246, 0.9)' }}
      >
        {/* Simple tree icon */}
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 2 L6 8 H8 L5 13 H9 V18 H11 V13 H15 L12 8 H14 Z" fill="white" />
        </svg>
      </div>
      <div>
        <div className="text-white font-bold text-base leading-none">UofTree</div>
        <div className="text-xs leading-none mt-0.5" style={{ color: 'rgba(123,108,246,0.8)' }}>Rank</div>
      </div>
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [courseData, setCourseData] = useState(null)
  const [notFound, setNotFound] = useState(false)

  const [fetchCourse, { loading, error }] = useLazyQuery(GET_COURSE, {
    onCompleted: (data) => {
      if (data.course) {
        setCourseData(data.course)
        setNotFound(false)
      } else {
        setCourseData(null)
        setNotFound(true)
      }
    },
  })

  function handleSearch(code) {
    setCourseData(null)
    setNotFound(false)
    fetchCourse({ variables: { code } })
  }

  // ── Results view ────────────────────────────────────────────────────────────
  if (courseData) {
    return (
      <div
        className="min-h-screen flex flex-col font-sans"
        style={{ background: '#06061a', color: '#f1f5f9' }}
      >
        <header className="px-8 py-4 flex items-center justify-between border-b border-white/5">
          <button onClick={() => setCourseData(null)}>
            <Logo />
          </button>
          <button
            className="text-sm transition"
            style={{ color: 'rgba(255,255,255,0.5)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
          >
            Sign in
          </button>
        </header>

        <div className="px-8 py-6 flex-1 flex flex-col">
          <div className="flex items-center gap-4 mb-5">
            <div className="flex-1 max-w-xl">
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>
          <h2 className="text-base font-semibold mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Prerequisite tree for{' '}
            <span style={{ color: '#7B6CF6' }} className="font-mono">{courseData.code}</span>
            {' '}— {courseData.name}
          </h2>
          <div className="flex-1 min-h-[580px]">
            <FlowVisualizer courseData={courseData} />
          </div>
        </div>
      </div>
    )
  }

  // ── Landing page ────────────────────────────────────────────────────────────
  return (
    <div
      className="relative min-h-screen flex flex-col font-sans overflow-hidden"
      style={{ background: '#06061a', color: '#f1f5f9' }}
    >
      {/* Center radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 48%, rgba(70,45,160,0.45) 0%, transparent 68%)',
        }}
      />

      {/* Building silhouettes */}
      <BuildingSilhouettes />

      {/* Header */}
      <header className="relative z-10 px-8 py-5 flex items-center justify-between">
        <Logo />
        <button
          className="text-sm transition"
          style={{ color: 'rgba(255,255,255,0.55)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'white'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
        >
          Sign in
        </button>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 pb-24">

        {/* Badge pill */}
        <div
          className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm"
          style={{
            border: '1px solid rgba(255,255,255,0.18)',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: '#7B6CF6' }}
          />
          We just launched! Learn more here.
        </div>

        {/* Heading */}
        <h1
          className="font-bold leading-tight mb-8"
          style={{ fontSize: 'clamp(2rem, 4.2vw, 3.6rem)', maxWidth: '900px', width: '100%' }}
        >
          <span style={{ display: 'block', whiteSpace: 'nowrap' }}>Explore prerequisite trees from</span>
          <span style={{ color: '#8B7CF8' }}>University of Toronto</span>
          {' '}courses
        </h1>

        {/* Search bar */}
        <div className="w-full max-w-2xl mb-4">
          <SearchBar onSearch={handleSearch} landing />
        </div>

        {/* State feedback */}
        {loading && (
          <p className="mb-4 text-sm animate-pulse" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Loading…
          </p>
        )}
        {(notFound || error) && (
          <p className="mb-4 text-sm text-yellow-400">
            {error ? `Error: ${error.message}` : 'Course not found. Try CSC263H1'}
          </p>
        )}

        {/* Stats + CTA */}
        <div className="w-full max-w-2xl flex items-center justify-between px-1">
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            6 courses &amp; 5 prerequisites seeded.
          </span>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white transition"
            style={{ background: '#7B6CF6' }}
            onMouseEnter={e => e.currentTarget.style.background = '#6a5be0'}
            onMouseLeave={e => e.currentTarget.style.background = '#7B6CF6'}
            onClick={() => handleSearch('CSC373H1')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
            Explore Courses
          </button>
        </div>
      </main>
    </div>
  )
}
