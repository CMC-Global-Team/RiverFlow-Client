"use client"

import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import BackgroundCanvas from "@/components/mindmap/BackgroundCanvas"
import AiComposer from "@/components/ai/AiComposer"
import BackButton from "@/components/editor/back-button"
import { ThemeSwitcher } from "@/components/theme-switcher"

function AiMindmapContent() {
  return (
    <div className="relative h-screen bg-background">
      <BackgroundCanvas />
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center p-6" />
      <div className="absolute inset-0 z-20 pointer-events-auto">
        <AiComposer />
      </div>
      <div className="absolute top-4 left-4 z-30 pointer-events-auto flex items-center gap-2">
        <BackButton />
        <ThemeSwitcher />
      </div>
    </div>
  )
}

export default function AiMindmapPage() {
  return (
    <ProtectedRoute>
      <AiMindmapContent />
    </ProtectedRoute>
  )
}
