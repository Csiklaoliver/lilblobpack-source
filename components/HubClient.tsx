"use client"
import { useState } from "react"
import Link from "next/link"
import BlobCard from "./BlobCard"
import { Toast, useToast } from "./Toast"
import type { Blob } from "@/lib/store"

interface Pack { label: string; slug: string; blobs: Blob[] }

const PACK_META: Record<string, { vol: string; desc: string; accent: string; accent2: string }> = {
  app:    { vol: "Vol. 01", desc: "The OGs. Your daily drivers, now in blob form.",              accent: "#1db954", accent2: "#5865f2" },
  dev:    { vol: "Vol. 02", desc: "For the nerds. Perfect for your README or portfolio.",         accent: "#7c3aed", accent2: "#1db954" },
  stream: { vol: "Vol. 03", desc: "For the couch potatoes. Just one more episode.",               accent: "#e50914", accent2: "#9146ff" },
}

export default function HubClient({ packs, allBlobs }: { packs: Pack[]; allBlobs: Blob[] }) {
  const { msg, visible, show } = useToast()

  return (
    <div className="min-h-screen bg-[#07070f] text-white font-[family-name:var(--font-nunito)]">
      {/* BG orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute w-[700px] h-[700px] rounded-full blur-[130px] opacity-[0.09] bg-[#1db954] -top-48 -left-48 animate-[orbA_20s_ease-in-out_infinite]" />
        <div className="absolute w-[600px] h-[600px] rounded-full blur-[130px] opacity-[0.10] bg-[#5865f2] -bottom-36 -right-36 animate-[orbB_20s_ease-in-out_infinite]" />
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[130px] opacity-[0.07] bg-[#e50914] top-1/2 left-1/2 animate-[orbA_25s_ease-in-out_infinite]" />
      </div>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-[#07070f]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <span className="font-[family-name:var(--font-fredoka)] text-xl bg-gradient-to-r from-[#a78bfa] via-[#34d399] to-[#60a5fa] bg-clip-text text-transparent">
          Lil&apos; Blob Pack
        </span>
        <div className="flex items-center gap-2">
          {packs.map(p => (
            <a key={p.slug} href={`#${p.slug}`}
              className="text-[0.7rem] font-black tracking-widest uppercase text-white/30 hover:text-white px-3 py-1.5 rounded-lg border border-transparent hover:border-white/10 transition-all">
              {p.label}
            </a>
          ))}
          <Link href="/admin"
            className="ml-2 text-[0.7rem] font-black tracking-widest uppercase text-white/20 hover:text-white/60 px-3 py-1.5 rounded-lg border border-white/5 hover:border-white/15 transition-all">
            Admin
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-20">
        <div className="inline-flex items-center gap-2 text-[0.65rem] font-black tracking-[3px] uppercase text-white/30 border border-white/[0.08] px-5 py-1.5 rounded-full mb-8">
          <span className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse" />
          Free 3D Mascots &nbsp;·&nbsp; oliverprojects.tech
        </div>

        <h1 className="font-[family-name:var(--font-fredoka)] text-[clamp(3.5rem,10vw,7rem)] leading-none mb-5">
          Lil&apos;{" "}
          <span className="bg-gradient-to-r from-[#a78bfa] via-[#34d399] to-[#60a5fa] bg-clip-text text-transparent">
            Blob Pack
          </span>
        </h1>

        <p className="text-white/30 font-bold text-base max-w-md leading-relaxed mb-12">
          Cute chubby 3D mascots for your favourite apps.<br />All free, all yours. No strings attached.
        </p>

        {/* stats */}
        <div className="inline-flex border border-white/[0.08] rounded-xl overflow-hidden mb-14">
          {[
            { val: allBlobs.length.toString(), label: "blobs" },
            { val: packs.length.toString(), label: "packs" },
            { val: "FBX", label: "+ GLB" },
            { val: "FREE", label: "forever" },
          ].map((s, i) => (
            <div key={i} className="px-7 py-4 border-r border-white/[0.08] last:border-r-0 text-center">
              <div className="font-[family-name:var(--font-fredoka)] text-2xl text-white">{s.val}</div>
              <div className="text-[0.6rem] font-black tracking-[2px] uppercase text-white/25 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* floating blob previews */}
        {allBlobs.length > 0 && (
          <div className="flex gap-4 flex-wrap justify-center mb-4">
            {allBlobs.map((b, i) => (
              <img key={b.id} src={b.render} alt={b.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-white/[0.06] bg-black hover:scale-125 hover:-translate-y-2 transition-transform duration-300 cursor-default"
                style={{ animation: `${i % 2 === 0 ? "bobA" : "bobB"} ${3 + (i % 3) * 0.4}s ease-in-out infinite` }}
              />
            ))}
          </div>
        )}

        {allBlobs.length === 0 && (
          <div className="text-white/20 font-black tracking-widest uppercase text-sm">
            No blobs yet — add some in admin!
          </div>
        )}

        {/* scroll hint */}
        <div className="absolute bottom-8 flex flex-col items-center gap-2 text-[0.6rem] font-black tracking-[3px] uppercase text-white/20">
          <span>Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/20 to-transparent animate-pulse" />
        </div>
      </section>

      {/* PACK SECTIONS */}
      {packs.map((pack, pi) => {
        const meta = PACK_META[pack.slug] ?? { vol: `Vol. 0${pi + 1}`, desc: "", accent: "#a78bfa", accent2: "#60a5fa" }
        return (
          <div key={pack.slug}>
            <div className="max-w-[1100px] mx-auto px-6">
              <div className="h-px bg-white/[0.06]" />
            </div>
            <section id={pack.slug} className="relative z-10 max-w-[1100px] mx-auto px-6 py-24">
              <div className="mb-12">
                <div className="text-[0.65rem] font-black tracking-[3px] uppercase mb-2" style={{ color: meta.accent }}>
                  {meta.vol}
                </div>
                <h2 className="font-[family-name:var(--font-fredoka)] text-[clamp(2rem,5vw,3.2rem)] text-white mb-2">
                  {pack.label}{" "}
                  <span style={{ color: meta.accent }}>✦</span>
                </h2>
                <p className="text-white/30 font-bold text-sm">{meta.desc}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pack.blobs.map(blob => (
                  <BlobCard key={blob.id} blob={blob} onCopy={show} />
                ))}
              </div>
            </section>
          </div>
        )
      })}

      {/* FOOTER */}
      <div className="max-w-[1100px] mx-auto px-6"><div className="h-px bg-white/[0.06]" /></div>
      <footer className="relative z-10 text-center py-16 px-6">
        <div className="font-[family-name:var(--font-fredoka)] text-3xl bg-gradient-to-r from-[#a78bfa] via-[#34d399] to-[#60a5fa] bg-clip-text text-transparent mb-3">
          Lil&apos; Blob Pack
        </div>
        <p className="text-white/20 font-bold text-[0.72rem] tracking-wider mb-6">
          Free forever · No credit required but appreciated · Made by Csiklaoliver
        </p>
        <div className="flex gap-6 justify-center text-[0.65rem] font-black tracking-[2px] uppercase">
          {["GitHub", ...packs.map(p => p.label)].map((l, i) => (
            <a key={i}
              href={l === "GitHub" ? "https://github.com/csiklaoliver" : `#${packs.find(p => p.label === l)?.slug}`}
              className="text-white/25 hover:text-white transition-colors">
              {l}
            </a>
          ))}
        </div>
      </footer>

      <Toast msg={msg} visible={visible} />

      <style>{`
        @keyframes orbA { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-30px)} }
        @keyframes orbB { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,25px)} }
        @keyframes bobA  { 0%,100%{transform:translateY(0)}    50%{transform:translateY(-10px)} }
        @keyframes bobB  { 0%,100%{transform:translateY(-5px)} 50%{transform:translateY(5px)} }
      `}</style>
    </div>
  )
}
