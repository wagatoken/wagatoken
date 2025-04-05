"use client"

import { useCommunity } from "@/context/community-context"
import DynamicGlowCard from "@/components/dynamic-glow-card"
import { MessageSquare, Eye, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function ForumPreview() {
  const { forumTopics } = useCommunity()

  return (
    <DynamicGlowCard variant="purple" className="p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-purple-300">Active Discussions</h2>
        <Link href="/community/forums" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
          View all
        </Link>
      </div>

      <div className="space-y-4">
        {forumTopics.length === 0 ? (
          <div className="text-center py-6 px-4 bg-black/30 border border-purple-500/10 rounded-md">
            <MessageSquare className="h-10 w-10 text-purple-400/70 mx-auto mb-3" />
            <p className="text-gray-300 font-medium mb-2">No discussions yet</p>
            <p className="text-sm text-gray-400 mb-4">
              Start a conversation or ask a question to get the community talking.
            </p>
            <Link href="/community/forums">
              <Button
                variant="outline"
                size="sm"
                className="border-purple-500/30 hover:bg-purple-900/30 hover:border-purple-500/50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Start a discussion
              </Button>
            </Link>
          </div>
        ) : (
          forumTopics.slice(0, 2).map((topic) => (
            <Link href={topic.url} key={topic.id} className="block">
              <div className="p-4 rounded-md bg-black/30 border border-purple-500/10 hover:border-purple-500/30 transition-colors">
                <div className="flex items-start">
                  <img
                    src={topic.author.avatar || "/placeholder.svg"}
                    alt={topic.author.name}
                    className="h-8 w-8 rounded-full mr-3 mt-1 border border-purple-500/30"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-200 mb-1">{topic.title}</h3>
                    <div className="flex items-center text-xs text-gray-400 mb-2">
                      <span className="bg-purple-900/50 px-2 py-0.5 rounded-full mr-2">{topic.category}</span>
                      <span>{topic.author.name}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-400">
                        <div className="flex items-center mr-3">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          <span>{topic.replyCount}</span>
                        </div>
                        <div className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          <span>{topic.viewCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </DynamicGlowCard>
  )
}

