"use client"

import { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "increase" | "decrease"
  icon: LucideIcon
  iconColor?: string
  iconBgColor?: string
}

export default function StatsCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  iconColor = "text-blue-500",
  iconBgColor = "bg-blue-100 dark:bg-blue-950",
}: StatsCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold text-foreground mt-2">{value}</h3>
            {change && (
              <div className="flex items-center gap-1 mt-2">
                <span
                  className={`text-xs font-medium ${
                    changeType === "increase"
                      ? "text-green-600 dark:text-green-500"
                      : "text-red-600 dark:text-red-500"
                  }`}
                >
                  {changeType === "increase" ? "↑" : "↓"} {change}
                </span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>
          <div className={`rounded-full p-3 ${iconBgColor}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

