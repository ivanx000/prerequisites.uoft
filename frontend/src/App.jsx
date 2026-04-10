import React, { useState } from 'react'
import { useLazyQuery } from '@apollo/client'
import SearchBar from './components/SearchBar'
import FlowVisualizer from './components/FlowVisualizer'
import { GET_COURSE } from './graphql/queries'

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

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100 font-sans">
      {/* Header */}
      <header className="px-6 py-5 border-b border-gray-800 flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-uoft-gold tracking-tight">
            UofTree
          </h1>
          <p className="text-gray-400 text-sm">
            University of Toronto — Course Prerequisite Visualizer
          </p>
        </div>
      </header>

      {/* Search */}
      <div className="px-6 py-8 flex flex-col items-center gap-3">
        <p className="text-gray-400 text-sm">
          Enter a course code to explore its prerequisite tree
        </p>
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Content */}
      <div className="px-6 flex-1 flex flex-col">
        {loading && (
          <p className="text-gray-400 text-center mt-16 animate-pulse">
            Loading prerequisite tree…
          </p>
        )}
        {error && (
          <p className="text-red-400 text-center mt-16">
            Error: {error.message}
          </p>
        )}
        {notFound && (
          <p className="text-yellow-400 text-center mt-16">
            Course not found. Try <span className="font-mono">CSC263H1</span> or{' '}
            <span className="font-mono">CSC373H1</span>.
          </p>
        )}

        {courseData && (
          <div className="flex-1 flex flex-col min-h-[600px] pb-6">
            <h2 className="text-base font-semibold mb-3 text-gray-200">
              Prerequisite tree for{' '}
              <span className="font-mono text-uoft-gold">{courseData.code}</span>
              {' '}—{' '}
              <span className="text-gray-300">{courseData.name}</span>
            </h2>
            <div className="flex-1">
              <FlowVisualizer courseData={courseData} />
            </div>
          </div>
        )}

        {!loading && !courseData && !notFound && (
          <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
            Search for a course above to visualize its prerequisite tree.
          </div>
        )}
      </div>
    </div>
  )
}
