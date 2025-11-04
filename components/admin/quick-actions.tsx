"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus, Package, FileText, Settings } from "lucide-react"

interface QuickAction {
  icon: any
  label: string
  description: string
  variant: "default" | "secondary" | "outline"
}

const actions: QuickAction[] = [
  {
    icon: UserPlus,
    label: "Add New User",
    description: "Manually create user account",
    variant: "default",
  },
  {
    icon: Package,
    label: "Create Package",
    description: "Add new subscription plan",
    variant: "secondary",
  },
  {
    icon: FileText,
    label: "Generate Report",
    description: "Create custom analytics report",
    variant: "outline",
  },
  {
    icon: Settings,
    label: "System Settings",
    description: "Configure platform settings",
    variant: "outline",
  },
]

export default function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <Button
                key={index}
                variant={action.variant}
                className="h-auto flex-col items-start p-4 gap-2"
              >
                <div className="flex items-center gap-2 w-full">
                  <Icon className="h-5 w-5" />
                  <span className="font-semibold">{action.label}</span>
                </div>
                <span className="text-xs text-muted-foreground text-left">
                  {action.description}
                </span>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

