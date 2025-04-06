"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, CheckCircle } from "lucide-react"

export function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      // In a real app, you would send this to your API
      console.log("Subscribing email:", email)
      setIsSubmitted(true)
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative rounded-xl overflow-hidden">
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/40 via-purple-900/30 to-emerald-900/40 backdrop-blur-sm"></div>

        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full filter blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full filter blur-3xl animate-float animation-delay-2000"></div>

        {/* Border */}
        <div
          className="absolute inset-0 rounded-xl animate-dual-border-glow"
          style={{
            border: "1px solid",
            borderImageSlice: 1,
            borderImageSource: "linear-gradient(to right, rgba(16, 185, 129, 0.5), rgba(147, 51, 234, 0.5))",
          }}
        ></div>

        {/* Content */}
        <div className="relative z-10 p-8 md:p-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 web3-dual-gradient-text-glow">Stay Updated</h2>
            <p className="text-white/80 max-w-lg mx-auto">
              Subscribe to our newsletter for the latest updates on courses, events, and Web3 innovations in the coffee
              industry
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-grow bg-black/15 border-white/10 focus:border-white/20 text-white placeholder:text-white/50"
                />
                <Button
                  type="submit"
                  className="web3-button-glow bg-gradient-to-r from-emerald-600 to-purple-600 border border-white/10 hover:border-white/20"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Subscribe
                </Button>
              </div>
            </form>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="inline-flex items-center justify-center mb-2">
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-medium mb-1 web3-gradient-text">Thank You!</h3>
              <p className="text-white/80">You've been successfully subscribed to our newsletter.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

