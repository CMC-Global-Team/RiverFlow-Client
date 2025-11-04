"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

export default function UserGrowthChart() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
  const data = [120, 180, 250, 320, 450, 580]
  const maxValue = Math.max(...data)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            User Growth
          </CardTitle>
          <select className="text-sm border border-border rounded-md px-2 py-1 bg-background">
            <option>Last 6 months</option>
            <option>Last year</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {months.map((month, index) => (
            <div key={month} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium w-12">{month}</span>
                <span className="font-semibold text-foreground">{data[index]}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${(data[index] / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

