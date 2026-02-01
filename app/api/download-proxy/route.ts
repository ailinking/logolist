import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")
  const filename = searchParams.get("filename") || "logo.png"

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 })
  }

  try {
    const imageRes = await fetch(url)
    if (!imageRes.ok) throw new Error("Failed to fetch image")

    const contentType = imageRes.headers.get("content-type") || "image/png"
    const buffer = await imageRes.arrayBuffer()

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Proxy download failed:", error)
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 })
  }
}
