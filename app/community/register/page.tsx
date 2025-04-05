"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useWallet } from "@/context/wallet-context"
import { Button } from "@/components/ui/button"
import { Wallet, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"
import DynamicGlowCard from "@/components/dynamic-glow-card"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export default function CommunityRegistration() {
  const router = useRouter()
  const { address, isConnected, openConnectModal } = useWallet()
  const [isVerifying, setIsVerifying] = useState(false)
  const [hasTokens, setHasTokens] = useState<boolean | null>(null)
  const [isRegistered, setIsRegistered] = useState(false)

  // Simulate token verification
  useEffect(() => {
    if (isConnected && address) {
      setIsVerifying(true)

      // Simulate API call to check token balance
      const checkTokenBalance = async () => {
        // In a real implementation, this would call a blockchain API
        // to check the user's WAGAToken balance
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // For demo purposes, we'll assume the user has tokens
        // In a real implementation, this would be based on the actual token balance
        setHasTokens(true)
        setIsVerifying(false)
      }

      checkTokenBalance()
    }
  }, [isConnected, address])

  const handleRegister = async () => {
    setIsVerifying(true)

    // Simulate registration process
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsRegistered(true)
    setIsVerifying(false)

    // Redirect to community dashboard after successful registration
    setTimeout(() => {
      router.push("/community/dashboard")
    }, 2000)
  }

  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <motion.div initial="hidden" animate="visible" variants={fadeIn} className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">
            <span className="bg-gradient-to-r from-emerald-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              Join the WAGA Community
            </span>
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Connect your wallet and verify your WAGAToken holdings to access the exclusive WAGA Protocol community.
          </p>
        </div>

        <DynamicGlowCard variant="emerald" className="p-8">
          <div className="space-y-8">
            {/* Step 1: Connect Wallet */}
            <div className="flex items-start">
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-4 ${isConnected ? "bg-emerald-900" : "bg-emerald-900/50"}`}
              >
                <span className="text-emerald-400 font-bold">1</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-emerald-300 mb-2">Connect Your Wallet</h2>
                <p className="text-gray-400 mb-4">
                  Connect your Web3 wallet to verify your identity and token holdings.
                </p>

                {!isConnected ? (
                  <Button onClick={openConnectModal} className="web3-button">
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </Button>
                ) : (
                  <div className="flex items-center text-emerald-400">
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    <span>
                      Wallet Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Verify Tokens */}
            <div className="flex items-start">
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-4 ${hasTokens ? "bg-emerald-900" : "bg-emerald-900/50"}`}
              >
                <span className="text-emerald-400 font-bold">2</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-emerald-300 mb-2">Verify WAGAToken Holdings</h2>
                <p className="text-gray-400 mb-4">
                  We'll check if you have the required WAGATokens to join the community.
                </p>

                {isConnected && (
                  <>
                    {isVerifying && !hasTokens && (
                      <div className="flex items-center text-yellow-400">
                        <div className="animate-spin mr-2 h-5 w-5 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
                        <span>Verifying token balance...</span>
                      </div>
                    )}

                    {hasTokens === true && (
                      <div className="flex items-center text-emerald-400">
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        <span>WAGATokens verified successfully!</span>
                      </div>
                    )}

                    {hasTokens === false && (
                      <div className="flex items-center text-red-400">
                        <AlertCircle className="mr-2 h-5 w-5" />
                        <span>
                          Insufficient WAGATokens.{" "}
                          <Link href="#" className="underline">
                            Learn how to get WAGATokens
                          </Link>
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Step 3: Complete Registration */}
            <div className="flex items-start">
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-4 ${isRegistered ? "bg-emerald-900" : "bg-emerald-900/50"}`}
              >
                <span className="text-emerald-400 font-bold">3</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-emerald-300 mb-2">Complete Registration</h2>
                <p className="text-gray-400 mb-4">Finalize your registration to access the WAGA community.</p>

                {hasTokens && (
                  <>
                    {!isRegistered ? (
                      <Button
                        onClick={handleRegister}
                        disabled={isVerifying}
                        className="bg-gradient-to-r from-emerald-600 to-purple-600"
                      >
                        {isVerifying ? (
                          <>
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            Complete Registration
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="flex items-center text-emerald-400">
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        <span>Registration complete! Redirecting to community...</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </DynamicGlowCard>

        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Already registered?{" "}
            <Link href="/community/dashboard" className="text-emerald-400 hover:text-emerald-300">
              Go to Dashboard
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

