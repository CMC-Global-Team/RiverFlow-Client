"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm font-medium 
                 hover:bg-muted transition-all text-foreground"
      title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
    >
      {theme === "light" ? (
        <>
          <Moon className="h-5 w-5 text-primary" />
          <span>Dark</span>
        </>
      ) : (
        <>
          <Sun className="h-5 w-5 text-yellow-400" />
          <span>Light</span>
        </>
      )}
    </button>
  )
}
