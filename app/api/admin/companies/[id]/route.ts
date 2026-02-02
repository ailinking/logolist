import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { authOptions } from @/lib/auth

// Schema for validation
const companySchema = z.object({
  name: z.string().min(1, "Name is required"),
  domain: z.string().min(1, "Domain is required"),
  logoUrl: z.string().optional().or(z.literal("")),
  description: z.string().optional(),
  sector: z.string().optional(),
  industry: z.string().optional(),
  affiliateUrl: z.string().optional().or(z.literal("")),
})

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid ID" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const result = companySchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      )
    }

    const { name, domain, logoUrl, description, sector, industry, affiliateUrl } = result.data

    // Check if domain exists for other companies
    const existing = await prisma.company.findFirst({
      where: {
        domain,
        NOT: {
          id,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Domain already exists" },
        { status: 409 }
      )
    }

    // Update company
    const company = await prisma.company.update({
      where: { id },
      data: {
        name,
        domain,
        logoUrl: logoUrl || "",
        description: description || null,
        sector: sector || null,
        industry: industry || null,
        affiliateUrl: affiliateUrl || null,
      },
    })

    // Log change
    if (session.user?.name) {
       const admin = await prisma.adminUser.findUnique({
          where: { username: session.user.name }
       })

       if (admin) {
          await prisma.changeLog.create({
            data: {
              action: "UPDATE",
              entityId: id,
              entityType: "Company",
              changes: `Updated company ${name}`,
              adminUserId: admin.id,
            },
          })
       }
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error("Error updating company:", error)
    return NextResponse.json(
      { error: "Failed to update company" },
      { status: 500 }
    )
  }
}
