"use client"

import { Bell, Search, Settings } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users, payments, logs..."
            className="pl-9 w-full"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background"></span>
        </Button>

        {/* Settings */}
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>

        {/* Admin Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-border">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-foreground">Admin User</p>
            <p className="text-xs text-muted-foreground">admin@riverflow.com</p>
          </div>
          <Avatar className="h-9 w-9">
            <AvatarImage src="/avatars/admin.png" alt="Admin" />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
              AD
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}

