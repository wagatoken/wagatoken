"use client"

import { motion } from "framer-motion"
import { useCommunity } from "@/context/community-context"
import { DashboardHeader } from "@/components/community/dashboard-header"
import DynamicGlowCard from "@/components/dynamic-glow-card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Star, Filter, Plus, BookOpen, Video, FileCode, FileQuestion } from "lucide-react"
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

export default function ResourcesPage() {
  const { resources, downloadResource } = useCommunity()

  // Add more mock resources for the page
  const allResources = [
    ...resources,
    {
      id: "resource-3",
      title: "DeFi Integration Guide for Coffee Farmers",
      description:
        "Learn how to leverage decentralized finance to access funding and financial services for your coffee farm.",
      type: "guide",
      author: {
        id: "user-7",
        name: "Thomas Nguyen",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      publishDate: "2023-10-15",
      downloadCount: 562,
      rating: 4.7,
      url: "/resources/defi-integration-guide",
    },
    {
      id: "resource-4",
      title: "WAGA Protocol Technical Documentation",
      description: "Comprehensive technical documentation for developers building on the WAGA Protocol.",
      type: "whitepaper",
      author: {
        id: "user-5",
        name: "WAGA Protocol Team",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      publishDate: "2023-09-05",
      downloadCount: 987,
      rating: 4.9,
      url: "/resources/technical-documentation",
    },
    {
      id: "resource-5",
      title: "Introduction to Blockchain for Coffee Industry",
      description:
        "A beginner-friendly video explaining how blockchain technology is transforming the coffee industry.",
      type: "video",
      author: {
        id: "user-8",
        name: "Isabella Gomez",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      publishDate: "2023-10-20",
      downloadCount: 1245,
      rating: 4.8,
      url: "/resources/blockchain-coffee-intro-video",
    },
    {
      id: "resource-6",
      title: "Smart Contract Examples for Coffee Tokenization",
      description: "Code examples and explanations for implementing coffee tokenization using smart contracts.",
      type: "tutorial",
      author: {
        id: "user-9",
        name: "David Kim",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      publishDate: "2023-10-12",
      downloadCount: 432,
      rating: 4.6,
      url: "/resources/smart-contract-examples",
    },
  ]

  // Categories for filtering
  const categories = [
    { name: "All", count: allResources.length },
    { name: "Guides", count: allResources.filter((r) => r.type === "guide").length },
    { name: "Tutorials", count: allResources.filter((r) => r.type === "tutorial").length },
    { name: "Whitepapers", count: 0 },
    { name: "Videos", count: 0 },
  ]

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "guide":
        return <BookOpen className="h-6 w-6 text-emerald-400" />
      case "tutorial":
        return <FileCode className="h-6 w-6 text-purple-400" />
      case "whitepaper":
        return <FileText className="h-6 w-6 text-emerald-400" />
      case "video":
        return <Video className="h-6 w-6 text-purple-400" />
      default:
        return <FileQuestion className="h-6 w-6 text-emerald-400" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <DashboardHeader
        title="Resources Library"
        description="Access guides, tutorials, whitepapers, and videos to learn about WAGA Protocol"
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
            <Link href="/community/resources/upload">Upload Resource</Link>
          </Button>
        </div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {allResources.map((resource, index) => (
          <motion.div key={resource.id} variants={fadeIn}>
            <DynamicGlowCard variant={index % 2 === 0 ? "emerald" : "purple"} className="p-6 h-full flex flex-col">
              <div className="flex items-start mb-4">
                <div className="bg-black/30 p-3 rounded-lg mr-4">{getResourceIcon(resource.type)}</div>
                <div>
                  <span className="bg-black/30 px-2 py-0.5 rounded-full text-xs text-emerald-300 border border-emerald-500/20 uppercase">
                    {resource.type}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-medium text-gray-200 mb-2">{resource.title}</h3>
              <p className="text-sm text-gray-400 mb-4 flex-grow">{resource.description}</p>

              <div className="mt-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-gray-400">
                    <div className="flex items-center mr-3">
                      <Download className="h-4 w-4 mr-1" />
                      <span>{resource.downloadCount}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-amber-400" />
                      <span>{resource.rating}</span>
                    </div>
                  </div>

                  <span className="text-xs text-gray-500">{new Date(resource.publishDate).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={resource.author.avatar || "/placeholder.svg"}
                      alt={resource.author.name}
                      className="h-6 w-6 rounded-full mr-2 border border-emerald-500/30"
                    />
                    <span className="text-xs text-gray-400">{resource.author.name}</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="border-emerald-500/30 hover:bg-emerald-900/30 hover:border-emerald-500/50"
                    onClick={() => downloadResource(resource.id)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </DynamicGlowCard>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

