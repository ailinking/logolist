import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")
  const search = searchParams.get("search") || ""

  const skip = (page - 1) * limit

  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { domain: { contains: search } },
        ],
      }
    : {}

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      skip,
      take: limit,
      orderBy: { searchCount: "desc" },
    }),
    prisma.company.count({ where }),
  ])

  return NextResponse.json({
    companies,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    },
  })
}
