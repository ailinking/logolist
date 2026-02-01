import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const prisma = new PrismaClient()

// Schema for validation
const companySchema = z.object({
  name: z.string().min(1, "Name is required"),
  domain: z.string().min(1, "Domain is required"),
  logoUrl: z.string().url("Invalid logo URL").optional().or(z.literal("")),
  description: z.string().optional(),
  category: z.string().optional(),
  affiliateUrl: z.string().url("Invalid affiliate URL").optional().or(z.literal("")),
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

    const { name, domain, logoUrl, description, category, affiliateUrl } = result.data

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
        logoUrl: logoUrl || null,
        description: description || null,
        category: category || null,
        affiliateUrl: affiliateUrl || null,
      },
    })

    // Log change
    if (session.user?.email) {
      await prisma.changeLog.create({
        data: {
          action: "UPDATE",
          entityId: id.toString(),
          entityType: "Company",
          details: `Updated company ${name}`,
          adminEmail: session.user.email,
        },
      })
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error("Error updating company:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Delete company
    await prisma.company.delete({
      where: { id },
    })

    // Log change
    if (session.user?.email) {
      await prisma.changeLog.create({
        data: {
          action: "DELETE",
          entityId: id.toString(),
          entityType: "Company",
          details: `Deleted company with ID ${id}`,
          adminEmail: session.user.email,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting company:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
