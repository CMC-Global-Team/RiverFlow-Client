"use client"

import { useState } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FeatureManager from "./feature-manager"
import PriceManager from "./price-manager"

interface PackageFormData {
  name: string
  description: string
  slug: string
  basePrice: number
  baseCurrencyCode: string
  durationDays: number
  maxMindmaps: number
  maxCollaborators: number
  maxStorageMb: number
  features: string[]
  prices: any[]
  isActive: boolean
  displayOrder: number
}

interface PackageFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: PackageFormData) => void
  initialData?: Partial<PackageFormData>
  mode?: "create" | "edit"
}

export default function PackageFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode = "create",
}: PackageFormDialogProps) {
  const [formData, setFormData] = useState<PackageFormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    slug: initialData?.slug || "",
    basePrice: initialData?.basePrice || 0,
    baseCurrencyCode: initialData?.baseCurrencyCode || "USD",
    durationDays: initialData?.durationDays || 30,
    maxMindmaps: initialData?.maxMindmaps || 10,
    maxCollaborators: initialData?.maxCollaborators || 5,
    maxStorageMb: initialData?.maxStorageMb || 100,
    features: initialData?.features || [],
    prices: initialData?.prices || [],
    isActive: initialData?.isActive ?? true,
    displayOrder: initialData?.displayOrder || 0,
  })

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFeatureToggle = (featureKey: string, checked: boolean) => {
    const features = checked
      ? [...formData.features, featureKey]
      : formData.features.filter((f) => f !== featureKey)
    updateField("features", features)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Convert features array to object/map for server
    const featuresObject = formData.features.reduce((acc, featureKey) => {
      acc[featureKey] = true
      return acc
    }, {} as Record<string, boolean>)
    
    // Send data with features as object
    const submitData = {
      ...formData,
      features: featuresObject,
    }
    
    onSubmit(submitData)
  }

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    updateField("name", name)
    if (mode === "create") {
      const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
      updateField("slug", slug)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Package" : "Edit Package"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Define a new subscription package with features and pricing"
              : "Update package details, features, and pricing"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
            </TabsList>

            {/* Basic Information */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Package Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g., Pro Plan"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => updateField("slug", e.target.value)}
                    placeholder="e.g., pro-plan"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Brief description of the package"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base Price (USD) *</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) =>
                      updateField("basePrice", parseFloat(e.target.value))
                    }
                    min="0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (days) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.durationDays}
                    onChange={(e) =>
                      updateField("durationDays", parseInt(e.target.value))
                    }
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      updateField("displayOrder", parseInt(e.target.value))
                    }
                    min="0"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="active">Active Status</Label>
                    <p className="text-xs text-muted-foreground">
                      Enable this package for users
                    </p>
                  </div>
                  <Switch
                    id="active"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => updateField("isActive", checked)}
                  />
                </div>
              </div>

              {/* Limits */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">Package Limits</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxMindmaps">
                      Max Mindmaps
                      <span className="text-xs text-muted-foreground ml-1">
                        (0 = unlimited)
                      </span>
                    </Label>
                    <Input
                      id="maxMindmaps"
                      type="number"
                      value={formData.maxMindmaps}
                      onChange={(e) =>
                        updateField("maxMindmaps", parseInt(e.target.value))
                      }
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxCollaborators">
                      Max Collaborators
                      <span className="text-xs text-muted-foreground ml-1">
                        (0 = unlimited)
                      </span>
                    </Label>
                    <Input
                      id="maxCollaborators"
                      type="number"
                      value={formData.maxCollaborators}
                      onChange={(e) =>
                        updateField("maxCollaborators", parseInt(e.target.value))
                      }
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxStorage">
                      Storage (MB)
                      <span className="text-xs text-muted-foreground ml-1">
                        (0 = unlimited)
                      </span>
                    </Label>
                    <Input
                      id="maxStorage"
                      type="number"
                      value={formData.maxStorageMb}
                      onChange={(e) =>
                        updateField("maxStorageMb", parseInt(e.target.value))
                      }
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Features */}
            <TabsContent value="features" className="mt-4">
              <FeatureManager
                selectedFeatures={formData.features}
                onFeatureToggle={handleFeatureToggle}
              />
            </TabsContent>

            {/* Pricing */}
            <TabsContent value="pricing" className="mt-4">
              <PriceManager
                prices={formData.prices}
                onPriceChange={(prices) => updateField("prices", prices)}
              />
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {mode === "create" ? "Create Package" : "Update Package"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

