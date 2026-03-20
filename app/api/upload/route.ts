import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { addBlob } from "@/lib/store"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"

const ALLOWED_RENDER_EXTS = new Set(["png", "jpg", "jpeg", "webp"])
const ALLOWED_MODEL_EXTS  = new Set(["fbx", "glb", "obj"])
const MAX_RENDER_BYTES = 20 * 1024 * 1024  // 20 MB
const MAX_MODEL_BYTES  = 150 * 1024 * 1024 // 150 MB

function getExt(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? ""
}

async function saveFile(file: File, dir: string, allowedExts: Set<string>, maxBytes: number): Promise<string> {
  const ext = getExt(file.name)
  if (!allowedExts.has(ext)) throw new Error(`File type .${ext} not allowed`)
  if (file.size > maxBytes) throw new Error(`File too large: ${file.name}`)

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const filename = `${uuidv4()}.${ext}`
  const fullDir = path.join(process.cwd(), "public", dir)
  await mkdir(fullDir, { recursive: true })
  await writeFile(path.join(fullDir, filename), buffer)
  return `/${dir}/${filename}`
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const form = await req.formData()

    const name = form.get("name") as string
    const app = form.get("app") as string
    const pack = form.get("pack") as string
    const packSlug = form.get("packSlug") as string
    const bio = form.get("bio") as string
    const accentColor = form.get("accentColor") as string

    // Validate hex color to prevent stored XSS via accentColor
    if (!/^#[0-9a-fA-F]{3,8}$/.test(accentColor)) {
      return NextResponse.json({ error: "Invalid accent color" }, { status: 400 })
    }

    const renderFile = form.get("render") as File
    const renderUrl = await saveFile(renderFile, "uploads/renders", ALLOWED_RENDER_EXTS, MAX_RENDER_BYTES)

    const modelFiles = form.getAll("models") as File[]
    if (modelFiles.length === 0) return NextResponse.json({ error: "No model files" }, { status: 400 })

    const files = await Promise.all(
      modelFiles.map(async (f) => {
        const url = await saveFile(f, "uploads/models", ALLOWED_MODEL_EXTS, MAX_MODEL_BYTES)
        const ext = getExt(f.name).toUpperCase()
        const size = `${Math.round(f.size / 1024 / 1024 * 10) / 10}MB`
        return { format: ext, url, size }
      })
    )

    const blob = {
      id: uuidv4(),
      name, app, pack, packSlug, bio, accentColor,
      render: renderUrl,
      files,
      createdAt: new Date().toISOString(),
    }

    addBlob(blob)
    return NextResponse.json(blob)
  } catch (e: any) {
    console.error(e)
    const msg = e?.message ?? "Upload failed"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
