"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Package, 
  FileText, 
  BarChart3, 
  LogOut, 
  ChevronLeft 
} from "lucide-react"

interface MenuItem {
  href: string
  icon: any
  label: string
}

const menuItems: MenuItem[] = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "User Management" },
  { href: "/admin/payments", icon: CreditCard, label: "Payments" },
  { href: "/admin/packages", icon: Package, label: "Packages Management" },
  { href: "/admin/audit-logs", icon: FileText, label: "Audit Logs" },
  { href: "/admin/reports", icon: BarChart3, label: "Reports" },
]

export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside
      className={`fixed left-0 top-0 h-screen border-r border-border bg-card transition-all duration-300 z-40 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">RF</span>
            </div>
            <div>
              <span className="text-lg font-bold text-foreground">RiverFlow</span>
              <span className="block text-xs text-muted-foreground">Admin Panel</span>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-lg p-2 hover:bg-muted transition-colors"
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          <ChevronLeft className={`h-5 w-5 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              title={isCollapsed ? item.label : ""}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="absolute bottom-4 left-4 right-4">
        <button 
          className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
          title={isCollapsed ? "Logout" : ""}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  )
}

