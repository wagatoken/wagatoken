"use client"

import type React from "react"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export const FeatureCard = ({
  icon,
  title,
  description,
}: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <motion.div whileHover={{ y: -5 }} className="feature-card rounded-xl p-6">
      <div className="mb-4">{icon}</div>
      <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </motion.div>
  )
}

export const CTAButton = ({ href, children }: { href: string; children: React.ReactNode }) => {
  return (
    <Link
      href={href}
      className="group inline-flex items-center rounded-full bg-emerald-600 px-6 py-3 text-white transition-all hover:bg-emerald-700"
    >
      {children}
      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
    </Link>
  )
}

export const GradientText = ({ children }: { children: React.ReactNode }) => {
  return <span className="gradient-text">{children}</span>
}

export const AnimatedImage = ({
  src,
  alt,
  width,
  height,
}: { src: string; alt: string; width: number; height: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="overflow-hidden rounded-lg"
    >
      <img src={src || "/placeholder.svg"} alt={alt} width={width} height={height} className="w-full" />
    </motion.div>
  )
}

