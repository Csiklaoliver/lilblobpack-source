import fs from "fs"
import path from "path"

const DATA_PATH  = path.join(process.cwd(), "data", "blobs.json")
const PACKS_PATH = path.join(process.cwd(), "data", "packs.json")

export interface Blob {
  id: string
  name: string
  app: string
  pack: string
  packSlug: string
  bio: string
  accentColor: string
  render: string
  files: { format: string; url: string; size: string }[]
  createdAt: string
}

export interface PackDef {
  slug: string
  label: string
  description: string
  accent: string
  accent2: string
}

export interface Pack extends PackDef {
  vol: string
  blobs: Blob[]
}

// ── Blobs ────────────────────────────────────────────────────────────────────

export function getBlobs(): Blob[] {
  if (!fs.existsSync(DATA_PATH)) return []
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8")).blobs ?? []
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
  saveBlobs(getBlobs().filter(b => b.id !== id))
}

export function updateBlob(id: string, updates: Partial<Blob>) {
  saveBlobs(getBlobs().map(b => b.id === id ? { ...b, ...updates } : b))
}

// ── Pack definitions ──────────────────────────────────────────────────────────

export function getPackDefs(): PackDef[] {
  if (!fs.existsSync(PACKS_PATH)) return []
  return JSON.parse(fs.readFileSync(PACKS_PATH, "utf-8")).packs ?? []
}

export function savePackDefs(packs: PackDef[]) {
  fs.writeFileSync(PACKS_PATH, JSON.stringify({ packs }, null, 2))
}

export function addPack(pack: PackDef) {
  const packs = getPackDefs()
  if (packs.find(p => p.slug === pack.slug)) throw new Error("Pack slug already exists")
  packs.push(pack)
  savePackDefs(packs)
}

export function deletePack(slug: string) {
  savePackDefs(getPackDefs().filter(p => p.slug !== slug))
}

// ── Combined ──────────────────────────────────────────────────────────────────

export function getPacks(): Pack[] {
  const defs  = getPackDefs()
  const blobs = getBlobs()
  return defs.map((def, i) => ({
    ...def,
    vol:   `Vol. ${String(i + 1).padStart(2, "0")}`,
    blobs: blobs.filter(b => b.packSlug === def.slug),
  }))
}
