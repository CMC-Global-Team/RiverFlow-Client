"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import Sidebar from "@/components/dashboard/sidebar"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import FilterBar from "@/components/mindmap/FilterBar"
import SearchBar from "@/components/mindmap/SearchBar"
import ViewToggle from "@/components/mindmap/ViewToggle"
import MindmapGrid from "@/components/mindmap/MindmapGrid"
import MindmapList from "@/components/mindmap/MindmapList"
import EmptyState from "@/components/mindmap/EmptyState"
import TemplateModal from "@/components/dashboard/template-modal"
import { useMindmaps } from "@/hooks/mindmap/useMindmaps"
import { useMindmapActions } from "@/hooks/mindmap/useMindmapActions"
import { Plus, Loader2, AlertCircle } from "lucide-react"

function MyMindmapsContent() {
  const router = useRouter()
  const { mindmaps, loading, error, refetch } = useMindmaps()
  const { create, remove, toggleFavorite, archive } = useMindmapActions()

  // UI State
  const [view, setView] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("active")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [sortBy, setSortBy] = useState("updatedAt")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showTemplateModal, setShowTemplateModal] = useState(false)

  // Filter and Sort Logic
  const filteredAndSortedMindmaps = useMemo(() => {
    let result = [...mindmaps]

    // Filter by search query
    if (searchQuery) {
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter((m) => m.category === selectedCategory)
    }

    // Filter by status
    result = result.filter((m) => m.status === selectedStatus)

    // Filter by favorites
    if (showFavoritesOnly) {
      result = result.filter((m) => m.isFavorite)
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "updatedAt":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case "createdAt":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "title":
          return a.title.localeCompare(b.title)
        case "nodeCount":
          return b.nodeCount - a.nodeCount
        default:
          return 0
      }
    })

    return result
  }, [mindmaps, searchQuery, selectedCategory, selectedStatus, showFavoritesOnly, sortBy])

  // Action Handlers
  const handleCreateNew = () => {
    setShowTemplateModal(true)
  }

  const handleSelectTemplate = async (template: any) => {
    const newMindmap = await create({
      title: "Untitled Mindmap",
      nodes: template.initialNodes,
      edges: template.initialEdges,
    })

    if (newMindmap) {
      router.push(`/editor?id=${newMindmap.id}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this mindmap?")) return

    setActionLoading(id)
    const success = await remove(id)
    if (success) {
      await refetch()
    }
    setActionLoading(null)
  }

  const handleToggleFavorite = async (id: string) => {
    setActionLoading(id)
    await toggleFavorite(id)
    await refetch()
    setActionLoading(null)
  }

  const handleArchive = async (id: string) => {
    if (!confirm("Archive this mindmap?")) return

    setActionLoading(id)
    await archive(id)
    await refetch()
    setActionLoading(null)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col ml-64">
        <DashboardHeader />

        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">My Mindmaps</h1>
                  <p className="mt-2 text-muted-foreground">
                    {mindmaps.length} mindmap{mindmaps.length !== 1 ? "s" : ""} total
                  </p>
                </div>
                <button
                  onClick={handleCreateNew}
                  className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground font-semibold hover:bg-primary/90 transition-all"
                >
                  <Plus className="h-5 w-5" />
                  Create New
                </button>
              </div>

              {/* Search Bar */}
              <div className="mb-4">
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
              </div>

              {/* Filter Bar */}
              <FilterBar
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                showFavoritesOnly={showFavoritesOnly}
                onFavoritesToggle={() => setShowFavoritesOnly(!showFavoritesOnly)}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            </div>

            {/* View Toggle */}
            {!loading && !error && filteredAndSortedMindmaps.length > 0 && (
              <div className="mb-6 flex justify-end">
                <ViewToggle view={view} onViewChange={setView} />
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Loading mindmaps...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <div className="flex-1">
                  <p className="font-semibold">Failed to load mindmaps</p>
                  <p className="text-sm">{error}</p>
                  {error.includes("403") && (
                    <p className="text-xs mt-1">
                      You may need to log in again. Your session might have expired.
                    </p>
                  )}
                </div>
                <button
                  onClick={refetch}
                  className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredAndSortedMindmaps.length === 0 && (
              <EmptyState
                title={
                  searchQuery || selectedCategory !== "all" || showFavoritesOnly
                    ? "No mindmaps match your filters"
                    : "No mindmaps yet"
                }
                description={
                  searchQuery || selectedCategory !== "all" || showFavoritesOnly
                    ? "Try adjusting your filters or search query"
                    : "Create your first mindmap to get started"
                }
                actionLabel="Create Mindmap"
                onAction={handleCreateNew}
              />
            )}

            {/* Content - Grid or List View */}
            {!loading && !error && filteredAndSortedMindmaps.length > 0 && (
              <>
                {view === "grid" ? (
                  <MindmapGrid
                    mindmaps={filteredAndSortedMindmaps}
                    onDelete={handleDelete}
                    onToggleFavorite={handleToggleFavorite}
                    onArchive={handleArchive}
                    actionLoading={actionLoading}
                  />
                ) : (
                  <MindmapList
                    mindmaps={filteredAndSortedMindmaps}
                    onDelete={handleDelete}
                    onToggleFavorite={handleToggleFavorite}
                    onArchive={handleArchive}
                    actionLoading={actionLoading}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Template Selection Modal */}
      <TemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  )
}

export default function MyMindmapsPage() {
  return (
    <ProtectedRoute>
      <MyMindmapsContent />
    </ProtectedRoute>
  )
}

