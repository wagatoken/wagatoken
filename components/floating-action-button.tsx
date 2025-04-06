"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, X, BookOpen, Calendar, MessageSquare, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface FloatingActionButtonProps {
  actions?: {
    icon: React.ReactNode
    label: string
    href: string
  }[]
  className?: string
}

export function FloatingActionButton({
  actions = [
    { icon: <BookOpen className="h-4 w-4" />, label: "New Course", href: "/admin/courses/new" },
    { icon: <Calendar className="h-4 w-4" />, label: "New Event", href: "/admin/events/new" },
    { icon: <MessageSquare className="h-4 w-4" />, label: "New Forum", href: "/admin/forums/new" },
    { icon: <FileText className="h-4 w-4" />, label: "New Resource", href: "/admin/resources/new" },
  ],
  className,
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      <div className="relative">
        {isOpen && (
          <div className="absolute bottom-16 right-0 flex flex-col-reverse gap-2 items-end">
            {actions.map((action, index) => (
              <div
                key={index}
                className="flex items-center gap-2 transition-all duration-300"
                style={{
                  opacity: isOpen ? 1 : 0,
                  transform: isOpen ? "translateY(0)" : "translateY(20px)",
                  transitionDelay: `${index * 50}ms`,
                }}
              >
                <span className="bg-emerald-950/90 text-white text-sm py-1 px-3 rounded-full shadow-lg border border-emerald-500/20">
                  {action.label}
                </span>
                <Button asChild size="icon" className="h-10 w-10 rounded-full web3-button-purple shadow-lg">
                  <Link href={action.href}>{action.icon}</Link>
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "h-12 w-12 rounded-full shadow-lg transition-all duration-300 web3-button-purple",
            isOpen ? "rotate-45" : "",
          )}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  )
}

