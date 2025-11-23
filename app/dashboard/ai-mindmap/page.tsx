"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { ReactFlowProvider } from "reactflow"
import { MindmapProvider, useMindmapContext } from "@/contexts/mindmap/MindmapContext"
import BackButton from "@/components/editor/back-button"
import Canvas from "@/components/editor/canvas"
import { Loader2 } from "lucide-react"
import { ChatMessage } from "@/components/ai/PromptChat"
import AiBuilderPanel from "@/components/ai/AiBuilderPanel"
import { useAuth } from "@/hooks/auth/useAuth"
import { generateMindmapByAI } from "@/services/mindmap/mindmap.service"
import { getUserProfile } from "@/services/auth/update-user.service"
import CreditTopupSheet from "@/components/payment/CreditTopupSheet"

function AiWorkspaceInner() {
  const { user, updateUser } = useAuth()
  const { mindmap, setFullMindmapState } = useMindmapContext()
  const [mode, setMode] = useState<'normal' | 'max'>('normal')
  const [model, setModel] = useState<string>('gpt-4o-mini')
  const [files, setFiles] = useState<File[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTopupOpen, setIsTopupOpen] = useState(false)

  const MODE_COST = { normal: 1, max: 3 }

  const onSend = (text: string) => {
    setMessages((prev) => [...prev, { role: 'user', content: text }])
  }

  const onGenerate = async () => {
    if (loading) return
    setError(null)
    const cost = MODE_COST[mode]
    const balance = user?.credit ?? 0
    if (balance < cost) {
      setError('Credit không đủ')
      return
    }
    const prompt = messages.filter((m) => m.role === 'user').map((m) => m.content).join('\n')
    try {
      setLoading(true)
      const res = await generateMindmapByAI({ prompt, mode, model, files, messages })
      try {
        const profile = await getUserProfile()
        if (user) {
          updateUser({ ...user, credit: profile.credit ?? user.credit })
        }
      } catch {}
      setFullMindmapState(res)
    } catch (e: any) {
      setError(e?.message || 'Tạo mindmap bằng AI thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <div className="flex-1 overflow-hidden relative">
        <div className="w-full h-full flex flex-col">
          <div className="flex-1 rounded-lg overflow-hidden">
            <Canvas readOnly={!mindmap} />
          </div>
        </div>

        <div className="absolute top-4 left-4 z-50 pointer-events-auto">
          <BackButton />
        </div>

        <div className="absolute top-4 right-4 z-50 w-[380px] max-w-[90vw] pointer-events-auto">
          <AiBuilderPanel
            messages={messages}
            onSend={onSend}
            files={files}
            onFilesChange={setFiles}
            mode={mode}
            onModeChange={setMode}
            model={model}
            onModelChange={setModel}
            balance={user?.credit ?? 0}
            cost={MODE_COST[mode]}
            loading={loading}
            error={error}
            onGenerate={onGenerate}
            onTopup={() => setIsTopupOpen(true)}
          />
          <CreditTopupSheet open={isTopupOpen} onOpenChange={setIsTopupOpen} />
        </div>
      </div>
    </div>
  )
}

function AiWorkspaceContent() {
  return (
    <ReactFlowProvider>
      <MindmapProvider>
        <AiWorkspaceInner />
      </MindmapProvider>
    </ReactFlowProvider>
  )
}

export default function AiMindmapPage() {
  return (
    <ProtectedRoute>
      <AiWorkspaceContent />
    </ProtectedRoute>
  )
}
