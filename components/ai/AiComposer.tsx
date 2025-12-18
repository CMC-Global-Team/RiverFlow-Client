"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { ArrowUp, ChevronDown, Coins, Plus, Sliders, MessageSquare, Upload, X } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { optimizeMindmapByAI } from "@/services/mindmap/mindmap.service"
import { type ThinkingModeRequest } from "@/services/ai/ai.service"
import { useAuth } from "@/hooks/auth/useAuth"
import { getUserProfile } from "@/services/auth/update-user.service"
import { getSocket } from "@/lib/realtime"
import type { MindmapResponse } from "@/types/mindmap.types"
import { useTranslation } from "react-i18next"

import { useMindmapContext } from "@/contexts/mindmap/MindmapContext"

function Draggable({ children, initialPos, handle }: { children: React.ReactNode; initialPos?: { x: number; y: number }; handle?: string }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [dragging, setDragging] = useState(false)
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const widthRef = useRef<number>(720)

  useEffect(() => {
    const place = () => {
      const w = widthRef.current
      if (initialPos) {
        setPos(initialPos)
      } else {
        const x = Math.max(16, Math.round((window.innerWidth - w) / 2))
        const y = Math.max(16, window.innerHeight - 120)
        setPos({ x, y })
      }
    }
    place()
    const r = () => place()
    window.addEventListener("resize", r)
    return () => window.removeEventListener("resize", r)
  }, [initialPos])

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!ref.current) return
      const target = e.target as HTMLElement
      if (!ref.current.contains(target)) return
      if (handle && !target.closest(handle)) return
      const tag = target.tagName
      const interactive = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tag === "BUTTON" || target.isContentEditable || !!target.closest('[data-drag-ignore]')
      if (interactive) return
      const rect = ref.current.getBoundingClientRect()
      setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      setDragging(true)
    }
    const onMove = (e: MouseEvent) => {
      if (!dragging) return
      setPos({ x: e.clientX - offset.x, y: e.clientY - offset.y })
    }
    const onUp = () => setDragging(false)
    window.addEventListener("mousedown", onDown)
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => {
      window.removeEventListener("mousedown", onDown)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
  }, [dragging, offset.x, offset.y])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    widthRef.current = el.getBoundingClientRect().width
  })

  return (
    <div ref={ref} className="fixed z-50 pointer-events-auto" style={{ left: pos.x, top: pos.y }}>
      {children}
    </div>
  )
}

