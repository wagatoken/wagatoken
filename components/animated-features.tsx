"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Leaf, Coins, LineChart, Shield, Users, BookOpen, Globe, Coffee } from "lucide-react"

const features = [
  {
    icon: Leaf,
    title: "Sustainable Practices",
    description: "Learn eco-friendly farming techniques that preserve soil health and biodiversity",
    color: "emerald",
  },
  {
    icon: Coins,
    title: "Tokenized Assets",
    description: "Understand how coffee assets can be tokenized for fair pricing and market access",
    color: "purple",
  },
  {
    icon: LineChart,
    title: "Market Analytics",
    description: "Access real-time data and analytics to make informed business decisions",
    color: "emerald",
  },
  {
    icon: Shield,
    title: "Secure Transactions",
    description: "Implement blockchain solutions for transparent and secure coffee trading",
    color: "purple",
  },
  {
    icon: Users,
    title: "Community Building",
    description: "Connect with a global network of coffee professionals and enthusiasts",
    color: "emerald",
  },
  {
    icon: BookOpen,
    title: "Expert Curriculum",
    description: "Learn from industry experts with decades of experience in coffee and technology",
    color: "purple",
  },
  {
    icon: Globe,
    title: "Global Perspective",
    description: "Gain insights into international markets and cross-border coffee trading",
    color: "emerald",
  },
  {
    icon: Coffee,
    title: "Quality Assurance",
    description: "Master techniques for ensuring consistent coffee quality from farm to cup",
    color: "purple",
  },
]

export function AnimatedFeatures() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => {
          const isEmerald = feature.color === "emerald"

          return (
            <motion.div
              key={index}
              className="relative rounded-xl overflow-hidden"
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
            >
              <div
                className={`absolute inset-0 ${
                  isEmerald
                    ? "bg-gradient-to-br from-emerald-900/90 to-emerald-800/80"
                    : "bg-gradient-to-br from-purple-900/90 to-purple-800/80"
                } backdrop-blur-sm`}
              ></div>

              {/* Animated border */}
              <div
                className={`absolute inset-0 rounded-xl ${
                  isEmerald ? "animate-border-glow" : "animate-purple-border-glow"
                }`}
                style={{
                  border: "1px solid",
                  borderColor: isEmerald ? "rgba(16, 185, 129, 0.5)" : "rgba(147, 51, 234, 0.5)",
                }}
              ></div>

              {/* Hover effect */}
              {hoveredIndex === index && (
                <motion.div
                  className="absolute inset-0 opacity-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.2 }}
                  exit={{ opacity: 0 }}
                >
                  <div className={`absolute inset-0 ${isEmerald ? "bg-emerald-400" : "bg-purple-400"}`}></div>
                </motion.div>
              )}

              <div className="relative z-10 p-6">
                <div
                  className={`inline-flex items-center justify-center p-3 rounded-full mb-4 ${
                    isEmerald ? "bg-emerald-500/20" : "bg-purple-500/20"
                  }`}
                >
                  <feature.icon className={`h-6 w-6 ${isEmerald ? "text-emerald-300" : "text-purple-300"}`} />
                </div>

                <h3
                  className={`text-lg font-medium mb-2 ${
                    isEmerald ? "web3-gradient-text" : "web3-purple-gradient-text"
                  }`}
                >
                  {feature.title}
                </h3>

                <p className="text-white/80 text-sm">{feature.description}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

