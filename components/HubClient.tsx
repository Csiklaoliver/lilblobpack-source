"use client"
import { useState } from "react"
import Link from "next/link"
import BlobCard from "./BlobCard"
import { Toast, useToast } from "./Toast"
import type { Blob, Pack } from "@/lib/store"

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
          <a href="https://github.com/Csiklaoliver/lil-blob-pack" target="_blank" rel="noopener"
            className="ml-2 text-[0.7rem] font-black tracking-widest uppercase text-white/30 hover:text-[#f59e0b] px-3 py-1.5 rounded-lg border border-white/5 hover:border-[#f59e0b]/30 transition-all flex items-center gap-1.5">
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg>
            Star
          </a>
          <Link href="/admin"
            className="ml-1 text-[0.7rem] font-black tracking-widest uppercase text-white/20 hover:text-white/60 px-3 py-1.5 rounded-lg border border-white/5 hover:border-white/15 transition-all">
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

        {/* Stats */}
        <div className="inline-flex border border-white/[0.08] rounded-xl overflow-hidden mb-14">
          {[
            { val: allBlobs.length.toString(), label: "blobs" },
            { val: packs.length.toString(),    label: "packs" },
            { val: "FBX",                      label: "+ GLB" },
            { val: "FREE",                     label: "forever" },
          ].map((s, i) => (
            <div key={i} className="px-7 py-4 border-r border-white/[0.08] last:border-r-0 text-center">
              <div className="font-[family-name:var(--font-fredoka)] text-2xl text-white">{s.val}</div>
              <div className="text-[0.6rem] font-black tracking-[2px] uppercase text-white/25 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Floating blob previews */}
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

        <div className="absolute bottom-8 flex flex-col items-center gap-2 text-[0.6rem] font-black tracking-[3px] uppercase text-white/20">
          <span>Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/20 to-transparent animate-pulse" />
        </div>
      </section>

      {/* PACK SECTIONS */}
      {packs.map(pack => (
        <div key={pack.slug}>
          <div className="max-w-[1100px] mx-auto px-6">
            <div className="h-px bg-white/[0.06]" />
          </div>
          <section id={pack.slug} className="relative z-10 max-w-[1100px] mx-auto px-6 py-24">
            <div className="mb-12">
              <div className="text-[0.65rem] font-black tracking-[3px] uppercase mb-2" style={{ color: pack.accent }}>
                {pack.vol}
              </div>
              <h2 className="font-[family-name:var(--font-fredoka)] text-[clamp(2rem,5vw,3.2rem)] text-white mb-2">
                {pack.label}{" "}
                <span style={{ color: pack.accent }}>✦</span>
              </h2>
              <p className="text-white/30 font-bold text-sm">{pack.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pack.blobs.map(blob => (
                <BlobCard key={blob.id} blob={blob} onCopy={show} />
              ))}
            </div>
          </section>
        </div>
      ))}

      {/* REQUEST SECTION */}
      <div className="max-w-[1100px] mx-auto px-6"><div className="h-px bg-white/[0.06]" /></div>
      <section className="relative z-10 max-w-[1100px] mx-auto px-6 py-24 text-center">
        <div className="text-[0.65rem] font-black tracking-[3px] uppercase text-[#a78bfa] mb-4">Custom Requests</div>
        <h2 className="font-[family-name:var(--font-fredoka)] text-[clamp(2rem,5vw,3rem)] text-white mb-4">
          Want a blob for your app?
        </h2>
        <p className="text-white/30 font-bold text-sm max-w-sm mx-auto mb-8 leading-relaxed">
          Don&apos;t see your favourite app in the pack? Send a request and I&apos;ll consider adding it.
        </p>
        <a href="mailto:info@oliverprojects.tech"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl border border-[#a78bfa]/20 bg-[#a78bfa]/5 hover:bg-[#a78bfa]/10 hover:border-[#a78bfa]/40 transition-all group">
          <span className="text-[#a78bfa] text-lg">✉</span>
          <span className="font-black text-sm tracking-wider text-white/70 group-hover:text-white transition-colors">
            info@oliverprojects.tech
          </span>
        </a>
      </section>

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
