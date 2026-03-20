import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { deletePack } from "@/lib/store"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { slug } = await params
  deletePack(slug)
  return NextResponse.json({ ok: true })
}
