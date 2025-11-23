"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export type ChatMessage = { role: 'user' | 'assistant'; content: string }

export default function PromptChat({ messages, onSend }: { messages: ChatMessage[]; onSend: (text: string) => void }) {
  const [text, setText] = useState("")

  const send = () => {
    const t = text.trim()
    if (!t) return
    onSend(t)
    setText("")
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 h-48 border border-border rounded-md p-3 bg-card">
        <div className="space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
              <div className={`inline-block max-w-[80%] rounded-md px-3 py-2 text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>{m.content}</div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="mt-3 flex items-center gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Nhập promt..." />
        <Button onClick={send}>Gửi</Button>
      </div>
    </div>
  )
}

