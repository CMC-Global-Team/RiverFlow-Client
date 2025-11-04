"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

interface Feature {
  key: string
  name: string
  description: string
  category: string
}

interface FeatureManagerProps {
  selectedFeatures: string[]
  onFeatureToggle: (featureKey: string, checked: boolean) => void
}

const features: Feature[] = [
  {
    key: "real_time_collaboration",
    name: "Real-time Collaboration",
    description: "Edit mindmaps together in real-time",
    category: "collaboration",
  },
  {
    key: "unlimited_mindmaps",
    name: "Unlimited Mindmaps",
    description: "Create unlimited number of mindmaps",
    category: "storage",
  },
  {
    key: "unlimited_collaborators",
    name: "Unlimited Collaborators",
    description: "Invite unlimited collaborators",
    category: "collaboration",
  },
  {
    key: "export_pdf",
    name: "Export to PDF",
    description: "Export mindmaps as PDF files",
    category: "export",
  },
  {
    key: "export_png",
    name: "Export to PNG",
    description: "Export mindmaps as PNG images",
    category: "export",
  },
  {
    key: "export_json",
    name: "Export to JSON",
    description: "Export mindmaps as JSON data",
    category: "export",
  },
  {
    key: "custom_templates",
    name: "Custom Templates",
    description: "Create and use custom templates",
    category: "advanced",
  },
  {
    key: "version_history",
    name: "Version History",
    description: "Access full version history",
    category: "advanced",
  },
  {
    key: "ai_suggestions",
    name: "AI Suggestions",
    description: "Get AI-powered mindmap suggestions",
    category: "advanced",
  },
  {
    key: "priority_support",
    name: "Priority Support",
    description: "24/7 priority customer support",
    category: "support",
  },
  {
    key: "custom_branding",
    name: "Custom Branding",
    description: "Remove branding and add your own",
    category: "advanced",
  },
  {
    key: "api_access",
    name: "API Access",
    description: "Access to REST API",
    category: "developer",
  },
]

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
  // Group features by category
  const groupedFeatures = features.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = []
    }
    acc[feature.category].push(feature)
    return acc
  }, {} as Record<string, Feature[]>)

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

