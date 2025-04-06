"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, ChevronRight } from "lucide-react"

const steps = [
  {
    id: 1,
    title: "Coffee Fundamentals",
    description: "Learn the basics of coffee cultivation, processing, and quality assessment",
    color: "emerald",
  },
  {
    id: 2,
    title: "Blockchain Basics",
    description: "Understand the core concepts of blockchain technology and its applications",
    color: "purple",
  },
  {
    id: 3,
    title: "Supply Chain Tracking",
    description: "Master the implementation of blockchain for coffee traceability",
    color: "emerald",
  },
  {
    id: 4,
    title: "Tokenization",
    description: "Learn how to tokenize coffee assets for global market access",
    color: "purple",
  },
  {
    id: 5,
    title: "DeFi Solutions",
    description: "Explore decentralized finance options for coffee farmers and businesses",
    color: "emerald",
  },
]

export function LearningPath() {
  const [activeStep, setActiveStep] = useState(1)

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 web3-dual-gradient-text-glow">Your Learning Journey</h2>
        <p className="text-white/80 max-w-2xl mx-auto">
          Follow our structured curriculum to master both coffee expertise and blockchain technology
        </p>
      </div>

      <div className="relative">
        {/* Progress line */}
        <div className="absolute left-[22px] top-8 bottom-8 w-1 bg-gradient-to-b from-emerald-500/30 via-purple-500/30 to-emerald-500/30 rounded-full"></div>

        <div className="space-y-6">
          {steps.map((step) => {
            const isActive = activeStep >= step.id
            const isEmerald = step.color === "emerald"

            return (
              <div key={step.id} className="relative" onClick={() => setActiveStep(step.id)}>
                <div className="flex items-start">
                  {/* Step indicator */}
                  <motion.div
                    className={`relative z-10 flex items-center justify-center w-11 h-11 rounded-full mr-4 cursor-pointer ${
                      isActive ? (isEmerald ? "bg-emerald-500" : "bg-purple-500") : "bg-gray-800"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    {isActive ? (
                      <Check className="h-5 w-5 text-white" />
                    ) : (
                      <span className="text-white font-medium">{step.id}</span>
                    )}

                    {/* Pulse effect for active step */}
                    {activeStep === step.id && (
                      <motion.div
                        className={`absolute inset-0 rounded-full ${isEmerald ? "bg-emerald-500" : "bg-purple-500"}`}
                        initial={{ opacity: 0.5, scale: 1 }}
                        animate={{ opacity: 0, scale: 1.5 }}
                        transition={{
                          repeat: Number.POSITIVE_INFINITY,
                          duration: 1.5,
                          repeatType: "loop",
                        }}
                      />
                    )}
                  </motion.div>

                  {/* Content */}
                  <div
                    className={`flex-1 p-4 rounded-lg cursor-pointer ${
                      isActive
                        ? isEmerald
                          ? "bg-emerald-900/40 border border-emerald-500/30"
                          : "bg-purple-900/40 border border-purple-500/30"
                        : "bg-gray-900/40 border border-gray-700/30"
                    }`}
                  >
                    <h3
                      className={`font-medium mb-1 ${
                        isActive ? (isEmerald ? "web3-gradient-text" : "web3-purple-gradient-text") : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p className={`text-sm ${isActive ? "text-white/80" : "text-gray-500"}`}>{step.description}</p>

                    {isActive && (
                      <div className="flex items-center mt-2 text-xs">
                        <span className={isEmerald ? "text-emerald-300" : "text-purple-300"}>
                          {step.id === activeStep ? "Current step" : "Completed"}
                        </span>
                        {step.id === activeStep && (
                          <ChevronRight
                            className={`h-3 w-3 ml-1 ${isEmerald ? "text-emerald-300" : "text-purple-300"}`}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

