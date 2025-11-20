"use client"

import { useEffect, useRef, useState } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/hooks/auth/useAuth"
import Sidebar from "@/components/dashboard/sidebar"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import MindmapCard from "@/components/dashboard/mindmap-card"
import { Plus, Loader2, AlertCircle } from "lucide-react"
import gsap from "gsap"
import { useMindmaps } from "@/hooks/mindmap/useMindmaps"
import { useMindmapActions } from "@/hooks/mindmap/useMindmapActions"
import { useRouter } from "next/navigation"
import TemplateModal from "@/components/dashboard/template-modal"
import {MindmapSummary} from "@/types/mindmap.types";
import DeleteConfirmDialog from "@/components/mindmap/DeleteConfirmDialog";
import EditMindmapModal from "@/components/mindmap/EditMindmapModal";
import { useToast } from "@/hooks/use-toast"
import { duplicateMindmap, leaveCollaboration } from "@/services/mindmap/mindmap.service"

function DashboardContent() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const { user } = useAuth()
  const router = useRouter()
  const { mindmaps, loading, error, refetch } = useMindmaps()
  const { create,update, remove, toggleFavorite, archive } = useMindmapActions()
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [mindmapToDelete, setMindmapToDelete] = useState<MindmapSummary | null>(null)

    const [showEditModal, setShowEditModal] = useState(false)
    const [mindmapToEdit, setMindmapToEdit] = useState<MindmapSummary | null>(null)
    const { toast } = useToast()

    useEffect(() => {
    if (!containerRef.current || loading) return

    const ctx = gsap.context(() => {
      // Ensure cards are visible initially
      cardsRef.current.forEach((card) => {
        if (card) {
          gsap.set(card, { opacity: 1 })
        }
      })
      
      // Then animate
      cardsRef.current.forEach((card, index) => {
        if (!card) return
        gsap.fromTo(
          card,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            delay: index * 0.05,
            ease: "power2.out",
          }
        )
      })
    }, containerRef)

    return () => ctx.revert()
  }, [loading, mindmaps])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mindmap?')) return
    
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

    setActionLoading(id)
    await archive(id)
    await refetch()
    setActionLoading(null)
  }

  const handleCreateNew = () => {
    setShowTemplateModal(true)
  }
    const handleEditInfo = (id: string) => {
        const mindmap = mindmaps.find((m) => m.id === id)
        if (mindmap) {
            setMindmapToEdit(mindmap)
            setShowEditModal(true)
        }
    }

// Lưu sửa thông tin (gọi API update)
    const handleSaveEdit = async (data: { title: string; description: string }) => {
        if (!mindmapToEdit) return
        setActionLoading(mindmapToEdit.id)
        await update(mindmapToEdit.id, data)
        await refetch()
        setShowEditModal(false)
        setMindmapToEdit(null)
        setActionLoading(null)
    }

// Bấm nút Xóa: mở dialog xác nhận (không xóa ngay)
    const handleDeleteClick = (id: string) => {
        const mindmap = mindmaps.find((m) => m.id === id)
        if (mindmap) {
            setMindmapToDelete(mindmap)
            setShowDeleteDialog(true)
        }
    }

// Xác nhận xóa trong dialog
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


    const handleSelectTemplate = async (template: any) => {
    // Create mindmap with selected template
      const newMindmap = await create({
        title: "Untitled Mindmap",
        nodes: template.initialNodes,
        edges: template.initialEdges,
      })

      if (newMindmap) {
        // Navigate to editor with the new mindmap ID
        router.push(`/editor?id=${newMindmap.id}`)
      }
    }

  const handleDuplicate = async (id: string) => {
    setActionLoading(id);
    toast({ title: "Đang nhân bản...", description: "Vui lòng chờ..." });

    try {
      const newMindmap = await duplicateMindmap(id);
      
      toast({ 
        title: "Nhân bản thành công!",
        description: `Đã tạo "${newMindmap.title}".`
      });
      await refetch();

    } catch (error) {
      console.error("Duplicate failed:", error);
      toast({ 
        variant: "destructive", 
        title: "Lỗi", 
        description: "Không thể nhân bản mind map." 
      });
    } finally {
      setActionLoading(null); 
    }
  };

  const handleLeave = async (id: string) => {
    if (!confirm('Are you sure you want to leave this project?')) return
    
    setActionLoading(id)
    try {
      await leaveCollaboration(id)
      toast({ 
        title: "Left project",
        description: "You have successfully left the project."
      })
      await refetch()
    } catch (error) {
      console.error("Leave failed:", error)
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Failed to leave the project." 
      })
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col ml-64">
        <DashboardHeader />

        <main ref={containerRef} className="flex-1 overflow-auto">
          <div className="p-6 md:p-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {user?.fullName || "User"}
              </h1>
              <p className="mt-2 text-muted-foreground">Here are your recent mindmaps</p>
            </div>

            {/* Quick Action - Only show if user has mindmaps */}
            {!loading && !error && mindmaps.length > 0 && (
              <div className="mb-8">
                <button 
                  onClick={handleCreateNew}
                  className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground font-semibold hover:bg-primary/90 transition-all"
                >
                  <Plus className="h-5 w-5" />
                  Create New Mindmap
                </button> 
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
                  {error.includes('403') && (
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
            {!loading && !error && mindmaps.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No mindmaps yet. Create your first one!</p>
                <button 
                  onClick={handleCreateNew}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground font-semibold hover:bg-primary/90 transition-all"
                >
                  <Plus className="h-5 w-5" />
                  Create Your First Mindmap
                </button>
              </div>
            )}

            {/* Mindmaps Grid */}
            {!loading && !error && mindmaps.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mindmaps.map((mindmap, index) => (
                  <div
                    key={mindmap.id}
                    ref={(el) => {
                      cardsRef.current[index] = el
                    }}
                    style={{ 
                      opacity: actionLoading === mindmap.id ? 0.5 : 1,
                      pointerEvents: actionLoading === mindmap.id ? 'none' : 'auto'
                    }}
                  >
                      <MindmapCard
                          mindmap={mindmap}
                          isOwner={mindmap.mysqlUserId === user?.userId}
                          onDelete={handleDeleteClick}
                          onToggleFavorite={handleToggleFavorite}
                          onArchive={handleArchive}
                          onEdit={handleEditInfo}
                          onClick={(id) => router.push(`/editor?id=${id}`)}
                          onDuplicate={handleDuplicate}
                          onLeave={handleLeave}
                      />
                  </div>
                ))}
              </div>
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

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
