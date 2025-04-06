"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useInView } from "framer-motion"

const stats = [
  {
    value: 5000,
    label: "Farmers Impacted",
    prefix: "+",
    color: "emerald",
  },
  {
    value: 25,
    label: "Countries Represented",
    prefix: "",
    color: "purple",
  },
  {
    value: 40,
    label: "Expert Instructors",
    prefix: "",
    color: "emerald",
  },
  {
    value: 100,
    label: "Courses Planned",
    prefix: "+",
    color: "purple",
  },
]

export function ImpactStats() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const [counts, setCounts] = useState(stats.map(() => 0))

  useEffect(() => {
    if (!isInView) return

    const intervals = stats.map((stat, index) => {
      const duration = 2000 // 2 seconds for the count animation
      const increment = stat.value / (duration / 16) // 60fps

      return setInterval(() => {
        setCounts((prevCounts) => {
          const newCounts = [...prevCounts]
          if (newCounts[index] < stat.value) {
            newCounts[index] = Math.min(newCounts[index] + increment, stat.value)
          }
          return newCounts
        })
      }, 16)
    })

    return () => intervals.forEach((interval) => clearInterval(interval))
  }, [isInView])

  return (
    <div ref={ref} className="w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const isEmerald = stat.color === "emerald"

          return (
            <motion.div
              key={index}
              className="relative rounded-xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
            >
              <div
                className={`absolute inset-0 ${
                  isEmerald
                    ? "bg-gradient-to-br from-emerald-900/40 to-emerald-800/30"
                    : "bg-gradient-to-br from-purple-900/40 to-purple-800/30"
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

              <div className="relative z-10 p-6 text-center">
                <div
                  className={`text-4xl md:text-5xl font-bold mb-2 ${
                    isEmerald ? "web3-gradient-text-glow" : "web3-purple-gradient-text-glow"
                  }`}
                >
                  {stat.prefix}
                  {Math.round(counts[index])}
                </div>

                <p className="text-white/80">{stat.label}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

