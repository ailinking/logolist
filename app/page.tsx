"use client"
import { useState, useEffect } from "react"
import CompanyCard from "./components/CompanyCard"
import KPIDashboard from "./components/KPIDashboard"
import Header from "./components/Header"

interface EnrichedCompany {
    id: number | string;
    name: string;
    domain: string;
    logoUrl: string;
    downloadCount: number;
    isExternal?: boolean;
    type?: "logo" | "favicon";
}

export default function Home() {
  const [query, setQuery] = useState("")
  const [companies, setCompanies] = useState<EnrichedCompany[]>([])
  const [loading, setLoading] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<string | null>(null)

  const search = async (q: string, category?: string) => {
    setLoading(true)
    setQuery(q)
    setCurrentCategory(category || null)

    try {
      let url = \/api/companies\
      if (category) {
        url += \?category=\\
      } else if (q) {
        url += \?query=\\
      }
      
      const res = await fetch(url)
      const data = await res.json()
      setCompanies(data)
    } catch (error) {
      console.error("Search failed", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    search("")
  }, [])

  const logos = companies.filter(c => c.type !== "favicon")
  const favicons = companies.filter(c => c.type === "favicon")

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Header onSearch={search} isLoading={loading} />

      <main className="flex-1 pt-24 px-4 md:px-8 pb-12 max-w-7xl mx-auto w-full">
        {/* KPI Dashboard */}
        {!query && !currentCategory && (
            <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <KPIDashboard />
            </div>
        )}

        {loading ? (
          <div className="text-center py-20">
             <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-500"></div>
             <p className="mt-4 text-gray-500 font-medium">Searching global database...</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Logos Section */}
            <section>
                <div className="flex items-center justify-between mb-6">       
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="bg-black w-1 h-6 rounded-full block"></span>
                        {currentCategory ? \Top \ Companies\ : (query ? "Search Results" : "Global Top 100")}
                    </h2>
                    <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                        {logos.length} results
                    </span>
                </div>

                {logos.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {logos.map((company: any) => (
                        <CompanyCard key={company.id} company={company} />     
                        ))}
                    </div>
                ) : (
                    !loading && query && <div className="text-gray-400 italic py-8 text-center bg-white rounded-xl border border-dashed border-gray-200">No brand logos found matching "{query}"</div>
                )}
            </section>

            {/* Favicons Section */}
            {favicons.length > 0 && (
                <section className="pt-8 border-t border-gray-200">
                    <div className="flex items-center gap-3 mb-6 opacity-70">  
                        <h2 className="text-lg font-semibold text-gray-600">Web Icons (Favicons)</h2>
                        <div className="h-px bg-gray-300 flex-1"></div>        
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 opacity-90 hover:opacity-100 transition-opacity">     
                        {favicons.map((company: any) => (
                        <CompanyCard key={company.id} company={company} />     
                        ))}
                    </div>
                </section>
            )}
            
            {!loading && companies.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4"></div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                    We couldn't find any companies matching "{query}". Try searching for a domain (e.g. example.com) to automatically discover it.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 text-center text-sm text-gray-400">
        <p>&copy; {new Date().getFullYear()} LogoList. All rights reserved.</p>
      </footer>
    </div>
  )
}
