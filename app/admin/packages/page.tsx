"use client"

import { useState, useMemo } from "react"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeader from "@/components/admin/admin-header"
import PackageStats from "@/components/admin/packages/package-stats"
import PackageCard from "@/components/admin/packages/package-card"
import PackageFormDialog from "@/components/admin/packages/package-form-dialog"
import { Button } from "@/components/ui/button"
import { Plus, Filter } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { usePackages } from "@/hooks/admin/usePackages"
import { usePackageMutations } from "@/hooks/admin/usePackageMutations"
import { useToast } from "@/hooks/use-toast"
import type { PackageRequest } from "@/types/package.types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function PackagesManagementPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name")
  
  const { toast } = useToast()
  const { packages, isLoading, refetch } = usePackages()
  const { create, remove, isLoading: isMutating } = usePackageMutations()

  const handleCreatePackage = async (data: PackageRequest) => {
    const result = await create(data)
    if (result) {
      toast({
        title: "Success",
        description: "Package created successfully",
      })
      setShowCreateDialog(false)
      refetch()
    } else {
      toast({
        title: "Error",
        description: "Failed to create package",
        variant: "destructive",
      })
    }
  }

  const handleDeletePackage = async (id: number) => {
    if (!confirm("Are you sure you want to delete this package?")) return
    
    const success = await remove(id)
    if (success) {
      toast({
        title: "Success",
        description: "Package deleted successfully",
      })
      refetch()
    } else {
      toast({
        title: "Error",
        description: "Failed to delete package",
        variant: "destructive",
      })
    }
  }

  const filteredAndSortedPackages = useMemo(() => {
    let filtered = packages

    // Filter by status
    if (filterStatus === "active") {
      filtered = filtered.filter((pkg) => pkg.isActive)
    } else if (filterStatus === "inactive") {
      filtered = filtered.filter((pkg) => !pkg.isActive)
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price":
          return a.basePrice - b.basePrice
        case "subscribers":
          return b.subscriberCount - a.subscriberCount
        case "name":
        default:
          return a.name.localeCompare(b.name)
      }
    })

    return sorted
  }, [packages, filterStatus, sortBy])

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

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-64 w-full" />
                ))}
              </div>
            )}

            {/* Packages Grid */}
            {!isLoading && filteredAndSortedPackages.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedPackages.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    id={pkg.id.toString()}
                    name={pkg.name}
                    description={pkg.description || ""}
                    slug={pkg.slug}
                    basePrice={pkg.basePrice}
                    currency={pkg.baseCurrencySymbol}
                    durationDays={pkg.durationDays}
                    maxMindmaps={pkg.maxMindmaps}
                    maxCollaborators={pkg.maxCollaborators}
                    maxStorageMb={pkg.maxStorageMb}
                    isActive={pkg.isActive}
                    subscriberCount={pkg.subscriberCount}
                    onEdit={() => console.log("Edit", pkg.id)}
                    onDelete={() => handleDeletePackage(pkg.id)}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredAndSortedPackages.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No packages found</p>
                {filterStatus !== "all" && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setFilterStatus("all")}
                  >
                    Clear Filters
                  </Button>
                )}
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

