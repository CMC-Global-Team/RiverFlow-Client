"use client"

import { useState, useMemo } from "react"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeader from "@/components/admin/admin-header"
import PackageStats from "@/components/admin/packages/package-stats"
import PackageCard from "@/components/admin/packages/package-card"
import PackageFormDialog from "@/components/admin/packages/package-form-dialog"
import FeaturesList from "@/components/admin/features/features-list"
import FeatureFormDialog from "@/components/admin/features/feature-form-dialog"
import CurrenciesList from "@/components/admin/currencies/currencies-list"
import CurrencyFormDialog from "@/components/admin/currencies/currency-form-dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Filter } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { usePackages } from "@/hooks/admin/usePackages"
import { usePackageMutations } from "@/hooks/admin/usePackageMutations"
import { useFeatures } from "@/hooks/admin/useFeatures"
import { useFeatureMutations } from "@/hooks/admin/useFeatureMutations"
import { useCurrencies } from "@/hooks/admin/useCurrencies"
import { useCurrencyMutations } from "@/hooks/admin/useCurrencyMutations"
import { useToast } from "@/hooks/use-toast"
import type { PackageRequest } from "@/types/package.types"
import type { FeatureRequest, FeatureResponse } from "@/services/admin/feature.service"
import type { CurrencyRequest, CurrencyResponse } from "@/services/admin/currency.service"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function PackagesManagementPage() {
  const [showPackageDialog, setShowPackageDialog] = useState(false)
  const [showFeatureDialog, setShowFeatureDialog] = useState(false)
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false)
  const [editingPackage, setEditingPackage] = useState<any | undefined>()
  const [editingFeature, setEditingFeature] = useState<FeatureResponse | undefined>()
  const [editingCurrency, setEditingCurrency] = useState<CurrencyResponse | undefined>()
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name")
  
  const { toast } = useToast()
  const { packages, isLoading, refetch } = usePackages()
  const { create, update, remove, isLoading: isMutating } = usePackageMutations()
  
  // Features hooks
  const { features, isLoading: featuresLoading, refetch: refetchFeatures } = useFeatures()
  const {
    create: createFeature,
    update: updateFeature,
    remove: removeFeature,
  } = useFeatureMutations()
  
  // Currencies hooks
  const { currencies, isLoading: currenciesLoading, refetch: refetchCurrencies } = useCurrencies()
  const {
    create: createCurrency,
    update: updateCurrency,
    remove: removeCurrency,
  } = useCurrencyMutations()

  const handleCreatePackage = () => {
    setEditingPackage(undefined)
    setShowPackageDialog(true)
  }

  const handleEditPackage = (pkg: any) => {
    // Convert PackageResponse to form data format
    const formData = {
      name: pkg.name,
      description: pkg.description,
      slug: pkg.slug,
      basePrice: pkg.basePrice,
      baseCurrencyCode: pkg.baseCurrencyCode,
      durationDays: pkg.durationDays,
      maxMindmaps: pkg.maxMindmaps,
      maxCollaborators: pkg.maxCollaborators,
      maxStorageMb: pkg.maxStorageMb,
      features: pkg.features ? Object.keys(pkg.features).filter(key => pkg.features[key]) : [],
      prices: pkg.prices?.map((p: any) => ({
        currencyCode: p.currencyCode,
        price: p.price,
        promotionalPrice: p.promotionalPrice,
        promotionStartDate: p.promotionStartDate,
        promotionEndDate: p.promotionEndDate,
      })) || [],
      isActive: pkg.isActive,
      displayOrder: pkg.displayOrder,
    }
    setEditingPackage({ id: pkg.id, ...formData })
    setShowPackageDialog(true)
  }

  const handlePackageSubmit = async (data: PackageRequest) => {
    if (editingPackage) {
      // Update package
      const result = await update(editingPackage.id, data)
      if (result) {
        toast({
          title: "Success",
          description: "Package updated successfully",
        })
        setShowPackageDialog(false)
        refetch()
      } else {
        toast({
          title: "Error",
          description: "Failed to update package",
          variant: "destructive",
        })
      }
    } else {
      // Create package
      const result = await create(data)
      if (result) {
        toast({
          title: "Success",
          description: "Package created successfully",
        })
        setShowPackageDialog(false)
        refetch()
      } else {
        toast({
          title: "Error",
          description: "Failed to create package",
          variant: "destructive",
        })
      }
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

  // Feature handlers
  const handleCreateFeature = () => {
    setEditingFeature(undefined)
    setShowFeatureDialog(true)
  }

  const handleEditFeature = (feature: FeatureResponse) => {
    setEditingFeature(feature)
    setShowFeatureDialog(true)
  }

  const handleFeatureSubmit = async (data: FeatureRequest) => {
    if (editingFeature) {
      const result = await updateFeature(editingFeature.id, data)
      if (result) {
        toast({
          title: "Success",
          description: "Feature updated successfully",
        })
        setShowFeatureDialog(false)
        refetchFeatures()
      } else {
        toast({
          title: "Error",
          description: "Failed to update feature",
          variant: "destructive",
        })
      }
    } else {
      const result = await createFeature(data)
      if (result) {
        toast({
          title: "Success",
          description: "Feature created successfully",
        })
        setShowFeatureDialog(false)
        refetchFeatures()
      } else {
        toast({
          title: "Error",
          description: "Failed to create feature",
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteFeature = async (id: number) => {
    if (!confirm("Are you sure you want to delete this feature?")) return
    
    const success = await removeFeature(id)
    if (success) {
      toast({
        title: "Success",
        description: "Feature deleted successfully",
      })
      refetchFeatures()
    } else {
      toast({
        title: "Error",
        description: "Failed to delete feature",
        variant: "destructive",
      })
    }
  }

  // Currency handlers
  const handleCreateCurrency = () => {
    setEditingCurrency(undefined)
    setShowCurrencyDialog(true)
  }

  const handleEditCurrency = (currency: CurrencyResponse) => {
    setEditingCurrency(currency)
    setShowCurrencyDialog(true)
  }

  const handleCurrencySubmit = async (data: CurrencyRequest) => {
    if (editingCurrency) {
      const result = await updateCurrency(editingCurrency.id, data)
      if (result) {
        toast({
          title: "Success",
          description: "Currency updated successfully",
        })
        setShowCurrencyDialog(false)
        refetchCurrencies()
      } else {
        toast({
          title: "Error",
          description: "Failed to update currency",
          variant: "destructive",
        })
      }
    } else {
      const result = await createCurrency(data)
      if (result) {
        toast({
          title: "Success",
          description: "Currency created successfully",
        })
        setShowCurrencyDialog(false)
        refetchCurrencies()
      } else {
        toast({
          title: "Error",
          description: "Failed to create currency",
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteCurrency = async (id: number) => {
    if (!confirm("Are you sure you want to delete this currency?")) return
    
    const success = await removeCurrency(id)
    if (success) {
      toast({
        title: "Success",
        description: "Currency deleted successfully",
      })
      refetchCurrencies()
    } else {
      toast({
        title: "Error",
        description: "Failed to delete currency",
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
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Packages Management
              </h1>
              <p className="mt-2 text-muted-foreground">
                Manage subscription packages, features, and pricing
              </p>
            </div>

            {/* Stats */}
            <PackageStats />

            {/* Tabs */}
            <Tabs defaultValue="packages" className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="packages">Packages</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="currencies">Currencies</TabsTrigger>
              </TabsList>

              {/* Packages Tab */}
              <TabsContent value="packages" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">All Packages</h2>
                  <Button onClick={handleCreatePackage}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Package
                  </Button>
                </div>

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
                        onEdit={() => handleEditPackage(pkg)}
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
              </TabsContent>

              {/* Features Tab */}
              <TabsContent value="features">
                <FeaturesList
                  features={features}
                  isLoading={featuresLoading}
                  onEdit={handleEditFeature}
                  onDelete={handleDeleteFeature}
                  onCreate={handleCreateFeature}
                />
              </TabsContent>

              {/* Currencies Tab */}
              <TabsContent value="currencies">
                <CurrenciesList
                  currencies={currencies}
                  isLoading={currenciesLoading}
                  onEdit={handleEditCurrency}
                  onDelete={handleDeleteCurrency}
                  onCreate={handleCreateCurrency}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Create/Edit Package Dialog */}
      <PackageFormDialog
        open={showPackageDialog}
        onOpenChange={setShowPackageDialog}
        onSubmit={handlePackageSubmit}
        initialData={editingPackage}
        mode={editingPackage ? "edit" : "create"}
      />

      {/* Create/Edit Feature Dialog */}
      <FeatureFormDialog
        open={showFeatureDialog}
        onOpenChange={setShowFeatureDialog}
        onSubmit={handleFeatureSubmit}
        initialData={editingFeature}
        mode={editingFeature ? "edit" : "create"}
      />

      {/* Create/Edit Currency Dialog */}
      <CurrencyFormDialog
        open={showCurrencyDialog}
        onOpenChange={setShowCurrencyDialog}
        onSubmit={handleCurrencySubmit}
        initialData={editingCurrency}
        mode={editingCurrency ? "edit" : "create"}
      />
    </div>
  )
}

