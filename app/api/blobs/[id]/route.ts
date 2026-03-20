import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getBlobs, updateBlob } from "@/lib/store"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"

const ALLOWED_RENDER_EXTS = new Set(["png", "jpg", "jpeg", "webp"])
const ALLOWED_MODEL_EXTS  = new Set(["fbx", "glb", "obj"])
const MAX_RENDER_BYTES = 20  * 1024 * 1024
const MAX_MODEL_BYTES  = 150 * 1024 * 1024

function getExt(filename: string) {
  return filename.split(".").pop()?.toLowerCase() ?? ""
}

async function saveFile(file: File, dir: string, allowedExts: Set<string>, maxBytes: number): Promise<string> {
  const ext = getExt(file.name)
  if (!allowedExts.has(ext)) throw new Error(`File type .${ext} not allowed`)
  if (file.size > maxBytes) throw new Error(`File too large: ${file.name}`)
  const bytes  = await file.arrayBuffer()
  const filename = `${uuidv4()}.${ext}`
  const fullDir  = path.join(process.cwd(), "public", dir)
  await mkdir(fullDir, { recursive: true })
  await writeFile(path.join(fullDir, filename), Buffer.from(bytes))
  return `/${dir}/${filename}`
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const existing = getBlobs().find(b => b.id === id)
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  try {
    const fd          = await req.formData()
    const name        = fd.get("name") as string
    const app         = fd.get("app") as string
    const bio         = fd.get("bio") as string
    const pack        = fd.get("pack") as string
    const packSlug    = fd.get("packSlug") as string
    const accentColor = fd.get("accentColor") as string

    if (!name || !app || !bio || !pack || !packSlug || !accentColor) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }
    if (!/^#[0-9a-fA-F]{3,8}$/.test(accentColor)) {
      return NextResponse.json({ error: "Invalid accent color" }, { status: 400 })
    }

    // Render: use new file if provided, otherwise keep existing
    let render = existing.render
    const renderFile = fd.get("render") as File | null
    if (renderFile && renderFile.size > 0) {
      render = await saveFile(renderFile, "uploads/renders", ALLOWED_RENDER_EXTS, MAX_RENDER_BYTES)
    }

    // Models: use new files if provided, otherwise keep existing
    let files = existing.files
    const modelFiles = (fd.getAll("models") as File[]).filter(f => f.size > 0)
    if (modelFiles.length > 0) {
      files = await Promise.all(modelFiles.map(async f => {
        const url = await saveFile(f, "uploads/models", ALLOWED_MODEL_EXTS, MAX_MODEL_BYTES)
        return {
          format: getExt(f.name).toUpperCase(),
          url,
          size: `${Math.round(f.size / 1024 / 1024 * 10) / 10}MB`,
        }
      }))
    }

    const updates = { name, app, bio, pack, packSlug, accentColor, render, files }
    updateBlob(id, updates)
    return NextResponse.json({ ...existing, ...updates })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e.message ?? "Update failed" }, { status: 500 })
  }
}
