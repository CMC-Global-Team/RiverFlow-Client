"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Package, TrendingUp, DollarSign, Users } from "lucide-react"
import { usePackageStats } from "@/hooks/admin/usePackageStats"
import { Skeleton } from "@/components/ui/skeleton"

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

function StatSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function PackageStats() {
  const { stats, isLoading } = usePackageStats()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatItem
        icon={Package}
        label="Total Packages"
        value={stats.totalPackages}
        iconColor="text-blue-500"
        iconBgColor="bg-blue-100 dark:bg-blue-950"
      />
      <StatItem
        icon={Users}
        label="Active Subscribers"
        value={stats.activeSubscribers.toLocaleString()}
        change={stats.growthPercentage > 0 ? `+${stats.growthPercentage.toFixed(1)}%` : undefined}
        changeType={stats.growthPercentage > 0 ? "increase" : "decrease"}
        iconColor="text-green-500"
        iconBgColor="bg-green-100 dark:bg-green-950"
      />
      <StatItem
        icon={DollarSign}
        label="MRR"
        value={`$${stats.monthlyRecurringRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        iconColor="text-purple-500"
        iconBgColor="bg-purple-100 dark:bg-purple-950"
      />
      <StatItem
        icon={TrendingUp}
        label="Conversion Rate"
        value={`${stats.conversionRate.toFixed(1)}%`}
        iconColor="text-orange-500"
        iconBgColor="bg-orange-100 dark:bg-orange-950"
      />
    </div>
  )
}

