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
import { Switch } from "@/components/ui/switch"
import type { CurrencyRequest, CurrencyResponse } from "@/services/admin/currency.service"

interface CurrencyFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CurrencyRequest) => void
  initialData?: CurrencyResponse
  mode?: "create" | "edit"
}

export default function CurrencyFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode = "create",
}: CurrencyFormDialogProps) {
  const [formData, setFormData] = useState<CurrencyRequest>({
    code: initialData?.code || "",
    name: initialData?.name || "",
    symbol: initialData?.symbol || "",
    decimalPlaces: initialData?.decimalPlaces ?? 2,
    isActive: initialData?.isActive ?? true,
    displayOrder: 0,
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code,
        name: initialData.name,
        symbol: initialData.symbol,
        decimalPlaces: initialData.decimalPlaces,
        isActive: initialData.isActive,
        displayOrder: 0,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Currency" : "Edit Currency"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new currency to the system"
              : "Update currency details"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Currency Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  updateField("code", e.target.value.toUpperCase())
                }
                placeholder="USD"
                maxLength={3}
                required
                disabled={mode === "edit"}
                className="uppercase"
              />
              <p className="text-xs text-muted-foreground">
                {mode === "edit"
                  ? "Currency code cannot be changed"
                  : "ISO 4217 code (3 letters)"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol *</Label>
              <Input
                id="symbol"
                value={formData.symbol}
                onChange={(e) => updateField("symbol", e.target.value)}
                placeholder="$"
                maxLength={10}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Currency Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="US Dollar"
              maxLength={100}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="decimalPlaces">Decimal Places *</Label>
              <Input
                id="decimalPlaces"
                type="number"
                value={formData.decimalPlaces ?? ""}
                onChange={(e) => {
                  const value = parseInt(e.target.value)
                  updateField("decimalPlaces", isNaN(value) ? 2 : value)
                }}
                min="0"
                max="4"
                required
              />
              <p className="text-xs text-muted-foreground">
                0 for JPY/VND, 2 for USD/EUR
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input
                id="displayOrder"
                type="number"
                value={formData.displayOrder ?? ""}
                onChange={(e) => {
                  const value = parseInt(e.target.value)
                  updateField("displayOrder", isNaN(value) ? 0 : value)
                }}
                min="0"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="active">Active Status</Label>
              <p className="text-xs text-muted-foreground">
                Enable this currency for packages
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
              {mode === "create" ? "Create Currency" : "Update Currency"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

