import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

// Instantiate PrismaClient outside of the handler
const prisma = new PrismaClient()

// Define the external API response type
interface ClearbitCompany {
  name: string
  domain: string
  logo: string | null
}

// Interface for frontend consumption
interface EnrichedCompany {
    id: number | string;
    name: string;
    domain: string;
    logoUrl: string;
    description?: string;
    downloadCount: number;
    isExternal?: boolean;
    resolutions?: Record<string, string>; // e.g. { "original": "url", "512x512": "url" }
    source?: string; // "Clearbit", "AppStore", "DB", "Google"
}

// Helper: Check if string is a domain
function isDomain(str: string) {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(str);
}

// Helper: Extract name from domain
function getNameFromDomain(domain: string) {
  const parts = domain.split(".");
  if (parts.length >= 2) {
    const name = parts[parts.length - 2];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  return domain;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  // Default Fallback Response
  const fallbackResponse: EnrichedCompany[] = [
    {
       id: "fallback-google",
       name: "Google",
       domain: "google.com",
       logoUrl: "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://google.com&size=256",
       downloadCount: 9999,
       isExternal: true,
       source: "Fallback"
    }
  ];

  if (query) {
    let dbCompanies: EnrichedCompany[] = []
    let apiCompanies: EnrichedCompany[] = []
    let appStoreCompanies: EnrichedCompany[] = []
    let isDbOperational = true

    // 1. Try Local DB Search
    try {
      const dbResults = await prisma.company.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { domain: { contains: query } }
          ]
        }
      })
      dbCompanies = dbResults.map(c => ({
          ...c,
          source: "DB"
      }))
    } catch (e) {
      console.warn("DB Search failed:", e)
      isDbOperational = false
    }

    // 2. Call Clearbit API (Global Search)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); 

      const res = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(query)}`, {
        signal: controller.signal
      })
      clearTimeout(timeoutId);

      if (res.ok) {
        const data: ClearbitCompany[] = await res.json()
        apiCompanies = data.map(item => ({
          id: `ext-${item.domain}`,
          name: item.name,
          domain: item.domain,
          logoUrl: item.logo || `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${item.domain}&size=256`,
          description: `Official logo of ${item.name}`,
          downloadCount: 0,
          isExternal: true,
          source: "Clearbit"
        }))
      }
    } catch (error) {
      console.error("Clearbit API failed:", error)
    }

    // 3. Call iTunes App Store API (For Mobile Apps)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); 

      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=software&limit=5`, {
        signal: controller.signal
      })
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json()
        if (data.results) {
            appStoreCompanies = data.results.map((item: any) => ({
                id: `app-${item.trackId}`,
                name: item.trackName,
                domain: item.sellerUrl || "App Store", // Fallback if no seller URL
                logoUrl: item.artworkUrl512 || item.artworkUrl100,
                description: `App Store: ${item.description ? item.description.substring(0, 100) + "..." : item.trackName}`,
                downloadCount: 0,
                isExternal: true,
                source: "AppStore",
                resolutions: {
                    "60x60": item.artworkUrl60,
                    "100x100": item.artworkUrl100,
                    "512x512": item.artworkUrl512
                }
            }))
        }
      }
    } catch (error) {
        console.error("App Store API failed:", error)
    }

    // 4. Fallback for Domain Queries
    if (dbCompanies.length === 0 && apiCompanies.length === 0 && appStoreCompanies.length === 0 && isDomain(query)) {
      const name = getNameFromDomain(query);
      apiCompanies.push({
        id: `auto-${query}`,
        name: name,
        domain: query,
        logoUrl: `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${query}&size=256`,
        description: `Official logo of ${name}`,
        downloadCount: 0,
        isExternal: true,
        source: "Google"
      })
    }

    // 5. Merge Results
    // We prioritize DB -> App Store -> Clearbit
    // Use a Map to deduplicate by Name (fuzzy) or Domain
    const combinedResults = [...dbCompanies, ...appStoreCompanies, ...apiCompanies];
    
    // Simple deduplication logic: if same domain exists, prefer DB > AppStore > Clearbit
    // Since we concat in order, we can filter duplicates.
    const uniqueMap = new Map();
    combinedResults.forEach(item => {
        // Use domain as key if valid, otherwise use ID (for apps without domain)
        const key = (item.domain && item.domain !== "App Store") ? item.domain : item.id;
        if (!uniqueMap.has(key)) {
            uniqueMap.set(key, item);
        }
    });

    const finalResults = Array.from(uniqueMap.values());

    // 6. Log Search
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

  // Default List
  try {
    const companies = await prisma.company.findMany({
      orderBy: { downloadCount: "desc" },
      take: 20
    })
    return NextResponse.json(companies)
  } catch (e) {
    return NextResponse.json(fallbackResponse)
  }
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
