"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { FeatureRequest, FeatureResponse } from "@/services/admin/feature.service"

interface FeatureFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: FeatureRequest) => void
  initialData?: FeatureResponse
  mode?: "create" | "edit"
}

const CATEGORIES = [
  { value: "collaboration", label: "Collaboration" },
  { value: "storage", label: "Storage" },
  { value: "export", label: "Export" },
  { value: "advanced", label: "Advanced" },
  { value: "support", label: "Support" },
  { value: "developer", label: "Developer" },
  { value: "general", label: "General" },
]

export default function FeatureFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode = "create",
}: FeatureFormDialogProps) {
  const [formData, setFormData] = useState<FeatureRequest>({
    featureKey: initialData?.featureKey || "",
    featureName: initialData?.featureName || "",
    description: initialData?.description || "",
    category: initialData?.category || "general",
    isActive: initialData?.isActive ?? true,
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        featureKey: initialData.featureKey,
        featureName: initialData.featureName,
        description: initialData.description || "",
        category: initialData.category,
        isActive: initialData.isActive,
      })
    }
  }, [initialData])

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  // Auto-generate feature key from name
  const handleNameChange = (name: string) => {
    updateField("featureName", name)
    if (mode === "create") {
      const key = name
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "")
      updateField("featureKey", key)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Feature" : "Edit Feature"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Define a new package feature"
              : "Update feature details"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="featureName">Feature Name *</Label>
            <Input
              id="featureName"
              value={formData.featureName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Real-time Collaboration"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="featureKey">Feature Key *</Label>
            <Input
              id="featureKey"
              value={formData.featureKey}
              onChange={(e) => updateField("featureKey", e.target.value)}
              placeholder="e.g., real_time_collaboration"
              required
              disabled={mode === "edit"}
            />
            <p className="text-xs text-muted-foreground">
              {mode === "edit"
                ? "Feature key cannot be changed"
                : "Auto-generated from feature name"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Brief description of the feature"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => updateField("category", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="active">Active Status</Label>
              <p className="text-xs text-muted-foreground">
                Enable this feature for packages
              </p>
            </div>
            <Switch
              id="active"
              checked={formData.isActive}
              onCheckedChange={(checked) => updateField("isActive", checked)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {mode === "create" ? "Create Feature" : "Update Feature"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

