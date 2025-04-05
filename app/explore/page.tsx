"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import DynamicGlowCard from "@/components/dynamic-glow-card"
import { DemoProvider } from "@/context/demo-context"
import DemoStepNavigator from "@/components/demo/demo-step-navigator"
import DemoIntroduction from "@/components/demo/steps/demo-introduction"
import BatchCreationStep from "@/components/demo/steps/batch-creation-step"
import ReserveVerificationStep from "@/components/demo/steps/reserve-verification-step"
import TokenMintingStep from "@/components/demo/steps/token-minting-step"
import CommunityDistributionStep from "@/components/demo/steps/community-distribution-step"
import InventoryManagementStep from "@/components/demo/steps/inventory-management-step"
import TokenRedemptionStep from "@/components/demo/steps/token-redemption-step"
import QRTraceabilityStep from "@/components/demo/steps/qr-traceability-step"
import DemoCompletionStep from "@/components/demo/steps/demo-completion-step"
import { useDemoContext } from "@/context/demo-context"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export default function ExplorePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <DemoProvider>
      <div className="min-h-screen bg-gradient-to-b from-emerald-950/40 to-purple-950/30 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <div className="mb-6">
              <Link href="/">
                <Button variant="ghost" className="text-emerald-400 hover:text-emerald-300 p-0">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>

            <DynamicGlowCard variant="dual" className="p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl md:text-3xl font-bold">
                  <span className="web3-dual-gradient-text-glow">WAGA Coffee Tokenization Demo</span>
                </h1>
                <div className="bg-emerald-900/30 text-emerald-300 px-3 py-1 rounded-full text-sm border border-emerald-500/30">
                  Interactive Demo
                </div>
              </div>
              <p className="text-gray-300 mb-2">
                Experience the WAGA Coffee Tokenization workflow through this interactive demonstration. This proof of
                concept illustrates how our blockchain technology transforms the coffee supply chain, focusing on retail
                coffee bags with community-driven distribution and 3PL integration.
              </p>
              <p className="text-sm text-gray-400">
                Note: This is a simulated environment using dummy data to demonstrate the platform's functionality.
              </p>
            </DynamicGlowCard>

            <div className="mb-8">
              <DemoStepNavigator />
            </div>

            <DemoStepContent />

            <div className="mt-8 flex justify-between">
              <NavigationButtons />
            </div>
          </motion.div>
        </div>
      </div>
    </DemoProvider>
  )
}

function DemoStepContent() {
  const steps = [
    <DemoIntroduction key="intro" />,
    <BatchCreationStep key="batch" />,
    <ReserveVerificationStep key="verify" />,
    <TokenMintingStep key="mint" />,
    <CommunityDistributionStep key="distribution" />,
    <InventoryManagementStep key="inventory" />,
    <TokenRedemptionStep key="redeem" />,
    <QRTraceabilityStep key="qr" />,
    <DemoCompletionStep key="complete" />,
  ]

  return (
    <div className="demo-step-content">
      <StepRenderer steps={steps} />
    </div>
  )
}

function StepRenderer({ steps }) {
  const { currentStep } = useDemoContext()
  return steps[currentStep]
}

function NavigationButtons() {
  const { currentStep, totalSteps, goToNextStep, goToPreviousStep } = useDemoContext()

  return (
    <>
      <Button
        variant="outline"
        className="border-emerald-500/30"
        onClick={goToPreviousStep}
        disabled={currentStep === 0}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Previous Step
      </Button>

      {currentStep < totalSteps - 1 ? (
        <Button className="bg-gradient-to-r from-emerald-600 to-purple-600" onClick={goToNextStep}>
          Next Step
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      ) : (
        <Link href="/">
          <Button className="bg-gradient-to-r from-emerald-600 to-purple-600">
            Return to Home
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      )}
    </>
  )
}

