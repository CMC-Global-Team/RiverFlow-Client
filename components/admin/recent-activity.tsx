"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Activity {
  id: string
  user: {
    name: string
    email: string
    avatar?: string
  }
  action: string
  type: "user" | "payment" | "package" | "system"
  timestamp: string
}

const activities: Activity[] = [
  {
    id: "1",
    user: { name: "John Doe", email: "john@example.com" },
    action: "Created new account",
    type: "user",
    timestamp: "5 minutes ago",
  },
  {
    id: "2",
    user: { name: "Jane Smith", email: "jane@example.com" },
    action: "Upgraded to Pro plan",
    type: "payment",
    timestamp: "15 minutes ago",
  },
  {
    id: "3",
    user: { name: "Mike Johnson", email: "mike@example.com" },
    action: "Created 3 new mindmaps",
    type: "user",
    timestamp: "1 hour ago",
  },
  {
    id: "4",
    user: { name: "System", email: "system@riverflow.com" },
    action: "Database backup completed",
    type: "system",
    timestamp: "2 hours ago",
  },
  {
    id: "5",
    user: { name: "Sarah Wilson", email: "sarah@example.com" },
    action: "Payment received - $29.99",
    type: "payment",
    timestamp: "3 hours ago",
  },
]

const getBadgeVariant = (type: Activity["type"]) => {
  switch (type) {
    case "user":
      return "default"
    case "payment":
      return "secondary"
    case "package":
      return "outline"
    case "system":
      return "destructive"
    default:
      return "default"
  }
}

export default function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 pb-4 last:pb-0 border-b last:border-0 border-border"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                <AvatarFallback className="text-xs">
                  {activity.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">
                    {activity.user.name}
                  </p>
                  <Badge variant={getBadgeVariant(activity.type)} className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{activity.action}</p>
                <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

