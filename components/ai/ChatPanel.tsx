"use client"

import { useMemo, useState } from "react"
import ModeToggle, { type ChatMode } from "./ModeToggle"
import FileUploader from "./FileUploader"
import ChatMessage, { type ChatMessageData } from "./ChatMessage"
import ChatInput from "./ChatInput"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"

export default function ChatPanel() {
  const [mode, setMode] = useState<ChatMode>("normal")
  const [messages, setMessages] = useState<ChatMessageData[]>([])
  const [pending, setPending] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])

  const header = useMemo(() => {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Mindmap
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <FileUploader onFilesSelected={(files) => setAttachments(files)} disabled={pending} />
          <ModeToggle value={mode} onChange={setMode} />
        </div>
      </div>
    )
  }, [mode, pending])

  const handleSend = async (text: string) => {
    const userMsg: ChatMessageData = { id: `${Date.now()}-u`, role: "user", content: text, attachments: attachments.map((f) => ({ name: f.name })) }
    setMessages((m) => [...m, userMsg])
    setPending(true)
    setAttachments([])
    const reply = mode === "max"
      ? `Mình sẽ tạo mindmap chi tiết với cấp độ tối đa:\n• Xác định mục tiêu, phạm vi và yêu cầu\n• Sinh các nhánh chính, phụ và mối liên hệ\n• Gợi ý tài nguyên, checklist và lộ trình\n• Sẵn sàng chuyển sang Editor khi bạn duyệt`
      : `Mình sẽ phác thảo mindmap ở mức cơ bản và có thể chỉnh sửa thêm.`
    await new Promise((r) => setTimeout(r, 600))
    const aiMsg: ChatMessageData = { id: `${Date.now()}-a`, role: "assistant", content: reply, mode }
    setMessages((m) => [...m, aiMsg])
    setPending(false)
  }

  return (
    <div className="pointer-events-auto w-full max-w-3xl mx-auto">
      <Card className="p-5 bg-background/80 backdrop-blur border shadow-lg">
        {header}
        <div className="mt-4 h-[48vh]">
          <ScrollArea className="h-full pr-3">
            <div className="space-y-4">
              {messages.map((m) => (
                <ChatMessage key={m.id} message={m} />
              ))}
              {messages.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  Nhập yêu cầu để AI thiết kế mindmap theo ý tưởng của bạn.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        <div className="mt-4">
          <ChatInput onSend={handleSend} mode={mode} disabled={pending} />
        </div>
      </Card>
    </div>
  )
}

