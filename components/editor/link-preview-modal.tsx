"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink, X, GripHorizontal, AlertCircle, Globe } from "lucide-react"

interface LinkPreviewModalProps {
    isOpen: boolean
    onClose: () => void
    url: string
    nodeLabel?: string
    position?: { x: number; y: number }
}

export default function LinkPreviewModal({
    isOpen,
    onClose,
    url,
    nodeLabel,
    position = { x: 100, y: 100 },
}: LinkPreviewModalProps) {
    const [hasError, setHasError] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [modalPosition, setModalPosition] = useState({ x: position.x, y: position.y })
    const dragStartRef = useRef({ x: 0, y: 0 })
    const modalRef = useRef<HTMLDivElement>(null)

    // Reset position when modal opens
    useEffect(() => {
        if (isOpen) {
            // Center the modal near the click position but ensure it's visible
            const modalWidth = 450
            const modalHeight = 350
            const padding = 20

            let x = position.x - modalWidth / 2
            let y = position.y - modalHeight / 2

            // Ensure modal stays within viewport
            x = Math.max(padding, Math.min(x, window.innerWidth - modalWidth - padding))
            y = Math.max(padding, Math.min(y, window.innerHeight - modalHeight - padding))

            setModalPosition({ x, y })
            setHasError(false)
        }
    }, [isOpen, position])

    const handleOpenInNewTab = () => {
        window.open(url, '_blank', 'noopener,noreferrer')
    }

    const handleIframeError = () => {
        setHasError(true)
    }

    // Drag handlers
    const handleDragStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        setIsDragging(true)
        dragStartRef.current = {
            x: e.clientX - modalPosition.x,
            y: e.clientY - modalPosition.y,
        }
    }, [modalPosition])

    useEffect(() => {
        if (!isDragging) return

        const handleMouseMove = (e: MouseEvent) => {
            const newX = e.clientX - dragStartRef.current.x
            const newY = e.clientY - dragStartRef.current.y

            // Keep modal within viewport
            const padding = 20
            const modalWidth = modalRef.current?.offsetWidth || 450
            const modalHeight = modalRef.current?.offsetHeight || 350

            setModalPosition({
                x: Math.max(padding, Math.min(newX, window.innerWidth - modalWidth - padding)),
                y: Math.max(padding, Math.min(newY, window.innerHeight - modalHeight - padding)),
            })
        }

        const handleMouseUp = () => {
            setIsDragging(false)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging])

    if (!isOpen) return null

    // Extract domain name for display
    const getDomain = (urlString: string) => {
        try {
            const urlObj = new URL(urlString)
            return urlObj.hostname
        } catch {
            return urlString
        }
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/20"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                ref={modalRef}
                className="fixed z-50 bg-background border border-border rounded-xl shadow-2xl overflow-hidden"
                style={{
                    left: modalPosition.x,
                    top: modalPosition.y,
                    width: '450px',
                    maxWidth: 'calc(100vw - 40px)',
                }}
            >
                {/* Header - Draggable */}
                <div
                    className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border cursor-move select-none"
                    onMouseDown={handleDragStart}
                >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <GripHorizontal className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <Globe className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm font-medium truncate">
                            {nodeLabel || getDomain(url)}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={handleOpenInNewTab}
                            title="Open in new tab"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={onClose}
                            title="Close"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="relative bg-muted/20" style={{ height: '300px' }}>
                    {hasError ? (
                        <div className="absolute inset-0 flex items-center justify-center p-6">
                            <div className="flex flex-col items-center gap-4 text-center">
                                <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30">
                                    <AlertCircle className="w-8 h-8 text-orange-500" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground text-sm">Cannot preview this website</p>
                                    <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
                                        This website blocks embedding. Click below to open it directly.
                                    </p>
                                </div>
                                <Button size="sm" onClick={handleOpenInNewTab} className="gap-2">
                                    <ExternalLink className="w-4 h-4" />
                                    Open Website
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <iframe
                            src={url}
                            className="w-full h-full border-0"
                            onError={handleIframeError}
                            title="Link Preview"
                            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                            referrerPolicy="no-referrer"
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="px-3 py-2 bg-muted/30 border-t border-border">
                    <p className="text-xs text-muted-foreground truncate" title={url}>
                        {url}
                    </p>
                </div>
            </div>
        </>
    )
}
