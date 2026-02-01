import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Define the external API response type
interface ClearbitCompany {
  name: string
  domain: string
  logo: string | null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (query) {
    // 1. Search Local DB First
    let dbCompanies = await prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { domain: { contains: query } }
        ]
      }
    })

    // 2. Call External API (Clearbit) for global coverage
    let apiCompanies: any[] = []
    try {
      const res = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(query)}`)
      if (res.ok) {
        const data: ClearbitCompany[] = await res.json()
        
        // Transform API data to match our schema and fill in logos if missing
        apiCompanies = data.map(item => ({
          id: `ext-${item.domain}`, // Temporary ID for frontend
          name: item.name,
          domain: item.domain,
          logoUrl: item.logo || `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${item.domain}&size=256`,
          description: `Official logo of ${item.name}`,
          downloadCount: 0,
          isExternal: true // Flag to identify non-persisted items
        }))
      }
    } catch (error) {
      console.error("External API search failed:", error)
    }

    // 3. Merge Results (Deduplicate based on domain)
    const existingDomains = new Set(dbCompanies.map(c => c.domain))
    const newFromApi = apiCompanies.filter(c => !existingDomains.has(c.domain))
    
    // Combine local + unique API results
    const combinedResults = [...dbCompanies, ...newFromApi]

    // Log search
    await prisma.searchLog.create({
      data: {
        query,
        success: combinedResults.length > 0,
      }
    })

    // Update search count for found DB companies
    if (dbCompanies.length > 0) {
      await prisma.company.updateMany({
        where: {
          id: { in: dbCompanies.map(c => c.id) }
        },
        data: {
          searchCount: { increment: 1 }
        }
      })
    }

    return NextResponse.json(combinedResults)
  }

  // Default: Show top downloaded companies from DB
  const companies = await prisma.company.findMany({
    orderBy: { downloadCount: "desc" },
    take: 20
  })
  return NextResponse.json(companies)
}

export async function POST(request: Request) {
  // Endpoint to "Save" an external company when it is interacted with (e.g. downloaded)
  try {
    const body = await request.json()
    const { name, domain, logoUrl } = body

    const existing = await prisma.company.findUnique({ where: { domain } })
    if (existing) {
      return NextResponse.json(existing)
    }

    const newCompany = await prisma.company.create({
      data: {
        name,
        domain,
        logoUrl,
        description: `Official logo of ${name}`,
        sector: "Auto-discovered",
        industry: "Internet",
        searchCount: 1
      }
    })

    return NextResponse.json(newCompany)
  } catch (error) {
    return NextResponse.json({ error: "Failed to save company" }, { status: 500 })
  }
}
