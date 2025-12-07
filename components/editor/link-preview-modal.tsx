"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink, X, GripHorizontal, Globe, Loader2, Image as ImageIcon } from "lucide-react"

interface OGMetadata {
    title: string
    description: string
    image: string
    siteName: string
    favicon: string
    url: string
    error?: string
}

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
    const [metadata, setMetadata] = useState<OGMetadata | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isDragging, setIsDragging] = useState(false)
    const [modalPosition, setModalPosition] = useState({ x: position.x, y: position.y })
    const [imageError, setImageError] = useState(false)
    const dragStartRef = useRef({ x: 0, y: 0 })
    const modalRef = useRef<HTMLDivElement>(null)

    // Fetch OG metadata when modal opens
    useEffect(() => {
        if (isOpen && url) {
            setIsLoading(true)
            setMetadata(null)
            setImageError(false)

            // Calculate modal position
            const modalWidth = 400
            const modalHeight = 300
            const padding = 20

            let x = position.x - modalWidth / 2
            let y = position.y - modalHeight / 2

            x = Math.max(padding, Math.min(x, window.innerWidth - modalWidth - padding))
            y = Math.max(padding, Math.min(y, window.innerHeight - modalHeight - padding))

            setModalPosition({ x, y })

            // Fetch metadata
            fetch(`/api/og-metadata?url=${encodeURIComponent(url)}`)
                .then(res => res.json())
                .then((data: OGMetadata) => {
                    setMetadata(data)
                    setIsLoading(false)
                })
                .catch(err => {
                    console.error('Failed to fetch metadata:', err)
                    setMetadata({
                        title: getDomain(url),
                        description: '',
                        image: '',
                        siteName: getDomain(url),
                        favicon: '',
                        url: url,
                        error: 'Failed to load preview',
                    })
                    setIsLoading(false)
                })
        }
    }, [isOpen, url, position])

    const handleOpenInNewTab = () => {
        window.open(url, '_blank', 'noopener,noreferrer')
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

            const padding = 20
            const modalWidth = modalRef.current?.offsetWidth || 400
            const modalHeight = modalRef.current?.offsetHeight || 300

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

    const getDomain = (urlString: string) => {
        try {
            return new URL(urlString).hostname
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
                    width: '400px',
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
                        {metadata?.favicon && !imageError ? (
                            <img
                                src={metadata.favicon}
                                alt=""
                                className="w-4 h-4 flex-shrink-0"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <Globe className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium truncate">
                            {metadata?.siteName || nodeLabel || getDomain(url)}
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
                <div className="p-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                            <span className="text-sm text-muted-foreground">Loading preview...</span>
                        </div>
                    ) : metadata ? (
                        <div className="space-y-3">
                            {/* Preview Image */}
                            {metadata.image && !imageError ? (
                                <div className="relative rounded-lg overflow-hidden bg-muted aspect-video">
                                    <img
                                        src={metadata.image}
                                        alt={metadata.title}
                                        className="w-full h-full object-cover"
                                        onError={() => setImageError(true)}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center rounded-lg bg-muted/50 aspect-video">
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <ImageIcon className="w-10 h-10" />
                                        <span className="text-xs">No preview available</span>
                                    </div>
                                </div>
                            )}

                            {/* Title */}
                            <h3 className="font-semibold text-foreground line-clamp-2">
                                {metadata.title}
                            </h3>

                            {/* Description */}
                            {metadata.description && (
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {metadata.description}
                                </p>
                            )}

                            {/* Open Button */}
                            <Button
                                className="w-full gap-2"
                                onClick={handleOpenInNewTab}
                            >
                                <ExternalLink className="w-4 h-4" />
                                Open Website
                            </Button>
                        </div>
                    ) : null}
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
