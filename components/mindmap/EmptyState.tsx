"use client"

import { FileQuestion, Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

interface EmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  const { t } = useTranslation("mindmaps")

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6">
        {icon || <FileQuestion className="h-12 w-12 text-muted-foreground" />}
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{title || t("emptyState.title")}</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        {description || t("emptyState.description")}
      </p>
      {onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all"
        >
          <Plus className="h-5 w-5" />
          {actionLabel || t("emptyState.action")}
        </button>
      )}
    </div>
  )
}

