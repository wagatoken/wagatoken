"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

interface SecondaryNavProps {
  items: {
    title: string
    href: string
    icon?: React.ReactNode
  }[]
  className?: string
}

export function SecondaryNav({ items, className }: SecondaryNavProps) {
  const pathname = usePathname()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  useEffect(() => {
    const index = items.findIndex((item) => item.href === pathname)
    setActiveIndex(index !== -1 ? index : null)
  }, [pathname, items])

  return (
    <div
      className={cn(
        "flex overflow-x-auto scrollbar-hide py-2 px-4 bg-gradient-to-r from-emerald-950/60 to-purple-950/60 backdrop-blur border-y border-emerald-500/10",
        className,
      )}
    >
      <nav className="flex items-center space-x-1 mx-auto">
        {items.map((item, index) => {
          const isActive = index === activeIndex

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-300 whitespace-nowrap relative group",
                isActive
                  ? "text-white bg-gradient-to-r from-emerald-500/20 to-purple-500/20"
                  : "text-muted-foreground hover:text-white",
              )}
            >
              {item.icon && (
                <span
                  className={cn(
                    "mr-2",
                    isActive ? "text-emerald-400" : "text-muted-foreground group-hover:text-purple-400",
                  )}
                >
                  {item.icon}
                </span>
              )}
              <span>{item.title}</span>
              {index < items.length - 1 && <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-purple-500"></span>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

