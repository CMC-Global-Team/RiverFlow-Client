"use client"

import { Suspense, useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { ReactFlowProvider } from "reactflow"
import { MindmapProvider, useMindmapContext } from "@/contexts/mindmap/MindmapContext"
import Canvas from "@/components/editor/canvas"
import { getEmbedMindmap } from "@/services/mindmap/mindmap.service"
import { Loader2, AlertCircle, Code } from "lucide-react"
import { MindmapResponse } from "@/types/mindmap.types"

function EmbedInner() {
    const searchParams = useSearchParams()
    const embedToken = searchParams.get('token')
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [mindmapTitle, setMindmapTitle] = useState<string>('')
    const [ownerName, setOwnerName] = useState<string>('')
    const dataLoadedRef = useRef(false)

    const { setAutoSaveEnabled, setFullMindmapState } = useMindmapContext()

    // Disable auto-save immediately - embed is read-only
    useEffect(() => {
        setAutoSaveEnabled(false)
    }, [setAutoSaveEnabled])

    useEffect(() => {
        // Prevent double loading
        if (dataLoadedRef.current) return

        const loadEmbedMindmap = async () => {
            if (!embedToken) {
                setError('Token không hợp lệ')
                setIsLoading(false)
                return
            }

            try {
                const mindmapData = await getEmbedMindmap(embedToken)

                // Set title and owner for display
                setMindmapTitle(mindmapData.title || 'Untitled Mindmap')
                setOwnerName(mindmapData.ownerName || '')

                // Create a modified mindmap without id to prevent socket connection
                // The MindmapContext only joins socket when mindmap.id exists
                const embedData: MindmapResponse = {
                    ...mindmapData,
                    id: '', // Empty id prevents socket connection
                }

                setFullMindmapState(embedData)
                dataLoadedRef.current = true
                setError(null)
            } catch (err: any) {
                console.error('Error loading embed mindmap:', err)
                if (err.response?.status === 403) {
                    setError('Tính năng nhúng đã bị tắt cho mindmap này')
                } else if (err.response?.status === 404) {
                    setError('Mindmap không tồn tại')
                } else {
                    setError('Không thể tải mindmap')
                }
            } finally {
                setIsLoading(false)
            }
        }

        loadEmbedMindmap()
    }, [embedToken, setFullMindmapState])

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Đang tải mindmap...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3 text-center p-6 max-w-md">
                    <div className="rounded-full bg-destructive/10 p-3">
                        <AlertCircle className="h-8 w-8 text-destructive" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">
                        Không thể tải Mindmap
                    </h2>
                    <p className="text-sm text-muted-foreground">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen w-full flex flex-col overflow-hidden bg-background">
            {/* Minimal header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background/80 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                        {mindmapTitle}
                    </span>
                </div>
                {ownerName && (
                    <span className="text-xs text-muted-foreground">
                        by {ownerName}
                    </span>
                )}
            </div>

            {/* Canvas - Read-only */}
            <div className="flex-1 overflow-hidden">
                <Canvas readOnly={true} hidePresence={true} />
            </div>

            {/* Powered by footer */}
            <div className="flex items-center justify-center py-1.5 border-t border-border bg-background/80 backdrop-blur-sm">
                <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                    Powered by <span className="font-semibold text-primary">RiverFlow</span>
                </a>
            </div>
        </div>
    )
}

function EmbedContent() {
    return (
        <ReactFlowProvider>
            <MindmapProvider>
                <EmbedInner />
            </MindmapProvider>
        </ReactFlowProvider>
    )
}

export default function EmbedPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <EmbedContent />
        </Suspense>
    )
}


