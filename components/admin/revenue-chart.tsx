"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

export default function RevenueChart() {
  const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"]
  const revenue = [2400, 3200, 2800, 4100]
  const maxRevenue = Math.max(...revenue)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue Overview
          </CardTitle>
          <span className="text-sm text-muted-foreground">This Month</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Total Revenue */}
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-foreground">
              ${revenue.reduce((a, b) => a + b, 0).toLocaleString()}
            </h3>
            <span className="text-sm text-green-600 dark:text-green-500 font-medium">
              +12.5%
            </span>
          </div>

          {/* Chart */}
          <div className="flex items-end justify-between gap-4 h-48">
            {weeks.map((week, index) => (
              <div key={week} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end h-full">
                  <div
                    className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-lg transition-all duration-500 hover:opacity-80 cursor-pointer"
                    style={{ height: `${(revenue[index] / maxRevenue) * 100}%` }}
                    title={`$${revenue[index]}`}
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">{week}</p>
                  <p className="text-sm font-semibold text-foreground">
                    ${revenue[index]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

