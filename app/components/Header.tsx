'use client'
import React, { useState } from 'react'
import { FaSearch, FaLeaf, FaCompass } from 'react-icons/fa'

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

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-100 z-50 transition-all">
      <div className="h-16 flex items-center px-4 md:px-8 justify-between max-w-7xl mx-auto w-full">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.location.reload()}>
            <div className="bg-black text-white p-2 rounded-lg group-hover:bg-blue-600 transition-colors">
                <FaLeaf size={16} />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-gray-900">LogoList</span>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="flex-1 max-w-2xl mx-4 md:mx-8">
            <div className="relative group">
                <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search 10M+ brands, apps, and domains..."
                className="w-full pl-11 pr-4 py-2.5 bg-gray-100 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm text-black placeholder-gray-400 group-hover:bg-white group-hover:border-gray-200"
                />
                <FaSearch className="absolute left-4 top-3 text-gray-400 group-hover:text-blue-500 transition-colors" size={14} />
                {isLoading && (
                    <div className="absolute right-3 top-2.5">
                        <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                    </div>
                )}
            </div>
        </form>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-6">
            <button className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black transition">
                <FaCompass className="text-gray-400" /> Categories
            </button>
            <div className="h-4 w-px bg-gray-200"></div>
            <a href="#" className="text-sm font-semibold text-gray-600 hover:text-black transition">Submit Brand</a>
        </div>
      </div>

      {/* Sub-header Categories */}
      <div className="h-10 border-t border-gray-50 flex items-center px-4 md:px-8 max-w-7xl mx-auto w-full overflow-x-auto no-scrollbar">
        <span className="text-xs font-semibold text-gray-400 mr-4 uppercase tracking-wider shrink-0">Trending:</span>
        <div className="flex gap-2">
            {POPULAR_CATEGORIES.map(cat => (
                <button
                    key={cat.name}
                    onClick={() => handleCategoryClick(cat.query)}
                    className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors whitespace-nowrap"
                >
                    {cat.name}
                </button>
            ))}
        </div>
      </div>
    </header>
  )
}
