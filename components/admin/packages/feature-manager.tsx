"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useFeatures } from "@/hooks/admin/useFeatures"

interface FeatureManagerProps {
  selectedFeatures: string[]
  onFeatureToggle: (featureKey: string, checked: boolean) => void
}

const categoryColors: Record<string, string> = {
  collaboration: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  storage: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  export: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  advanced: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  support: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  developer: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
}

export default function FeatureManager({
  selectedFeatures = [],
  onFeatureToggle,
}: FeatureManagerProps) {
  const { features, isLoading } = useFeatures()

  // Group features by category
  const groupedFeatures = features.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = []
    }
    acc[feature.category].push({
      key: feature.featureKey,
      name: feature.featureName,
      description: feature.description || "",
      category: feature.category,
    })
    return acc
  }, {} as Record<string, Array<{ key: string; name: string; description: string; category: string }>>)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Package Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Package Features</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
          <div key={category} className="space-y-3">
            <Badge className={categoryColors[category]}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Badge>
            <div className="space-y-3">
              {categoryFeatures.map((feature) => (
                <div
                  key={feature.key}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={feature.key}
                    checked={selectedFeatures.includes(feature.key)}
                    onCheckedChange={(checked) =>
                      onFeatureToggle(feature.key, checked as boolean)
                    }
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={feature.key}
                      className="text-sm font-medium text-foreground cursor-pointer"
                    >
                      {feature.name}
                    </label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {feature.description}
                    </p>
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

