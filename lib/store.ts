import fs from "fs"
import path from "path"

const DATA_PATH = path.join(process.cwd(), "data", "blobs.json")

export interface Blob {
  id: string
  name: string        // e.g. "Lil' Groove"
  app: string         // e.g. "Spotify"
  pack: string        // e.g. "App Pack"
  packSlug: string    // e.g. "app"
  bio: string
  accentColor: string // hex
  render: string      // /uploads/renders/filename.png
  files: {
    format: string    // "FBX" | "GLB"
    url: string       // /uploads/models/filename.fbx
    size: string      // e.g. "6MB"
  }[]
  createdAt: string
}

export function getBlobs(): Blob[] {
  if (!fs.existsSync(DATA_PATH)) return []
  const raw = fs.readFileSync(DATA_PATH, "utf-8")
  return JSON.parse(raw).blobs ?? []
}

export function saveBlobs(blobs: Blob[]) {
  fs.writeFileSync(DATA_PATH, JSON.stringify({ blobs }, null, 2))
}

export function addBlob(blob: Blob) {
  const blobs = getBlobs()
  blobs.push(blob)
  saveBlobs(blobs)
}

export function deleteBlob(id: string) {
  const blobs = getBlobs().filter(b => b.id !== id)
  saveBlobs(blobs)
}

export function updateBlob(id: string, updates: Partial<Blob>) {
  const blobs = getBlobs().map(b => b.id === id ? { ...b, ...updates } : b)
  saveBlobs(blobs)
}

export function getPacks(blobs: Blob[]) {
  const map = new Map<string, { label: string; slug: string; blobs: Blob[] }>()
  for (const blob of blobs) {
    if (!map.has(blob.packSlug)) {
      map.set(blob.packSlug, { label: blob.pack, slug: blob.packSlug, blobs: [] })
    }
    map.get(blob.packSlug)!.blobs.push(blob)
  }
  return Array.from(map.values())
}
