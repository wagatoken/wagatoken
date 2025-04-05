"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/community/dashboard-header"
import DynamicGlowCard from "@/components/dynamic-glow-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, Check, Star, Trophy, Shield, Gift } from "lucide-react"
import Link from "next/link"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export default function FoundingMemberPage() {
  const [isApplying, setIsApplying] = useState(false)
  const [applicationSubmitted, setApplicationSubmitted] = useState(false)

  const handleApply = () => {
    setIsApplying(true)
    // Simulate API call
    setTimeout(() => {
      setApplicationSubmitted(true)
    }, 1000)
  }

  const benefits = [
    {
      icon: <Trophy className="h-6 w-6 text-amber-400" />,
      title: "Exclusive Recognition",
      description: "Be recognized as a founding member with a special badge on your profile and in the community.",
    },
    {
      icon: <Shield className="h-6 w-6 text-emerald-400" />,
      title: "Early Access",
      description: "Get early access to new features, products, and services before they are released to the public.",
    },
    {
      icon: <Star className="h-6 w-6 text-purple-400" />,
      title: "Direct Input",
      description: "Provide direct input on the development roadmap and help shape the future of WAGA Protocol.",
    },
    {
      icon: <Gift className="h-6 w-6 text-emerald-400" />,
      title: "Special Rewards",
      description: "Receive special rewards, including exclusive NFTs and token allocations for your contributions.",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <DashboardHeader
        title="Founding Member Program"
        description="Join our exclusive program and help shape the future of WAGA Protocol"
      />

      <div className="mb-6">
        <Link href="/community/dashboard">
          <Button variant="ghost" className="text-emerald-400 hover:text-emerald-300 p-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div className="lg:col-span-2" initial="hidden" animate="visible" variants={fadeIn}>
          <DynamicGlowCard variant="emerald" className="p-6">
            <h2 className="text-2xl font-bold mb-6">
              <span className="hero-gradient-text">Become a Founding Member</span>
            </h2>

            <div className="space-y-6">
              <p className="text-gray-300">
                The WAGA Protocol Founding Member Program is an exclusive opportunity for early supporters and
                contributors to help shape the future of our platform. As a founding member, you'll have a direct impact
                on our development roadmap, access to exclusive benefits, and recognition for your early support.
              </p>

              <h3 className="text-xl font-semibold text-emerald-300 mt-8 mb-4">Why Join?</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="bg-black/30 border border-emerald-500/20 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="bg-black/50 p-2 rounded-lg mr-3">{benefit.icon}</div>
                      <div>
                        <h4 className="font-medium text-emerald-300 mb-1">{benefit.title}</h4>
                        <p className="text-sm text-gray-400">{benefit.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="text-xl font-semibold text-emerald-300 mt-8 mb-4">Requirements</h3>

              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Active participation in the community forums and events</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">
                    Willingness to provide feedback on new features and developments
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Commitment to helping grow the WAGA Protocol ecosystem</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">
                    Experience in blockchain, coffee industry, or related fields (preferred but not required)
                  </span>
                </li>
              </ul>
            </div>
          </DynamicGlowCard>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          <DynamicGlowCard variant="purple" className="p-6">
            <div className="text-center mb-6">
              <div className="bg-purple-900/40 p-3 rounded-full inline-block mb-4">
                <Users className="h-8 w-8 text-purple-300" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                <span className="hero-gradient-text">Join the Program</span>
              </h3>
              <p className="text-gray-400">
                Applications for the founding member program are now open. Limited spots available!
              </p>
            </div>

            {applicationSubmitted ? (
              <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4 text-center">
                <Check className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-emerald-300 font-medium mb-2">Application Submitted!</h4>
                <p className="text-sm text-gray-400">
                  Thank you for your interest in the Founding Member Program. We'll review your application and get back
                  to you within 3-5 business days.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-black/30 border border-purple-500/20 rounded-lg p-4">
                  <h4 className="text-purple-300 font-medium mb-2">Limited Availability</h4>
                  <p className="text-sm text-gray-400">
                    We're accepting only 50 founding members in this initial phase to ensure a high-quality experience.
                  </p>
                </div>

                <Button
                  onClick={handleApply}
                  disabled={isApplying}
                  className="w-full bg-gradient-to-r from-purple-600 to-emerald-600 py-6"
                >
                  {isApplying ? "Submitting Application..." : "Apply to Join"}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  By applying, you agree to our community guidelines and terms of service.
                </p>
              </div>
            )}
          </DynamicGlowCard>
        </motion.div>
      </div>
    </div>
  )
}

