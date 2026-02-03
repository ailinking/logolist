'use client'
import React, { useState } from 'react'
import { FaSearch, FaLeaf, FaCompass } from 'react-icons/fa'
import ThemeToggle from './ThemeToggle'

interface HeaderProps {
  onSearch: (query: string, category?: string) => void;
  isLoading: boolean;
}

const POPULAR_CATEGORIES = [
  { name: 'AI', query: 'ai' },
  { name: 'SaaS', query: 'saas' },
  { name: 'Fintech', query: 'finance' },
  { name: 'Social', query: 'social' },
  { name: 'Crypto', query: 'crypto' },
  { name: 'E-commerce', query: 'shop' }
]

export default function Header({ onSearch, isLoading }: HeaderProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  const handleCategoryClick = (category: string) => {
    setQuery('')
    onSearch('', category)
  }

  const handleLogoClick = () => {
    window.location.reload()
  }

  const handleLogoKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      window.location.reload()
    }
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-100 z-50 transition-all"
      role="banner"
    >
      <div className="h-16 flex items-center px-4 md:px-8 justify-between max-w-7xl mx-auto w-full">
        {/* Logo - accessible with keyboard */}
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={handleLogoClick}
          onKeyDown={handleLogoKeyDown}
          role="button"
          tabIndex={0}
          aria-label="LogoList - Go to homepage"
        >
          <div className="bg-black text-white p-2 rounded-lg group-hover:bg-blue-600 transition-colors" aria-hidden="true">
            <FaLeaf size={16} />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-gray-900">LogoList</span>
        </div>

        {/* Search Bar - with proper labeling */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 max-w-2xl mx-4 md:mx-8"
          role="search"
          aria-label="Search for brand logos"
        >
          <div className="relative group">
            <label htmlFor="logo-search" className="sr-only">
              Search for brand logos
            </label>
            <input
              id="logo-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 10M+ brands, apps, and domains..."
              className="w-full pl-11 pr-4 py-2.5 bg-gray-100 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm text-black placeholder-gray-500 group-hover:bg-white group-hover:border-gray-200"
              aria-describedby="search-hint"
            />
            <FaSearch
              className="absolute left-4 top-3 text-gray-400 group-hover:text-blue-500 transition-colors"
              size={14}
              aria-hidden="true"
            />
            <span id="search-hint" className="sr-only">
              Enter a company name, brand, or domain to search for logos
            </span>
            {isLoading && (
              <div className="absolute right-3 top-2.5" role="status" aria-label="Loading search results">
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent" aria-hidden="true"></div>
                <span className="sr-only">Loading...</span>
              </div>
            )}
          </div>
        </form>

        {/* Right Actions */}
        <nav className="hidden md:flex items-center gap-4" aria-label="Quick actions">
          <button
            className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition"
            aria-haspopup="true"
          >
            <FaCompass className="text-gray-400" aria-hidden="true" /> Categories
          </button>
          <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" role="separator" aria-hidden="true"></div>
          <a
            href="#"
            className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition"
          >
            Submit Brand
          </a>
          <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" role="separator" aria-hidden="true"></div>
          <ThemeToggle />
        </nav>
      </div>

      {/* Sub-header Categories */}
      <nav
        className="h-10 border-t border-gray-50 flex items-center px-4 md:px-8 max-w-7xl mx-auto w-full overflow-x-auto no-scrollbar"
        aria-label="Trending categories"
      >
        <span className="text-xs font-semibold text-gray-500 mr-4 uppercase tracking-wider shrink-0" aria-hidden="true">Trending:</span>
        <div className="flex gap-2" role="list">
          {POPULAR_CATEGORIES.map(cat => (
            <button
              key={cat.name}
              onClick={() => handleCategoryClick(cat.query)}
              className="px-3 py-1 text-xs font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors whitespace-nowrap"
              role="listitem"
              aria-label={`Browse ${cat.name} logos`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </nav>
    </header>
  )
}
