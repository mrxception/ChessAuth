import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"

interface ModernCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function ModernCard({ children, className = "", hover = true }: ModernCardProps) {
  return (
    <Card
      className={`
        glass border-yellow-500/20 
        ${hover ? "hover-glow cursor-pointer" : ""} 
        ${className}
      `}
    >
      {children}
    </Card>
  )
}
