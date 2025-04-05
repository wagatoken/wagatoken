"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/community/dashboard-header"
import DynamicGlowCard from "@/components/dynamic-glow-card"
import { Button } from "@/components/ui/button"
import { Search, Filter, MessageSquare, UserPlus, Award } from "lucide-react"
import { Input } from "@/components/ui/input"

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

// Update the members array to show a more realistic set of initial users
const members = [
  {
    id: "user-admin",
    name: "WAGA Admin",
    avatar: "/placeholder.svg?height=80&width=80",
    role: "admin",
    joinDate: new Date().toISOString(),
    reputation: 5,
    badges: ["Admin", "Founding Member"],
    location: "Addis Ababa, Ethiopia",
    bio: "Platform administrator and community manager for the WAGA Protocol ecosystem.",
  },
  {
    id: "user-1",
    name: "Maria Chen",
    avatar: "/placeholder.svg?height=80&width=80",
    role: "member",
    joinDate: new Date().toISOString(),
    reputation: 2,
    badges: ["Early Adopter"],
    location: "Singapore",
    bio: "Blockchain enthusiast interested in sustainable supply chains and coffee traceability.",
  },
  {
    id: "user-2",
    name: "James Wilson",
    avatar: "/placeholder.svg?height=80&width=80",
    role: "member",
    joinDate: new Date().toISOString(),
    reputation: 1,
    badges: ["Coffee Farmer"],
    location: "Nairobi, Kenya",
    bio: "Coffee farmer looking to leverage blockchain for better market access.",
  },
]

export default function MembersPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter members based on search query
  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.bio.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <DashboardHeader
        title="Community Members"
        description="Connect with farmers, developers, and industry experts in the WAGA Protocol community"
      />

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search members..."
            className="pl-10 bg-black/30 border-emerald-500/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" className="border-emerald-500/30">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredMembers.map((member, index) => (
          <motion.div key={member.id} variants={fadeIn}>
            <DynamicGlowCard variant={index % 2 === 0 ? "emerald" : "purple"} className="p-6 h-full flex flex-col">
              <div className="flex items-center mb-4">
                <img
                  src={member.avatar || "/placeholder.svg"}
                  alt={member.name}
                  className="h-16 w-16 rounded-full border border-emerald-500/30 mr-4"
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-200">{member.name}</h3>
                  <div className="flex items-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        member.role === "admin"
                          ? "bg-emerald-900/50 text-emerald-300 border border-emerald-500/30"
                          : member.role === "moderator"
                            ? "bg-purple-900/50 text-purple-300 border border-purple-500/30"
                            : "bg-gray-800 text-gray-300"
                      }`}
                    >
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </span>
                    <span className="ml-2 text-xs text-gray-400">Joined today</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-400 mb-4 flex-grow">{member.bio}</p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-400">
                  <Award className="h-4 w-4 mr-2 text-emerald-400" />
                  <span>Reputation: {member.reputation}</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {member.badges.map((badge, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-full text-xs bg-black/30 border border-emerald-500/20 text-emerald-300"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-auto flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-emerald-500/30 hover:bg-emerald-900/30 hover:border-emerald-500/50"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-emerald-500/30 hover:bg-emerald-900/30 hover:border-emerald-500/50"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Follow
                </Button>
              </div>
            </DynamicGlowCard>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

