"use client"

import { useState, useEffect } from "react"
import { BlockchainCanvas } from "./blockchain-2d"

interface BlockchainPlaceholderProps {
  className?: string
  height?: string | number
  width?: string | number
  variant?: "default" | "circular" | "grid"
  nodeCount?: number
  alt?: string
}

export function BlockchainPlaceholder({
  className = "",
  height = 400,
  width = "100%",
  variant = "default",
  nodeCount = 15,
  alt = "Blockchain visualization",
}: BlockchainPlaceholderProps) {
  const [mounted, setMounted] = useState(false)

  // Check if client-side
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate height based on prop
  const heightStyle = typeof height === "number" ? `${height}px` : height

  // Style for container
  const containerStyle = {
    height: heightStyle,
    width: typeof width === "number" ? `${width}px` : width,
    position: "relative" as const,
  }

  // If not mounted yet, show nothing to avoid hydration mismatch
  if (!mounted) {
    return (
      <div style={containerStyle} className={`rounded-xl overflow-hidden web3-card ${className}`} aria-label={alt} />
    )
  }

  return (
    <div style={containerStyle} className={`rounded-xl overflow-hidden web3-card ${className}`} aria-label={alt}>
      <BlockchainCanvas variant={variant} nodeCount={nodeCount} />
    </div>
  )
}

