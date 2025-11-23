"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { ReactFlowProvider } from "reactflow"
import { MindmapProvider, useMindmapContext } from "@/contexts/mindmap/MindmapContext"
import Toolbar from "@/components/editor/toolbar"
import Canvas from "@/components/editor/canvas"
import { Sparkles, Loader2 } from "lucide-react"
import PromptChat, { ChatMessage } from "@/components/ai/PromptChat"
import FileUpload from "@/components/ai/FileUpload"
import ModeSelector from "@/components/ai/ModeSelector"
import ModelSelector from "@/components/ai/ModelSelector"
import CreditCost from "@/components/ai/CreditCost"
import { useAuth } from "@/hooks/auth/useAuth"
import { generateMindmapByAI } from "@/services/mindmap/mindmap.service"
import { getUserProfile } from "@/services/auth/update-user.service"

function AiWorkspaceInner() {
  const { user, updateUser } = useAuth()
  const { mindmap, setFullMindmapState } = useMindmapContext()
  const [mode, setMode] = useState<'normal' | 'max'>('normal')
  const [model, setModel] = useState<string>('gpt-4o-mini')
  const [files, setFiles] = useState<File[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const MODE_COST = { normal: 1, max: 3 }
  const MODELS = ['gpt-4o-mini', 'gpt-4.1', 'claude-3.5']

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

        <div className="absolute top-4 left-4 right-4 z-50 pointer-events-none">
          <div className="pointer-events-auto">
            <Toolbar />
          </div>
        </div>

        <div className="absolute top-4 right-4 z-50 w-[380px] max-w-[90vw] pointer-events-auto">
          <div className="rounded-lg border border-border bg-card/95 backdrop-blur-sm shadow-2xl">
            <div className="flex items-center gap-2 p-3 border-b border-border">
              <div className="p-2 rounded-md bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="text-sm font-semibold">Tạo Mindmap bằng AI</div>
            </div>
            <div className="p-3 space-y-3">
              <PromptChat messages={messages} onSend={onSend} />
              <FileUpload files={files} onChange={setFiles} />
              <ModeSelector value={mode} onChange={setMode} normalCost={MODE_COST.normal} maxCost={MODE_COST.max} />
              <ModelSelector value={model} onChange={setModel} models={MODELS} />
              <CreditCost balance={user?.credit ?? 0} cost={MODE_COST[mode]} />
              {error && <div className="text-sm text-destructive">{error}</div>}
              <button
                onClick={onGenerate}
                disabled={loading}
                className="w-full rounded-lg bg-primary px-4 py-2 text-primary-foreground font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/>Đang tạo...</span>
                ) : (
                  'Tạo Mindmap'
                )}
              </button>
            </div>
          </div>
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
