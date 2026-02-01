import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // params needs to be awaited in newer Next.js versions if using app router, but currently it's passed as object
  // Next.js 15+ changes this, but 14 is likely what we have. 
  // Let's assume standard behavior for now. If error, we fix.
  // Actually params is a promise in recent versions.
  // Let's use `const { id } = params` and if it fails, we adapt.
  // Wait, Next 15 is recent. `package.json` said "next": "16.1.6".
  // Oh, Next 16? That's very new.
  // In Next 15/16, params is a Promise.
  
  const { id: idStr } = await params
  const id = parseInt(idStr)
  
  const body = await request.json()
  const { affiliateUrl } = body

  const originalCompany = await prisma.company.findUnique({ where: { id } })

  if (!originalCompany) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 })
  }

  const updatedCompany = await prisma.company.update({
    where: { id },
    data: { affiliateUrl },
  })

  // Log change
  try {
    await prisma.changeLog.create({
      data: {
        entityType: "Company",
        entityId: id,
        action: "UPDATE",
        changes: JSON.stringify({
          field: "affiliateUrl",
          old: originalCompany.affiliateUrl,
          new: affiliateUrl,
        }),
        adminUserId: parseInt((session.user as any).id),
      },
    })
  } catch (e) {
    console.error("Failed to log change", e)
  }

  return NextResponse.json(updatedCompany)
}
