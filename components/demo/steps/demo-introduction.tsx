"use client"

import type React from "react"

import { motion } from "framer-motion"
import DynamicGlowCard from "@/components/dynamic-glow-card"
import { Coffee, FileCheck, Coins, BarChart3, ShoppingBag, ArrowRight, Users, QrCode } from "lucide-react"
import { useDemoContext } from "@/context/demo-context"
import { Button } from "@/components/ui/button"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export default function DemoIntroduction() {
  const { goToNextStep } = useDemoContext()

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn}>
      <DynamicGlowCard variant="emerald" className="p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">
          <span className="web3-dual-gradient-text-glow">
            Welcome to the WAGA Coffee Tokenization & Distribution Workflow Demo
          </span>
        </h2>
        <p className="text-gray-300 mb-6">
          This interactive demonstration showcases our Phase 1 MVP currently in development. You'll experience how we
          use blockchain technology to transform the coffee supply chain, with a specific focus on retail-grade roasted
          coffee bags, community-driven distribution, and 3PL integration for global fulfillment.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-black/30 border border-emerald-500/20 rounded-lg p-4">
            <h3 className="text-lg font-medium text-emerald-300 mb-2">What is Coffee Tokenization?</h3>
            <p className="text-gray-400">
              Coffee Tokenization is a blockchain-based approach that brings transparency, traceability, and financial
              empowerment to the coffee value chain. By tokenizing coffee reserves, we create a more inclusive and
              sustainable ecosystem for all participants.
            </p>
          </div>

          <div className="bg-black/30 border border-emerald-500/20 rounded-lg p-4">
            <h3 className="text-lg font-medium text-emerald-300 mb-2">Phase 1 MVP Focus</h3>
            <p className="text-gray-400">
              Our initial MVP focuses on retail coffee bags, enabling transparent tracking from producer to consumer.
              The platform uses ERC-1155 tokens to represent physical coffee batches, with each retail bag including a
              QR code for authenticity verification and traceability.
            </p>
          </div>
        </div>

        <h3 className="text-xl font-bold text-emerald-300 mb-4">The Coffee Tokenization & Distribution Workflow</h3>

        <div className="space-y-6">
          <WorkflowStep
            number={1}
            title="Batch Creation"
            description="Coffee producers register retail coffee batches with detailed information about origin, variety, and roast profile."
            icon={<Coffee className="h-6 w-6 text-emerald-400" />}
          />

          <WorkflowStep
            number={2}
            title="Reserve Verification"
            description="Chainlink oracles verify that the physical coffee reserves match the batch information before tokenization."
            icon={<FileCheck className="h-6 w-6 text-purple-400" />}
          />

          <WorkflowStep
            number={3}
            title="Token Minting"
            description="After verification, ERC-1155 tokens are minted to represent the retail coffee bags in the batch."
            icon={<Coins className="h-6 w-6 text-emerald-400" />}
          />

          <WorkflowStep
            number={4}
            title="Community Distribution"
            description="Community members become distributors by staking tokens, creating a decentralized global distribution network."
            icon={<Users className="h-6 w-6 text-purple-400" />}
          />

          <WorkflowStep
            number={5}
            title="Inventory Management"
            description="The platform tracks inventory levels across the distribution network and triggers alerts when needed."
            icon={<BarChart3 className="h-6 w-6 text-emerald-400" />}
          />

          <WorkflowStep
            number={6}
            title="Token Redemption"
            description="Token holders can redeem their tokens for physical coffee, triggering the 3PL fulfillment process."
            icon={<ShoppingBag className="h-6 w-6 text-purple-400" />}
          />

          <WorkflowStep
            number={7}
            title="QR Traceability"
            description="Consumers scan QR codes on coffee bags to verify authenticity and trace the complete journey from farm to cup."
            icon={<QrCode className="h-6 w-6 text-emerald-400" />}
          />
        </div>

        <div className="mt-8 text-center">
          <Button className="bg-gradient-to-r from-emerald-600 to-purple-600 px-6 py-3" onClick={goToNextStep}>
            Start the Demo
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </DynamicGlowCard>
    </motion.div>
  )
}

function WorkflowStep({
  number,
  title,
  description,
  icon,
}: {
  number: number
  title: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <div className="flex items-start">
      <div className="bg-black/30 p-3 rounded-lg mr-4 flex-shrink-0">{icon}</div>
      <div>
        <h4 className="text-lg font-medium text-gray-200 mb-1">
          <span className="text-emerald-400 mr-2">{number}.</span>
          {title}
        </h4>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  )
}

