"use client"
import { useState, useRef, useCallback } from "react"
import type { Blob, PackDef } from "@/lib/store"

const ACCENT_PRESETS = [
  "#1db954", "#5865f2", "#e50914", "#ff0000",
  "#9146ff", "#7c3aed", "#007ACC", "#24292e",
  "#a78bfa", "#34d399", "#f59e0b", "#ec4899",
]

const emptyForm = (slug = "", label = "") => ({
  name: "", app: "", pack: label, packSlug: slug, bio: "", accentColor: "#1db954",
})

const emptyPackForm = { label: "", description: "", accent: "#a78bfa" }

export default function AdminClient({
  blobs: initial,
  packs: initialPacks,
}: {
  blobs: Blob[]
  packs: PackDef[]
}) {
  const [blobs, setBlobs]   = useState<Blob[]>(initial)
  const [packs, setPacks]   = useState<PackDef[]>(initialPacks)

  // ── Upload / edit form ────────────────────────────────────────────────────
  const first = initialPacks[0] ?? { slug: "", label: "" }
  const [form, setForm]               = useState(emptyForm(first.slug, first.label))
  const [render, setRender]           = useState<File | null>(null)
  const [renderPreview, setRenderPreview] = useState<string | null>(null)
  const [models, setModels]           = useState<File[]>([])
  const [uploading, setUploading]     = useState(false)
  const [draggingRender, setDraggingRender] = useState(false)

  // ── Edit mode ─────────────────────────────────────────────────────────────
  const [editingId, setEditingId]         = useState<string | null>(null)
  const [existingRender, setExistingRender] = useState<string | null>(null)
  const [existingFiles, setExistingFiles]   = useState<Blob["files"]>([])

  // ── Pack manager ──────────────────────────────────────────────────────────
  const [showPackForm, setShowPackForm] = useState(false)
  const [newPack, setNewPack]           = useState(emptyPackForm)
  const [packSaving, setPackSaving]     = useState(false)

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const toast = (text: string, ok = true) => {
    setMsg({ text, ok })
    setTimeout(() => setMsg(null), 3000)
  }

  const renderRef = useRef<HTMLInputElement>(null)
  const modelsRef = useRef<HTMLInputElement>(null)

  // ── Render handlers ───────────────────────────────────────────────────────
  const handleRenderDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDraggingRender(false)
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith("image/")) {
      setRender(file)
      setRenderPreview(URL.createObjectURL(file))
    }
  }, [])

  const handleRenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setRender(file); setRenderPreview(URL.createObjectURL(file)) }
  }

  const handleModelsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setModels(prev => [...prev, ...Array.from(e.target.files ?? [])])
  }

  const removeModel = (i: number) => setModels(prev => prev.filter((_, idx) => idx !== i))

  const handlePackChange = (slug: string) => {
    const p = packs.find(p => p.slug === slug)
    if (p) setForm(f => ({ ...f, packSlug: slug, pack: p.label }))
  }

  // ── Edit mode ─────────────────────────────────────────────────────────────
  const startEdit = (b: Blob) => {
    setEditingId(b.id)
    setForm({ name: b.name, app: b.app, pack: b.pack, packSlug: b.packSlug, bio: b.bio, accentColor: b.accentColor })
    setExistingRender(b.render)
    setRenderPreview(b.render)
    setRender(null)
    setExistingFiles(b.files)
    setModels([])
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm(packs[0]?.slug, packs[0]?.label))
    setRender(null); setRenderPreview(null)
    setExistingRender(null); setExistingFiles([])
    setModels([])
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const isEdit = editingId !== null

    if (!isEdit && !render)           return toast("Please add a render image", false)
    if (!isEdit && models.length === 0) return toast("Please add at least one model", false)
    if (isEdit && !render && !existingRender) return toast("Please add a render image", false)
    if (isEdit && models.length === 0 && existingFiles.length === 0) return toast("Please add at least one model", false)
    if (!form.name || !form.app || !form.bio) return toast("Please fill all fields", false)

    setUploading(true)
    try {
      const fd = new FormData()
      if (render) fd.append("render", render)
      models.forEach(m => fd.append("models", m))
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))

      const url    = isEdit ? `/api/blobs/${editingId}` : "/api/upload"
      const method = isEdit ? "PUT" : "POST"
      const res = await fetch(url, { method, body: fd })
      if (!res.ok) throw new Error("Failed")
      const blob = await res.json()

      if (isEdit) {
        setBlobs(prev => prev.map(b => b.id === blob.id ? blob : b))
        toast("Blob updated!")
      } else {
        setBlobs(prev => [blob, ...prev])
        toast("Blob uploaded!")
      }
      cancelEdit()
    } catch {
      toast(isEdit ? "Update failed" : "Upload failed", false)
    } finally {
      setUploading(false)
    }
  }

  // ── Delete blob ───────────────────────────────────────────────────────────
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return
    const res = await fetch("/api/blobs", {
      method: "DELETE",
      body: JSON.stringify({ id }),
      headers: { "Content-Type": "application/json" },
    })
    if (res.ok) {
      setBlobs(prev => prev.filter(b => b.id !== id))
      if (editingId === id) cancelEdit()
      toast("Deleted!")
    } else {
      toast("Delete failed", false)
    }
  }

  // ── Pack manager ──────────────────────────────────────────────────────────
  const handleAddPack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPack.label || !newPack.description) return toast("Fill pack name and description", false)
    setPackSaving(true)
    try {
      const res = await fetch("/api/packs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newPack, accent2: "#60a5fa" }),
      })
      if (!res.ok) throw new Error("Failed")
      const { slug } = await res.json()
      setPacks(prev => [...prev, { ...newPack, slug, accent2: "#60a5fa" }])
      setNewPack(emptyPackForm)
      setShowPackForm(false)
      toast("Pack created!")
    } catch {
      toast("Failed to create pack", false)
    } finally {
      setPackSaving(false)
    }
  }

  const handleDeletePack = async (slug: string, label: string) => {
    if (!confirm(`Delete pack "${label}"? Blobs in it are kept.`)) return
    const res = await fetch(`/api/packs/${slug}`, { method: "DELETE" })
    if (res.ok) {
      setPacks(prev => prev.filter(p => p.slug !== slug))
      toast("Pack deleted!")
    } else {
      toast("Failed to delete pack", false)
    }
  }

  const isEdit = editingId !== null

  return (
    <div className="min-h-screen bg-[#07070f] text-white font-[family-name:var(--font-nunito)] pb-20">

      {/* Header */}
      <div className="border-b border-white/[0.06] px-8 py-5 flex items-center justify-between">
        <div>
          <div className="font-[family-name:var(--font-fredoka)] text-2xl bg-gradient-to-r from-[#a78bfa] to-[#34d399] bg-clip-text text-transparent">
            Lil&apos; Blob Pack
          </div>
          <div className="text-[0.65rem] font-black tracking-[2px] uppercase text-white/25 mt-0.5">Admin Panel</div>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" className="text-[0.7rem] font-black tracking-widest uppercase text-white/30 hover:text-white transition-colors">← Site</a>
          <a href="/api/auth/signout" className="text-[0.7rem] font-black tracking-widest uppercase text-white/30 hover:text-white/60 transition-colors px-3 py-1.5 border border-white/10 rounded-lg">Sign out</a>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 pt-10 grid grid-cols-1 lg:grid-cols-[480px_1fr] gap-10">

        {/* LEFT COLUMN */}
        <div className="space-y-8">

          {/* ── PACK MANAGER ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-[family-name:var(--font-fredoka)] text-xl text-white/80">Packs</h2>
              <button type="button" onClick={() => setShowPackForm(v => !v)}
                className="text-[0.65rem] font-black tracking-widest uppercase text-[#a78bfa] hover:text-white transition-colors px-3 py-1.5 border border-[#a78bfa]/20 hover:border-[#a78bfa]/50 rounded-lg">
                {showPackForm ? "Cancel" : "+ New Pack"}
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {packs.map((p, i) => (
                <div key={p.slug} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] group">
                  <span className="text-[0.6rem] font-black tracking-wider" style={{ color: p.accent }}>
                    Vol.{String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[0.72rem] font-black text-white/70">{p.label}</span>
                  <button type="button" onClick={() => handleDeletePack(p.slug, p.label)}
                    className="text-white/20 hover:text-red-400 transition-colors text-xs opacity-0 group-hover:opacity-100 ml-1">✕</button>
                </div>
              ))}
            </div>

            {showPackForm && (
              <form onSubmit={handleAddPack} className="border border-white/10 rounded-2xl p-4 space-y-3 bg-white/[0.02]">
                <div>
                  <label className="text-[0.65rem] font-black tracking-[2px] uppercase text-white/30 mb-1.5 block">Pack Name</label>
                  <input type="text" placeholder="Editor Pack" value={newPack.label}
                    onChange={e => setNewPack(p => ({ ...p, label: e.target.value }))}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 font-bold focus:outline-none focus:border-white/30 transition-colors" />
                </div>
                <div>
                  <label className="text-[0.65rem] font-black tracking-[2px] uppercase text-white/30 mb-1.5 block">Description</label>
                  <input type="text" placeholder="For the code editors of the world." value={newPack.description}
                    onChange={e => setNewPack(p => ({ ...p, description: e.target.value }))}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 font-bold focus:outline-none focus:border-white/30 transition-colors" />
                </div>
                <div>
                  <label className="text-[0.65rem] font-black tracking-[2px] uppercase text-white/30 mb-1.5 block">Accent Color</label>
                  <div className="flex gap-2 flex-wrap items-center">
                    {ACCENT_PRESETS.map(c => (
                      <button key={c} type="button" onClick={() => setNewPack(p => ({ ...p, accent: c }))}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${newPack.accent === c ? "border-white scale-110" : "border-transparent opacity-60 hover:opacity-100"}`}
                        style={{ background: c }} />
                    ))}
                    <input type="color" value={newPack.accent} onChange={e => setNewPack(p => ({ ...p, accent: e.target.value }))}
                      className="w-6 h-6 rounded-full cursor-pointer" title="Custom" />
                  </div>
                </div>
                <div className="h-0.5 rounded-full" style={{ background: newPack.accent }} />
                <button type="submit" disabled={packSaving}
                  className="w-full py-2.5 rounded-xl font-black text-sm tracking-wider uppercase transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: newPack.accent, color: "#111" }}>
                  {packSaving ? "Creating..." : "Create Pack"}
                </button>
              </form>
            )}
          </div>

          {/* ── UPLOAD / EDIT FORM ── */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-[family-name:var(--font-fredoka)] text-xl text-white/80">
                {isEdit ? "Edit Blob" : "Upload New Blob"}
              </h2>
              {isEdit && (
                <button type="button" onClick={cancelEdit}
                  className="text-[0.65rem] font-black tracking-widest uppercase text-white/30 hover:text-white transition-colors px-3 py-1.5 border border-white/10 rounded-lg">
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Render drop zone */}
              <div
                className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer ${draggingRender ? "border-[#a78bfa] bg-[#a78bfa]/5" : "border-white/10 hover:border-white/25"}`}
                onDragOver={e => { e.preventDefault(); setDraggingRender(true) }}
                onDragLeave={() => setDraggingRender(false)}
                onDrop={handleRenderDrop}
                onClick={() => renderRef.current?.click()}
                style={{ aspectRatio: renderPreview ? "auto" : "1", minHeight: renderPreview ? 0 : 160 }}
              >
                <input ref={renderRef} type="file" accept="image/*" className="hidden" onChange={handleRenderChange} />
                {renderPreview ? (
                  <div className="relative">
                    <img src={renderPreview} alt="preview" className="w-full rounded-2xl object-cover max-h-72" />
                    {isEdit && !render && (
                      <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/70 text-[0.6rem] font-black uppercase tracking-wider text-white/50">
                        Existing — click to replace
                      </div>
                    )}
                    <button type="button"
                      onClick={e => { e.stopPropagation(); setRender(null); setRenderPreview(isEdit ? existingRender : null) }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white text-xs flex items-center justify-center hover:bg-black">✕</button>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/20">
                    <div className="text-4xl">🖼</div>
                    <div className="text-[0.7rem] font-black tracking-wider uppercase">Drop render PNG here</div>
                  </div>
                )}
              </div>

              {/* Model files */}
              <div>
                <div className="text-[0.65rem] font-black tracking-[2px] uppercase text-white/30 mb-2">
                  Model Files (FBX / GLB)
                  {isEdit && existingFiles.length > 0 && models.length === 0 && (
                    <span className="ml-2 normal-case font-bold text-white/20"> — keeping existing</span>
                  )}
                </div>
                <div className="border border-dashed border-white/10 rounded-xl p-4 cursor-pointer hover:border-white/25 transition-all"
                  onClick={() => modelsRef.current?.click()}>
                  <input ref={modelsRef} type="file" accept=".fbx,.glb,.obj" multiple className="hidden" onChange={handleModelsChange} />
                  {models.length === 0 ? (
                    isEdit && existingFiles.length > 0 ? (
                      <div className="space-y-2">
                        {existingFiles.map((f, i) => (
                          <div key={i} className="flex items-center justify-between bg-white/[0.03] rounded-lg px-3 py-2">
                            <span className="text-[0.75rem] font-bold text-white/40">{f.format} — {f.size}</span>
                            <span className="text-[0.6rem] text-white/20 font-black uppercase">existing</span>
                          </div>
                        ))}
                        <div className="text-center text-white/20 text-[0.65rem] font-black tracking-wider uppercase pt-1">+ Click to replace</div>
                      </div>
                    ) : (
                      <div className="text-center text-white/20 text-[0.7rem] font-black tracking-wider uppercase py-4">+ Add FBX / GLB files</div>
                    )
                  ) : (
                    <div className="space-y-2">
                      {models.map((m, i) => (
                        <div key={i} className="flex items-center justify-between bg-white/[0.03] rounded-lg px-3 py-2">
                          <span className="text-[0.75rem] font-bold text-white/60">{m.name}</span>
                          <button type="button" onClick={e => { e.stopPropagation(); removeModel(i) }} className="text-white/25 hover:text-white text-xs">✕</button>
                        </div>
                      ))}
                      <div className="text-center text-white/20 text-[0.65rem] font-black tracking-wider uppercase pt-1">+ Add more</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Text fields */}
              {[
                { key: "name", label: "Mascot Name", placeholder: "Lil' Groove" },
                { key: "app",  label: "App",          placeholder: "Spotify" },
                { key: "bio",  label: "Bio",           placeholder: "Always has the perfect playlist..." },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-[0.65rem] font-black tracking-[2px] uppercase text-white/30 mb-1.5 block">{label}</label>
                  {key === "bio" ? (
                    <textarea placeholder={placeholder} value={(form as any)[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      rows={2}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 font-bold focus:outline-none focus:border-white/30 resize-none transition-colors" />
                  ) : (
                    <input type="text" placeholder={placeholder} value={(form as any)[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 font-bold focus:outline-none focus:border-white/30 transition-colors" />
                  )}
                </div>
              ))}

              {/* Pack selector */}
              <div>
                <label className="text-[0.65rem] font-black tracking-[2px] uppercase text-white/30 mb-1.5 block">Pack</label>
                <div className="flex gap-2 flex-wrap">
                  {packs.map(p => (
                    <button key={p.slug} type="button" onClick={() => handlePackChange(p.slug)}
                      className={`px-4 py-2 rounded-xl text-[0.72rem] font-black border transition-all ${form.packSlug === p.slug ? "bg-[#a78bfa]/20 border-[#a78bfa]/50 text-[#a78bfa]" : "border-white/10 text-white/30 hover:border-white/25"}`}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent color */}
              <div>
                <label className="text-[0.65rem] font-black tracking-[2px] uppercase text-white/30 mb-1.5 block">Accent Color</label>
                <div className="flex gap-2 flex-wrap items-center">
                  {ACCENT_PRESETS.map(c => (
                    <button key={c} type="button" onClick={() => setForm(f => ({ ...f, accentColor: c }))}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${form.accentColor === c ? "border-white scale-110" : "border-transparent opacity-70 hover:opacity-100"}`}
                      style={{ background: c }} />
                  ))}
                  <input type="color" value={form.accentColor}
                    onChange={e => setForm(f => ({ ...f, accentColor: e.target.value }))}
                    className="w-8 h-8 rounded-full cursor-pointer border-2 border-white/20" title="Custom color" />
                </div>
              </div>

              <div className="h-1 rounded-full transition-all" style={{ background: form.accentColor }} />

              <button type="submit" disabled={uploading}
                className="w-full py-3.5 rounded-xl font-black text-sm tracking-wider uppercase transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: form.accentColor, color: "#111" }}>
                {uploading
                  ? (isEdit ? "Updating..." : "Uploading...")
                  : (isEdit ? "✎ Update Blob" : "⬆ Upload Blob")}
              </button>
            </form>
          </div>
        </div>

        {/* BLOB LIST */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-[family-name:var(--font-fredoka)] text-xl text-white/80">
              All Blobs <span className="text-white/25 text-base ml-1">({blobs.length})</span>
            </h2>
          </div>

          {blobs.length === 0 ? (
            <div className="border border-dashed border-white/10 rounded-2xl p-16 text-center text-white/20 font-black tracking-wider uppercase text-sm">
              No blobs yet. Upload your first one!
            </div>
          ) : (
            <div className="space-y-3">
              {blobs.map(b => (
                <div key={b.id}
                  className={`flex items-center gap-4 bg-white/[0.03] border rounded-2xl p-4 hover:border-white/10 transition-all group ${editingId === b.id ? "border-[#a78bfa]/30 bg-[#a78bfa]/5" : "border-white/[0.06]"}`}>
                  <img src={b.render} alt={b.name} className="w-16 h-16 rounded-xl object-cover bg-black flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-[family-name:var(--font-fredoka)] text-base text-white">{b.name}</span>
                      <span className="text-[0.6rem] font-black tracking-[2px] uppercase" style={{ color: b.accentColor }}>{b.app}</span>
                    </div>
                    <div className="text-white/25 text-[0.72rem] font-bold truncate">{b.bio}</div>
                    <div className="flex gap-1.5 mt-1.5">
                      <span className="text-[0.58rem] px-2 py-0.5 rounded border border-white/5 text-white/20 font-black uppercase tracking-wider">{b.pack}</span>
                      {b.files.map(f => (
                        <span key={f.format} className="text-[0.58rem] px-2 py-0.5 rounded border border-white/5 text-white/20 font-black uppercase tracking-wider">{f.format}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={() => startEdit(b)}
                      className="text-[0.65rem] font-black uppercase tracking-wider text-[#a78bfa]/50 hover:text-[#a78bfa] px-2 py-1 rounded border border-white/10 hover:border-[#a78bfa]/30 transition-all">
                      Edit
                    </button>
                    <a href={b.render} target="_blank" rel="noopener"
                      className="text-[0.65rem] font-black uppercase tracking-wider text-white/30 hover:text-white px-2 py-1 rounded border border-white/10 hover:border-white/25 transition-all">
                      View
                    </a>
                    <button onClick={() => handleDelete(b.id, b.name)}
                      className="text-[0.65rem] font-black uppercase tracking-wider text-red-400/50 hover:text-red-400 px-2 py-1 rounded border border-white/10 hover:border-red-400/30 transition-all">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {msg && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-2.5 rounded-full text-[0.75rem] font-black tracking-widest uppercase border transition-all ${msg.ok ? "bg-[#1a2e1a] border-[#34d399]/30 text-[#34d399]" : "bg-[#2e1a1a] border-red-400/30 text-red-400"}`}>
          {msg.ok ? "✓" : "✕"} {msg.text}
        </div>
      )}
    </div>
  )
}
