"use client"

import type React from "react"

import { useScrollTop } from "@/hooks/use-scroll-top"

interface ScrollToTopProps {
  children: React.ReactNode
}

export function ScrollToTop({ children }: ScrollToTopProps) {
  useScrollTop()

  return <>{children}</>
}

