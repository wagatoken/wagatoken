"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Menu, X, Bell, Settings, User, LogOut, Home } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"
import { useScrollTop } from "@/hooks/use-scroll-top"

const navItems = [
  { name: "Dashboard", href: "/admin/dashboard" },
  { name: "Users", href: "/admin/users" },
  { name: "Content", href: "/admin/content" },
  { name: "Reports", href: "/admin/reports" },
  { name: "Settings", href: "/admin/settings" },
]

export function AdminNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
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

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
      variant: "default",
    })
    // In a real app, this would handle the logout process
    router.push("/")
  }

  const handleNotificationClick = () => {
    toast({
      title: "Notifications",
      description: "You have 2 unread notifications.",
      variant: "default",
    })
  }

  const handleProfileClick = () => {
    toast({
      title: "Profile",
      description: "Viewing admin profile.",
      variant: "default",
    })
  }

  const handleSettingsClick = () => {
    router.push("/admin/settings")
  }

  return (
    <>
      <nav
        className={cn(
          "sticky top-0 z-40 w-full border-b border-emerald-500/20 bg-emerald-950/80 backdrop-blur supports-[backdrop-filter]:bg-emerald-950/60",
          scrolled ? "shadow-[0_4px_20px_-12px_rgba(16,185,129,0.3)]" : "",
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/admin/dashboard" className="flex items-center mr-6">
                <span className="text-xl font-bold">
                  <span className="bg-gradient-to-r from-emerald-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent glow-text">
                    WAGA
                  </span>
                  <span className="bg-gradient-to-r from-purple-400 via-emerald-400 to-purple-400 bg-clip-text text-transparent glow-text">
                    Admin
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
                  <Button variant="ghost" size="icon" className="relative" onClick={handleNotificationClick}>
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-500"></span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 web3-card-purple">
                  <DropdownMenuLabel>Admin Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-[300px] overflow-y-auto">
                    <DropdownMenuItem className="flex flex-col items-start py-2">
                      <div className="font-medium">New content reported</div>
                      <div className="text-xs text-muted-foreground">5 minutes ago</div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex flex-col items-start py-2">
                      <div className="font-medium">New user registration spike</div>
                      <div className="text-xs text-muted-foreground">1 hour ago</div>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="justify-center text-emerald-400">
                    View all notifications
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

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative rounded-full">
                    <img
                      src="/placeholder.svg"
                      alt="Admin avatar"
                      className="h-8 w-8 rounded-full border border-emerald-500/30"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 web3-card-purple">
                  <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleProfileClick}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSettingsClick}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

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

