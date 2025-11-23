"use client"

import { Sparkles, Loader2 } from "lucide-react"
import PromptChat, { ChatMessage } from "@/components/ai/PromptChat"
import FileUpload from "@/components/ai/FileUpload"
import ModeSelector from "@/components/ai/ModeSelector"
import ModelSelector from "@/components/ai/ModelSelector"
import CreditCost from "@/components/ai/CreditCost"

interface AiBuilderPanelProps {
  messages: ChatMessage[]
  onSend: (text: string) => void
  files: File[]
  onFilesChange: (files: File[]) => void
  mode: 'normal' | 'max'
  onModeChange: (m: 'normal' | 'max') => void
  model: string
  onModelChange: (m: string) => void
  balance: number
  cost: number
  loading: boolean
  error?: string | null
  onGenerate: () => void
  onTopup?: () => void
}

export default function AiBuilderPanel({
  messages,
  onSend,
  files,
  onFilesChange,
  mode,
  onModeChange,
  model,
  onModelChange,
  balance,
  cost,
  loading,
  error,
  onGenerate,
  onTopup,
}: AiBuilderPanelProps) {
  return (
    <div className="rounded-lg border border-border bg-card/95 backdrop-blur-sm shadow-2xl">
      <div className="flex items-center justify-between gap-2 p-3 border-b border-border">
        <div className="p-2 rounded-md bg-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="text-sm font-semibold">Tạo Mindmap bằng AI</div>
        <div className="flex items-center gap-2">
          {loading && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Đang tạo
            </span>
          )}
          {onTopup && (
            <button
              type="button"
              onClick={onTopup}
              className="text-xs rounded-md px-2 py-1 bg-primary text-white hover:opacity-90"
              aria-label="Nạp credit"
            >
              Nạp
            </button>
          )}
        </div>
      </div>
      <div className="p-3 space-y-3">
        <PromptChat messages={messages} onSend={onSend} />
        <FileUpload files={files} onChange={onFilesChange} />
        <ModeSelector value={mode} onChange={onModeChange} normalCost={1} maxCost={3} />
        <ModelSelector value={model} onChange={onModelChange} models={["gpt-4o-mini","gpt-4.1","claude-3.5"]} />
        <CreditCost balance={balance} cost={cost} />
        {error && <div className="text-sm text-destructive">{error}</div>}
        <button
          onClick={onGenerate}
          disabled={loading || balance < cost}
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
  )
}

