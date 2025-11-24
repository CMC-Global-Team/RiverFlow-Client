"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useLogout } from "@/hooks/auth/useLogout"
import TemplateModal from "./template-modal"
import { useRouter } from "next/navigation"
import { useMindmapActions } from "@/hooks/mindmap/useMindmapActions"
import Link from "next/link"
import ChangeLanguage from "./changeLanguage"
import {
  LayoutGrid,
  FileText,
  Settings,
  LogOut,
  Plus,
  ChevronDown,
  ChevronRight,
  Shield,
  Lock,
  History
} from "lucide-react"




export default function Sidebar() {

  const { t } = useTranslation("settings")
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { logout, isLoading } = useLogout()
  const { create } = useMindmapActions();
  const [settingsOpen, setSettingsOpen] = useState(false)
  const router = useRouter()

  //handle create new mindmap
  const handleCreateNew = () => {
    setShowTemplateModal(true)

  }


  //handle select template
  const handleSelectTemplate = async (template: any) => {
    const newMindmap = await create(
      {
        title: "Untitled Mindmap",
        nodes: template.initialNodes,
        edges: template.initialEdges,
      }
    )
    if (newMindmap) {
      router.push(`/editor?id=${newMindmap.id}`)
    }
  }



  const toggleSettings = () => {
    if (isCollapsed) return
    setSettingsOpen(!settingsOpen)
  }
  return (
    <aside
      className={`fixed left-0 top-0 h-screen border-r border-border bg-card transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"
        }`}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        {!isCollapsed && <span className="text-lg font-bold text-foreground" ><Link href="/">RiverFlow</Link></span>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-lg p-2 hover:bg-muted transition-colors"
        >
          <ChevronDown className={`h-5 w-5 transition-transform ${isCollapsed ? "rotate-90" : ""}`} />
        </button>
      </div>

      <nav className="space-y-2 p-4">
        {/* New Mindmap */}
        <button
          className={`w-full flex rounded-lg bg-primary py-2.5 text-primary-foreground font-medium hover:bg-primary/90 transition-all ${isCollapsed ? 'justify-center gap-0 px-3' : 'items-center gap-3 px-4'}`}
          onClick={handleCreateNew}
          aria-label="New Mindmap"
        >
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

          <div className="space-y-1">
            <button
              onClick={toggleSettings}
              className="flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5" />
                {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
              </div>

              {!isCollapsed && (
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${settingsOpen ? "rotate-90" : ""}`}
                />
              )}
            </button>

            {/* SUBMENU */}
            {!isCollapsed && settingsOpen && (
              <div className="ml-10 mt-1 flex flex-col gap-1 animate-in slide-in-from-top-2 fade-in">
                <Link
                  href="/dashboard/changepassword"
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                >
                  <Lock className="h-4 w-4" /> {t("changePassword")}
                </Link>
                <Link
                  href="/dashboard/billing/history"
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                >
                  <History className="h-4 w-4" /> {t("paymentHistory")}
                </Link>
                <ChangeLanguage />
              </div>
            )}
          </div>
        </div>
      </nav>


      {/* Template Selection Modal*/}
      <TemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelectTemplate={handleSelectTemplate}
      />


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
