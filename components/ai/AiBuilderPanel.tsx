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
}: AiBuilderPanelProps) {
  return (
    <div className="rounded-xl border border-border bg-card/90 backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="text-sm font-semibold">Generate MindMap With Promt</div>
        </div>
        {loading && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Generating
          </span>
        )}
      </div>
      <div className="p-4 space-y-5">
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Chat History</div>
          <div className="rounded-lg border border-border bg-background/60">
            <PromptChat messages={messages} onSend={onSend} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Attachments</div>
          <div className="rounded-lg border border-dashed border-border bg-background/60">
            <FileUpload files={files} onChange={onFilesChange} />
          </div>
        </div>
        <div className="space-y-3">
          <div className="text-xs font-medium text-muted-foreground">Options</div>
          <div className="grid grid-cols-1 gap-3">
            <div className="rounded-lg border border-border bg-background/60 p-3">
              <ModeSelector value={mode} onChange={onModeChange} normalCost={1} maxCost={3} />
            </div>
            <div className="rounded-lg border border-border bg-background/60 p-3">
              <ModelSelector value={model} onChange={onModelChange} models={["gpt-4o-mini","gpt-4.1","claude-3.5"]} />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <CreditCost balance={balance} cost={cost} />
          {error && <div className="text-sm text-destructive">{error}</div>}
          <button
            onClick={onGenerate}
            disabled={loading || balance < cost}
            className="w-full rounded-lg bg-primary px-4 py-2 text-primary-foreground font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/>Generating...</span>
            ) : (
              'Generate'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
