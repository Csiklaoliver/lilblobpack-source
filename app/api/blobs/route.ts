import { NextRequest, NextResponse } from "next/server"
import { getBlobs, deleteBlob } from "@/lib/store"
import { auth } from "@/lib/auth"

export async function GET() {
  const blobs = getBlobs()
  return NextResponse.json(blobs)
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  deleteBlob(id)
  return NextResponse.json({ ok: true })
}
