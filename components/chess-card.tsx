import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"

interface ChessCardProps {
  children: ReactNode
  className?: string
  variant?: "light" | "dark"
}

export function ChessCard({ children, className = "", variant = "dark" }: ChessCardProps) {
  const bgColor = variant === "light" ? "bg-[#2a2a2a]" : "bg-[#1e1e1e]"

  return <Card className={`${bgColor} border-[#3a3a3a] text-white ${className}`}>{children}</Card>
}
