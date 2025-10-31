"use client"

import { Search, Bell } from "lucide-react"
import { useState } from "react"

export default function DashboardHeader() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search mindmaps..."
              className="w-full rounded-lg border border-border bg-input pl-10 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 ml-6">
          <button className="rounded-lg p-2 hover:bg-muted transition-colors relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
          </button>

          <button className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted transition-colors">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent"></div>
            <span className="text-sm font-medium text-foreground hidden sm:inline">Profile</span>
          </button>
        </div>
      </div>
    </header>
  )
}
