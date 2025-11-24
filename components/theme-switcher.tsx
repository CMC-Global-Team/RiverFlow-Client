"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { t } = useTranslation()
  
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors min-w-[100px]"
      title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
    >
      {theme === "light" ? (
        <>
          <Moon className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-foreground">{t("dark")}</span>
        </>
      ) : (
        <>
          <Sun className="h-5 w-5 text-yellow-400" />
          <span className="text-sm font-medium text-foreground">{t("light")}</span>
        </>
      )}
    </button>
  )
}