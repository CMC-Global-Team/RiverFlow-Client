"use client"

import { useEffect, useRef, useState } from "react"
import { GripVertical, X, Send, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMindmapContext } from "@/contexts/mindmap/MindmapContext"
import { getSocket } from "@/lib/realtime"
import { getAvatarUrl } from "@/lib/avatar-utils"

interface ChatMessage {
  id: string
  room: string
  clientId: string
  userId?: string | number | null
  name: string
  color: string
  avatar?: string | null
  message: string
  createdAt: string
  from?: string
}

function EmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return
      if (!(e.target as HTMLElement).closest('[data-emoji-root]')) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])
  const emojis = ["🙂", "😊", "😂", "😍", "😎", "👍", "👏", "🙌", "🤝", "🚀", "🎉", "❤️", "🔥", "🤔", "😡", "🤯", "😭", "🤗", "🙏"]
  return (
    <div className="relative" data-emoji-root ref={ref}>
      <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setOpen((v) => !v)} title="Chọn biểu tượng">
        <Smile className="h-4 w-4" />
      </Button>
      {open && (
        <div className="absolute bottom-full right-0 mb-2 z-50 rounded-md border border-border bg-popover p-2 shadow-lg w-64">
          <div className="grid grid-cols-8 gap-1">
            {emojis.map((em) => (
              <button key={em} className="h-7 w-7 text-xl rounded hover:bg-muted" onClick={() => { onPick(em); setOpen(false) }}>
                {em}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ChatPanel({ isOpen = false, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const { mindmap, participants } = useMindmapContext()
  const [position, setPosition] = useState({ x: 24, y: 100 })
  const [size, setSize] = useState({ width: 360, height: 420 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [typingUsers, setTypingUsers] = useState<Record<string, { clientId: string; userId?: string | number | null; name: string; color: string; avatar?: string | null }>>({})
  const [agentTyping, setAgentTyping] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const stopTimerRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition((p) => ({ ...p }))
    }
  }, [])

  useEffect(() => {
    const s = getSocket()
    const normalizeAgentText = (t: string) => {
      const s = (t || '').replace(/^[^A-Za-zÀ-ỹ]+\s*/, '')
      if (/Agent:\s*action\s*=\s*replace/i.test(s)) {
        const m = s.match(/mentioned\s*=\s*(\d+)/i)
        const del = s.match(/prune\s*=\s*(\d+)/i)
        const edit = s.match(/edit\s*=\s*(\d+)/i)
        return `RiverFlow Agent: Kế hoạch thay thế toàn bộ (xóa: ${del?.[1] || 0}, sửa: ${edit?.[1] || 0}, liên quan: ${m?.[1] || 0})`
      }
      if (/Generate:\s*áp dụng\s*replace/i.test(s)) return 'RiverFlow Agent: Thực hiện thay thế mindmap theo kế hoạch'
      if (/Generate:\s*áp dụng\s*expand/i.test(s)) return 'RiverFlow Agent: Mở rộng mindmap theo kế hoạch'
      if (/Agent Plan:/i.test(s)) return 'RiverFlow Agent: Kế hoạch đã thiết lập'
      if (/Agent Analyze:/i.test(s)) {
        const tgt = s.match(/target\s*=\s*([a-z]+)/i)?.[1]
        const st = s.match(/structureType\s*=\s*([a-z]+)/i)?.[1]
        return `RiverFlow Agent: Phân tích tác vụ=${tgt || 'structure'}${st ? `, kiểu=${st}` : ''}`
      }
      if (/Pruned subtree of\s+/i.test(s)) {
        const lbl = s.replace(/.*Pruned subtree of\s+/i, '')
        return `RiverFlow Agent: Đã xóa toàn bộ nhánh "${lbl}"`
      }
      if (/Pruned labels:/i.test(s)) {
        const rest = s.replace(/.*Pruned labels:\s*/i, '')
        return `RiverFlow Agent: Đã xóa nhánh: ${rest}`
      }
      if (/Edited label of node\s+/i.test(s)) return 'RiverFlow Agent: Đã cập nhật tên node'
      if (/Updated description/i.test(s)) return 'RiverFlow Agent: Đã cập nhật mô tả mindmap'
      if (/Replace:\s*rebuilt structure with\s*(\d+)/i.test(s)) {
        const m = s.match(/Replace:\s*rebuilt structure with\s*(\d+)/i)
        return `RiverFlow Agent: Đã tạo lại cấu trúc gồm ${m?.[1] || '0'} node`
      }
      if (/Expand:\s*added\s*(\d+)/i.test(s)) {
        const m = s.match(/Expand:\s*added\s*(\d+)/i)
        return `RiverFlow Agent: Đã thêm ${m?.[1] || '0'} node mới`
      }
      return `RiverFlow Agent: ${s}`
    }

    const onMsg = (msg: any) => {
      const isAgent = typeof msg === 'string' || msg?.from === 'agent' || (!!msg?.message && !msg?.clientId)
      if (isAgent) {
        const raw = typeof msg === 'string' ? msg : (msg?.message || '')

        // Skip AI streaming content - it's shown in the modal
        if (raw.includes('```json') || raw.includes('"targetType"') || raw.includes('"ops"')) {
          return
        }

        // Skip technical logs - they're not user-friendly
        if (/Agent:|Generate:|Pruned|Edited|Updated|Replace:|Expand:|Node not found|Added node|Updated node|Deleted node/i.test(raw)) {
          return
        }

        // Only show simple, friendly AI messages
        const text = normalizeAgentText(raw)
        const now = new Date().toISOString()
        const agentMsg: ChatMessage = {
          id: `agent-${Date.now()}`,
          room: '',
          clientId: 'agent',
          userId: null,
          name: 'RiverFlow Agent',
          color: '#8b5cf6',
          avatar: null,
          message: text,
          createdAt: now,
          from: 'agent',
        }
        setMessages((prev) => {
          const next = [...prev, agentMsg]
          return next.length > 500 ? next.slice(next.length - 500) : next
        })
      } else {
        setMessages((prev) => {
          const next = [...prev, msg as ChatMessage]
          return next.length > 500 ? next.slice(next.length - 500) : next
        })
      }
      setTimeout(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
      }, 10)
    }
    s.on('chat:message', onMsg)
    const onAgentTyping = (data: any) => { setAgentTyping(!!data?.isTyping) }
    s.on('agent:typing', onAgentTyping)
    const onTyping = (data: any) => {
      const c = data?.clientId
      const isTyping = !!data?.isTyping
      if (!c) return
      setTypingUsers((prev) => {
        const next = { ...prev }
        if (isTyping) {
          next[c] = { clientId: c, userId: data?.userId || null, name: data?.name || 'Anonymous', color: data?.color || '#3b82f6', avatar: data?.avatar || null }
        } else {
          delete next[c]
        }
        return next
      })
    }
    s.on('chat:typing', onTyping)
    return () => { s.off('chat:message', onMsg); s.off('chat:typing', onTyping); s.off('agent:typing', onAgentTyping) }
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isResizing) return
      const dx = e.clientX - resizeStart.x
      const dy = e.clientY - resizeStart.y
      setSize({ width: Math.max(320, resizeStart.width + dx), height: Math.max(260, resizeStart.height + dy) })
    }
    const onUp = () => setIsResizing(false)
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [isResizing, resizeStart])

  if (!isOpen) return null
  if (!mindmap) return null

  const room = `mindmap:${mindmap.id}`
  const socket = getSocket()
  const myId = socket.id

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.resize-handle')) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      e.stopPropagation()
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
    }
  }

  const handleMouseUp = () => { setIsDragging(false) }

  const handleResizeStart = (e: React.MouseEvent) => {
    setIsResizing(true)
    setResizeStart({ x: e.clientX, y: e.clientY, width: size.width, height: size.height })
    e.stopPropagation()
  }



  const send = () => {
    const text = input.trim()
    if (!text) return
    socket.emit('chat:message', room, { text })
    socket.emit('chat:typing', room, { isTyping: false })
    setInput("")
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') send()
  }

  return (
    <div
      ref={panelRef}
      className="fixed rounded-lg border border-border bg-card shadow-2xl backdrop-blur-sm bg-card/95 overflow-hidden z-50 pointer-events-auto"
      style={{ transform: `translate(${position.x}px, ${position.y}px)`, width: `${size.width}px`, height: `${size.height}px`, cursor: isDragging ? 'grabbing' : 'default' }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="sticky top-0 flex items-center justify-between p-3 border-b border-border bg-card/50 backdrop-blur-sm cursor-grab active:cursor-grabbing hover:bg-card/70 transition-colors flex-shrink-0 gap-2" onMouseDown={handleMouseDown}>
        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <h3 className="text-sm font-semibold text-foreground flex-1 min-w-0">Chat</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 flex-shrink-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col" style={{ height: `calc(100% - 45px)` }}>
        <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-2">
          {messages.map((m) => {
            const isMine = m.clientId === myId
            const isAgent = m.from === 'agent' || m.name === 'RiverFlow Agent' || m.clientId === 'agent'
            return (
              <div key={m.id} className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`} title={new Date(m.createdAt).toLocaleTimeString()}>
                {!isMine && !isAgent && (
                  <div className="inline-flex items-center justify-center w-7 h-7 rounded-full overflow-hidden border border-border">
                    {m.avatar ? (
                      <img src={getAvatarUrl(m.avatar) || ''} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-[11px] font-semibold" style={{ color: '#fff', backgroundColor: m.color }}>{(m.name || 'A').slice(0, 1).toUpperCase()}</span>
                    )}
                  </div>
                )}
                <div className={`max-w-[70%] px-1 py-0`}>
                  {isAgent ? <div className="text-[11px] text-muted-foreground mb-1">RiverFlow Agent</div> : null}
                  <div className={`rounded-lg px-3 py-2 shadow-sm ${isMine ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                    {!isAgent ? (
                      <div className="text-[10px] opacity-70 mb-1 flex items-center gap-1">
                        <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: m.color }}></span>
                        <span>{isMine ? 'You' : m.name || 'Anonymous'}</span>
                      </div>
                    ) : null}
                    <div className="text-sm break-words whitespace-pre-wrap overflow-hidden" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{m.message}</div>
                  </div>
                </div>
                {isMine && (
                  <div className="inline-flex items-center justify-center w-7 h-7 rounded-full overflow-hidden border border-border">
                    {m.avatar ? (
                      <img src={getAvatarUrl(m.avatar) || ''} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-[11px] font-semibold" style={{ color: '#fff', backgroundColor: m.color }}>{(m.name || 'Y').slice(0, 1).toUpperCase()}</span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          {agentTyping ? (
            <div className="flex justify-start">
              <div className="max-w-[70%] px-1 py-0">
                <div className="text-[11px] text-muted-foreground mb-1">RiverFlow Agent</div>
                <div className="rounded-lg px-3 py-2 shadow-sm bg-muted text-foreground inline-flex items-center gap-2">
                  <div className="flex items-end gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '200ms' }} />
                    <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '400ms' }} />
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="p-3 border-t border-border">
          {Object.keys(typingUsers).length > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex -space-x-2">
                {Object.values(typingUsers).map((u) => (
                  <div key={u.clientId} className="inline-flex items-center justify-center w-6 h-6 rounded-full border-2 border-card bg-muted text-[10px] overflow-hidden">
                    {u.avatar ? (
                      <img src={getAvatarUrl(u.avatar) || ''} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-semibold" style={{ color: '#fff', backgroundColor: u.color, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {(u.name || 'A').slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">...</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                socket.emit('chat:typing', room, { isTyping: true })
                if (stopTimerRef.current) clearTimeout(stopTimerRef.current)
                stopTimerRef.current = setTimeout(() => {
                  socket.emit('chat:typing', room, { isTyping: false })
                }, 1200)
              }}
              onBlur={() => {
                socket.emit('chat:typing', room, { isTyping: false })
              }}
              onKeyDown={onKeyDown}
              placeholder="Nhập tin nhắn..."
            />
            <EmojiPicker onPick={(em) => { socket.emit('chat:message', room, { text: em }); socket.emit('chat:typing', room, { isTyping: false }) }} />
            <Button onClick={send} className="h-9 w-9" variant="default" title="Gửi">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize hover:bg-primary/50 transition-colors" onMouseDown={handleResizeStart} title="Drag to resize" />
    </div>
  )
}
