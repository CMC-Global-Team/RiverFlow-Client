"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink, X, GripHorizontal, Globe, Loader2, Play } from "lucide-react"

interface OGMetadata {
    title: string
    description: string
    image: string
    siteName: string
    favicon: string
    url: string
    type: 'website' | 'image' | 'video' | 'youtube' | 'vimeo'
    videoEmbedUrl?: string
    videoId?: string
    error?: string
}

interface LinkPreviewModalProps {
    isOpen: boolean
    onClose: () => void
    url: string
    nodeLabel?: string
    position?: { x: number; y: number }
}

function getGoogleThumbnail(url: string): string {
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(url)}&sz=128`
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

    useEffect(() => {
        if (isOpen && url) {
            setIsLoading(true)
            setMetadata(null)
            setImageError(false)

            // Calculate modal size based on content type (we'll adjust after loading)
            const modalWidth = 420
            const modalHeight = 400
            const padding = 20

            let x = position.x - modalWidth / 2
            let y = position.y - modalHeight / 2

            x = Math.max(padding, Math.min(x, window.innerWidth - modalWidth - padding))
            y = Math.max(padding, Math.min(y, window.innerHeight - modalHeight - padding))

            setModalPosition({ x, y })

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
                        type: 'website',
                        error: 'Failed to load preview',
                    })
                    setIsLoading(false)
                })
        }
    }, [isOpen, url, position])

    const handleOpenInNewTab = () => {
        window.open(url, '_blank', 'noopener,noreferrer')
    }

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
            const modalWidth = modalRef.current?.offsetWidth || 420
            const modalHeight = modalRef.current?.offsetHeight || 400

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

    // Render content based on media type
    const renderContent = () => {
        if (!metadata) return null

        // Direct image
        if (metadata.type === 'image') {
            return (
                <div className="p-4">
                    <div className="rounded-lg overflow-hidden bg-muted">
                        <img
                            src={url}
                            alt={metadata.title}
                            className="w-full h-auto max-h-[400px] object-contain"
                            onError={() => setImageError(true)}
                        />
                    </div>
                    <Button className="w-full gap-2 mt-3" onClick={handleOpenInNewTab}>
                        <ExternalLink className="w-4 h-4" />
                        Open Full Image
                    </Button>
                </div>
            )
        }

        // Direct video
        if (metadata.type === 'video' && !metadata.videoEmbedUrl) {
            return (
                <div className="p-4">
                    <div className="rounded-lg overflow-hidden bg-black">
                        <video
                            src={url}
                            controls
                            className="w-full max-h-[300px]"
                            preload="metadata"
                        >
                            Your browser does not support video playback.
                        </video>
                    </div>
                    <Button className="w-full gap-2 mt-3" onClick={handleOpenInNewTab}>
                        <ExternalLink className="w-4 h-4" />
                        Open Video
                    </Button>
                </div>
            )
        }

        // YouTube embed
        if (metadata.type === 'youtube' && metadata.videoEmbedUrl) {
            return (
                <div className="p-4">
                    <div className="rounded-lg overflow-hidden bg-black aspect-video">
                        <iframe
                            src={`${metadata.videoEmbedUrl}?autoplay=0`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="YouTube video"
                        />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-1">{metadata.title}</p>
                    <Button className="w-full gap-2 mt-2" onClick={handleOpenInNewTab}>
                        <Play className="w-4 h-4" />
                        Watch on YouTube
                    </Button>
                </div>
            )
        }

        // Vimeo embed
        if (metadata.type === 'vimeo' && metadata.videoEmbedUrl) {
            return (
                <div className="p-4">
                    <div className="rounded-lg overflow-hidden bg-black aspect-video">
                        <iframe
                            src={metadata.videoEmbedUrl}
                            className="w-full h-full"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            title="Vimeo video"
                        />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-1">{metadata.title}</p>
                    <Button className="w-full gap-2 mt-2" onClick={handleOpenInNewTab}>
                        <Play className="w-4 h-4" />
                        Watch on Vimeo
                    </Button>
                </div>
            )
        }

        // Regular website with OG video
        if (metadata.videoEmbedUrl) {
            return (
                <div className="p-4">
                    <div className="rounded-lg overflow-hidden bg-black aspect-video">
                        <video
                            src={metadata.videoEmbedUrl}
                            controls
                            className="w-full h-full"
                            poster={metadata.image}
                        >
                            Your browser does not support video playback.
                        </video>
                    </div>
                    <h3 className="font-semibold text-foreground line-clamp-2 mt-3">{metadata.title}</h3>
                    {metadata.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{metadata.description}</p>
                    )}
                    <Button className="w-full gap-2 mt-3" onClick={handleOpenInNewTab}>
                        <ExternalLink className="w-4 h-4" />
                        Open Website
                    </Button>
                </div>
            )
        }

        // Regular website preview
        const previewImage = metadata.image && !imageError ? metadata.image : null

        return (
            <div className="p-4">
                <div className="space-y-3">
                    {previewImage ? (
                        <div className="relative rounded-lg overflow-hidden bg-muted aspect-video">
                            <img
                                src={previewImage}
                                alt={metadata.title}
                                className="w-full h-full object-cover"
                                onError={() => setImageError(true)}
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 py-8">
                            <div className="flex flex-col items-center gap-3">
                                {metadata.favicon ? (
                                    <img
                                        src={metadata.favicon}
                                        alt=""
                                        className="w-16 h-16 rounded-lg shadow-md"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = getGoogleThumbnail(url)
                                        }}
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center">
                                        <Globe className="w-8 h-8 text-primary" />
                                    </div>
                                )}
                                <span className="text-xs text-muted-foreground">{getDomain(url)}</span>
                            </div>
                        </div>
                    )}

                    <h3 className="font-semibold text-foreground line-clamp-2">{metadata.title}</h3>

                    {metadata.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{metadata.description}</p>
                    )}

                    <Button className="w-full gap-2" onClick={handleOpenInNewTab}>
                        <ExternalLink className="w-4 h-4" />
                        Open Website
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <>
            <div
                className="fixed inset-0 z-40 bg-black/20"
                onClick={onClose}
            />

            <div
                ref={modalRef}
                className="fixed z-50 bg-background border border-border rounded-xl shadow-2xl overflow-hidden"
                style={{
                    left: modalPosition.x,
                    top: modalPosition.y,
                    width: metadata?.type === 'youtube' || metadata?.type === 'vimeo' ? '480px' : '420px',
                    maxWidth: 'calc(100vw - 40px)',
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border cursor-move select-none"
                    onMouseDown={handleDragStart}
                >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <GripHorizontal className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        {metadata?.favicon ? (
                            <img
                                src={metadata.favicon}
                                alt=""
                                className="w-4 h-4 flex-shrink-0"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none'
                                }}
                            />
                        ) : (
                            <Globe className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium truncate">
                            {metadata?.siteName || nodeLabel || getDomain(url)}
                        </span>
                        {/* Type badge */}
                        {metadata && metadata.type !== 'website' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase">
                                {metadata.type}
                            </span>
                        )}
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
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                        <span className="text-sm text-muted-foreground">Loading preview...</span>
                    </div>
                ) : (
                    renderContent()
                )}

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
