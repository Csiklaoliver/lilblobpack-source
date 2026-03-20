import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getPackDefs, addPack } from "@/lib/store"

export async function GET() {
  return NextResponse.json(getPackDefs())
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { label, description, accent, accent2 } = body

  if (!label || !description) {
    return NextResponse.json({ error: "Missing label or description" }, { status: 400 })
  }

  const slug = label.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")

  try {
    addPack({ slug, label, description, accent: accent || "#a78bfa", accent2: accent2 || "#60a5fa" })
    return NextResponse.json({ ok: true, slug })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
