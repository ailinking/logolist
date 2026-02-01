'use client'
import { useState, useEffect } from 'react'
import CompanyCard from './components/CompanyCard'
import KPIDashboard from './components/KPIDashboard'
import { FaSearch, FaGlobe } from 'react-icons/fa'

export default function Home() {
  const [query, setQuery] = useState('')
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(false)

  const search = async (q: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/companies?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setCompanies(data)
    } catch (error) {
      console.error('Search failed', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    search('') // Initial load
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    search(query)
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">LogoList</h1>
          <p className="text-gray-600">The centralized database for high-quality company logos.</p>
        </header>

        <KPIDashboard />

        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for any company (e.g. OpenAI, Notion, Vercel)..." 
              className="flex-1 p-4 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-black"
            />
            <button 
              type="submit" 
              className="bg-black text-white px-8 py-4 rounded-lg font-bold hover:bg-gray-800 flex items-center gap-2 cursor-pointer"
            >
              <FaSearch /> Search
            </button>
          </form>
          <div className="text-center mt-2 text-sm text-gray-500">
            <span className="flex items-center justify-center gap-1">
              <FaGlobe className="text-gray-400" />
              Now searching global company database via API.
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-black">Searching global database...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {companies.map((company: any) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        )}
        
        {!loading && companies.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No companies found. Try a different name.
          </div>
        )}
      </div>
    </main>
  )
}
