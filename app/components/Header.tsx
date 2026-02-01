'use client'
import React, { useState } from 'react'
import { FaSearch, FaLeaf } from 'react-icons/fa'

interface HeaderProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export default function Header({ onSearch, isLoading }: HeaderProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-gray-100 z-50 flex items-center px-4 md:px-8 justify-between">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
        <div className="bg-black text-white p-2 rounded-lg">
            <FaLeaf size={16} />
        </div>
        <span className="text-xl font-extrabold tracking-tight text-gray-900">LogoList</span>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 max-w-xl mx-4">
        <div className="relative">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search brands, domains, or apps..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm text-black"
            />
            <FaSearch className="absolute left-3 top-2.5 text-gray-400" size={14} />
            {isLoading && (
                <div className="absolute right-3 top-2.5">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
            )}
        </div>
      </form>

      <div className="hidden md:flex items-center gap-4">
        <a href="#" className="text-sm font-medium text-gray-500 hover:text-black transition">Explore</a>
        <a href="#" className="text-sm font-medium text-gray-500 hover:text-black transition">API</a>
        <button className="bg-black text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-gray-800 transition">
            Get Access
        </button>
      </div>
    </header>
  )
}
