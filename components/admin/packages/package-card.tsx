"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Users, Calendar, DollarSign } from "lucide-react"

interface PackageCardProps {
  id: string
  name: string
  description: string
  slug: string
  basePrice: number
  currency: string
  durationDays: number
  maxMindmaps: number
  maxCollaborators: number
  maxStorageMb: number
  isActive: boolean
  subscriberCount?: number
  onEdit?: () => void
  onDelete?: () => void
}

export default function PackageCard({
  name,
  description,
  basePrice,
  currency,
  durationDays,
  maxMindmaps,
  maxCollaborators,
  maxStorageMb,
  isActive,
  subscriberCount = 0,
  onEdit,
  onDelete,
}: PackageCardProps) {
  return (
    <Card className={`hover:shadow-lg transition-shadow ${!isActive ? "opacity-60" : ""}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {name}
              {!isActive && (
                <Badge variant="secondary" className="text-xs">
                  Inactive
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground">
            {currency}
            {basePrice.toFixed(2)}
          </span>
          <span className="text-sm text-muted-foreground">/ {durationDays} days</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-medium">{subscriberCount}</span>
            <span className="text-muted-foreground">users</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-medium">{durationDays}</span>
            <span className="text-muted-foreground">days</span>
          </div>
        </div>

        {/* Limits */}
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Mindmaps</span>
            <span className="font-medium text-foreground">
              {maxMindmaps === 0 ? "Unlimited" : maxMindmaps}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Collaborators</span>
            <span className="font-medium text-foreground">
              {maxCollaborators === 0 ? "Unlimited" : maxCollaborators}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Storage</span>
            <span className="font-medium text-foreground">
              {maxStorageMb === 0 ? "Unlimited" : `${maxStorageMb} MB`}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

