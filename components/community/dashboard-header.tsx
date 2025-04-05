"use client"

import { motion } from "framer-motion"

interface DashboardHeaderProps {
  title: string
  description?: string
}

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <h1 className="text-3xl font-bold tracking-tight mb-2">
        <span className="hero-gradient-text">{title}</span>
      </h1>
      {description && <p className="text-gray-400 max-w-3xl">{description}</p>}
    </motion.div>
  )
}

