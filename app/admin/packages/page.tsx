"use client"

import { useState } from "react"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeader from "@/components/admin/admin-header"
import PackageStats from "@/components/admin/packages/package-stats"
import PackageCard from "@/components/admin/packages/package-card"
import PackageFormDialog from "@/components/admin/packages/package-form-dialog"
import { Button } from "@/components/ui/button"
import { Plus, Filter } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Mock data based on database schema
const mockPackages = [
  {
    id: "1",
    name: "Free",
    description: "Perfect for getting started",
    slug: "free",
    basePrice: 0,
    currency: "$",
    durationDays: 365,
    maxMindmaps: 3,
    maxCollaborators: 2,
    maxStorageMb: 50,
    isActive: true,
    subscriberCount: 1543,
  },
  {
    id: "2",
    name: "Pro",
    description: "For professionals and small teams",
    slug: "pro",
    basePrice: 9.99,
    currency: "$",
    durationDays: 30,
    maxMindmaps: 50,
    maxCollaborators: 10,
    maxStorageMb: 500,
    isActive: true,
    subscriberCount: 892,
  },
  {
    id: "3",
    name: "Enterprise",
    description: "For large organizations",
    slug: "enterprise",
    basePrice: 49.99,
    currency: "$",
    durationDays: 30,
    maxMindmaps: 0,
    maxCollaborators: 0,
    maxStorageMb: 0,
    isActive: true,
    subscriberCount: 108,
  },
  {
    id: "4",
    name: "Starter",
    description: "Limited time offer for new users",
    slug: "starter",
    basePrice: 4.99,
    currency: "$",
    durationDays: 30,
    maxMindmaps: 10,
    maxCollaborators: 3,
    maxStorageMb: 200,
    isActive: false,
    subscriberCount: 45,
  },
]

export default function PackagesManagementPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name")

  const handleCreatePackage = (data: any) => {
    console.log("Creating package:", data)
    setShowCreateDialog(false)
    // TODO: Implement API call
  }

  const filteredPackages = mockPackages.filter((pkg) => {
    if (filterStatus === "all") return true
    if (filterStatus === "active") return pkg.isActive
    if (filterStatus === "inactive") return !pkg.isActive
    return true
  })

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 flex flex-col ml-64">
        <AdminHeader />

        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Packages Management
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Manage subscription packages, features, and pricing
                </p>
              </div>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Package
              </Button>
            </div>

            {/* Stats */}
            <PackageStats />

            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Filters:</span>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Packages</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="price">Sort by Price</SelectItem>
                  <SelectItem value="subscribers">Sort by Subscribers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPackages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  {...pkg}
                  onEdit={() => console.log("Edit", pkg.id)}
                  onDelete={() => console.log("Delete", pkg.id)}
                />
              ))}
            </div>

            {/* Empty State */}
            {filteredPackages.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No packages found</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setFilterStatus("all")}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create/Edit Dialog */}
      <PackageFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreatePackage}
        mode="create"
      />
    </div>
  )
}

