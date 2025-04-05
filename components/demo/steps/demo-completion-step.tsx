"use client"

import { motion } from "framer-motion"
import DynamicGlowCard from "@/components/dynamic-glow-card"
import { useDemoContext } from "@/context/demo-context"
import { Button } from "@/components/ui/button"
import { Check, Coffee, FileCheck, Coins, ShoppingBag, ArrowRight } from "lucide-react"
import Link from "next/link"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export default function DemoCompletionStep() {
  const { batches, verificationRequests, mintedTokens, redemptionRequests } = useDemoContext()

  // Calculate completion statistics
  const batchesCreated = batches.length
  const batchesVerified = batches.filter((b) => b.status !== "created").length
  const tokensCreated = mintedTokens.length
  const redemptionsProcessed = redemptionRequests.length

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn}>
      <DynamicGlowCard variant="dual" className="p-6 mb-6">
        <div className="flex items-center mb-4">
          <div className="bg-emerald-900/40 p-3 rounded-full mr-3">
            <Check className="h-6 w-6 text-emerald-300" />
          </div>
          <h2 className="text-2xl font-bold">
            <span className="web3-dual-gradient-text-glow">Demo Completed!</span>
          </h2>
        </div>

        <p className="text-gray-300 mb-6">
          Congratulations! You've completed the WAGA Coffee Tokenization interactive demo. You've experienced the entire
          workflow from batch creation to token redemption, seeing how blockchain technology can transform the coffee
          supply chain.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-medium text-emerald-300 mb-4">Your Demo Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-emerald-500/20">
                <div className="flex items-center">
                  <Coffee className="h-5 w-5 text-emerald-400 mr-2" />
                  <span className="text-sm text-gray-300">Batches Created</span>
                </div>
                <span className="text-lg font-medium text-gray-200">{batchesCreated}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-emerald-500/20">
                <div className="flex items-center">
                  <FileCheck className="h-5 w-5 text-purple-400 mr-2" />
                  <span className="text-sm text-gray-300">Batches Verified</span>
                </div>
                <span className="text-lg font-medium text-gray-200">{batchesVerified}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-emerald-500/20">
                <div className="flex items-center">
                  <Coins className="h-5 w-5 text-emerald-400 mr-2" />
                  <span className="text-sm text-gray-300">Tokens Created</span>
                </div>
                <span className="text-lg font-medium text-gray-200">{tokensCreated}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-emerald-500/20">
                <div className="flex items-center">
                  <ShoppingBag className="h-5 w-5 text-purple-400 mr-2" />
                  <span className="text-sm text-gray-300">Redemptions Processed</span>
                </div>
                <span className="text-lg font-medium text-gray-200">{redemptionsProcessed}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-purple-300 mb-4">Key Takeaways</h3>
            <div className="space-y-3">
              <div className="p-3 bg-black/30 rounded-lg border border-purple-500/20">
                <h4 className="font-medium text-purple-300 mb-1">Transparency & Traceability</h4>
                <p className="text-sm text-gray-400">
                  The WAGA Coffee Tokenization system provides end-to-end transparency in the coffee supply chain,
                  allowing all participants to trace coffee from farm to cup.
                </p>
              </div>

              <div className="p-3 bg-black/30 rounded-lg border border-purple-500/20">
                <h4 className="font-medium text-purple-300 mb-1">Tokenization Benefits</h4>
                <p className="text-sm text-gray-400">
                  By tokenizing coffee, we create new opportunities for trading, financing, and market access that
                  benefit farmers, processors, and consumers.
                </p>
              </div>

              <div className="p-3 bg-black/30 rounded-lg border border-purple-500/20">
                <h4 className="font-medium text-purple-300 mb-1">Automated Processes</h4>
                <p className="text-sm text-gray-400">
                  Smart contracts and oracles automate key processes, reducing costs, eliminating intermediaries, and
                  increasing efficiency.
                </p>
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold text-center mb-4">
          <span className="web3-dual-gradient-text-glow">What's Next?</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-black/30 border border-emerald-500/20 rounded-lg p-4">
            <h4 className="font-medium text-emerald-300 mb-2">Join Our Community</h4>
            <p className="text-sm text-gray-400 mb-4">
              Connect with other stakeholders in the coffee industry who are interested in blockchain solutions.
            </p>
            <Link href="/community/dashboard">
              <Button className="w-full bg-gradient-to-r from-emerald-600 to-purple-600">
                Explore Community
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="bg-black/30 border border-emerald-500/20 rounded-lg p-4">
            <h4 className="font-medium text-emerald-300 mb-2">Read Our Whitepaper</h4>
            <p className="text-sm text-gray-400 mb-4">
              Dive deeper into the technical details and economic model of the WAGA Coffee Tokenization system.
            </p>
            <Button className="w-full bg-gradient-to-r from-emerald-600 to-purple-600">
              Download Whitepaper
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="bg-black/30 border border-emerald-500/20 rounded-lg p-4">
            <h4 className="font-medium text-emerald-300 mb-2">Stay Updated</h4>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe to our newsletter to receive updates on our development progress and launch plans.
            </p>
            <Button className="w-full bg-gradient-to-r from-emerald-600 to-purple-600">
              Subscribe
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-300 mb-6">
            Thank you for exploring the WAGA Coffee Tokenization demo. We're excited to revolutionize the coffee
            industry with blockchain technology, and we hope you'll join us on this journey.
          </p>
          <Link href="/">
            <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-purple-600 px-8 py-6">
              Return to Homepage
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </DynamicGlowCard>
    </motion.div>
  )
}

