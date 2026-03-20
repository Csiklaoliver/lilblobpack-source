"use client"
import { useState, useCallback } from "react"

export function useToast() {
  const [msg, setMsg] = useState("")
  const [visible, setVisible] = useState(false)

  const show = useCallback((text: string) => {
    setMsg(text)
    setVisible(true)
    setTimeout(() => setVisible(false), 2200)
  }, [])

  return { msg, visible, show }
}

export function Toast({ msg, visible }: { msg: string; visible: boolean }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-2.5 rounded-full bg-[#1a1a2e] border border-white/10 text-white text-[0.75rem] font-black tracking-widest uppercase whitespace-nowrap transition-all duration-300 ${visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
      ✓ {msg}
    </div>
  )
}
