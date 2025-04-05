"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { motion, useAnimation, useInView } from "framer-motion"
import { Coffee, Leaf, BarChart3, Shield, Globe, Zap, ChevronRight, Database, Cpu } from "lucide-react"
import Link from "next/link"
import ParticleBackground from "@/components/particle-background"
import HexagonGrid from "@/components/hexagon-grid"
import BlockchainCube from "@/components/blockchain-cube"
import BlockchainCubeAdvanced from "@/components/blockchain-cube-advanced"
import BlockchainBoxGrid from "@/components/blockchain-box-grid"
import Web3Button from "@/components/web3-button"
import Web3Card from "@/components/web3-card"
import DynamicGlowCard from "@/components/dynamic-glow-card"

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

const Section = ({ children, id, className = "" }: { children: React.ReactNode; id?: string; className?: string }) => {
  const controls = useAnimation()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, threshold: 0.2 })

  useEffect(() => {
    if (inView) {
      controls.start("visible")
    }
  }, [controls, inView])

  return (
    <motion.section
      id={id}
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={fadeIn}
      className={`py-12 md:py-20 ${className}`}
    >
      {children}
    </motion.section>
  )
}

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* Web3 Background Elements */}
      <ParticleBackground />
      <HexagonGrid className="opacity-30" />

      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] md:min-h-screen items-center justify-center overflow-hidden pt-16 md:pt-24 lg:pt-32 pb-12 md:pb-16 lg:pb-32">
        {/* Solid emerald background - removed grid pattern */}
        <div className="absolute inset-0 bg-emerald-950/90 z-0"></div>

        {/* Animated blobs - using emerald-500 to match navbar and about section */}
        <div className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 rounded-full blur-3xl bg-emerald-500/10 animate-blob animation-delay-2000 z-0"></div>
        <div className="absolute top-1/3 right-1/4 w-64 md:w-96 h-64 md:h-96 rounded-full blur-3xl bg-emerald-500/10 animate-blob animation-delay-4000 z-0"></div>
        <div className="absolute bottom-1/4 right-1/3 w-64 md:w-96 h-64 md:h-96 rounded-full blur-3xl bg-emerald-500/10 animate-blob z-0"></div>

        {/* Magnetic field effect with emerald and purple glow - responsive version */}
        <div className="absolute inset-0 z-0">
          {/* Large emerald glow with purple tint at center - using percentages for responsiveness */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90vw] max-w-[800px] max-h-[800px] rounded-full bg-gradient-radial from-emerald-500/20 via-emerald-700/10 to-transparent blur-3xl"></div>

          {/* Purple tinted edges - using percentages for responsiveness */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100vw] max-w-[1000px] max-h-[1000px] rounded-full bg-gradient-radial from-transparent via-purple-700/5 to-purple-900/10 blur-3xl"></div>

          {/* Pulsating magnetic field lines - using percentages for responsiveness */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60vw] max-w-[600px] max-h-[600px] rounded-full border border-emerald-500/10 animate-pulse"></div>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80vw] max-w-[800px] max-h-[800px] rounded-full border border-purple-500/5 animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] h-[95vw] max-w-[1000px] max-h-[1000px] rounded-full border border-emerald-500/5 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        {/* Overlay gradient for better text readability - using emerald tint */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/40 to-emerald-950/60 z-0"></div>

        <div className="container relative z-10 mx-auto px-4 text-center sm:px-6 lg:px-8 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 md:space-y-12"
          >
            {/* Hero Card with glowing edges - improved for mobile */}
            <div className="relative px-4 sm:px-0">
              {/* Card glow effect - adjusted for mobile */}
              <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-emerald-500/20 via-purple-500/20 to-emerald-500/20 rounded-xl blur-xl opacity-70 animate-pulse"></div>

              {/* Card content - improved padding for mobile */}
              <div className="relative web3-card-glow-border p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl backdrop-blur-sm bg-black/45 mx-auto max-w-4xl">
                <h1 className="text-xl font-bold tracking-tighter sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl/none">
                  <span className="block leading-tight web3-dual-gradient-text-glow mb-2">WAGA Protocol</span>
                </h1>
                <p className="mx-auto max-w-2xl text-sm sm:text-base md:text-lg lg:text-xl text-gray-300/90 mt-2 md:mt-4">
                  Brewing a New Era of Coffee with Blockchain & Web3 Technology
                </p>
              </div>
            </div>

            {/* Buttons moved below the card - improved for mobile */}
            <div className="flex flex-col items-center justify-center space-y-4 px-4 sm:flex-row sm:space-x-6 sm:space-y-0">
              <Web3Button size="lg" variant="gradient" className="w-full sm:w-auto" asChild>
                <Link href="/explore">Explore Platform</Link>
              </Web3Button>
              <Web3Button
                size="lg"
                variant="purple"
                className="w-full sm:w-auto px-4 sm:px-8 py-4 sm:py-6 text-sm sm:text-base"
                asChild
              >
                <Link href="/token-pre-sale">Token Pre-Sale</Link>
              </Web3Button>
            </div>

            <div className="mt-12 sm:mt-16 md:mt-24 pt-8 sm:pt-12 md:pt-16 relative">
              {/* Blockchain hash connection - using emerald-500 to match navbar */}
              <div className="absolute left-1/2 top-0 -translate-x-1/2 w-0.5 h-full max-h-16 sm:max-h-24 md:max-h-32 bg-gradient-to-b from-emerald-500 via-emerald-400 to-emerald-500/5"></div>

              {/* Hash nodes - using emerald-500 to match navbar */}
              <div className="flex justify-center mb-6 sm:mb-8">
                <div className="px-2 sm:px-3 py-1 bg-black/30 rounded-md border border-emerald-500/40 backdrop-blur-sm">
                  <span className="text-[10px] sm:text-xs text-emerald-400/80 font-mono">0x7f9e8d...</span>
                </div>
              </div>

              {/* Blockchain cubes with connecting elements - improved for mobile */}
              <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-12 xl:gap-24 px-2 sm:px-4 relative">
                {/* Hash connection lines - using emerald-500 to match navbar */}
                <div className="absolute top-1/2 left-1/4 right-1/4 h-px bg-emerald-500/30 hidden sm:block"></div>
                <div className="absolute top-1/2 left-1/3 w-px h-4 bg-emerald-500/30 hidden sm:block"></div>
                <div className="absolute top-1/2 right-1/3 w-px h-4 bg-emerald-500/30 hidden sm:block"></div>

                {/* Blockchain cubes - properly positioned and sized for mobile */}
                <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 scale-75 relative">
                  <BlockchainCube />
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs text-emerald-400/70 font-mono">
                    01
                  </div>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 scale-90 relative">
                  <BlockchainCubeAdvanced />
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs text-emerald-400/70 font-mono">
                    02
                  </div>
                </div>
                <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 relative">
                  <BlockchainBoxGrid />
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs text-emerald-400/70 font-mono">
                    03
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <Section id="about">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl">
              <span className="web3-dual-gradient-text-glow" style={gradientTextStyle}>
                About WAGA Protocol
              </span>
            </h2>
            <p className="mb-8 md:mb-12 text-base md:text-lg text-gray-400">
              Revolutionizing the coffee industry with a two-phase approach to blockchain integration
            </p>
          </div>

          <div className="grid gap-8 md:gap-12 md:grid-cols-2">
            <motion.div variants={fadeIn} className="flex flex-col justify-center">
              <h3 className="mb-3 md:mb-4 text-xl md:text-2xl font-bold text-emerald-400">Our Vision</h3>
              <p className="mb-4 md:mb-6 text-gray-300 text-sm md:text-base">
                WAGA Protocol envisions a future where smallholder farmers, cooperatives, roasters, and consumers
                operate in a more inclusive, transparent, and sustainable coffee value chain.
              </p>
              <p className="mb-4 md:mb-6 text-gray-300 text-sm md:text-base">
                By leveraging blockchain and DeFi technologies, we aim to create an ecosystem where all participants
                thrive while contributing to the growth of a global, sustainable coffee industry.
              </p>
              <div className="mt-2 md:mt-4">
                <Link
                  href="#features"
                  className="group inline-flex items-center text-emerald-500 hover:text-emerald-400 text-sm md:text-base"
                >
                  Learn more about our approach
                  <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>

            <motion.div variants={fadeIn}>
              <Web3Card variant="dual" className="h-full p-4 sm:p-6 web3-card-glow">
                <h3 className="mb-4 md:mb-6 text-xl md:text-2xl font-bold text-purple-300 purple-glow flex flex-wrap items-center">
                  <div className="relative mr-3 mb-2 sm:mb-0">
                    <div className="absolute -inset-1 rounded-full bg-purple-500/20 blur-sm"></div>
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg">
                      <svg
                        className="h-4 w-4 text-black"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 8V16M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                  <span>Two-Phase MVP Deployment</span>
                </h3>

                <div className="mb-4 md:mb-6 space-y-3 md:space-y-4">
                  <div className="rounded-lg border border-purple-500/20 bg-black/50 p-3 sm:p-4 backdrop-blur-sm">
                    <h4 className="mb-1 md:mb-2 text-base md:text-lg font-semibold text-purple-300">
                      Phase 1: Retail Coffee Traceability
                    </h4>
                    <p className="text-gray-400 text-sm md:text-base">
                      A consumer-facing traceability solution for roasted coffee bags with QR code scanning and
                      blockchain verification.
                    </p>
                  </div>

                  <div className="rounded-lg border border-emerald-500/20 bg-black/50 p-3 sm:p-4 backdrop-blur-sm">
                    <h4 className="mb-1 md:mb-2 text-base md:text-lg font-semibold text-emerald-300">
                      Phase 2: Wholesale Export Tokenization
                    </h4>
                    <p className="text-gray-400 text-sm md:text-base">
                      A blockchain-based trade finance system for bulk coffee exports with DeFi integration and
                      tokenized assets.
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs sm:text-sm text-purple-300">Launching Q2 2025</span>
                </div>
              </Web3Card>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* Features Section */}
      <Section id="features" className="bg-black/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl">
              <span className="web3-dual-gradient-text-glow" style={gradientTextStyle}>
                Key Features
              </span>
            </h2>
            <p className="mb-8 md:mb-16 text-base md:text-lg text-gray-400">
              Our platform combines blockchain technology with real-world coffee value chain solutions
            </p>
          </div>

          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
          >
            {[
              {
                icon: (
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-sm"></div>
                    <div className="relative flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg">
                      <Coffee className="h-5 w-5 md:h-6 md:w-6 text-black" />
                    </div>
                  </div>
                ),
                title: "Tokenized Coffee Reserves",
                description:
                  "Digitize coffee into traceable and tradable ERC-1155 tokens secured by real-world coffee batches.",
                variant: "emerald",
              },
              {
                icon: (
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-purple-500/20 blur-sm"></div>
                    <div className="relative flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg">
                      <Shield className="h-5 w-5 md:h-6 md:w-6 text-black" />
                    </div>
                  </div>
                ),
                title: "Transparency & Traceability",
                description:
                  "Track coffee batches from farm to cup, verifying ethical, quality, and sustainability parameters.",
                variant: "purple",
              },
              {
                icon: (
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-sm"></div>
                    <div className="relative flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 shadow-lg">
                      <BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-black" />
                    </div>
                  </div>
                ),
                title: "DeFi Integration",
                description:
                  "Access community-funded liquidity pools and tokenized collateral for loans and trade finance.",
                variant: "emerald",
              },
              {
                icon: (
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-purple-500/20 blur-sm"></div>
                    <div className="relative flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg">
                      <Leaf className="h-5 w-5 md:h-6 md:w-6 text-black" />
                    </div>
                  </div>
                ),
                title: "Sustainable Farming",
                description: "Incentivize and reward sustainable farming practices through transparent verification.",
                variant: "purple",
              },
              {
                icon: (
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-sm"></div>
                    <div className="relative flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 shadow-lg">
                      <Globe className="h-5 w-5 md:h-6 md:w-6 text-black" />
                    </div>
                  </div>
                ),
                title: "Global Marketplace",
                description: "Connect farmers directly with buyers worldwide through our decentralized marketplace.",
                variant: "emerald",
              },
              {
                icon: (
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-purple-500/20 blur-sm"></div>
                    <div className="relative flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg">
                      <Zap className="h-5 w-5 md:h-6 md:w-6 text-black" />
                    </div>
                  </div>
                ),
                title: "WAGAToken Utility",
                description:
                  "Access platform services, lower transaction costs, and earn rewards through our native token.",
                variant: "purple",
              },
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeIn}>
                <DynamicGlowCard
                  variant={feature.variant as "emerald" | "purple"}
                  className="h-full p-4 sm:p-6"
                  intensity="medium"
                >
                  <div className="mb-3 md:mb-4">{feature.icon}</div>
                  <h3 className="mb-2 text-lg md:text-xl font-bold text-emerald-300 glow-text">{feature.title}</h3>
                  <p className="text-gray-400 text-sm md:text-base">{feature.description}</p>
                </DynamicGlowCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* Benefits Section */}
      <Section>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl">
              <span className="web3-dual-gradient-text-glow" style={gradientTextStyle}>
                Benefits for Stakeholders
              </span>
            </h2>
            <p className="mb-8 md:mb-16 text-base md:text-lg text-gray-400">
              WAGA Protocol creates value across the entire coffee value chain
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
            <motion.div variants={fadeIn}>
              <DynamicGlowCard variant="purple" className="h-full p-3 sm:p-4 md:p-6 lg:p-8">
                <h3 className="mb-4 md:mb-6 text-xl md:text-2xl font-bold text-purple-300 purple-glow">For Farmers</h3>
                <ul className="space-y-3 md:space-y-4">
                  <li className="flex items-start">
                    <div className="mr-3 md:mr-4 mt-1 relative">
                      <div className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-sm"></div>
                      <div className="relative flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-emerald-800">
                        <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm md:text-base">
                      Access to fair pricing mechanisms and global markets
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 md:mr-4 mt-1 relative">
                      <div className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-sm"></div>
                      <div className="relative flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-emerald-800">
                        <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm md:text-base">
                      Income stability through tokenized futures and decentralized insurance
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 md:mr-4 mt-1 relative">
                      <div className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-sm"></div>
                      <div className="relative flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-emerald-800">
                        <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm md:text-base">
                      Direct loans and financial resources for operational needs
                    </p>
                  </li>
                </ul>
              </DynamicGlowCard>
            </motion.div>

            <motion.div variants={fadeIn}>
              <DynamicGlowCard variant="emerald" className="h-full p-4 sm:p-6 md:p-8">
                <h3 className="mb-4 md:mb-6 text-xl md:text-2xl font-bold text-emerald-400 glow-text">
                  For Processors & Exporters
                </h3>
                <ul className="space-y-3 md:space-y-4">
                  <li className="flex items-start">
                    <div className="mr-3 md:mr-4 mt-1 relative">
                      <div className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-sm"></div>
                      <div className="relative flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-emerald-800">
                        <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm md:text-base">
                      Liquidity for scaling operations and equipment upgrades
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 md:mr-4 mt-1 relative">
                      <div className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-sm"></div>
                      <div className="relative flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-emerald-800">
                        <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm md:text-base">
                      Enhanced traceability for compliance and market access
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 md:mr-4 mt-1 relative">
                      <div className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-sm"></div>
                      <div className="relative flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-emerald-800">
                        <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm md:text-base">Lower transaction fees and instant settlements</p>
                  </li>
                </ul>
              </DynamicGlowCard>
            </motion.div>

            <motion.div variants={fadeIn}>
              <DynamicGlowCard variant="purple" className="h-full p-4 sm:p-6 md:p-8">
                <h3 className="mb-4 md:mb-6 text-xl md:text-2xl font-bold text-purple-300 purple-glow">
                  For Consumers
                </h3>
                <ul className="space-y-3 md:space-y-4">
                  <li className="flex items-start">
                    <div className="mr-3 md:mr-4 mt-1 relative">
                      <div className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-sm"></div>
                      <div className="relative flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-emerald-800">
                        <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm md:text-base">
                      Transparent sourcing with blockchain-verified records
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 md:mr-4 mt-1 relative">
                      <div className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-sm"></div>
                      <div className="relative flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-emerald-800">
                        <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm md:text-base">
                      Ethical consumption through verified sustainable practices
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 md:mr-4 mt-1 relative">
                      <div className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-sm"></div>
                      <div className="relative flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-emerald-800">
                        <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm md:text-base">
                      Direct connection to coffee producers through QR code scanning
                    </p>
                  </li>
                </ul>
              </DynamicGlowCard>
            </motion.div>

            <motion.div variants={fadeIn}>
              <DynamicGlowCard variant="emerald" className="h-full p-4 sm:p-6 md:p-8">
                <h3 className="mb-4 md:mb-6 text-xl md:text-2xl font-bold text-emerald-400 glow-text">
                  For Governments & Regulators
                </h3>
                <ul className="space-y-3 md:space-y-4">
                  <li className="flex items-start">
                    <div className="mr-3 md:mr-4 mt-1 relative">
                      <div className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-sm"></div>
                      <div className="relative flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-emerald-800">
                        <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm md:text-base">
                      Improved foreign currency reserves through transparent exports
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 md:mr-4 mt-1 relative">
                      <div className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-sm"></div>
                      <div className="relative flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-emerald-800">
                        <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm md:text-base">Transparent and efficient market oversight</p>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 md:mr-4 mt-1 relative">
                      <div className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-sm"></div>
                      <div className="relative flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-emerald-800">
                        <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm md:text-base">
                      Compliance with international trade standards and regulations
                    </p>
                  </li>
                </ul>
              </DynamicGlowCard>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* Technology Section */}
      <Section className="bg-black/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl">
              <span className="web3-dual-gradient-text-glow" style={gradientTextStyle}>
                Technology Stack
              </span>
            </h2>
            <p className="mb-8 md:mb-16 text-base md:text-lg text-gray-400">
              Powered by cutting-edge blockchain and IoT technologies
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
            <motion.div variants={fadeIn}>
              <DynamicGlowCard variant="emerald" className="h-full p-3 sm:p-4 md:p-6 lg:p-8">
                <h3 className="mb-4 md:mb-6 text-xl md:text-2xl font-bold text-emerald-400 glow-text flex flex-wrap items-center">
                  <div className="relative mr-3 mb-2 sm:mb-0">
                    <div className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-sm"></div>
                    <div className="relative flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg">
                      <Database className="h-3 w-3 sm:h-4 sm:w-4 text-black" />
                    </div>
                  </div>
                  <span>Blockchain Infrastructure</span>
                </h3>
                <p className="mb-4 md:mb-6 text-gray-300 text-sm md:text-base">
                  Our platform is built on a zkRollup architecture, providing the perfect balance between transparency
                  and privacy while ensuring high throughput and low transaction costs.
                </p>
                <div className="space-y-3 md:space-y-4">
                  <div className="rounded-lg border border-emerald-500/20 bg-black/50 p-3 sm:p-4 backdrop-blur-sm">
                    <h4 className="mb-1 md:mb-2 font-semibold text-emerald-300 text-sm md:text-base">
                      ERC-1155 Token Standard
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-400">
                      Enables efficient batch tokenization of coffee with shared metadata and lower gas costs.
                    </p>
                  </div>
                  <div className="rounded-lg border border-emerald-500/20 bg-black/50 p-3 sm:p-4 backdrop-blur-sm">
                    <h4 className="mb-1 md:mb-2 font-semibold text-emerald-300 text-sm md:text-base">
                      Smart Contracts
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-400">
                      Automate key processes like tokenization, collateralization, and insurance payouts.
                    </p>
                  </div>
                  <div className="rounded-lg border border-emerald-500/20 bg-black/50 p-3 sm:p-4 backdrop-blur-sm">
                    <h4 className="mb-1 md:mb-2 font-semibold text-emerald-300 text-sm md:text-base">
                      IPFS Metadata Storage
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-400">
                      Decentralized storage for coffee batch data, ensuring immutability and accessibility.
                    </p>
                  </div>
                </div>
              </DynamicGlowCard>
            </motion.div>

            <motion.div variants={fadeIn}>
              <DynamicGlowCard variant="purple" className="h-full p-4 sm:p-6 md:p-8">
                <h3 className="mb-4 md:mb-6 text-xl md:text-2xl font-bold text-purple-300 purple-glow flex flex-wrap items-center">
                  <div className="relative mr-3 mb-2 sm:mb-0">
                    <div className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-sm"></div>
                    <div className="relative flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg">
                      <Cpu className="h-3 w-3 sm:h-4 sm:w-4 text-black" />
                    </div>
                  </div>
                  <span>IoT & Oracle Integration</span>
                </h3>
                <p className="mb-4 md:mb-6 text-gray-300 text-sm md:text-base">
                  Real-world data is securely brought on-chain through IoT devices and Chainlink oracles, ensuring
                  accurate verification of coffee reserves and conditions.
                </p>
                <div className="space-y-3 md:space-y-4">
                  <div className="rounded-lg border border-emerald-500/20 bg-black/50 p-3 sm:p-4 backdrop-blur-sm">
                    <h4 className="mb-1 md:mb-2 font-semibold text-emerald-300 text-sm md:text-base">
                      Proof of Reserve (PoR)
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-400">
                      Chainlink Functions verify that physical coffee reserves match tokenized representations.
                    </p>
                  </div>
                  <div className="rounded-lg border border-emerald-500/20 bg-black/50 p-3 sm:p-4 backdrop-blur-sm">
                    <h4 className="mb-1 md:mb-2 font-semibold text-emerald-300 text-sm md:text-base">
                      Quality Monitoring
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-400">
                      IoT sensors track parameters like temperature and humidity to ensure coffee quality.
                    </p>
                  </div>
                  <div className="rounded-lg border border-emerald-500/20 bg-black/50 p-3 sm:p-4 backdrop-blur-sm">
                    <h4 className="mb-1 md:mb-2 font-semibold text-emerald-300 text-sm md:text-base">Price Feeds</h4>
                    <p className="text-xs sm:text-sm text-gray-400">
                      Real-time coffee market prices are brought on-chain for accurate valuation and trading.
                    </p>
                  </div>
                </div>
              </DynamicGlowCard>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* Roadmap Section */}
      <Section id="roadmap">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl">
              <span className="web3-dual-gradient-text-glow" style={gradientTextStyle}>
                Development Roadmap
              </span>
            </h2>
            <p className="mb-8 md:mb-16 text-base md:text-lg text-gray-400">
              Our journey to transform the coffee value chain
            </p>
          </div>

          <div className="relative mx-auto max-w-4xl">
            <div className="roadmap-line hidden md:block"></div>

            <motion.div variants={staggerContainer} className="space-y-8 md:space-y-12">
              {[
                {
                  phase: "Phase 1: Initial Development",
                  timeline: "Q1-Q2 2025",
                  milestones: [
                    "MVP development completion",
                    "Utility token (WAGAToken) presale launch",
                    "WAGA Academy curriculum development",
                  ],
                  variant: "emerald",
                },
                {
                  phase: "Phase 2: Pilot & Feedback",
                  timeline: "Q2-Q4 2025",
                  milestones: [
                    "Launch pilot study with coffee producers",
                    "Integrate DeFi functionalities for liquidity pools",
                    "Community-driven campaigns to boost adoption",
                    "Collect data and feedback to refine the platform",
                  ],
                  variant: "purple",
                },
                {
                  phase: "Phase 3: Scaling & Optimization",
                  timeline: "Q1 2026",
                  milestones: [
                    "Implement learnings from pilot study",
                    "Advanced features like decentralized trade finance",
                    "Secure global partnerships with coffee industry stakeholders",
                    "Regional expansion marketing campaigns",
                  ],
                  variant: "emerald",
                },
                {
                  phase: "Phase 4: Full Platform Deployment",
                  timeline: "Q2 2026",
                  milestones: [
                    "Full-scale platform deployment globally",
                    "Continuous improvements based on user feedback",
                    "Expansion of WAGA Academy programs",
                    "Establishment of blockchain coffee standard",
                  ],
                  variant: "purple",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  className={`md:w-[calc(50%-2rem)] ${index % 2 === 0 ? "md:ml-auto" : "md:mr-auto"}`}
                >
                  <DynamicGlowCard
                    variant={item.variant as "emerald" | "purple"}
                    className="p-3 sm:p-4 md:p-6"
                    intensity={index % 2 === 0 ? "medium" : "high"}
                  >
                    <div className="roadmap-dot hidden md:block"></div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3
                        className={`text-lg sm:text-xl font-bold ${item.variant === "purple" ? "text-purple-300 purple-glow" : "text-emerald-400 glow-text"}`}
                      >
                        {item.phase}
                      </h3>
                      <span
                        className={`rounded-full ${item.variant === "purple" ? "bg-purple-800/60 text-purple-300" : "bg-emerald-800/60 text-emerald-300"} px-2 sm:px-3 py-0.5 sm:py-1 text-xs`}
                      >
                        {item.timeline}
                      </span>
                    </div>
                    <ul className="mt-3 md:mt-4 space-y-1.5 sm:space-y-2">
                      {item.milestones.map((milestone, i) => (
                        <li key={i} className="flex items-start">
                          <div
                            className={`mr-2 mt-1 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${item.variant === "purple" ? "bg-purple-400" : "bg-emerald-400"}`}
                          ></div>
                          <p className="text-gray-300 text-sm md:text-base">{milestone}</p>
                        </li>
                      ))}
                    </ul>
                  </DynamicGlowCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section id="contact" className="bg-black/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <DynamicGlowCard variant="emerald" className="mx-auto max-w-4xl p-3 sm:p-4 md:p-8 lg:p-12" intensity="high">
            <motion.div variants={fadeIn}>
              <h2 className="mb-3 md:mb-4 text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl text-center">
                <span className="web3-dual-gradient-text-glow" style={gradientTextStyle}>
                  Join the WAGA Ecosystem
                </span>
              </h2>
              <p className="mx-auto mb-6 md:mb-8 max-w-2xl text-base md:text-lg text-gray-300 text-center">
                Be part of a movement to make the coffee value chain fair again. Whether you're a farmer, processor,
                buyer, or enthusiast, there's a place for you in our community.
              </p>
              <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Web3Button size="lg" variant="gradient" className="w-full sm:w-auto" asChild>
                  <Link href="/community/dashboard">Join Community</Link>
                </Web3Button>
                <Web3Button size="lg" variant="purple" className="w-full sm:w-auto">
                  Read Whitepaper
                </Web3Button>
              </div>
            </motion.div>
          </DynamicGlowCard>
        </div>
      </Section>
    </div>
  )
}

