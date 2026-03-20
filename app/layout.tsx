import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Lil' Blob Pack — Free 3D Mascots",
  description: "Cute chubby 3D mascots for your favourite apps. All free, all yours.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#07070f] text-white antialiased overflow-x-hidden" style={{ fontFamily: "'Nunito', sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
