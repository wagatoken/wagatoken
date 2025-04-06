"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"

const categories = [
  {
    id: "cultivation",
    name: "Coffee Cultivation",
    description: "Learn sustainable farming practices and cultivation techniques",
    color: "emerald",
  },
  {
    id: "processing",
    name: "Coffee Processing",
    description: "Master processing methods that preserve quality and flavor",
    color: "purple",
  },
  {
    id: "web3",
    name: "Web3 & Blockchain",
    description: "Explore blockchain applications in the coffee supply chain",
    color: "emerald",
  },
  {
    id: "finance",
    name: "DeFi & Finance",
    description: "Understand decentralized finance solutions for coffee farmers",
    color: "purple",
  },
]

export function CategorySelector() {
  const [activeCategory, setActiveCategory] = useState(categories[0].id)

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`relative p-4 rounded-lg transition-all duration-300 overflow-hidden ${
              activeCategory === category.id
                ? "ring-2 ring-opacity-70 shadow-lg transform -translate-y-1"
                : "opacity-80 hover:opacity-100 hover:-translate-y-0.5"
            }`}
            style={{
              ring:
                activeCategory === category.id
                  ? category.color === "emerald"
                    ? "rgb(16, 185, 129)"
                    : "rgb(147, 51, 234)"
                  : "transparent",
            }}
          >
            <div className="absolute inset-0 opacity-80">
              {category.color === "emerald" ? (
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 to-emerald-800/80 backdrop-blur-sm"></div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 to-purple-800/80 backdrop-blur-sm"></div>
              )}
            </div>

            {/* Animated border */}
            {activeCategory === category.id && (
              <motion.div
                className={`absolute inset-0 rounded-lg ${
                  category.color === "emerald" ? "animate-border-glow" : "animate-purple-border-glow"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                layoutId="categoryBorder"
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                style={{
                  border: "1px solid",
                  borderColor: category.color === "emerald" ? "rgba(16, 185, 129, 0.5)" : "rgba(147, 51, 234, 0.5)",
                }}
              />
            )}

            <div className="relative z-10">
              <h3
                className={`font-medium mb-1 ${
                  category.color === "emerald" ? "web3-gradient-text" : "web3-purple-gradient-text"
                }`}
              >
                {category.name}
              </h3>
              <p className="text-sm text-white/80 mb-2">{category.description}</p>

              {activeCategory === category.id && (
                <motion.div
                  className="flex items-center text-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <span className={category.color === "emerald" ? "text-emerald-300" : "text-purple-300"}>
                    View courses
                  </span>
                  <ChevronRight
                    className={`h-3 w-3 ml-1 ${category.color === "emerald" ? "text-emerald-300" : "text-purple-300"}`}
                  />
                </motion.div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 p-6 rounded-lg web3-card-dual">
        <h3 className="text-xl font-medium mb-4 web3-dual-gradient-text-glow">
          {categories.find((c) => c.id === activeCategory)?.name} Courses
        </h3>
        <p className="text-white/80">Select a category above to explore our curriculum in that area.</p>
      </div>
    </div>
  )
}

