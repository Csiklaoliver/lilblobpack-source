"use client"
import { Blob } from "@/lib/store"

interface Props {
  blob: Blob
  onCopy?: (text: string) => void
}

export default function BlobCard({ blob, onCopy }: Props) {
  const accent = blob.accentColor || "#a78bfa"

  return (
    <div
      className="group bg-[#0e0e1c] border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2"
      style={{
        ["--accent" as string]: accent,
        boxShadow: "0 0 0 transparent",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 24px 50px ${accent}25`
        ;(e.currentTarget as HTMLElement).style.borderColor = `${accent}40`
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 transparent"
        ;(e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.05)"
      }}
    >
      {/* top color bar */}
      <div className="h-[3px] w-full" style={{ background: accent }} />

      {/* render */}
      <div className="overflow-hidden bg-black aspect-square">
        <img
          src={blob.render}
          alt={blob.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* body */}
      <div className="p-5">
        <div className="text-[0.6rem] font-black tracking-[3px] uppercase mb-1" style={{ color: accent }}>
          {blob.app}
        </div>
        <div className="font-['Fredoka_One'] text-2xl text-white mb-2">{blob.name}</div>

        {/* formats */}
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {blob.files.map(f => (
            <span key={f.format} className="text-[0.58rem] px-2 py-0.5 rounded border border-white/5 bg-white/[0.03] text-white/30 font-black tracking-wider uppercase">
              {f.format}
            </span>
          ))}
          {blob.files[0] && (
            <span className="text-[0.58rem] px-2 py-0.5 rounded border border-white/5 bg-white/[0.03] text-white/30 font-black tracking-wider uppercase">
              {blob.files[0].size}
            </span>
          )}
        </div>

        <p className="text-[0.78rem] text-white/30 font-bold leading-relaxed mb-4">{blob.bio}</p>

        {/* actions */}
        <div className="flex gap-2 flex-wrap">
          {blob.files.map(f => (
            <a
              key={f.format}
              href={f.url}
              download
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-[0.72rem] font-black text-white transition-transform hover:scale-[1.04] active:scale-[0.97]"
              style={{ background: accent, color: isLight(accent) ? "#111" : "#fff" }}
            >
              ⬇ {f.format}
            </a>
          ))}
          <button
            onClick={() => onCopy?.(`${blob.name} by Csiklaoliver — lilblobpack.oliverprojects.tech`)}
            className="flex-none px-3 py-2.5 rounded-lg border border-white/5 text-white/30 text-[0.72rem] font-black transition-all hover:border-white/20 hover:text-white"
          >
            ⧉
          </button>
        </div>
      </div>
    </div>
  )
}

function isLight(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 128
}