export default function AiComposer({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const { t } = useTranslation("ai")
  const [mode, setMode] = useState<"normal" | "thinking" | "max">("normal")
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const modeLabel = mode === "max" ? t("mode.max") : mode === "thinking" ? t("mode.thinking") : t("mode.normal")
  const [chatOpen, setChatOpen] = useState(defaultOpen)
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string; mode?: "normal" | "thinking" | "max"; streaming?: boolean }[]>([])
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [lastResult, setLastResult] = useState<MindmapResponse | null>(null)
  const [structureType, setStructureType] = useState<"mindmap" | "logic" | "brace" | "org" | "tree" | "timeline" | "fishbone">("mindmap")
  const [langPref, setLangPref] = useState<"auto" | "vi" | "en">("auto")
  const [streamingText, setStreamingText] = useState<string>("")
  const { mindmap, nodes, edges, selectedNode, setFullMindmapState, saveMindmap, applyStreamingAdditions, updateNodeData, deleteNode, loadMindmap } = useMindmapContext()
  const { user, updateUser } = useAuth()

  // Check if user can use AI
  // Must be logged in AND have editor/owner role
  const canUseAI = user && mindmap && (
    mindmap.mysqlUserId === user.userId ||
    mindmap.collaborators?.some(c =>
      c.mysqlUserId === user.userId &&
      c.status === 'accepted' &&
      c.role === 'EDITOR'
    )
  )

  // Hide AIComposer if user doesn't have permission
  if (!canUseAI) {
    return null
  }

  const handleUploadClick = () => fileInputRef.current?.click()

  const detectLang = () => {
    if (typeof document !== 'undefined') {
      const htmlLang = document.documentElement.lang
      if (htmlLang) return htmlLang
    }
    if (typeof navigator !== 'undefined') {
      const n = navigator.language || ''
      if (n.toLowerCase().startsWith('vi')) return 'vi'
      if (n.toLowerCase().startsWith('en')) return 'en'
    }
    return 'vi'
  }

  const shouldReplace = (s: string) => {
    const t = (s || '').toLowerCase()
    return /(sửa lại|đổi|thay|chuyển sang|thành|replace|change to|update to)/.test(t)
  }

  // Removed inferTargetType - backend AI now decides dynamically

  const buildContextHint = () => {
    const ns = Array.isArray(nodes) ? nodes : []
    const es = Array.isArray(edges) ? edges : []
    const inMap = new Map<string, number>()
    es.forEach(e => { const t = String((e as any).target || ''); if (t) inMap.set(t, (inMap.get(t) || 0) + 1) })
    const rootNode = ns.find(n => !inMap.has(String(n.id))) || ns[0]
    const rootLabel = String(rootNode?.data?.label || rootNode?.id || '')
    const children = ns.filter(n => es.some(e => String((e as any).source || '') === String(rootNode?.id) && String((e as any).target || '') === String(n.id)))
      .map(n => String(n?.data?.label || n.id)).slice(0, 12)
    return `context: root=${rootLabel}; top-level=${children.join(', ')}; nodeCount=${ns.length};`
  }

  // Typewriter effect refs
  const streamingBufferRef = useRef("")
  const displayedTextRef = useRef("")
  const isStreamingRef = useRef(false)
  const animationFrameRef = useRef<number>()
  const lastFrameTimeRef = useRef(0)
  const streamTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const isActionListAnimatingRef = useRef(false) // Prevent handleThinkingDone from interrupting Action Plan
  const isThinkingModeRef = useRef(false) // Track if we're in Thinking Mode
  const finalResponseBufferRef = useRef("") // Separate buffer for final response in thinking mode
  const thinkingAnalysisTextRef = useRef("") // Save thinking analysis text

  // Animation loop for smooth typewriter effect
  const animateTypewriter = useCallback((time: number) => {
    if (!isStreamingRef.current && displayedTextRef.current.length === streamingBufferRef.current.length) {
      return // Stop if done and fully displayed
    }

    const delta = time - lastFrameTimeRef.current
    // Target ~30-50ms per character for natural reading speed, or faster if buffer is large
    // If buffer is huge (>50 chars ahead), speed up to catch up
    const bufferDiff = streamingBufferRef.current.length - displayedTextRef.current.length
    const speed = bufferDiff > 50 ? 5 : bufferDiff > 20 ? 15 : 30

    if (delta >= speed && bufferDiff > 0) {
      // Add next character(s)
      const charsToAdd = bufferDiff > 100 ? 5 : bufferDiff > 50 ? 3 : 1
      const nextChars = streamingBufferRef.current.substring(
        displayedTextRef.current.length,
        displayedTextRef.current.length + charsToAdd
      )

      displayedTextRef.current += nextChars
      lastFrameTimeRef.current = time

      // Update UI
      setMessages((prev) => {
        const newMsgs = [...prev]
        const lastMsg = newMsgs[newMsgs.length - 1]
        if (lastMsg && lastMsg.streaming) {
          lastMsg.text = displayedTextRef.current
        }
        return newMsgs
      })
    }

    animationFrameRef.current = requestAnimationFrame(animateTypewriter)
  }, [])

  // Setup WebSocket listeners for AI streaming
  useEffect(() => {
    if (!mindmap?.id && !user?.userId) return

    const socket = getSocket()

    // Join both mindmap room (if exists) and user room for AI events
    if (mindmap?.id) {
      console.log('[AIComposer] Joining mindmap room:', mindmap.id)
      socket.emit('mindmap:join', { mindmapId: mindmap.id })
    }
    if (user?.userId) {
      console.log('[AIComposer] Joining user room:', `user:${user.userId}`)
      socket.emit('mindmap:join', { mindmapId: `user:${user.userId}` })
    }

    // Start typewriter animation
    const startTypewriter = () => {
      if (streamTimeoutRef.current) clearTimeout(streamTimeoutRef.current)
      isStreamingRef.current = true
      streamingBufferRef.current = ""
      displayedTextRef.current = ""
      lastFrameTimeRef.current = 0
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = requestAnimationFrame(animateTypewriter)
    }

    // Normal/Max mode streaming
    const handleStreamStart = () => {
      console.log('[AIComposer] Stream start event received')

      // In Thinking Mode, DON'T create a new message yet - wait for actionlist to handle it
      if (isThinkingModeRef.current) {
        console.log('[AIComposer] In Thinking Mode - deferring stream message creation to actionlist handler')
        finalResponseBufferRef.current = "" // Reset buffer for final response
        return
      }

      setStreamingText("")
      setMessages((m: typeof messages) => [...m, { role: 'assistant', text: '', streaming: true }])
      startTypewriter()
    }

    const handleStreamChunk = (data: { chunk: string; done: boolean }) => {
      console.log('[AIComposer] Stream chunk received:', data.chunk.substring(0, 50) + '...')

      // In Thinking Mode, append to separate final response buffer
      if (isThinkingModeRef.current) {
        finalResponseBufferRef.current += data.chunk
        // Also append to streaming buffer if we're animating the final response
        if (!isActionListAnimatingRef.current) {
          streamingBufferRef.current += data.chunk
        }
        return
      }

      // Normal mode - append to main buffer
      streamingBufferRef.current += data.chunk
    }

    const handleStreamDone = () => {
      console.log('[AIComposer] Stream done event received')

      // In Thinking Mode, finalize the final response message
      if (isThinkingModeRef.current) {
        console.log('[AIComposer] Thinking Mode final response done')
        isThinkingModeRef.current = false // Reset thinking mode flag

        if (streamTimeoutRef.current) clearTimeout(streamTimeoutRef.current)

        streamTimeoutRef.current = setTimeout(() => {
          // Force completion
          setMessages((m) => {
            const newMsgs = [...m]
            const lastMsg = newMsgs[newMsgs.length - 1]
            if (lastMsg && lastMsg.streaming) {
              lastMsg.text = streamingBufferRef.current || finalResponseBufferRef.current
              delete lastMsg.streaming
            }
            return newMsgs
          })
          isStreamingRef.current = false
          isActionListAnimatingRef.current = false
          setStreamingText("")
        }, 1000)
        return
      }

      // Normal mode
      if (streamTimeoutRef.current) clearTimeout(streamTimeoutRef.current)

      streamTimeoutRef.current = setTimeout(() => {
        // Force completion if stuck
        if (displayedTextRef.current !== streamingBufferRef.current) {
          displayedTextRef.current = streamingBufferRef.current
          setMessages((m) => {
            const newMsgs = [...m]
            const lastMsg = newMsgs[newMsgs.length - 1]
            if (lastMsg && lastMsg.streaming) {
              lastMsg.text = displayedTextRef.current
              delete lastMsg.streaming
            }
            return newMsgs
          })
        } else {
          setMessages((m) => {
            const newMsgs = [...m]
            const lastMsg = newMsgs[newMsgs.length - 1]
            if (lastMsg && lastMsg.streaming) {
              delete lastMsg.streaming
            }
            return newMsgs
          })
        }
        isStreamingRef.current = false
        setStreamingText("")
      }, 1000) // Give it 1s to finish animating
    }

    const handleStreamError = (data: { error: string }) => {
      console.error('[AIComposer] Stream error:', data.error)
      isStreamingRef.current = false
      isThinkingModeRef.current = false
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      setMessages((m: typeof messages) => [...m, { role: 'assistant', text: `${t('error.generic', 'Error')}: ${data.error}` }])
      setStreamingText("")
    }

    // Thinking mode streaming
    const handleThinkingStart = () => {
      console.log('[AIComposer] Thinking Mode stream start event received')
      isThinkingModeRef.current = true // Mark that we're in Thinking Mode
      thinkingAnalysisTextRef.current = "" // Reset
      finalResponseBufferRef.current = "" // Reset
      setStreamingText("")
      setMessages((m: typeof messages) => [...m, { role: 'assistant', text: '', streaming: true }])
      startTypewriter()
    }

    const handleThinkingChunk = (data: { chunk: string; done: boolean }) => {
      console.log('[AIComposer] Thinking Mode chunk received:', data.chunk.substring(0, 50) + '...')
      streamingBufferRef.current += data.chunk
      thinkingAnalysisTextRef.current += data.chunk // Save thinking analysis
    }

    const handleThinkingDone = (data: { fullText: string }) => {
      console.log('[AIComposer] Thinking Mode stream done event received')

      // IMPORTANT: If Action Plan is animating, don't interrupt it!
      // The actionlist event will handle its own completion
      if (isActionListAnimatingRef.current) {
        console.log('[AIComposer] Skipping handleThinkingDone - Action Plan is animating')
        return
      }

      // If we haven't received actionlist yet, just finalize thinking analysis
      if (streamTimeoutRef.current) clearTimeout(streamTimeoutRef.current)

      streamTimeoutRef.current = setTimeout(() => {
        if (displayedTextRef.current !== streamingBufferRef.current) {
          displayedTextRef.current = streamingBufferRef.current
          setMessages((m) => {
            const newMsgs = [...m]
            const lastMsg = newMsgs[newMsgs.length - 1]
            if (lastMsg && lastMsg.streaming) {
              lastMsg.text = displayedTextRef.current
              delete lastMsg.streaming
            }
            return newMsgs
          })
        } else {
          setMessages((m) => {
            const newMsgs = [...m]
            const lastMsg = newMsgs[newMsgs.length - 1]
            if (lastMsg && lastMsg.streaming) {
              delete lastMsg.streaming
            }
            return newMsgs
          })
        }
        isStreamingRef.current = false
        setStreamingText("")
      }, 1000)
    }

    const handleThinkingError = (data: { error: string }) => {
      console.error('[AIComposer] Thinking Mode stream error:', data.error)
      isStreamingRef.current = false
      isThinkingModeRef.current = false
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      setMessages((m: typeof messages) => [...m, { role: 'assistant', text: `${t('error.genericThinking', 'Error Thinking Mode')}: ${data.error}` }])
      setStreamingText("")
    }

    const handleThinkingActionList = (data: { text: string; actions: string[] }) => {
      console.log('[AIComposer] Thinking Mode action list received:', data)

      // Mark that we're now animating the action list
      isActionListAnimatingRef.current = true

      // Clear any pending timeout
      if (streamTimeoutRef.current) clearTimeout(streamTimeoutRef.current)

      // Step 1: Finalize the thinking analysis message (message 1)
      const savedThinkingText = thinkingAnalysisTextRef.current || streamingBufferRef.current
      setMessages((m) => {
        const newMsgs = [...m]
        // Find the last streaming message (should be thinking analysis)
        const lastMsg = newMsgs[newMsgs.length - 1]
        if (lastMsg && lastMsg.streaming) {
          lastMsg.text = savedThinkingText
          delete lastMsg.streaming
        }
        return newMsgs
      })

      // Step 2: Add Action Plan message (message 2) - show instantly for now
      setMessages((m: typeof messages) => [...m, { role: 'assistant', text: data.text }])

      // Step 3: Add Final Response message (message 3) - streaming
      setMessages((m: typeof messages) => [...m, { role: 'assistant', text: '', streaming: true }])

      // Reset typewriter for final response
      isStreamingRef.current = true
      streamingBufferRef.current = finalResponseBufferRef.current // Use accumulated final response
      displayedTextRef.current = ""
      lastFrameTimeRef.current = 0
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = requestAnimationFrame(animateTypewriter)
    }

    // Register all listeners
    socket.on('ai:stream:start', handleStreamStart)
    socket.on('ai:stream:chunk', handleStreamChunk)
    socket.on('ai:stream:done', handleStreamDone)
    socket.on('ai:stream:error', handleStreamError)
    socket.on('ai:thinking:start', handleThinkingStart)
    socket.on('ai:thinking:chunk', handleThinkingChunk)
    socket.on('ai:thinking:done', handleThinkingDone)
    socket.on('ai:thinking:error', handleThinkingError)
    socket.on('ai:thinking:actionlist', handleThinkingActionList)

    return () => {
      isStreamingRef.current = false
      isThinkingModeRef.current = false
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      if (streamTimeoutRef.current) clearTimeout(streamTimeoutRef.current)

      socket.off('ai:stream:start', handleStreamStart)
      socket.off('ai:stream:chunk', handleStreamChunk)
      socket.off('ai:stream:done', handleStreamDone)
      socket.off('ai:stream:error', handleStreamError)
      socket.off('ai:thinking:start', handleThinkingStart)
      socket.off('ai:thinking:chunk', handleThinkingChunk)
      socket.off('ai:thinking:done', handleThinkingDone)
      socket.off('ai:thinking:error', handleThinkingError)
      socket.off('ai:thinking:actionlist', handleThinkingActionList)
    }
  }, [mindmap?.id, user?.userId, animateTypewriter, t])

  // Removed composeAgentPlan - backend AI handles all planning

  const sendPrompt = async (text: string) => {
    setChatOpen(true)
    setLoading(true)
    setMessages((m) => [...m, { role: 'user', text, mode }])
    try {
      const lang = detectLang()
      if (mindmap?.id) {
        const s = getSocket()
        s.emit('agent:typing', { isTyping: true })
        const modeLabel = mode
        const levels = modeLabel === 'max' ? 4 : modeLabel === 'thinking' ? 3 : 2
        const firstLevelCount = modeLabel === 'max' ? 6 : modeLabel === 'thinking' ? 5 : 4
        // Removed client-side agentPlan - backend AI handles all planning

        const effectiveLang = (langPref === 'auto' ? lang : langPref) || 'vi'

        // All modes now use the same backend API
        // Thinking Mode is handled server-side automatically
        const payload: any = {
          mindmapId: mindmap.id,
          targetType: 'auto', // Let backend AI decide dynamically
          nodeId: selectedNode ? selectedNode.id : undefined,
          language: effectiveLang,
          mode: mode, // Pass mode to backend (thinking/normal/max)
          hints: text ? [text, buildContextHint()] : undefined,
          levels,
          firstLevelCount,
          structureType,
        }
        const result = await optimizeMindmapByAI(payload)
        setLastResult(result)
        // Streaming responses are handled by WebSocket listeners above
        // AI natural language is streamed directly to modal - no processing needed here

        // CRITICAL FIX: Always reload mindmap after AI operations to prevent race condition
        // Problem: Client's auto-save (1.5s after changes) was overwriting AI changes
        // because client had stale state. This affected update_node, delete_node, add_node.
        // Solution: Always reload from DB to sync state before auto-save triggers.
        console.log('[AI Composer] Reloading mindmap after AI operation to sync state')
        if (mindmap?.id) {
          await loadMindmap(mindmap.id)
        }
      } else {
        const msg = t('error.noMindmap')
        setMessages((m) => [...m, { role: 'assistant', text: msg }])
      }
    } catch (err: any) {
      const code = err?.response?.data?.error?.code || 'ERROR'
      const message = err?.response?.data?.error?.message || err?.message || t('error.createFailed')
      const hints: string[] | undefined = err?.response?.data?.error?.hints
      const hintStr = hints && hints.length ? `\n${t('error.hint')}: ${hints.join(' • ')}` : ''
      setMessages((m) => [...m, { role: 'assistant', text: `${t('errorGeneric', 'Error')} (${code}): ${message}${hintStr}` }])
    } finally {
      try {
        const s = getSocket()
        s.emit('agent:typing', { isTyping: false })
      } catch { }

      // Refresh credit balance after AI operation
      try {
        const profile = await getUserProfile()
        if (user) {
          updateUser({ ...user, credit: Number(profile.credit || 0) })
        }
      } catch { }

      setLoading(false)
    }
  }

  return (
    <>
      <Draggable>
        <div className="rounded-2xl border bg-background shadow-md">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="size-8 rounded-lg" onClick={handleUploadClick}>
                <Plus className="size-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8 rounded-lg">
                    <Sliders className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[260px] p-2 bg-background shadow-md border rounded-xl">
                  <DropdownMenuLabel>{t('settings')}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <span>{t('structure')}</span>
                      <span className="ml-auto text-muted-foreground">
                        {structureType === "mindmap" ? "Mind Map" : structureType === "logic" ? "Logic Chart" : structureType === "brace" ? "Brace Map" : structureType === "org" ? "Org Chart" : structureType === "tree" ? "Tree Chart" : structureType === "timeline" ? "Timeline" : "Fishbone"}
                      </span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="min-w-[240px] p-2 bg-background shadow-md border rounded-lg">
                      <DropdownMenuRadioGroup value={structureType} onValueChange={(v) => setStructureType(v as any)}>
                        <DropdownMenuRadioItem value="mindmap">Mind Map</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="logic">Logic Chart</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="brace">Brace Map</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="org">Org Chart</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="tree">Tree Chart</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="timeline">Timeline</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="fishbone">Fishbone</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <span>{t('language')}</span>
                      <span className="ml-auto text-muted-foreground">
                        {langPref === "auto" ? t('auto') : langPref === "vi" ? t('vietnamese') : t('english')}
                      </span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="min-w-[200px] p-2 bg-background shadow-md border rounded-lg">
                      <DropdownMenuRadioGroup value={langPref} onValueChange={(v) => setLangPref(v as any)}>
                        <DropdownMenuRadioItem value="auto">{t('auto')}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="vi">{t('vietnamese')}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="en">{t('english')}</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon" className="size-8 rounded-lg" onClick={() => setChatOpen(true)}>
                <MessageSquare className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="size-8 rounded-lg" onClick={handleUploadClick}>
                <Upload className="size-4" />
              </Button>

              <input ref={fileInputRef} type="file" className="hidden" />
            </div>
            <Textarea
              placeholder={t("inputPlaceholder")}
              className="flex-1 min-h-10 max-h-24 rounded-xl bg-background/40 border-muted/50 resize-none overflow-y-auto"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  const t = inputValue.trim()
                  if (!t || loading) return
                  setInputValue("")
                  void sendPrompt(t)
                }
              }}
              rows={1}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 rounded-xl px-3 gap-1">
                  {modeLabel}
                  <ChevronDown className="size-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setMode("normal")}>
                  <span className="flex-1">{t('mode.normal')}</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    -1
                    <Coins className="size-4" />
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setMode("thinking")}>
                  <span className="flex-1">{t('mode.thinking')}</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    -3
                    <Coins className="size-4" />
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setMode("max")}>
                  <span className="flex-1">{t('mode.max')}</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    -5
                    <Coins className="size-4" />
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="ml-1 inline-flex items-center gap-1 px-2 h-8 rounded-lg border bg-muted">
              <Coins className="size-4 text-yellow-500" />
              <span className="text-sm">{Number(user?.credit || 0)}</span>
            </div>
            <Button size="icon" className="size-10 rounded-xl" disabled={loading} onClick={() => {
              const t = inputValue.trim()
              if (!t || loading) return
              setInputValue("")
              void sendPrompt(t)
            }}>
              {loading ? <span className="animate-pulse text-xs">...</span> : <ArrowUp className="size-4" />}
            </Button>
          </div>
        </div>
      </Draggable>

      {chatOpen ? (
        <Draggable
          initialPos={{ x: Math.max(16, window.innerWidth - 420 - 16), y: Math.max(16, Math.round(window.innerHeight / 6)) }}
          handle=".draggable-handle"
        >
          <div className="w-[420px] rounded-2xl border bg-card dark:bg-card text-card-foreground shadow-xl ring-1 ring-border">
            <div className="draggable-handle flex items-center justify-between gap-2 px-3 py-2 border-b cursor-move">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{t('conversation')}</span>
                <span className="text-xs px-2 py-1 rounded bg-muted">{modeLabel}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)} title="Đóng">
                <X className="size-4" />
              </Button>
            </div>
            <ScrollArea className="h-[360px] p-3">
              <div className="space-y-4">
                {messages.map((m, i) => (
                  <div key={i} className={m.role === "user" ? "flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300" : "flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300"}>
                    <div className="flex flex-col items-start gap-1">
                      {m.role !== "user" ? (
                        <div className="text-[11px] text-muted-foreground">{t('agentName')}</div>
                      ) : null}
                      <div className={m.role === "user" ? "max-w-[80%] rounded-xl bg-primary text-primary-foreground px-3 py-2 shadow-sm" : "max-w-[80%] rounded-xl bg-muted px-3 py-2 shadow-sm"}>
                        <div className="whitespace-pre-wrap" style={{ whiteSpace: 'pre-wrap' }}>
                          {m.text ? m.text.split('\n').map((line, idx) => (
                            <div key={idx}>
                              {line.startsWith('**') && line.endsWith('**') ? (
                                <strong>{line.slice(2, -2)}</strong>
                              ) : line.startsWith('- ') ? (
                                <div className="ml-2">• {line.slice(2)}</div>
                              ) : (
                                line || <br />
                              )}
                            </div>
                          )) : (
                            m.streaming ? (
                              <span className="inline-flex items-center gap-1">
                                <span className="size-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms', animationDuration: '600ms' }}></span>
                                <span className="size-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms', animationDuration: '600ms' }}></span>
                                <span className="size-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms', animationDuration: '600ms' }}></span>
                              </span>
                            ) : null
                          )}
                        </div>
                      </div>
                      {m.role === "user" && m.mode ? (
                        <div className="text-[11px] text-muted-foreground">
                          {m.mode === "max" && t('mode.max')}
                          {m.mode === "thinking" && t('mode.thinking')}
                          {m.mode === "normal" && t('mode.normal')}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
                {messages.length === 0 ? (
                  <div className="text-muted-foreground text-sm">{t('noMessages')}</div>
                ) : null}
              </div>
            </ScrollArea>
          </div>
        </Draggable>
      ) : null}
    </>
  )
}
