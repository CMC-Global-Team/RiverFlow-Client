"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Copy, Code, Link as LinkIcon, FileCode, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTranslation, Trans } from "react-i18next"

interface EmbedModalProps {
    isOpen: boolean
    onClose: () => void
    mindmapId: string
    mindmapTitle: string
    embedToken?: string
    isEmbedEnabled: boolean
    onToggleEmbed: (enabled: boolean) => Promise<void>
}

export default function EmbedModal({
    isOpen,
    onClose,
    mindmapId,
    mindmapTitle,
    embedToken,
    isEmbedEnabled,
    onToggleEmbed
}: EmbedModalProps) {
    const [isTogglingEmbed, setIsTogglingEmbed] = useState(false)
    const [embedEnabled, setEmbedEnabled] = useState(isEmbedEnabled)
    const [copiedType, setCopiedType] = useState<'link' | 'iframe' | null>(null)
    const { toast } = useToast()
    const { t } = useTranslation('embedModal')

    // Sync state with prop
    useEffect(() => {
        setEmbedEnabled(isEmbedEnabled)
    }, [isEmbedEnabled])

    const handleToggleEmbed = async (newEnabled: boolean) => {
        setIsTogglingEmbed(true)
        try {
            await onToggleEmbed(newEnabled)
            setEmbedEnabled(newEnabled)
            setEmbedEnabled(newEnabled)
            toast({
                description: newEnabled
                    ? t('enableEmbed.enabledSuccess')
                    : t('enableEmbed.disabledSuccess')
            })
        } catch (error) {
            console.error(error)
            toast({
                description: t('enableEmbed.error', { defaultValue: 'Failed to update embed settings' }),
                variant: "destructive"
            })
        } finally {
            setIsTogglingEmbed(false)
        }
    }

    // Generate embed URL
    const getEmbedUrl = () => {
        if (!embedToken) return ''
        const origin = typeof window !== 'undefined' ? window.location.origin : ''
        return `${origin}/embed?token=${embedToken}`
    }

    // Generate iframe code
    const getIframeCode = () => {
        const url = getEmbedUrl()
        return `<iframe 
  src="${url}"
  width="100%"
  height="600"
  style="border: none; border-radius: 8px;"
  title="${mindmapTitle}"
  loading="lazy"
></iframe>`
    }

    const handleCopy = (type: 'link' | 'iframe') => {
        const content = type === 'link' ? getEmbedUrl() : getIframeCode()
        navigator.clipboard.writeText(content)
        setCopiedType(type)
        setCopiedType(type)
        toast({
            description: type === 'link'
                ? t('link.copySuccess')
                : t('iframe.copySuccess')
        })
        setTimeout(() => setCopiedType(null), 2000)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Code className="h-5 w-5" />
                        {t('title')}
                    </DialogTitle>
                    <DialogDescription>
                        <Trans i18nKey="description" values={{ title: mindmapTitle }} components={{ 1: <span className="font-medium text-foreground" /> }} />
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Toggle embed */}
                    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-semibold text-foreground">{t('enableEmbed.title')}</h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {t('enableEmbed.description')}
                                </p>
                            </div>
                            <button
                                onClick={() => handleToggleEmbed(!embedEnabled)}
                                disabled={isTogglingEmbed}
                                className={`relative w-11 h-6 rounded-full transition-colors ${embedEnabled ? "bg-blue-500" : "bg-gray-300"
                                    } ${isTogglingEmbed ? "opacity-50" : ""}`}
                            >
                                {isTogglingEmbed ? (
                                    <span className="absolute inset-0 flex items-center justify-center">
                                        <Loader2 className="h-3 w-3 animate-spin text-white" />
                                    </span>
                                ) : (
                                    <span
                                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${embedEnabled ? "translate-x-5" : ""
                                            }`}
                                    />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Embed options - only show when enabled */}
                    {embedEnabled && embedToken && (
                        <>
                            {/* Assets Link */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <LinkIcon className="h-4 w-4" />
                                    {t('link.label')}
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        readOnly
                                        value={getEmbedUrl()}
                                        className="bg-muted/50 text-muted-foreground cursor-text text-sm font-mono"
                                    />
                                    <Button
                                        size="icon"
                                        className="shrink-0 bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
                                        onClick={() => handleCopy('link')}
                                    >
                                        {copiedType === 'link'
                                            ? <Check className="h-4 w-4" />
                                            : <Copy className="h-4 w-4" />
                                        }
                                    </Button>
                                </div>
                            </div>

                            {/* Iframe Code */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <FileCode className="h-4 w-4" />
                                    {t('iframe.label')}
                                </Label>
                                <div className="relative">
                                    <pre className="bg-muted/50 rounded-lg p-3 text-xs font-mono overflow-x-auto max-h-32 whitespace-pre-wrap break-all text-foreground">
                                        <code>{getIframeCode()}</code>
                                    </pre>
                                    <Button
                                        size="icon"
                                        className="absolute top-2 right-2 h-7 w-7 bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
                                        onClick={() => handleCopy('iframe')}
                                    >
                                        {copiedType === 'iframe'
                                            ? <Check className="h-3 w-3" />
                                            : <Copy className="h-3 w-3" />
                                        }
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Message when not enabled */}
                    {!embedEnabled && (
                        <div className="rounded-lg bg-muted/50 p-4 text-center text-sm text-muted-foreground">
                            <Code className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>{t('disabledState')}</p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                        {t('close')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
