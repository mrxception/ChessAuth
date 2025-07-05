"use client"

import type { ReactNode } from "react"

interface ChessLayoutProps {
  children: ReactNode
  title?: string
}

export function ChessLayout({ children, title }: ChessLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Chess pattern background */}
      <div className="fixed inset-0 opacity-5">
        <div className="grid grid-cols-8 h-full">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className={`${Math.floor(i / 8) % 2 === i % 2 ? "bg-white" : "bg-black"}`} />
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-[#2a2a2a] bg-[#1a1a1a]/90 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">♔</span>
              <h1 className="text-xl font-bold text-[#FFD700]">ChessAuth</h1>
            </div>
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
