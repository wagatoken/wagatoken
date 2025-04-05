"use client"

import { useCommunity } from "@/context/community-context"
import DynamicGlowCard from "@/components/dynamic-glow-card"
import { FileText, Download, Star, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function ResourcesWidget() {
  const { resources, downloadResource } = useCommunity()

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "guide":
      case "tutorial":
      case "whitepaper":
      case "video":
      default:
        return <FileText className="h-5 w-5 text-emerald-400" />
    }
  }

  return (
    <DynamicGlowCard variant="emerald" className="p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-emerald-300">Popular Resources</h2>
        <Link href="/community/resources" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
          View all
        </Link>
      </div>

      <div className="space-y-4">
        {resources.length === 0 ? (
          <div className="text-center py-6 px-4 bg-black/30 border border-emerald-500/10 rounded-md">
            <FileText className="h-10 w-10 text-emerald-400/70 mx-auto mb-3" />
            <p className="text-gray-300 font-medium mb-2">No resources yet</p>
            <p className="text-sm text-gray-400 mb-4">Resources will be added soon to help you get started.</p>
            <Link href="/community/resources">
              <Button
                variant="outline"
                size="sm"
                className="border-emerald-500/30 hover:bg-emerald-900/30 hover:border-emerald-500/50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Contribute a resource
              </Button>
            </Link>
          </div>
        ) : (
          resources.slice(0, 2).map((resource) => (
            <div
              key={resource.id}
              className="p-4 rounded-md bg-black/30 border border-emerald-500/10 hover:border-emerald-500/30 transition-colors"
            >
              <div className="flex items-start">
                <div className="bg-emerald-900/50 p-2 rounded-md mr-3 mt-1">{getResourceIcon(resource.type)}</div>
                <div className="flex-1">
                  <h3 className="font-medium text-emerald-300 mb-1">{resource.title}</h3>
                  <p className="text-sm text-gray-400 mb-2 line-clamp-2">{resource.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-400">
                      <div className="flex items-center mr-3">
                        <Download className="h-3 w-3 mr-1" />
                        <span>{resource.downloadCount}</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 mr-1 text-amber-400" />
                        <span>{resource.rating}</span>
                      </div>
                    </div>

                    <button
                      className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                      onClick={() => downloadResource(resource.id)}
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </DynamicGlowCard>
  )
}

