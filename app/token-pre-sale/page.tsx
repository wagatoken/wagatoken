"use client"

import type React from "react"

import { motion } from "framer-motion"
import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Check, Coins, Gem, GraduationCap, Percent, Users, X } from "lucide-react"
import ParticleBackground from "@/components/particle-background"
import HexagonGrid from "@/components/hexagon-grid"
import Web3Button from "@/components/web3-button"
import Web3Card from "@/components/web3-card"
import DynamicGlowCard from "@/components/dynamic-glow-card"
import { Button } from "@/components/ui/button"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const gradientTextStyle = {
  color: "transparent",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  backgroundImage: "linear-gradient(to right, rgba(16, 185, 129, 1), rgba(147, 51, 234, 1), rgba(16, 185, 129, 1))",
  backgroundSize: "300% auto",
}

export default function TokenPreSalePage() {
  const [email, setEmail] = useState("")
  const [showNotification, setShowNotification] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // This would normally submit to a backend
    alert(`Thank you! We'll notify ${email} when the token sale begins.`)
    setEmail("")
    setShowNotification(false)
  }

  return (
    <div className="overflow-hidden">
      {/* Web3 Background Elements */}
      <ParticleBackground />
      <HexagonGrid className="opacity-30" />

      {/* Coming Soon Notification - Now a banner at the top instead of a full overlay */}
      {showNotification && (
        <div className="fixed top-20 left-0 right-0 z-40 flex justify-center px-4">
          <div className="max-w-2xl w-full">
            <DynamicGlowCard variant="purple" className="p-6" intensity="high">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-purple-300 purple-glow">Token Pre-Sale Coming Soon</h2>
                <button
                  onClick={() => setShowNotification(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-300 mb-4">
                Be the first to know when our token pre-sale launches. Sign up for notifications.
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-grow px-4 py-2 rounded-md bg-black/50 border border-purple-500/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  required
                />
                <Button
                  type="submit"
                  className="py-2 rounded-md bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white font-medium transition-all duration-200"
                >
                  Notify Me
                </Button>
              </form>
            </DynamicGlowCard>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-32 pb-32">
        {/* Animated background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/80"></div>
          <div className="absolute inset-0 bg-cyber-grid bg-[length:50px_50px] opacity-20"></div>

          {/* Animated token circles */}
          <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-1/3 right-1/4 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>

          {/* Floating blockchain nodes */}
          <div className="absolute top-1/3 right-1/3 flex space-x-2 animate-bounce" style={{ animationDuration: "6s" }}>
            <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
            <div className="h-2 w-2 rounded-full bg-purple-400"></div>
            <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
          </div>
          <div
            className="absolute bottom-1/4 left-1/3 flex space-x-2 animate-bounce"
            style={{ animationDuration: "8s", animationDelay: "1s" }}
          >
            <div className="h-2 w-2 rounded-full bg-purple-400"></div>
            <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
            <div className="h-2 w-2 rounded-full bg-purple-400"></div>
          </div>
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center sm:px-6 lg:px-8 max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Decorative elements */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full border border-emerald-500/20 animate-pulse"></div>
            <div
              className="absolute -top-10 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full border border-purple-500/20 animate-pulse"
              style={{ animationDelay: "0.5s" }}
            ></div>

            {/* Main content card with glow effect */}
            <div className="relative backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-2xl overflow-hidden">
              {/* Animated gradient border */}
              <div className="absolute inset-0 p-[1px] rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-purple-500 to-emerald-500 animate-[gradientShift_4s_linear_infinite] opacity-70"></div>
              </div>

              {/* Glowing orbs in background */}
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-purple-500/20 blur-2xl"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-emerald-500/20 blur-2xl"></div>

              <div className="relative z-10 space-y-10">
                {/* Token badge */}
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-purple-400 blur animate-pulse"></div>
                    <div className="relative px-6 py-2 rounded-full bg-black/80 border border-white/20 backdrop-blur-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 animate-pulse"></div>
                        <span className="text-white font-bold">WGTN TOKEN</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-emerald-400 mb-4 tracking-wide">WAGA PROTOCOL</h2>
                  <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                    <span className="block mb-4 web3-dual-gradient-text-glow">Utility Token Pre-Sale</span>
                  </h1>
                  <h3 className="text-xl sm:text-2xl font-medium text-gray-300/90 mt-6">
                    Empower, Transform, & Grow With Us
                  </h3>
                </div>

                <div className="mx-auto max-w-2xl">
                  <h2 className="text-2xl sm:text-3xl font-bold">
                    <span className="text-emerald-400">OnChain Coffee.</span>{" "}
                    <span className="text-purple-400">OffChart Impact</span>
                  </h2>
                </div>

                {/* Token metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/5">
                    <div className="text-emerald-400 font-bold text-2xl">30%</div>
                    <div className="text-gray-400 text-sm">Community Rewards</div>
                  </div>
                  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/5">
                    <div className="text-purple-400 font-bold text-2xl">$0.1</div>
                    <div className="text-gray-400 text-sm">Initial Price</div>
                  </div>
                  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/5">
                    <div className="text-emerald-400 font-bold text-2xl">1B</div>
                    <div className="text-gray-400 text-sm">Total Supply</div>
                  </div>
                  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/5">
                    <div className="text-purple-400 font-bold text-2xl">Q2 2025</div>
                    <div className="text-gray-400 text-sm">Launch Date</div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Buttons with enhanced styling */}
            <div className="mt-12 flex flex-col items-center justify-center space-y-5 sm:flex-row sm:space-x-6 sm:space-y-0">
              <Web3Button
                size="lg"
                variant="gradient"
                className="px-8 py-6 text-base relative group overflow-hidden"
                asChild
              >
                <Link href="#features">
                  <span className="relative z-10">Learn More</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Link>
              </Web3Button>

              <Web3Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-base border-emerald-500/50 hover:border-emerald-400 group"
                onClick={() => setShowNotification(true)}
              >
                <span className="bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent group-hover:text-white transition-colors duration-300">
                  Get Notified
                </span>
              </Web3Button>
            </div>

            {/* Animated scroll indicator */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce"
              style={{ animationDuration: "2s" }}
            >
              <div className="text-gray-400 mb-2">Scroll to explore</div>
              <div className="w-6 h-10 rounded-full border-2 border-gray-400 flex justify-center pt-1">
                <div className="w-1 h-2 bg-gray-400 rounded-full animate-[pulse_2s_infinite]"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="py-20 bg-black/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              <span className="web3-dual-gradient-text-glow" style={gradientTextStyle}>
                Key Features
              </span>
            </h2>
            <p className="mb-16 text-lg text-gray-400">
              Our utility token provides multiple benefits across the WAGA ecosystem
            </p>
          </div>

          <motion.div variants={staggerContainer} className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: (
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-sm"></div>
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg">
                      <Coins className="h-6 w-6 text-black" />
                    </div>
                  </div>
                ),
                title: "Staking Rewards",
                description:
                  "Stake WGTN tokens to earn a share in the platform's earnings and access exclusive features in the WAGA ecosystem.",
                variant: "emerald",
              },
              {
                icon: (
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-purple-500/20 blur-sm"></div>
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg">
                      <Percent className="h-6 w-6 text-black" />
                    </div>
                  </div>
                ),
                title: "Discounts",
                description:
                  "Token holders enjoy exclusive discounts when purchasing WAGA coffee products, enhancing value for loyal customers.",
                variant: "purple",
              },
              {
                icon: (
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-sm"></div>
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 shadow-lg">
                      <GraduationCap className="h-6 w-6 text-black" />
                    </div>
                  </div>
                ),
                title: "Academy",
                description:
                  "Gain access to role-based training and employment opportunities throughout the WAGA ecosystem.",
                variant: "emerald",
              },
              {
                icon: (
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-purple-500/20 blur-sm"></div>
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg">
                      <Gem className="h-6 w-6 text-black" />
                    </div>
                  </div>
                ),
                title: "Capability Building",
                description:
                  "Contribute directly to smallholder coffee farmer capability building programs, supporting sustainable coffee production.",
                variant: "purple",
              },
              {
                icon: (
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-sm"></div>
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 shadow-lg">
                      <Users className="h-6 w-6 text-black" />
                    </div>
                  </div>
                ),
                title: "Distributor Access",
                description:
                  "Token holders gain priority access to distributor opportunities in the WAGA ecosystem, enabling participation in the global coffee value chain.",
                variant: "emerald",
              },
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeIn} className={index === 4 ? "lg:col-start-2" : ""}>
                <DynamicGlowCard
                  variant={feature.variant as "emerald" | "purple"}
                  className="h-full p-6"
                  intensity="medium"
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="mb-2 text-xl font-bold text-emerald-300 glow-text">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </DynamicGlowCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Tokenomics Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              <span className="web3-dual-gradient-text-glow" style={gradientTextStyle}>
                Tokenomics
              </span>
            </h2>
            <p className="mb-16 text-lg text-gray-400">
              A balanced token allocation designed for long-term sustainability and growth
            </p>
          </div>

          <div className="grid gap-12 md:grid-cols-2">
            <motion.div variants={fadeIn}>
              <Web3Card variant="dual" className="h-full p-8 web3-card-glow">
                <h3 className="mb-6 text-2xl font-bold text-purple-300 purple-glow">Token Allocation</h3>
                <div className="space-y-4">
                  {[
                    { name: "Community Rewards & Staking", percentage: 30, color: "bg-emerald-400" },
                    { name: "Public Token Sale", percentage: 30, color: "bg-purple-400" },
                    { name: "Private Token Sale", percentage: 10, color: "bg-teal-400" },
                    { name: "Founding Team & Advisors", percentage: 5, color: "bg-blue-400" },
                    { name: "Development Team Personnel", percentage: 10, color: "bg-indigo-400" },
                    { name: "Development Fund", percentage: 5, color: "bg-pink-400" },
                    { name: "Community Engagement Fund", percentage: 10, color: "bg-yellow-400" },
                  ].map((item, index) => (
                    <div key={index} className="relative">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-300">{item.name}</span>
                        <span className="text-gray-300 font-medium">{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-800/50 rounded-full h-2.5">
                        <div
                          className={`${item.color} h-2.5 rounded-full`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Web3Card>
            </motion.div>

            <motion.div variants={fadeIn}>
              <DynamicGlowCard variant="emerald" className="h-full p-8">
                <h3 className="mb-6 text-2xl font-bold text-emerald-400 glow-text">Token Utility</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="mr-4 mt-1 relative">
                      <div className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-sm"></div>
                      <div className="relative flex h-5 w-5 items-center justify-center rounded-full bg-emerald-800">
                        <Check className="h-3 w-3 text-emerald-400" />
                      </div>
                    </div>
                    <p className="text-gray-300">Community governance participation rights</p>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-4 mt-1 relative">
                      <div className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-sm"></div>
                      <div className="relative flex h-5 w-5 items-center justify-center rounded-full bg-emerald-800">
                        <Check className="h-3 w-3 text-emerald-400" />
                      </div>
                    </div>
                    <p className="text-gray-300">Fee reductions on platform transactions</p>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-4 mt-1 relative">
                      <div className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-sm"></div>
                      <div className="relative flex h-5 w-5 items-center justify-center rounded-full bg-emerald-800">
                        <Check className="h-3 w-3 text-emerald-400" />
                      </div>
                    </div>
                    <p className="text-gray-300">Access to premium features and services</p>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-4 mt-1 relative">
                      <div className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-sm"></div>
                      <div className="relative flex h-5 w-5 items-center justify-center rounded-full bg-emerald-800">
                        <Check className="h-3 w-3 text-emerald-400" />
                      </div>
                    </div>
                    <p className="text-gray-300">Participation in community-driven initiatives</p>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-4 mt-1 relative">
                      <div className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-sm"></div>
                      <div className="relative flex h-5 w-5 items-center justify-center rounded-full bg-emerald-800">
                        <Check className="h-3 w-3 text-emerald-400" />
                      </div>
                    </div>
                    <p className="text-gray-300">Staking rewards from platform revenue</p>
                  </li>
                </ul>
              </DynamicGlowCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Roadmap Section - Alternative Display */}
      <section className="py-20 bg-black/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              <span className="web3-dual-gradient-text-glow" style={gradientTextStyle}>
                Token Launch Roadmap
              </span>
            </h2>
            <p className="mb-16 text-lg text-gray-400">Our journey to bring the WAGA token to market</p>
          </div>

          <div className="max-w-4xl mx-auto">
            {[
              {
                phase: "Phase 1: Initial Development",
                timeline: "Q1-Q2 2025",
                description:
                  "Utility token (WAGAToken) presale launch alongside MVP development completion and WAGA Academy curriculum development.",
                variant: "emerald",
                icon: "🚀",
              },
              {
                phase: "Phase 2: Pilot & Feedback",
                timeline: "Q2-Q4 2025",
                description:
                  "Launch pilot study with coffee producers, integrate DeFi functionalities for liquidity pools, and run community-driven campaigns to boost adoption.",
                variant: "purple",
                icon: "🔍",
              },
              {
                phase: "Phase 3: Scaling & Optimization",
                timeline: "Q1 2026",
                description:
                  "Implement learnings from pilot study, add advanced features like decentralized trade finance, and secure global partnerships with coffee industry stakeholders.",
                variant: "emerald",
                icon: "📈",
              },
              {
                phase: "Phase 4: Full Platform Deployment",
                timeline: "Q2 2026",
                description:
                  "Full-scale platform deployment globally with continuous improvements based on user feedback and expansion of WAGA Academy programs.",
                variant: "purple",
                icon: "🌍",
              },
            ].map((item, index) => (
              <motion.div key={index} variants={fadeIn} className="mb-8 last:mb-0">
                <DynamicGlowCard
                  variant={item.variant as "emerald" | "purple"}
                  className="p-6 relative overflow-hidden"
                  intensity="medium"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 opacity-10 flex items-center justify-center text-6xl">
                    {item.icon}
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="md:w-1/3">
                      <h3
                        className={`text-xl font-bold ${item.variant === "purple" ? "text-purple-300 purple-glow" : "text-emerald-400 glow-text"}`}
                      >
                        {item.phase}
                      </h3>
                      <span
                        className={`inline-block mt-2 rounded-full ${item.variant === "purple" ? "bg-purple-800/60 text-purple-300" : "bg-emerald-800/60 text-emerald-300"} px-3 py-1 text-xs`}
                      >
                        {item.timeline}
                      </span>
                    </div>
                    <div className="md:w-2/3">
                      <p className="text-gray-300">{item.description}</p>
                      <div className="mt-4">
                        <Link
                          href="#"
                          className={`group inline-flex items-center ${item.variant === "purple" ? "text-purple-400 hover:text-purple-300" : "text-emerald-500 hover:text-emerald-400"}`}
                        >
                          Learn more
                          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </DynamicGlowCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <DynamicGlowCard variant="purple" className="mx-auto max-w-4xl p-8 sm:p-12" intensity="high">
            <motion.div variants={fadeIn}>
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl text-center">
                <span className="web3-dual-gradient-text-glow" style={gradientTextStyle}>
                  Join the WAGA Token Community
                </span>
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-300 text-center">
                Be part of a movement to make the coffee value chain fair again. Join our community for exclusive
                updates and early access opportunities.
              </p>
              <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Web3Button size="lg" variant="gradient" asChild>
                  <Link href="/community/dashboard">Join Community</Link>
                </Web3Button>
                <Web3Button size="lg" variant="emerald" onClick={() => setShowNotification(true)}>
                  Get Notified
                </Web3Button>
              </div>
            </motion.div>
          </DynamicGlowCard>
        </div>
      </section>
    </div>
  )
}

