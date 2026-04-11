import React from 'react'
import SearchBar from './components/SearchBar'

export default function App() {
  function handleSearch() {}

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 font-sans"
      style={{
        background: 'linear-gradient(180deg, #050513 0%, #0b0b25 55%, #121241 100%)',
        color: '#f1f5f9',
      }}
    >
      <main className="w-full max-w-2xl text-center">
        <h1
          className="font-bold leading-tight mb-8"
          style={{ fontSize: 'clamp(2rem, 4.2vw, 3.6rem)' }}
        >
          <span style={{ display: 'block', whiteSpace: 'nowrap' }}>
            Explore prerequisite trees from
          </span>
          <span style={{ color: '#8B7CF8' }}>University of Toronto</span>
          {' '}courses
        </h1>

        <div className="w-full">
          <SearchBar onSearch={handleSearch} landing />
        </div>
      </main>
    </div>
  )
}
