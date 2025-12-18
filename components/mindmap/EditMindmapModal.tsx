"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { MindmapSummary } from "@/types/mindmap.types"
import { useTranslation, Trans } from "react-i18next"

interface EditMindmapModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { title: string; description: string }) => void
  mindmap: MindmapSummary | null
  isLoading?: boolean
}

export default function EditMindmapModal({
  isOpen,
  onClose,
  onSave,
  mindmap,
  isLoading = false,
}: EditMindmapModalProps) {
  const { t } = useTranslation("mindmaps")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (mindmap) {
      setTitle(mindmap.title)
      setDescription(mindmap.description || "")
    }
  }, [mindmap])

  if (!isOpen || !mindmap) return null

  const handleSave = () => {
    if (!title.trim()) {
      return // Don't use alert, just prevent save
    }
    onSave({ title: title.trim(), description: description.trim() })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSave()
    }
    if (e.key === "Escape") {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg mx-4 bg-card rounded-xl shadow-2xl border border-border animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">{t("editMindmap.title")}</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t("editMindmap.titleLabel")} <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("editMindmap.titlePlaceholder")}
              disabled={isLoading}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t("editMindmap.charCount", { current: title.length, max: 200 })}
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t("editMindmap.descriptionLabel")}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("editMindmap.descriptionPlaceholder")}
              disabled={isLoading}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none disabled:opacity-50"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t("editMindmap.charCount", { current: description.length, max: 1000 })}
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            <Trans
              i18nKey="editMindmap.shortcut"
              ns="mindmaps"
              components={{ 1: <kbd className="px-2 py-1 rounded bg-muted" />, 2: <kbd className="px-2 py-1 rounded bg-muted" /> }}
            />
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
          >
            {t("editMindmap.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !title.trim()}
            className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t("editMindmap.saving") : t("editMindmap.save")}
          </button>
        </div>
      </div>
    </div>
  )
}

