import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface ClearbitCompany {
  name: string
  domain: string
  logo: string | null
}

interface EnrichedCompany {
    id: number | string;
    name: string;
    domain: string;
    logoUrl: string;
    description?: string | null;
    downloadCount: number;
    isExternal?: boolean;
    resolutions?: Record<string, string>;
    source?: string;
    type?: "logo" | "favicon"; // New field for classification
}

function isDomain(str: string) {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(str);
}

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

  const fallbackResponse: EnrichedCompany[] = [
    {
       id: "fallback-google",
       name: "Google",
       domain: "google.com",
       logoUrl: "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://google.com&size=256",
       downloadCount: 9999,
       isExternal: true,
       source: "Fallback",
       type: "logo"
    }
  ];

  if (query) {
    let dbCompanies: EnrichedCompany[] = []
    let apiCompanies: EnrichedCompany[] = []
    let appStoreCompanies: EnrichedCompany[] = []
    let isDbOperational = true

    // 1. Local DB
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
          source: "DB",
          type: "logo" // Assume DB content is vetted/good
      }))
    } catch (e) {
      console.warn("DB Search failed:", e)
      isDbOperational = false
    }

    // 2. Clearbit API
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
          source: "Clearbit",
          type: "logo"
        }))
      }
    } catch (error) {
      console.error("Clearbit API failed:", error)
    }

    // 3. App Store API
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
                domain: item.sellerUrl || "App Store",
                logoUrl: item.artworkUrl512 || item.artworkUrl100,
                description: `App Store: ${item.description ? item.description.substring(0, 100) + "..." : item.trackName}`,
                downloadCount: 0,
                isExternal: true,
                source: "AppStore",
                type: "logo",
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

    // 4. Domain Fallback (Google Favicon) - Explicitly mark as favicon
    // ALWAYS add this if query is a domain, not just as fallback. 
    // User wants to see favicons but classified separately.
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

    // 5. Merge Results
    const combinedResults = [...dbCompanies, ...appStoreCompanies, ...apiCompanies, ...googleFavicons];
    
    // Deduplicate: 
    // - If we have a Logo (DB/AppStore/Clearbit) for a domain, we generally prefer it over the Favicon.
    // - BUT user said "separate classification", so maybe keep both if they are distinct?
    // - Let is keep simple deduplication but ensure Logos win over Favicons if keys collide.
    const uniqueMap = new Map();
    combinedResults.forEach(item => {
        const key = (item.domain && item.domain !== "App Store") ? item.domain : item.id;
        
        if (!uniqueMap.has(key)) {
            uniqueMap.set(key, item);
        } else {
            // If existing is favicon and new is logo, replace it
            const existing = uniqueMap.get(key);
            if (existing.type === "favicon" && item.type === "logo") {
                uniqueMap.set(key, item);
            }
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
    return NextResponse.json(companies.map(c => ({...c, type: "logo", source: "DB"})))
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
