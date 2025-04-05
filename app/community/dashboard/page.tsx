"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useCommunity } from "@/context/community-context"
import { DashboardHeader } from "@/components/community/dashboard-header"
import { ActivityFeed } from "@/components/community/activity-feed"
import { EventsCalendar } from "@/components/community/events-calendar"
import { ResourcesWidget } from "@/components/community/resources-widget"
import { ForumPreview } from "@/components/community/forum-preview"
import { CommunityStats } from "@/components/community/community-stats"
import DynamicGlowCard from "@/components/dynamic-glow-card"
import Link from "next/link"
import {
  MessageSquare,
  FileText,
  Calendar,
  Users,
  ArrowRight,
  Info,
  Sparkles,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"

// Animation variants
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export default function CommunityDashboard() {
  const { user, fetchUserActivity, isLoading, error } = useCommunity()
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsRefreshing(true)
        await fetchUserActivity()
      } catch (err) {
        console.error("Error loading dashboard data:", err)
      } finally {
        setIsRefreshing(false)
      }
    }

    loadData()
  }, [fetchUserActivity])

  if (isLoading && !isRefreshing) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mb-4" />
          <p className="text-emerald-400">Loading community dashboard...</p>
        </div>
      </div>
    )
  }

  if (error && !isRefreshing) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <DynamicGlowCard variant="purple" className="p-6">
          <div className="flex flex-col items-center text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <Button onClick={() => fetchUserActivity()} className="bg-gradient-to-r from-emerald-600 to-purple-600">
              Try Again
            </Button>
          </div>
        </DynamicGlowCard>
      </div>
    )
  }

  // Navigation cards for main community sections
  const navigationCards = [
    {
      title: "Discussion Forums",
      description: "Join conversations, ask questions, and share your knowledge with the community",
      icon: <MessageSquare className="h-6 w-6 text-emerald-400" />,
      href: "/community/forums",
      color: "emerald",
    },
    {
      title: "Resources Library",
      description: "Access guides, tutorials, whitepapers, and videos to learn about WAGA Protocol",
      icon: <FileText className="h-6 w-6 text-purple-400" />,
      href: "/community/resources",
      color: "purple",
    },
    {
      title: "Upcoming Events",
      description: "Join webinars, workshops, and conferences to learn and connect with the community",
      icon: <Calendar className="h-6 w-6 text-emerald-400" />,
      href: "/community/events",
      color: "emerald",
    },
    {
      title: "Member Directory",
      description: "Connect with farmers, developers, and industry experts in the WAGA Protocol community",
      icon: <Users className="h-6 w-6 text-purple-400" />,
      href: "/community/members",
      color: "purple",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <DashboardHeader
        title="Community Dashboard"
        description="Connect, learn, and grow with the WAGA Protocol community"
      />

      {/* Welcome Card */}
      <motion.div variants={fadeIn} initial="hidden" animate="visible" className="mb-8">
        <DynamicGlowCard variant="dual" className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-black/30 p-3 rounded-lg">
              <Sparkles className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-3">
                <span className="hero-gradient-text">Welcome to WAGA Community, {user?.name || "Member"}</span>
              </h2>
              <p className="text-gray-300 mb-4">
                Waga is officially launching! Be amongst the first to get early access to our ecosystem. Right now you
                can check out our introduction guide, join our upcoming webinars, follow our social media pages, and
                introduce yourself in our welcome threads. Glad to have you onboard!! Team Waga.
              </p>
              <div className="p-3 bg-black/30 border border-emerald-500/20 rounded-lg">
                <div className="flex">
                  <Info className="h-5 w-5 text-emerald-400 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-emerald-300 font-medium mb-1">Platform Roadmap</p>
                    <p className="text-sm text-gray-400">
                      Over the next two weeks, we'll be adding to the forum categories enabling you to track our
                      progress and contribute to shaping the future of WAGA. Your feedback during this alpha phase will
                      be invaluable!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DynamicGlowCard>
      </motion.div>

      {/* Navigation Cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
      >
        {navigationCards.map((card, index) => (
          <motion.div key={index} variants={fadeIn}>
            <Link href={card.href}>
              <DynamicGlowCard
                variant={card.color as "emerald" | "purple"}
                className="p-6 h-full hover:translate-y-0 transition-transform"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-black/30 p-3 rounded-lg">{card.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-emerald-300 mb-2">{card.title}</h3>
                    <p className="text-gray-400 mb-4">{card.description}</p>
                    <div className="flex justify-end">
                      <span className="text-sm flex items-center text-emerald-400">
                        Explore <ArrowRight className="h-4 w-4 ml-1" />
                      </span>
                    </div>
                  </div>
                </div>
              </DynamicGlowCard>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Early Adopter Banner */}
      <motion.div variants={fadeIn} initial="hidden" animate="visible" className="mb-8">
        <DynamicGlowCard variant="purple" className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-purple-900/40 p-3 rounded-full">
                <Users className="h-6 w-6 text-purple-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  <span className="hero-gradient-text">Founding Member Program</span>
                </h3>
                <p className="text-gray-400">
                  Join our founding member program and help shape the future of WAGA Protocol
                </p>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-purple-600 to-emerald-600 whitespace-nowrap">
              <Link href="/community/founding-member">Learn More</Link>
            </Button>
          </div>
        </DynamicGlowCard>
      </motion.div>

      {/* Activity and content widgets */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-6 md:grid-cols-12"
      >
        {/* Main content - 8 columns on large screens */}
        <motion.div variants={fadeIn} className="md:col-span-8 space-y-6">
          <ActivityFeed />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ForumPreview />
            <ResourcesWidget />
          </div>
        </motion.div>

        {/* Sidebar - 4 columns */}
        <motion.div variants={fadeIn} className="md:col-span-4 space-y-6">
          <CommunityStats />
          <EventsCalendar />
        </motion.div>
      </motion.div>
    </div>
  )
}

