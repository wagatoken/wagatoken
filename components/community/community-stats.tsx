"use client"

import DynamicGlowCard from "@/components/dynamic-glow-card"
import { Users, MessageSquare, FileText, Calendar } from "lucide-react"

export function CommunityStats() {
  // Updated with more realistic numbers for a newly launched platform
  const stats = [
    { label: "Members", value: "3", icon: <Users className="h-4 w-4 text-emerald-400" /> },
    { label: "Discussions", value: "1", icon: <MessageSquare className="h-4 w-4 text-purple-400" /> },
    { label: "Resources", value: "1", icon: <FileText className="h-4 w-4 text-emerald-400" /> },
    { label: "Events", value: "1", icon: <Calendar className="h-4 w-4 text-purple-400" /> },
  ]

  return (
    <DynamicGlowCard variant="dual" className="p-6">
      <h2 className="text-xl font-bold text-emerald-300 mb-4">Community Stats</h2>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="p-3 rounded-md bg-black/30 border border-emerald-500/10">
            <div className="flex items-center mb-2">
              <div className="mr-2">{stat.icon}</div>
              <span className="text-xs text-gray-400">{stat.label}</span>
            </div>
            <div className="text-lg font-bold text-gray-200">{stat.value}</div>
          </div>
        ))}
      </div>
    </DynamicGlowCard>
  )
}

