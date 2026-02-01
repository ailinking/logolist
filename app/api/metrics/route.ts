import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  const totalSearches = await prisma.searchLog.count()
  const successfulSearches = await prisma.searchLog.count({ where: { success: true } })
  const successRate = totalSearches > 0 ? Math.round((successfulSearches / totalSearches) * 100) : 0

  const totalDownloads = await prisma.company.aggregate({
    _sum: { downloadCount: true }
  })

  const totalCompanies = await prisma.company.count()
  
  return NextResponse.json({
    searchSuccessRate: successRate,
    totalDownloads: totalDownloads._sum.downloadCount || 0,
    totalCompanies,
    totalSearches
  })
}
