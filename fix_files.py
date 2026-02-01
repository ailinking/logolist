import os

files = {
    'app/api/companies/route.ts': '''import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { CURATED_CATEGORIES, TOP_100_COMPANIES } from "../../lib/curatedData"

const prisma = new PrismaClient()
const BRANDFETCH_API_KEY = process.env.BRANDFETCH_API_KEY || "YOUR_KEY"

interface EnrichedCompany {
  id: number | string
  name: string
  domain: string
  logoUrl: string
  description: string
  downloadCount: number
  isExternal?: boolean
  resolutions?: Record<string, string>
  source?: string
  type?: "logo" | "favicon"
  sector?: string
  industry?: string
}

const isDomain = (str: string) => /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\\.[a-zA-Z]{2,})+$/.test(str)

const getNameFromDomain = (domain: string) => {
  try {
    const parts = domain.split(".")
    if (parts.length > 2) return parts[parts.length - 2]
    return parts[0]
  } catch (e) {
    return domain
  }
}

const formatCurated = (list: { name: string; domain: string }[]): EnrichedCompany[] => {
  return list.map((c, index) => ({
    id: curated-,
    name: c.name,
    domain: c.domain,
    logoUrl: https://logo.clearbit.com/, 
    description: Official logo of ,
    downloadCount: 1000 - index,
    isExternal: true,
    source: "Curated",
    type: "logo"
  }))
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")
  const category = searchParams.get("category")

  // 1. Curated Category List
  if (category && CURATED_CATEGORIES[category.toLowerCase()]) {
    const list = CURATED_CATEGORIES[category.toLowerCase()]
    return NextResponse.json(formatCurated(list))
  }

  // 2. Default Top 100 (if no query)
  if (!query) {
    return NextResponse.json(formatCurated(TOP_100_COMPANIES))
  }

  // 3. Search Logic
  let isDbOperational = true
  try {
    await prisma.()
  } catch (e) {
    console.warn("DB Connection failed", e)
    isDbOperational = false
  }

  // DB Search
  let dbCompanies: EnrichedCompany[] = []
  if (isDbOperational) {
    try {
      const results = await prisma.company.findMany({
        where: {
            OR: [
                { name: { contains: query } },
                { domain: { contains: query } }
            ]
        },
        orderBy: { downloadCount: 'desc' }
      })
      dbCompanies = results.map(c => ({...c, type: 'logo', source: 'DB'} as EnrichedCompany))
    } catch(e) { console.warn("DB search failed", e) }
  }

  // External Search (Brandfetch)
  let brandfetchCompanies: EnrichedCompany[] = []
  try {
      const res = await fetch(https://api.brandfetch.io/v2/search/, {
          headers: { 'Authorization': Bearer  }
      })
      if (res.ok) {
          const data = await res.json()
          brandfetchCompanies = data.map((item: any) => ({
              id: item.brandId,
              name: item.name,
              domain: item.domain,
              logoUrl: item.icon || https://logo.clearbit.com/,
              description: item.description || Logo of ,
              downloadCount: 0,
              isExternal: true,
              source: "Brandfetch",
              type: "logo"
          }))
      }
  } catch (e) {
      console.warn("Brandfetch search failed", e)
  }

  // App Store Search
  let appStoreCompanies: EnrichedCompany[] = []
  try {
    const res = await fetch(https://itunes.apple.com/search?term=&entity=software&limit=5)
    if (res.ok) {
      const data = await res.json()
      appStoreCompanies = data.results.map((item: any) => ({
        id: ppstore-,
        name: item.trackName,
        domain: "App Store",
        logoUrl: item.artworkUrl512 || item.artworkUrl100,
        description: item.description?.substring(0, 100) + "...",
        downloadCount: 0,
        isExternal: true,
        source: "AppStore",
        type: "logo"
      }))
    }
  } catch (e) { console.warn("App Store search failed", e) }

  // Google Favicon Fallback
  let googleFavicons: EnrichedCompany[] = [];
  if (isDomain(query)) {
    const name = getNameFromDomain(query);
    googleFavicons.push({
      id: uto-,
      name: name,
      domain: query,
      logoUrl: https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://&size=256,
      description: Official logo of ,
      downloadCount: 0,
      isExternal: true,
      source: "Google",
      type: "favicon"
    })
  }

  // Merge Results
  const combinedResults = [...dbCompanies, ...brandfetchCompanies, ...appStoreCompanies, ...googleFavicons];
  const uniqueMap = new Map();
  combinedResults.forEach(item => {
      const key = (item.domain && item.domain !== "App Store") ? item.domain : item.id;
      if (!uniqueMap.has(key)) {
          uniqueMap.set(key, item);
      } else {
          const existing = uniqueMap.get(key);
          if (existing.type === "favicon" && item.type === "logo") uniqueMap.set(key, item);
          if (existing.source !== "Brandfetch" && item.source === "Brandfetch") uniqueMap.set(key, item);
      }
  });

  const finalResults = Array.from(uniqueMap.values());

  // Log Search
  if (isDbOperational) {
    prisma.searchLog.create({
      data: { query, success: finalResults.length > 0 }
    }).catch(e => console.warn("Failed to log search", e))

    if (dbCompanies.length > 0) {
      prisma.company.updateMany({
        where: { id: { in: dbCompanies.map(c => c.id as number) } },
        data: { searchCount: { increment: 1 } }
      }).catch(e => console.warn("Failed to update counts", e))
    }
  }

  return NextResponse.json(finalResults)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, domain, logoUrl } = body

    if (!name || !domain) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 }) 
    }

    try {
        const existing = await prisma.company.findUnique({ where: { domain } })
        if (existing) {
        return NextResponse.json(existing)
        }

        const newCompany = await prisma.company.create({
        data: {
            name,
            domain,
            logoUrl: logoUrl || "",
            description: Official logo of ,
            sector: "Auto-discovered",
            industry: "Internet",
            searchCount: 1
        }
        })
        return NextResponse.json(newCompany)
    } catch (dbError) {
        console.error("DB Save failed:", dbError)
        return NextResponse.json({
            id: 	emp-,
            name,
            domain,
            logoUrl,
            isExternal: true
        })
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
''',
    'app/api/download-proxy/route.ts': '''import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")
  const filename = searchParams.get("filename") || "logo.png"

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 })
  }

  try {
    const imageRes = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
        }
    })
    if (!imageRes.ok) throw new Error("Failed to fetch image")

    const contentType = imageRes.headers.get("content-type") || "image/png"    
    const buffer = await imageRes.arrayBuffer()

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": ttachment; filename="",
      },
    })
  } catch (error) {
    console.error("Proxy download failed:", error)
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 })
  }
}
''',
    'app/page.tsx': '''"use client"
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
      let url = /api/companies
      if (category) {
        url += ?category=
      } else if (q) {
        url += ?query=
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
                        {currentCategory ? Top  Companies : (query ? "Search Results" : "Global Top 100")}
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
'''
}

for path, content in files.items():
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Updated {path}")
