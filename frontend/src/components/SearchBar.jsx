import React, { useState } from 'react'
import { useLazyQuery } from '@apollo/client'
import { SEARCH_COURSES } from '../graphql/queries'

export default function SearchBar({ onSearch }) {
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const [fetchSuggestions] = useLazyQuery(SEARCH_COURSES, {
    onCompleted: (data) => setSuggestions(data.courses ?? []),
  })

  function handleChange(e) {
    const value = e.target.value
    setInput(value)
    if (value.length >= 2) {
      fetchSuggestions({ variables: { search: value } })
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
      setSuggestions([])
    }
  }

  function handleSelect(code) {
    setInput(code)
    setShowSuggestions(false)
    onSearch(code)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = input.trim().toUpperCase()
    if (trimmed) {
      onSearch(trimmed)
      setShowSuggestions(false)
    }
  }

  function handleBlur() {
    // Delay so click on suggestion fires first
    setTimeout(() => setShowSuggestions(false), 150)
  }

  return (
    <div className="relative w-full max-w-xl">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={() => input.length >= 2 && setShowSuggestions(true)}
          placeholder="e.g. CSC263H1"
          className="
            flex-1 px-4 py-2.5 rounded-lg
            bg-gray-800 border border-gray-600
            text-gray-100 placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-uoft-gold focus:border-transparent
            font-mono text-sm transition
          "
        />
        <button
          type="submit"
          className="
            px-6 py-2.5 rounded-lg font-semibold text-sm
            bg-uoft-gold text-uoft-blue
            hover:brightness-110 active:scale-95 transition
          "
        >
          Search
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="
          absolute z-50 mt-1 w-full
          bg-gray-800 border border-gray-700 rounded-lg
          max-h-56 overflow-y-auto shadow-2xl
        ">
          {suggestions.map((c) => (
            <li
              key={c.code}
              onMouseDown={() => handleSelect(c.code)}
              className="
                px-4 py-2.5 cursor-pointer
                hover:bg-gray-700 transition
                flex items-center gap-3
              "
            >
              <span className="font-mono text-uoft-gold text-sm shrink-0">{c.code}</span>
              <span className="text-gray-300 text-sm truncate">{c.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
