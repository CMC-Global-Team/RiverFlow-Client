"use client"
import "@/i18n/i18n"
import { useState } from "react"
import Link from "next/link"
import { Menu, X, LogOut, User } from "lucide-react"
import { useAuth } from "@/hooks/auth/useAuth"
import { useLogout } from "@/hooks/auth/useLogout"
import { useTranslation } from "react-i18next"
import LanguageSwitcher from "./LanguageSwitcher"

interface HeaderProps {
  onAuthClick: (tab: "login" | "signup") => void
}

export default function Header({ onAuthClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAuthenticated, user } = useAuth()
  const { logout, isLoading: isLoggingOut } = useLogout()
  const { t } = useTranslation()
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent"></div>
            <span className="text-xl font-bold text-foreground">RiverFlow</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
                {t("features")}
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
                {t("pricing")}
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
                {t("about")}
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
                {t("docs")}
            </Link>
          </nav>

          {/* Desktop Actions - Auth Buttons & Language Switcher */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">{user?.fullName}</span>
                </Link>
                <button
                  onClick={() => logout()}
                  disabled={isLoggingOut}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onAuthClick("login")}
                  className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                    {t("login")}
                </button>
                <button
                  onClick={() => onAuthClick("signup")}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
                >
                    {t( "GetStarted")}
                </button>
              </>
            )}
            
            {/* Language Switcher */}
            <LanguageSwitcher />
          </div>
              
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-3">
            <Link
              href="#features"
              className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {t("features")}
            </Link>
            <Link
              href="/pricing"
              className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {t("pricing")}
            </Link>
            <Link
              href="/about"
              className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {t("about")}
            </Link>
            <Link href="#" className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              {t("docs")}
            </Link>
            
            {/* Language Switcher - Mobile */}
            <div className="px-4">
              <LanguageSwitcher />
            </div>

            <div className="px-4 pt-2 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    {user?.fullName}
                  </Link>
                  <button
                    onClick={() => {
                      logout()
                      setMobileMenuOpen(false)
                    }}
                    disabled={isLoggingOut}
                    className="w-full px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onAuthClick("login")
                      setMobileMenuOpen(false)
                    }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      onAuthClick("signup")
                      setMobileMenuOpen(false)
                    }}
                    className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
                  >
                      {t("GetStarted")}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
