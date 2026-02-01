import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const id = parseInt(params.id)
  
  await prisma.company.update({
    where: { id },
    data: {
      downloadCount: { increment: 1 }
    }
  })

  return NextResponse.json({ success: true })
}
