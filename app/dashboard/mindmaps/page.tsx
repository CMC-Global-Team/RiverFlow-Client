"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/hooks/auth/useAuth"
import Sidebar from "@/components/dashboard/sidebar"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import FilterBar from "@/components/mindmap/FilterBar"
import SearchBar from "@/components/mindmap/SearchBar"
import ViewToggle from "@/components/mindmap/ViewToggle"
import MindmapGrid from "@/components/mindmap/MindmapGrid"
import MindmapList from "@/components/mindmap/MindmapList"
import EmptyState from "@/components/mindmap/EmptyState"
import TemplateModal from "@/components/dashboard/template-modal"
import DeleteConfirmDialog from "@/components/mindmap/DeleteConfirmDialog"
import EditMindmapModal from "@/components/mindmap/EditMindmapModal"
import { useMindmapsByStatus } from "@/hooks/mindmap/useMindmapsByStatus"
import { useMindmapActions } from "@/hooks/mindmap/useMindmapActions"
import { Plus, Loader2, AlertCircle } from "lucide-react"
import { MindmapSummary } from "@/types/mindmap.types"
import { useToast } from "@/hooks/use-toast"
import { duplicateMindmap, leaveCollaboration } from "@/services/mindmap/mindmap.service"

function MyMindmapsContent() {
  const { t } = useTranslation("mindmaps")
  const router = useRouter()
  const { user } = useAuth()
  const [selectedStatus, setSelectedStatus] = useState<"active" | "archived">("active")
  
  // Fetch mindmaps based on status
  const { mindmaps, loading, error, refetch } = useMindmapsByStatus(selectedStatus)
  const { create, update, remove, toggleFavorite, archive,unarchive } = useMindmapActions()


    // UI State
  const [view, setView] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [sortBy, setSortBy] = useState("updatedAt")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showAiModal, setShowAiModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [mindmapToDelete, setMindmapToDelete] = useState<MindmapSummary | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [mindmapToEdit, setMindmapToEdit] = useState<MindmapSummary | null>(null)
  const { toast } = useToast()

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
  }, [mindmaps, searchQuery, showFavoritesOnly, sortBy])

  // Action Handlers
  const handleCreateNew = () => {
    setShowTemplateModal(true)
  }
  const handleCreateWithAI = () => {
    router.push('/dashboard/ai-mindmap')
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

  const handleAiGenerated = (m: any) => {
    if (m?.id) {
      router.push(`/editor?id=${m.id}`)
    }
  }

  const handleClickCard = (id: string) => {
    router.push(`/editor?id=${id}`)
  }

  const handleEditInfo = (id: string) => {
    const mindmap = mindmaps.find((m) => m.id === id)
    if (mindmap) {
      setMindmapToEdit(mindmap)
      setShowEditModal(true)
    }
  }

  const handleSaveEdit = async (data: { title: string; description: string }) => {
    if (!mindmapToEdit) return

    setActionLoading(mindmapToEdit.id)
    await update(mindmapToEdit.id, data)
    await refetch()
    setShowEditModal(false)
    setMindmapToEdit(null)
    setActionLoading(null)
  }

  const handleDeleteClick = (id: string) => {
    const mindmap = mindmaps.find((m) => m.id === id)
    if (mindmap) {
      setMindmapToDelete(mindmap)
      setShowDeleteDialog(true)
    }
  }

  const handleConfirmDelete = async () => {
    if (!mindmapToDelete) return

    setActionLoading(mindmapToDelete.id)
    const success = await remove(mindmapToDelete.id)
    if (success) {
      await refetch()
    }
    setShowDeleteDialog(false)
    setMindmapToDelete(null)
    setActionLoading(null)
  }

  const handleToggleFavorite = async (id: string) => {
    setActionLoading(id)
    await toggleFavorite(id)
    await refetch()
    setActionLoading(null)
  }

  const handleArchive = async (id: string) => {
    setActionLoading(id)
    await archive(id)
    await refetch()
    setActionLoading(null)
  }
    const handleUnarchive = async (id: string) => {
        setActionLoading(id)
        await unarchive(id)
        await refetch()
        setActionLoading(null)
    }

  const handleDuplicate = async (id: string) => {
    setActionLoading(id)
    toast({ title: t("duplicating"), description: t("pleaseWait") })

    try {
      const newMindmap = await duplicateMindmap(id)
      
      toast({ 
        title: t("duplicateSuccess"),
        description: t("created", { title: newMindmap.title })
      })
      await refetch()

    } catch (error) {
      console.error(t("duplicateFailedTitle"), error)
      toast({ 
        variant: "destructive", 
        title: t("duplicateFailedTitle"), 
        description: t("duplicateFailedDescription") 
      })
    } finally {
      setActionLoading(null) 
    }
  }

  const handleLeave = async (id: string) => {
    if (!confirm(t("confirmLeaveProject"))) return
    
    setActionLoading(id)
    try {
      await leaveCollaboration(id)
      toast({ 
        title: t("leftProject"),
        description: t("leftProjectDescription")
      })
      await refetch()
    } catch (error) {
      console.error(t("leaveFailed"), error)
      toast({ 
        variant: "destructive", 
        title: t("leaveFailed"), 
        description: t("leaveFailedDescription") 
      })
    } finally {
      setActionLoading(null)
    }
  }
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col ml-64">
        <DashboardHeader 
           searchValue={searchQuery}
           onSearchChange={setSearchQuery}
        />

        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{t("myMindmaps")}</h1>
                  <p className="mt-2 text-muted-foreground">
                    {filteredAndSortedMindmaps.length} {selectedStatus === "archived" ? "archived" : ""} {t("mindmap")}{filteredAndSortedMindmaps.length !== 1 ? "s" : ""}
                    {filteredAndSortedMindmaps.length !== mindmaps.length && 
                      ` (${mindmaps.length} total)`
                    }
                  </p>
                </div>
                {/* Only show Create New button if user has mindmaps */}
                {!loading && !error && mindmaps.length > 0 && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCreateNew}
                      className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground font-semibold hover:bg-primary/90 transition-all"
                    >
                      <Plus className="h-5 w-5" />
                      {t("createNew")}
                    </button>
                    <button
                      onClick={handleCreateWithAI}
                      className="flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-accent-foreground font-semibold hover:bg-accent/90 transition-all"
                    >
                      <Plus className="h-5 w-5" />
                      {t("createWithAI")}
                    </button>
                  </div>
                )}
              </div>

              {/* Search Bar */}
              {/* <div className="mb-4">
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
              </div> */}

              {/* Filter Bar */}
              <FilterBar
                selectedStatus={selectedStatus}
                onStatusChange={(status) => setSelectedStatus(status as "active" | "archived")}
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
                <span className="ml-3 text-muted-foreground">{t("loadingMindmaps")}</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <div className="flex-1">
                  <p className="font-semibold">{t("failedToLoadMindmaps")}</p>
                  <p className="text-sm">{error}</p>
                  {error.includes("403") && (
                    <p className="text-xs mt-1">
                      {t("sessionExpired")}
                    </p>
                  )}
                </div>
                <button
                  onClick={refetch}
                  className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {t("retry")}
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredAndSortedMindmaps.length === 0 && (
              <EmptyState
                title={
                  searchQuery || showFavoritesOnly
                    ? t("noResultsFound")
                    : selectedStatus === "archived"
                    ? t("noArchivedMindmaps")
                    : t("noMindmapsYet")
                }
                description={
                  searchQuery || showFavoritesOnly
                    ? t("tryAdjustingFilters")
                    : selectedStatus === "archived"
                    ? t("archivedMindmapsDescription")
                    : t("noMindmapsDescription")
                }
                actionLabel={t("createMindmap")}
                onAction={selectedStatus === "active" ? handleCreateNew : undefined}
              />
            )}

            {/* Content - Grid or List View */}
            {!loading && !error && filteredAndSortedMindmaps.length > 0 && (
              <>
                {view === "grid" ? (
                  <MindmapGrid
                    mindmaps={filteredAndSortedMindmaps}
                    onDelete={handleDeleteClick}
                    onToggleFavorite={handleToggleFavorite}
                    onArchive={handleArchive}
                    onEdit={handleEditInfo}
                    onUnarchive={handleUnarchive}
                    onDuplicate={handleDuplicate}
                    onLeave={handleLeave}
                    onClick={handleClickCard}
                    actionLoading={actionLoading}
                  />
                ) : (
                  <MindmapList
                    mindmaps={filteredAndSortedMindmaps}
                    onDelete={handleDeleteClick}
                    onToggleFavorite={handleToggleFavorite}
                    onArchive={handleArchive}
                    onUnarchive={handleUnarchive}
                    onEdit={handleEditInfo}
                    onDuplicate={handleDuplicate}
                    onLeave={handleLeave}
                    onClick={handleClickCard}
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
      

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setMindmapToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title={mindmapToDelete?.title || ""}
        isLoading={!!actionLoading}
      />

      {/* Edit Mindmap Modal */}
      <EditMindmapModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setMindmapToEdit(null)
        }}
        onSave={handleSaveEdit}
        mindmap={mindmapToEdit}
        isLoading={!!actionLoading}
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

