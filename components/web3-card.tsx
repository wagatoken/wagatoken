"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"

interface Web3CardProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "emerald" | "purple" | "blue" | "gradient" | "dual"
  hoverEffect?: boolean
}

export default function Web3Card({ children, className = "", variant = "default", hoverEffect = true }: Web3CardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getVariantClasses = () => {
    switch (variant) {
      case "emerald":
        return "border-emerald-400/40 bg-gradient-to-br from-emerald-800/40 to-emerald-700/20"
      case "purple":
        return "border-purple-500/30 bg-gradient-to-br from-purple-900/40 to-purple-800/20"
      case "blue":
        return "border-blue-500/30 bg-gradient-to-br from-blue-900/40 to-blue-800/20"
      case "gradient":
        return "border-emerald-400/40 bg-gradient-to-br from-emerald-800/30 via-blue-900/20 to-purple-900/30"
      case "dual":
        return "border-emerald-400/40 border-r-purple-500/40 bg-gradient-to-br from-emerald-800/30 to-purple-900/30"
      default:
        return "border-gray-800 bg-black/50"
    }
  }

  return (
    <motion.div
      className={`relative overflow-hidden rounded-xl border backdrop-blur-md ${getVariantClasses()} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={hoverEffect ? { y: -5, transition: { duration: 0.3 } } : {}}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 -z-10 opacity-0"
        animate={{
          boxShadow: isHovered
            ? variant === "emerald"
              ? "0 0 25px 8px rgba(16, 185, 129, 0.4)"
              : variant === "purple"
                ? "0 0 25px 8px rgba(147, 51, 234, 0.4)"
                : variant === "blue"
                  ? "0 0 25px 8px rgba(59, 130, 246, 0.4)"
                  : variant === "gradient"
                    ? "0 0 25px 8px rgba(16, 185, 129, 0.4)"
                    : variant === "dual"
                      ? "0 0 25px 8px rgba(16, 185, 129, 0.3), 0 0 25px 8px rgba(147, 51, 234, 0.3)"
                      : "0 0 25px 8px rgba(75, 85, 99, 0.4)"
            : "0 0 0 0 rgba(0, 0, 0, 0)",
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Border glow */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className={`absolute inset-0 rounded-xl ${
              variant === "emerald"
                ? "bg-emerald-400/15"
                : variant === "purple"
                  ? "bg-purple-500/15"
                  : variant === "blue"
                    ? "bg-blue-500/15"
                    : variant === "gradient"
                      ? "bg-emerald-400/15"
                      : "bg-gray-500/15"
            }`}
          />
        </motion.div>
      )}

      {children}
    </motion.div>
  )
}

