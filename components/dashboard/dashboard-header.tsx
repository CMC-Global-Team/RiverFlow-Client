"use client"

import { Search, Bell } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/hooks/auth/useAuth"
import { ThemeSwitcher } from "@/components/theme-switcher"
import ProfileModal from "@/components/profile/ProfileModal"
import { getAvatarUrl } from "@/lib/avatar-utils"

export default function DashboardHeader() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const { user } = useAuth()

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
          <ThemeSwitcher/>
          <button 
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted transition-colors"
          >
            {user?.avatar ? (
              <img 
                src={getAvatarUrl(user.avatar) || ''}
                alt={user.fullName}
                className="h-8 w-8 rounded-full object-cover border border-border"
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const fallback = parent.querySelector('.avatar-fallback') as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div className={`h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center avatar-fallback ${user?.avatar ? 'hidden' : ''}`}>
              <span className="text-xs font-bold text-white">
                {user?.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:inline">{user?.fullName}</span>
          </button>
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </header>
  )
}
