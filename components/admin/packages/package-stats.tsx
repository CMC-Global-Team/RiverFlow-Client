"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Package, TrendingUp, DollarSign, Users } from "lucide-react"

interface StatItemProps {
  icon: any
  label: string
  value: string | number
  change?: string
  changeType?: "increase" | "decrease"
  iconColor: string
  iconBgColor: string
}

function StatItem({
  icon: Icon,
  label,
  value,
  change,
  changeType,
  iconColor,
  iconBgColor,
}: StatItemProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <h3 className="text-2xl font-bold text-foreground mt-2">{value}</h3>
            {change && (
              <p
                className={`text-xs mt-1 ${
                  changeType === "increase"
                    ? "text-green-600 dark:text-green-500"
                    : "text-red-600 dark:text-red-500"
                }`}
              >
                {changeType === "increase" ? "↑" : "↓"} {change}
              </p>
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

export default function PackageStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatItem
        icon={Package}
        label="Total Packages"
        value={12}
        change="+2 this month"
        changeType="increase"
        iconColor="text-blue-500"
        iconBgColor="bg-blue-100 dark:bg-blue-950"
      />
      <StatItem
        icon={Users}
        label="Active Subscribers"
        value="2,543"
        change="+12.5%"
        changeType="increase"
        iconColor="text-green-500"
        iconBgColor="bg-green-100 dark:bg-green-950"
      />
      <StatItem
        icon={DollarSign}
        label="MRR"
        value="$45,231"
        change="+8.2%"
        changeType="increase"
        iconColor="text-purple-500"
        iconBgColor="bg-purple-100 dark:bg-purple-950"
      />
      <StatItem
        icon={TrendingUp}
        label="Conversion Rate"
        value="23.5%"
        change="-2.4%"
        changeType="decrease"
        iconColor="text-orange-500"
        iconBgColor="bg-orange-100 dark:bg-orange-950"
      />
    </div>
  )
}

