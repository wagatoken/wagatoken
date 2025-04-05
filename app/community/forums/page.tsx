"use client"

import { motion } from "framer-motion"
import { useCommunity } from "@/context/community-context"
import { DashboardHeader } from "@/components/community/dashboard-header"
import DynamicGlowCard from "@/components/dynamic-glow-card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Eye, Plus, Filter } from "lucide-react"
import Link from "next/link"

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

export default function ForumsPage() {
  const { forumTopics } = useCommunity()

  // Categories for filtering
  const categories = [
    { name: "All", count: forumTopics.length },
    { name: "Announcements", count: forumTopics.filter((t) => t.category === "Announcements").length },
    { name: "General", count: forumTopics.filter((t) => t.category === "General").length },
    { name: "Questions", count: 0 },
    { name: "Technical", count: 0 },
  ]

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <DashboardHeader
        title="Community Forums"
        description="Join discussions, ask questions, and share your knowledge with the community"
      />

      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
        <div className="w-full md:w-auto flex flex-wrap gap-2">
          {categories.map((category, index) => (
            <Button
              key={index}
              variant={index === 0 ? "default" : "outline"}
              size="sm"
              className={index === 0 ? "bg-gradient-to-r from-emerald-600 to-purple-600" : "border-emerald-500/30"}
            >
              {category.name}
              <span className="ml-2 bg-black/30 px-1.5 py-0.5 rounded-full text-xs">{category.count}</span>
            </Button>
          ))}
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" className="border-emerald-500/30">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-gradient-to-r from-emerald-600 to-purple-600 ml-auto md:ml-0">
            <Plus className="h-4 w-4 mr-2" />
            <Link href="/community/forums/new">New Topic</Link>
          </Button>
        </div>
      </div>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
        {forumTopics.map((topic, index) => (
          <motion.div key={topic.id} variants={fadeIn}>
            <Link href={`/community/forums/${topic.id}`}>
              <DynamicGlowCard variant={index % 2 === 0 ? "emerald" : "purple"} className="p-6 hover:translate-y-0">
                <div className="flex items-start">
                  <img
                    src={topic.author.avatar || "/placeholder.svg"}
                    alt={topic.author.name}
                    className="h-10 w-10 rounded-full mr-4 border border-emerald-500/30"
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="bg-black/30 px-2 py-0.5 rounded-full text-xs text-emerald-300 border border-emerald-500/20">
                        {topic.category}
                      </span>
                      {topic.isSticky && (
                        <span className="bg-purple-900/30 px-2 py-0.5 rounded-full text-xs text-purple-300 border border-purple-500/20">
                          Pinned
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-gray-200 mb-1">{topic.title}</h3>
                    <div className="flex items-center text-sm text-gray-400">
                      <span>By {topic.author.name}</span>
                      <span className="mx-2">•</span>
                      <span>Started on {new Date(topic.publishDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="hidden md:flex flex-col items-end ml-4">
                    <div className="flex items-center text-sm text-gray-400 mb-2">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      <span>{topic.replyCount} replies</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <Eye className="h-4 w-4 mr-1" />
                      <span>{topic.viewCount} views</span>
                    </div>
                  </div>
                </div>
              </DynamicGlowCard>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

