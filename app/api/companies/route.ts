import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { CURATED_CATEGORIES, TOP_100_COMPANIES } from "@/lib/curatedData"

const prisma = new PrismaClient()
const BRANDFETCH_API_KEY = process.env.BRANDFETCH_API_KEY

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

interface BrandfetchSearchItem {
  brandId: string
  name: string
  domain: string
  icon?: string
  description?: string
}

interface AppStoreSearchResult {
  trackId: number
  trackName: string
  artworkUrl512?: string
  artworkUrl100?: string
  description?: string
}

interface AppStoreSearchResponse {
  results: AppStoreSearchResult[]
}

const isDomain = (str: string) => /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(str)

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
    id: `curated-${c.domain}`,
    name: c.name,
    domain: c.domain,
    logoUrl: `https://logo.clearbit.com/${c.domain}`, 
    description: `Official logo of ${c.name}`,
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
    await prisma.$connect()
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
      const res = await fetch(`https://api.brandfetch.io/v2/search/${query}`, {
          headers: { 'Authorization': `Bearer ${BRANDFETCH_API_KEY}` }
      })
      if (res.ok) {
          const data = await res.json() as AppStoreSearchResponse as BrandfetchSearchItem[]
          brandfetchCompanies = data.map((item) => ({
              id: item.brandId,
              name: item.name,
              domain: item.domain,
              logoUrl: item.icon || `https://logo.clearbit.com/${item.domain}`,
              description: item.description || `Logo of ${item.name}`,
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
    const res = await fetch(`https://itunes.apple.com/search?term=${query}&entity=software&limit=5`)
    if (res.ok) {
      const data = await res.json()
      appStoreCompanies = data.results.map((item) => ({
        id: `appstore-${item.trackId}`,
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
      id: `auto-${query}`,
      name: name,
      domain: query,
      logoUrl: `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${query}&size=256`,
      description: `Official logo of ${name}`,
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
            description: `Official logo of ${name}`,
            sector: "Auto-discovered",
            industry: "Internet",
            searchCount: 1
        }
        })
        return NextResponse.json(newCompany)
    } catch (dbError) {
        console.error("DB Save failed:", dbError)
        return NextResponse.json({
            id: `temp-${Date.now()}`,
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
