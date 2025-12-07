"use client"

import { useState } from "react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ExternalLink, Loader2, AlertCircle } from "lucide-react"

interface LinkPreviewModalProps {
    isOpen: boolean
    onClose: () => void
    url: string
    nodeLabel?: string
}

export default function LinkPreviewModal({
    isOpen,
    onClose,
    url,
    nodeLabel,
}: LinkPreviewModalProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)

    const handleOpenInNewTab = () => {
        window.open(url, '_blank', 'noopener,noreferrer')
    }

    const handleIframeLoad = () => {
        setIsLoading(false)
    }

    const handleIframeError = () => {
        setIsLoading(false)
        setHasError(true)
    }

    // Reset state when modal opens
    const handleOpenChange = (open: boolean) => {
        if (open) {
            setIsLoading(true)
            setHasError(false)
        } else {
            onClose()
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        {nodeLabel || "Link Preview"}
                    </SheetTitle>
                    <SheetDescription className="truncate">
                        {url}
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 relative min-h-[400px] border rounded-lg overflow-hidden bg-muted/30">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <span className="text-sm text-muted-foreground">Loading preview...</span>
                            </div>
                        </div>
                    )}

                    {hasError ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-background">
                            <div className="flex flex-col items-center gap-4 text-center p-8">
                                <AlertCircle className="w-12 h-12 text-destructive" />
                                <div>
                                    <p className="font-medium text-foreground">Unable to preview this website</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Some websites block embedding. Click below to open in a new tab.
                                    </p>
                                </div>
                                <Button onClick={handleOpenInNewTab}>
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Open in New Tab
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <iframe
                            src={url}
                            className="w-full h-full min-h-[400px] border-0"
                            onLoad={handleIframeLoad}
                            onError={handleIframeError}
                            title="Link Preview"
                            sandbox="allow-scripts allow-same-origin allow-popups"
                            referrerPolicy="no-referrer"
                        />
                    )}
                </div>

                <SheetFooter className="flex-row gap-2 sm:justify-between">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    <Button onClick={handleOpenInNewTab}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open in New Tab
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
