"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type DynamicGlowCardProps = {
  children: ReactNode
  className?: string
  variant?: "emerald" | "purple" | "dual" | "featured"
}

export default function DynamicGlowCard({ children, className, variant = "emerald" }: DynamicGlowCardProps) {
  const getCardClasses = () => {
    switch (variant) {
      case "emerald":
        return "border-emerald-500/30 bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 shadow-emerald-500/20"
      case "purple":
        return "border-purple-500/30 bg-gradient-to-br from-purple-900/40 to-purple-800/20 shadow-purple-500/20"
      case "dual":
        return "border border-emerald-500/30 bg-gradient-to-br from-emerald-900/40 via-purple-900/20 to-emerald-900/30 shadow-[0_0_15px_rgba(16,185,129,0.2),_0_0_15px_rgba(147,51,234,0.2)]"
      case "featured":
        return "border-emerald-500/50 bg-gradient-to-br from-emerald-900/50 via-emerald-800/40 to-emerald-900/30 shadow-emerald-500/30"
      default:
        return "border-emerald-500/30 bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 shadow-emerald-500/20"
    }
  }

  return (
    <div
      className={cn(
        "rounded-lg border backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-xl",
        getCardClasses(),
        className,
      )}
    >
      {children}
    </div>
  )
}

