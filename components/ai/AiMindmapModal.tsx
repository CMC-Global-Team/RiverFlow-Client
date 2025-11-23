"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { X, Sparkles, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/auth/useAuth"
import ModeSelector from "@/components/ai/ModeSelector"
import ModelSelector from "@/components/ai/ModelSelector"
import FileUpload from "@/components/ai/FileUpload"
import PromptChat, { ChatMessage } from "@/components/ai/PromptChat"
import CreditCost from "@/components/ai/CreditCost"
import { generateMindmapByAI } from "@/services/mindmap/mindmap.service"
import { getUserProfile } from "@/services/auth/update-user.service"
import type { MindmapResponse } from "@/types/mindmap.types"

interface AiMindmapModalProps {
  isOpen: boolean
  onClose: () => void
  onGenerated: (mindmap: MindmapResponse) => void
}

export default function AiMindmapModal({ isOpen, onClose, onGenerated }: AiMindmapModalProps) {
  const { user, updateUser } = useAuth()
  const [mode, setMode] = useState<'normal' | 'max'>('normal')
  const [model, setModel] = useState<string>('gpt-4o-mini')
  const [files, setFiles] = useState<File[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const MODE_COST = { normal: 1, max: 3 }
  const MODELS = ['gpt-4o-mini', 'gpt-4.1', 'claude-3.5']

  useEffect(() => {
    if (!isOpen) {
      setMode('normal')
      setModel(MODELS[0])
      setFiles([])
      setMessages([])
      setLoading(false)
      setError(null)
    }
  }, [isOpen])

  if (!isOpen) return null

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
      onGenerated(res)
      onClose()
    } catch (e: any) {
      setError(e?.message || 'Tạo mindmap bằng AI thất bại')
    } finally {
      setLoading(false)
    }
  }

  const modal = (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl mx-4 bg-card rounded-xl shadow-2xl border border-border animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <div>
              <div className="text-2xl font-bold">Tạo Mindmap bằng AI</div>
              <div className="text-sm text-muted-foreground">Nhập promt, chọn chế độ, đính kèm file và model</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors"><X className="h-5 w-5"/></button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <PromptChat messages={messages} onSend={onSend} />
            <FileUpload files={files} onChange={setFiles} />
          </div>
          <div className="space-y-4">
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
  )

  if (typeof document !== 'undefined') return createPortal(modal, document.body)
  return modal
}

