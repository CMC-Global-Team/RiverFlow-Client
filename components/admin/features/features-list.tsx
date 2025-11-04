"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Edit, Trash2, Plus } from "lucide-react"
import type { FeatureResponse } from "@/services/admin/feature.service"

interface FeaturesListProps {
  features: FeatureResponse[]
  isLoading: boolean
  onEdit: (feature: FeatureResponse) => void
  onDelete: (id: number) => void
  onCreate: () => void
}

const categoryColors: Record<string, string> = {
  collaboration: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  storage: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  export: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  advanced: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  support: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  developer: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  general: "bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-300",
}

function FeatureSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-9 w-9" />
      </div>
    </div>
  )
}

export default function FeaturesList({
  features,
  isLoading,
  onEdit,
  onDelete,
  onCreate,
}: FeaturesListProps) {
  // Group features by category
  const groupedFeatures = features.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = []
    }
    acc[feature.category].push(feature)
    return acc
  }, {} as Record<string, FeatureResponse[]>)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Package Features Management</CardTitle>
          <Button onClick={onCreate} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Feature
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <FeatureSkeleton key={i} />
            ))}
          </div>
        )}

        {!isLoading && features.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No features found</p>
            <Button variant="outline" className="mt-4" onClick={onCreate}>
              Create First Feature
            </Button>
          </div>
        )}

        {!isLoading &&
          Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className={categoryColors[category] || categoryColors.general}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  ({categoryFeatures.length} feature{categoryFeatures.length !== 1 ? 's' : ''})
                </span>
              </div>

              <div className="space-y-2">
                {categoryFeatures.map((feature) => (
                  <div
                    key={feature.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground">
                          {feature.featureName}
                        </h4>
                        {!feature.isActive && (
                          <Badge variant="secondary" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {feature.description || "No description"}
                      </p>
                      <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded mt-2 inline-block">
                        {feature.featureKey}
                      </code>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(feature)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(feature.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  )
}

