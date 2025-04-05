"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface DynamicGlowCardProps {
  children: React.ReactNode
  className?: string
  variant?: "emerald" | "purple" | "dual" | "blue" | "teal"
  intensity?: "low" | "medium" | "high"
  interactive?: boolean
}

export default function DynamicGlowCard({
  children,
  className = "",
  variant = "emerald",
  intensity = "medium",
  interactive = true,
}: DynamicGlowCardProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Set up color variables based on variant
  const getGlowColor = () => {
    switch (variant) {
      case "emerald":
        return "rgba(16, 185, 129, 0.7)"
      case "purple":
        return "rgba(147, 51, 234, 0.7)"
      case "dual":
        return "conic-gradient(from 0deg, rgba(16, 185, 129, 0.7), rgba(147, 51, 234, 0.7), rgba(16, 185, 129, 0.7))"
      case "blue":
        return "rgba(59, 130, 246, 0.7)"
      case "teal":
        return "rgba(20, 184, 166, 0.7)"
      default:
        return "rgba(16, 185, 129, 0.7)"
    }
  }

  const getBorderColor = () => {
    switch (variant) {
      case "emerald":
        return "border-emerald-500/30"
      case "purple":
        return "border-purple-500/30"
      case "dual":
        return "border-emerald-500/20 border-r-purple-500/20"
      case "blue":
        return "border-blue-500/30"
      case "teal":
        return "border-teal-500/30"
      default:
        return "border-emerald-500/30"
    }
  }

  const getBackgroundGradient = () => {
    switch (variant) {
      case "emerald":
        return "bg-gradient-to-br from-emerald-900/40 to-emerald-800/20"
      case "purple":
        return "bg-gradient-to-br from-purple-900/40 to-purple-800/20"
      case "dual":
        return "bg-gradient-to-br from-emerald-900/30 to-purple-900/30"
      case "blue":
        return "bg-gradient-to-br from-blue-900/40 to-blue-800/20"
      case "teal":
        return "bg-gradient-to-br from-teal-900/40 to-teal-800/20"
      default:
        return "bg-gradient-to-br from-emerald-900/40 to-emerald-800/20"
    }
  }

  // Get intensity values
  const getIntensityValues = () => {
    // Get smaller values for mobile screens
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768

    switch (intensity) {
      case "low":
        return {
          opacity: isMobile ? 0.2 : 0.3,
          blur: isMobile ? "blur-sm" : "blur-md",
          spread: isMobile ? 5 : 10,
        }
      case "medium":
        return {
          opacity: isMobile ? 0.3 : 0.5,
          blur: isMobile ? "blur-md" : "blur-lg",
          spread: isMobile ? 10 : 15,
        }
      case "high":
        return {
          opacity: isMobile ? 0.5 : 0.7,
          blur: isMobile ? "blur-lg" : "blur-xl",
          spread: isMobile ? 15 : 20,
        }
      default:
        return {
          opacity: isMobile ? 0.3 : 0.5,
          blur: isMobile ? "blur-md" : "blur-lg",
          spread: isMobile ? 10 : 15,
        }
    }
  }

  const intensityValues = getIntensityValues()

  useEffect(() => {
    if (!cardRef.current || !interactive) return

    const updateDimensions = () => {
      if (cardRef.current) {
        setDimensions({
          width: cardRef.current.offsetWidth,
          height: cardRef.current.offsetHeight,
        })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)

    return () => {
      window.removeEventListener("resize", updateDimensions)
    }
  }, [interactive])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !interactive) return

    const rect = cardRef.current.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "relative overflow-hidden rounded-xl border backdrop-blur-md",
        getBorderColor(),
        getBackgroundGradient(),
        className,
      )}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
      onMouseMove={handleMouseMove}
      whileHover={interactive ? { y: -5, transition: { duration: 0.3 } } : {}}
    >
      {/* Interactive glow effect that follows cursor */}
      {interactive && isHovered && (
        <div
          className="absolute pointer-events-none transition-opacity duration-300"
          style={{
            background: getGlowColor(),
            borderRadius: "100%",
            width: dimensions.width * 0.8,
            height: dimensions.height * 0.8,
            opacity: intensityValues.opacity,
            left: mousePosition.x - dimensions.width * 0.4,
            top: mousePosition.y - dimensions.height * 0.4,
            filter: `blur(${intensityValues.spread}px)`,
            zIndex: -1,
          }}
        />
      )}

      {/* Ambient glow effect */}
      <div
        className={cn("absolute inset-0 opacity-0 transition-opacity duration-500 z-[-1]", {
          "opacity-30": !isHovered || !interactive,
        })}
        style={{
          background: getGlowColor(),
          filter: `blur(${intensityValues.spread}px)`,
        }}
      />

      {/* Pulsing border effect */}
      <div
        className="absolute inset-0 z-[-1] rounded-xl opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovered && interactive ? 0.5 : 0,
          border: `1px solid ${typeof getGlowColor() === "string" ? getGlowColor() : "rgba(16, 185, 129, 0.7)"}`,
          boxShadow: `0 0 ${intensityValues.spread}px ${
            typeof getGlowColor() === "string" ? getGlowColor() : "rgba(16, 185, 129, 0.7)"
          }`,
          animation: "pulse 2s infinite",
        }}
      />

      {/* Card content */}
      {children}
    </motion.div>
  )
}

