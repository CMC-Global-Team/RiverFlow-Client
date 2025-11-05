"use client"

import { useState } from "react"
import Link from "next/link"
import { LayoutGrid, FileText, Settings, LogOut, Plus, ChevronDown } from "lucide-react"
import { useLogout } from "@/hooks/auth/useLogout"

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { logout, isLoading } = useLogout()

  return (
    <aside
      className={`fixed left-0 top-0 h-screen border-r border-border bg-card transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        {!isCollapsed && <span className="text-lg font-bold text-foreground">RiverFlow</span>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-lg p-2 hover:bg-muted transition-colors"
        >
          <ChevronDown className={`h-5 w-5 transition-transform ${isCollapsed ? "rotate-90" : ""}`} />
        </button>
      </div>

      <nav className="space-y-2 p-4">
        {/* New Mindmap */}
        <button className="w-full flex items-center gap-3 rounded-lg bg-primary px-4 py-2.5 text-primary-foreground font-medium hover:bg-primary/90 transition-all">
          <Plus className="h-5 w-5" />
          {!isCollapsed && <span>New Mindmap</span>}
        </button>

        {/* Navigation Items */}
        <div className="space-y-1 pt-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
          >
            <LayoutGrid className="h-5 w-5" />
            {!isCollapsed && <span className="text-sm font-medium">Dashboard</span>}
          </Link>

          <Link
            href="/dashboard/mindmaps"
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
          >
            <FileText className="h-5 w-5" />
            {!isCollapsed && <span className="text-sm font-medium">My Mindmaps</span>}
          </Link>

          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
          >
            <Settings className="h-5 w-5" />
            {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
          </Link>
        </div>
      </nav>

      {/* Logout */}
      <div className="absolute bottom-4 left-4 right-4">
        <button 
          onClick={() => logout()}
          disabled={isLoading}
          className="w-full flex items-center gap-3 rounded-lg px-4 py-2.5 text-muted-foreground hover:bg-muted hover:text-destructive transition-all disabled:opacity-50"
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="text-sm font-medium">{isLoading ? "Logging out..." : "Logout"}</span>}
        </button>
      </div>
    </aside>
  )
}
