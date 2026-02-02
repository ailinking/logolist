import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const logs = await prisma.changeLog.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        adminUser: {
          select: { username: true },
        },
        company: {
          select: { name: true },
        },
      },
    })

    return NextResponse.json({ logs })
  } catch (error) {
    console.error("Error fetching history:", error)
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    )
  }
}
