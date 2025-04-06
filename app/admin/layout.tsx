"use client"

import type React from "react"
import { redirect } from "next/navigation"
import { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import { BookOpen, Calendar, FileText, Home, Menu, MessageSquare, Settings, X } from "lucide-react"
import { Button } from "@/components/ui/button"

// This is a simple auth check - in a real app, you would use a proper auth system
// This is just for demonstration purposes
const isAuthenticated = () => {
  // In a real implementation, this would check session/cookies/JWT
  return true // Always return true for demo purposes
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user is authenticated
  if (!isAuthenticated()) {
    redirect("/login")
  }

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile screens
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  return (
    <div className="admin-layout">
      <div className="flex min-h-screen relative">
        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-background border-b border-purple-500/20 h-16">
          <div className="flex items-center justify-between px-4 h-full">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <h2 className="text-lg font-bold web3-gradient-text">Admin Dashboard</h2>
            <Link href="/admin/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Sidebar - Overlay on mobile, fixed on desktop */}
        <div
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 transition-transform duration-200 fixed md:sticky top-0 left-0 z-40 md:z-0 h-full w-64 bg-background border-r border-purple-500/20 shadow-lg md:shadow-none`}
        >
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold web3-gradient-text">Admin Dashboard</h2>
              {isMobile && (
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
            <nav className="space-y-1">
              <Link
                href="/admin"
                className="flex items-center gap-3 p-2 rounded-md hover:bg-purple-500/10 transition text-sm"
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                <Home className="h-4 w-4 text-purple-400" />
                Dashboard
              </Link>
              <Link
                href="/admin/resources"
                className="flex items-center gap-3 p-2 rounded-md hover:bg-purple-500/10 transition text-sm"
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                <FileText className="h-4 w-4 text-blue-400" />
                Resources
              </Link>
              <Link
                href="/admin/courses"
                className="flex items-center gap-3 p-2 rounded-md hover:bg-purple-500/10 transition text-sm"
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                <BookOpen className="h-4 w-4 text-teal-400" />
                Courses
              </Link>
              <Link
                href="/admin/events"
                className="flex items-center gap-3 p-2 rounded-md hover:bg-purple-500/10 transition text-sm"
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                <Calendar className="h-4 w-4 text-pink-400" />
                Events
              </Link>
              <Link
                href="/admin/forums"
                className="flex items-center gap-3 p-2 rounded-md hover:bg-purple-500/10 transition text-sm"
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                <MessageSquare className="h-4 w-4 text-purple-400" />
                Forums
              </Link>
              <Link
                href="/admin/settings"
                className="flex items-center gap-3 p-2 rounded-md hover:bg-purple-500/10 transition text-sm"
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                <Settings className="h-4 w-4 text-blue-400" />
                Settings
              </Link>
            </nav>

            <div className="pt-6 mt-6 border-t border-purple-500/20">
              <div className="bg-purple-500/10 rounded-lg p-4">
                <h3 className="font-medium text-sm mb-2">Admin Help</h3>
                <p className="text-xs text-muted-foreground">Need assistance with the admin panel?</p>
                <Link
                  href="/admin/help"
                  className="mt-2 text-xs text-purple-400 hover:text-purple-300 block"
                  onClick={() => isMobile && setSidebarOpen(false)}
                >
                  View Documentation →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && isMobile && (
          <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main content area */}
        <div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full md:pt-8 pt-20">
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </div>
      </div>
    </div>
  )
}

