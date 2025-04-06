"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Menu, X, Bell, MessageSquare, User, Settings, Home } from "lucide-react"
import { useCommunity } from "@/context/community-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useScrollTop } from "@/hooks/use-scroll-top"

const navItems = [
  { name: "Dashboard", href: "/community/dashboard" },
  { name: "Forums", href: "/community/forums" },
  { name: "Resources", href: "/community/resources" },
  { name: "Events", href: "/community/events" },
  { name: "Members", href: "/community/members" },
]

export function CommunityNavbar() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user } = useCommunity()
  const scrolled = useScrollTop()

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isMenuOpen])

  // Add padding to body to account for fixed navbar
  useEffect(() => {
    document.body.style.paddingTop = "64px" // 4rem or 64px to match h-16
    return () => {
      document.body.style.paddingTop = "0px"
    }
  }, [])

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 w-full border-b border-emerald-500/20 bg-emerald-950/80 backdrop-blur supports-[backdrop-filter]:bg-emerald-950/60 transition-all duration-300",
          scrolled ? "shadow-[0_4px_20px_-12px_rgba(16,185,129,0.3)]" : "",
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center mr-6">
                <span className="text-xl font-bold">
                  <span className="bg-gradient-to-r from-emerald-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent glow-text">
                    WAGA
                  </span>
                  <span className="bg-gradient-to-r from-purple-400 via-emerald-400 to-purple-400 bg-clip-text text-transparent glow-text">
                    Community
                  </span>
                </span>
              </Link>
              <div className="hidden md:flex space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      pathname === item.href
                        ? "bg-gradient-to-r from-emerald-900/50 to-purple-900/50 text-emerald-400"
                        : "text-gray-300 hover:bg-gradient-to-r hover:from-emerald-900/30 hover:to-purple-900/30 hover:text-emerald-300",
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-500"></span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 web3-card-purple">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-[300px] overflow-y-auto">
                    <DropdownMenuItem className="flex flex-col items-start py-2">
                      <div className="font-medium">New reply to your forum post</div>
                      <div className="text-xs text-muted-foreground">5 minutes ago</div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex flex-col items-start py-2">
                      <div className="font-medium">Event reminder: DeFi Workshop</div>
                      <div className="text-xs text-muted-foreground">Tomorrow at 2:00 PM</div>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="justify-center text-emerald-400">
                    View all notifications
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Messages */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <MessageSquare className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-500"></span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 web3-card-purple">
                  <DropdownMenuLabel>Messages</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-[300px] overflow-y-auto">
                    <DropdownMenuItem className="flex flex-col items-start py-2">
                      <div className="font-medium">Maria Chen</div>
                      <div className="text-xs text-muted-foreground">Thanks for your help with the...</div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex flex-col items-start py-2">
                      <div className="font-medium">James Wilson</div>
                      <div className="text-xs text-muted-foreground">Are you attending the workshop?</div>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="justify-center text-emerald-400">View all messages</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative rounded-full">
                    <img
                      src={user?.avatar || "/placeholder.svg?height=40&width=40"}
                      alt="User avatar"
                      className="h-8 w-8 rounded-full border border-emerald-500/30"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 web3-card-purple">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Back to Home */}
              <Button variant="ghost" size="sm" asChild className="hidden md:flex">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  <span>Back to Home</span>
                </Link>
              </Button>

              {/* Mobile menu button */}
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu - moved outside the nav to avoid positioning issues */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md overflow-y-auto md:hidden">
          <div className="flex flex-col h-full">
            <div className="h-16 flex items-center justify-end px-4">
              <button
                className="flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white focus:outline-none"
                onClick={() => setIsMenuOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 px-4 pb-6">
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/10 to-purple-900/10 pointer-events-none"></div>
              <div className="absolute inset-0 web3-grid-bg opacity-10 pointer-events-none"></div>

              <nav className="flex flex-col space-y-4 mt-4 relative z-10">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "text-lg font-medium text-gray-300 hover:text-emerald-400 transition-colors py-3 border-b border-gray-800/50",
                      pathname === item.href ? "text-emerald-400" : "",
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}

                <Link
                  href="/"
                  className="text-lg font-medium text-gray-300 hover:text-emerald-400 transition-colors py-3 border-b border-gray-800/50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Home className="h-4 w-4 mr-2 inline" />
                  <span>Back to Home</span>
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

