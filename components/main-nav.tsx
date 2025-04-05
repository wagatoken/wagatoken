"use client"

import { cn } from "@/lib/utils"

import Link from "next/link"

import { usePathname } from "next/navigation"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="flex items-center">
      <Link href="/" className="flex items-center">
        <span className="text-xl font-bold">
          <span className="bg-gradient-to-r from-emerald-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent glow-text">
            WAGA
          </span>
          <span className="bg-gradient-to-r from-purple-400 via-emerald-400 to-purple-400 bg-clip-text text-transparent glow-text">
            Protocol
          </span>
        </span>
      </Link>
      <nav className="ml-8 hidden md:flex items-center space-x-6">
        <Link
          href="/#about"
          className={cn(
            "text-sm font-medium transition-colors hover:text-emerald-400",
            pathname === "/#about" ? "text-emerald-400" : "text-muted-foreground",
          )}
        >
          About
        </Link>
        <Link
          href="/#features"
          className={cn(
            "text-sm font-medium transition-colors hover:text-emerald-400",
            pathname === "/#features" ? "text-emerald-400" : "text-muted-foreground",
          )}
        >
          Features
        </Link>
        <Link
          href="/#roadmap"
          className={cn(
            "text-sm font-medium transition-colors hover:text-emerald-400",
            pathname === "/#roadmap" ? "text-emerald-400" : "text-muted-foreground",
          )}
        >
          Roadmap
        </Link>
        <Link
          href="/explore"
          className={cn(
            "text-sm font-medium transition-colors hover:text-emerald-400",
            pathname === "/explore" ? "text-emerald-400" : "text-muted-foreground",
          )}
        >
          Demo
        </Link>
        <Link
          href="/community/dashboard"
          className={cn(
            "text-sm font-medium transition-colors hover:text-emerald-400",
            pathname === "/community/dashboard" ? "text-emerald-400" : "text-muted-foreground",
          )}
        >
          Community
        </Link>
        <Link
          href="/admin/dashboard"
          className={cn(
            "text-sm font-medium transition-colors hover:text-emerald-400",
            pathname === "/admin/dashboard" ? "text-emerald-400" : "text-muted-foreground",
          )}
        >
          Admin
        </Link>
      </nav>
    </div>
  )
}

