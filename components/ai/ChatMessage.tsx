"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Bot, User } from "lucide-react"
import type { ChatMode } from "./ModeToggle"

export interface ChatMessageData {
  id: string
  role: "user" | "assistant"
  content: string
  attachments?: { name: string }[]
  mode?: ChatMode
}

export default function ChatMessage({ message }: { message: ChatMessageData }) {
  const isUser = message.role === "user"
  return (
    <div className={cn("flex items-start gap-3", isUser ? "justify-end" : "justify-start")}> 
      {!isUser && (
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      <div className={cn("max-w-[75%] rounded-2xl px-4 py-3", isUser ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm")}> 
        <div className="flex items-center gap-2">
          {!isUser && message.mode === "max" && <Badge variant="secondary">MAX MODE</Badge>}
        </div>
        <div className="whitespace-pre-wrap leading-relaxed mt-1 text-sm">
          {message.content}
        </div>
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            {message.attachments.map((a) => (
              <div key={a.name} className="truncate">{a.name}</div>
            ))}
          </div>
        )}
      </div>
      {isUser && (
        <Avatar className="size-8">
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}

