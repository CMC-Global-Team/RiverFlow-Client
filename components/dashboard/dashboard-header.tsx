"use client"

import { Search, Bell, Coins } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/hooks/auth/useAuth"

import ProfileModal from "@/components/profile/ProfileModal"
import CreditTopupSheet from "@/components/payment/CreditTopupSheet"
import { getAvatarUrl } from "@/lib/avatar-utils"

interface DashboardHeaderProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export default function DashboardHeader({
  searchValue = "",
  onSearchChange,
}: DashboardHeaderProps) {
  const { t } = useTranslation("dashboardHeader")
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isTopupOpen, setIsTopupOpen] = useState(false)
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
              value={searchValue || ""}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder={t("searchMindmaps")}
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
         
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted transition-colors cursor-pointer"
              >
                {user?.avatar ? (
                  <img 
                    src={getAvatarUrl(user.avatar) || ''}
                    alt={user.fullName}
                    className="h-8 w-8 rounded-full object-cover border border-border"
                    onError={(e) => {
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
                <div className="hidden sm:flex flex-col">
                  <span className="text-sm font-medium text-foreground">{user?.fullName}</span>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Coins className="h-4 w-4 text-primary" />
                          <span className="text-xs font-medium">{user?.credit ?? 0}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>{t("creditBalance")}</TooltipContent>
                    </Tooltip>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setIsTopupOpen(true) }}
                      className="text-xs rounded-md px-2 py-1 bg-primary text-white hover:opacity-90"
                      aria-label={t("topupCredit")}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>{t("topup")}</span>
                        </TooltipTrigger>
                        <TooltipContent>{t("topupCredit")}</TooltipContent>
                      </Tooltip>
                    </button>
                  </div>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>{t("viewProfile")}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />

      <CreditTopupSheet open={isTopupOpen} onOpenChange={setIsTopupOpen} />
    </header>
  )
}
