"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="border-emerald-500/40 hover:border-emerald-500/70 bg-emerald-500/10 h-8 w-8 p-0 relative overflow-hidden group"
    >
      <span className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
      <span className="relative z-10">
        {theme === "light" ? <Moon className="h-4 w-4 text-white" /> : <Sun className="h-4 w-4 text-yellow-300" />}
      </span>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

