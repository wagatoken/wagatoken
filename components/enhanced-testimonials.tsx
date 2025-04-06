"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Maria Rodriguez",
    role: "Coffee Farmer, Colombia",
    quote:
      "WAGA Academy's blockchain course transformed how I track my coffee production. Now I can prove the quality and origin of my beans to buyers around the world.",
    color: "emerald",
  },
  {
    id: 2,
    name: "Daniel Muthoni",
    role: "Cooperative Manager, Kenya",
    quote:
      "The DeFi solutions we learned have helped our cooperative access fair financing without the traditional banking barriers. Our members are finally getting paid what they deserve.",
    color: "purple",
  },
  {
    id: 3,
    name: "Sophia Chen",
    role: "Coffee Importer, Singapore",
    quote:
      "Understanding the tokenization of coffee assets has opened new markets for our business. We're now connecting directly with farmers and offering better prices.",
    color: "emerald",
  },
  {
    id: 4,
    name: "Alejandro Gomez",
    role: "Sustainability Director, Mexico",
    quote:
      "The sustainable farming practices taught at WAGA Academy have helped us reduce water usage by 30% while improving our yield. Our community is healthier for it.",
    color: "purple",
  },
]

export function EnhancedTestimonials() {
  const [current, setCurrent] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [autoplay])

  const handlePrevious = () => {
    setAutoplay(false)
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const handleNext = () => {
    setAutoplay(false)
    setCurrent((prev) => (prev + 1) % testimonials.length)
  }

  const testimonial = testimonials[current]
  const isEmerald = testimonial.color === "emerald"

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/20 to-purple-950/20 rounded-xl -m-6 blur-3xl opacity-20"></div>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative p-8 rounded-xl overflow-hidden"
          >
            <div className={`absolute inset-0 ${isEmerald ? "web3-card-glass" : "web3-card-purple"}`}></div>

            <div className="relative z-10">
              <Quote className={`h-12 w-12 mb-4 opacity-20 ${isEmerald ? "text-emerald-300" : "text-purple-300"}`} />

              <blockquote className="text-xl md:text-2xl font-medium mb-6">"{testimonial.quote}"</blockquote>

              <div className="flex items-center">
                <div
                  className={`h-12 w-12 rounded-full mr-4 ${
                    isEmerald
                      ? "bg-gradient-to-br from-emerald-400 to-emerald-600"
                      : "bg-gradient-to-br from-purple-400 to-purple-600"
                  }`}
                >
                  <span className="sr-only">{testimonial.name}</span>
                </div>

                <div>
                  <div className={`font-medium ${isEmerald ? "web3-gradient-text" : "web3-purple-gradient-text"}`}>
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-white/70">{testimonial.role}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-4">
          <button
            onClick={handlePrevious}
            className="p-2 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 hover:bg-black/30 transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex space-x-2">
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                onClick={() => {
                  setAutoplay(false)
                  setCurrent(i)
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  current === i
                    ? t.color === "emerald"
                      ? "bg-emerald-400 scale-125"
                      : "bg-purple-400 scale-125"
                    : "bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="p-2 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 hover:bg-black/30 transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

