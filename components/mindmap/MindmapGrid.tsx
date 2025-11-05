"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import MindmapCard from "@/components/dashboard/mindmap-card"
import { MindmapSummary } from "@/types/mindmap.types"

interface MindmapGridProps {
  mindmaps: MindmapSummary[]
  onDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
  onArchive: (id: string) => void
  onEdit: (id: string) => void
  onClick: (id: string) => void
  actionLoading: string | null
}

export default function MindmapGrid({
  mindmaps,
  onDelete,
  onToggleFavorite,
  onArchive,
  onEdit,
  onClick,
  actionLoading,
}: MindmapGridProps) {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    cardsRef.current.forEach((card, index) => {
      if (!card) return
      gsap.from(card, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        delay: index * 0.05,
        ease: "power2.out",
      })
    })
  }, [mindmaps])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {mindmaps.map((mindmap, index) => (
        <div
          key={mindmap.id}
          ref={(el) => {
            cardsRef.current[index] = el
          }}
          style={{
            opacity: actionLoading === mindmap.id ? 0.5 : 1,
            pointerEvents: actionLoading === mindmap.id ? "none" : "auto",
          }}
        >
          <MindmapCard
            mindmap={mindmap}
            onDelete={onDelete}
            onToggleFavorite={onToggleFavorite}
            onArchive={onArchive}
            onEdit={onEdit}
            onClick={onClick}
          />
        </div>
      ))}
    </div>
  )
}

