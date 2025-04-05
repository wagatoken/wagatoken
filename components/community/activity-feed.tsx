"use client"

import { useCommunity } from "@/context/community-context"
import DynamicGlowCard from "@/components/dynamic-glow-card"
import { formatDistanceToNow } from "date-fns"
import { MessageSquare, Calendar, FileText, ThumbsUp, Info } from "lucide-react"
import Link from "next/link"

export function ActivityFeed() {
  const { activities, isLoading } = useCommunity()

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "post":
      case "comment":
        return <MessageSquare className="h-5 w-5 text-emerald-400" />
      case "event":
        return <Calendar className="h-5 w-5 text-purple-400" />
      case "resource":
        return <FileText className="h-5 w-5 text-emerald-400" />
      case "reaction":
        return <ThumbsUp className="h-5 w-5 text-purple-400" />
      default:
        return <MessageSquare className="h-5 w-5 text-emerald-400" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch (e) {
      return "recently"
    }
  }

  return (
    <DynamicGlowCard variant="emerald" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-emerald-300">Recent Activity</h2>
        <Link href="/community/activity" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
          View all
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-emerald-900/20 animate-pulse rounded-md"></div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p className="mb-2">No activity yet</p>
          <p className="text-sm">Be the first to create a post or share a resource!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <Link href={activity.url} key={activity.id} className="block">
              <div className="p-4 rounded-md bg-black/30 border border-emerald-500/10 hover:border-emerald-500/30 transition-colors">
                <div className="flex items-start">
                  <div className="mr-3 mt-1">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <img
                        src={activity.author.avatar || "/placeholder.svg"}
                        alt={activity.author.name}
                        className="h-5 w-5 rounded-full mr-2"
                      />
                      <span className="text-sm text-gray-300">{activity.author.name}</span>
                      <span className="mx-2 text-gray-500">•</span>
                      <span className="text-xs text-gray-500">{formatTimestamp(activity.timestamp)}</span>
                    </div>
                    <h3 className="font-medium text-emerald-300">{activity.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{activity.content}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {activities.length < 3 && (
            <div className="p-4 rounded-md bg-black/30 border border-emerald-500/10 border-dashed">
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  <Info className="h-5 w-5 text-emerald-400/70" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-emerald-300">Community is just getting started</h3>
                  <p className="text-sm text-gray-400">
                    As more members join and participate, you'll see more activity here.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </DynamicGlowCard>
  )
}

