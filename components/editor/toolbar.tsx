"use client"

import { useEffect, useState } from "react"
import {
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Upload,
  Circle,
  Square,
  Diamond,
  Hexagon,
  Redo2,
  Undo2,
  GitBranch,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Users,
  Loader2,
  Check,
  Code,
  AlertCircle,
  ArrowLeft,
  HandHelping,
  History,
  FileText,
  Image as ImageIcon,
  FileJson,
  File,
  MessageSquare,
  Menu,
  Eye,
  Edit2,
  Keyboard
} from "lucide-react"
import { Sparkles } from "lucide-react"
import { useMindmapContext } from "@/contexts/mindmap/MindmapContext"
import { useReactFlow } from "reactflow"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ThemeSwitcher } from "@/components/theme-switcher"
import BackButton from "./back-button"
import gsap from "gsap"
import { useRouter } from "next/navigation"
import PresenceAvatars from "@/components/editor/presence-avatars"
import { toPng, toJpeg } from 'html-to-image'
import jsPDF from 'jspdf'


interface ToolbarProps {
  mindmap?: any
  isEditing?: boolean
  setIsEditing?: (value: boolean) => void
  titleRef?: React.RefObject<HTMLHeadingElement>
  handleTitleChange?: (title: string) => void
  handleTitleHover?: () => void
  handleTitleLeave?: () => void
  autoSaveEnabled?: boolean
  setAutoSaveEnabled?: (value: boolean) => void
  isSaving?: boolean
  saveStatus?: string
  handleSave?: () => void
  onShareClick?: () => void
  onEmbedClick?: () => void
  userRole?: 'owner' | 'editor' | 'viewer' | null
  onHistoryClick?: () => void
  onChatClick?: () => void
  onAiToggle?: () => void
  aiOpen?: boolean
  onTutorialClick?: () => void
  onCheatSheetClick?: () => void
}

export default function Toolbar({
  mindmap,
  isEditing,
  setIsEditing,
  titleRef,
  handleTitleChange,
  handleTitleHover,
  handleTitleLeave,
  autoSaveEnabled,
  setAutoSaveEnabled,
  isSaving,
  saveStatus,
  handleSave,
  onShareClick,
  onEmbedClick,
  userRole,
  onHistoryClick,
  onChatClick,
  onAiToggle,
  aiOpen,
  onTutorialClick,
  onCheatSheetClick,
}: ToolbarProps = {}) {
  const { addNode, deleteNode, deleteEdge, selectedNode, selectedEdge, nodes, edges, undo, redo, onConnect, setSelectedNode, canUndo, canRedo } = useMindmapContext()
  const reactFlowInstance = useReactFlow()
  const { t } = useTranslation("editor")
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Debug logging for userRole
  useEffect(() => {
    console.log('Toolbar - userRole:', userRole, 'isViewer:', userRole === 'viewer')
  }, [userRole])

  // Get permission label text
  const getPermissionLabel = () => {
    if (userRole === 'owner') return t('toolbar.owner')
    if (userRole === 'editor') return t('toolbar.edit')
    if (userRole === 'viewer') return t('toolbar.view')
    return ''
  }

  const handleAddNode = (shape: string) => {
    addNode(
      {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
      shape
    )
    toast.success(t("toasts.nodeAdded", { shape }))
  }

  const handleAddSiblingNode = () => {
    if (!selectedNode) {
      toast.error(t("toasts.selectNodeFirst"))
      return
    }

    // Find parent node by finding edge where selectedNode is the target
    const parentEdge = edges.find(edge => edge.target === selectedNode.id)
    const parentNode = parentEdge ? nodes.find(n => n.id === parentEdge.source) : null

    // Calculate position for sibling node
    const siblingOffset = 200 // Horizontal distance between siblings
    const verticalOffset = 150 // Vertical distance for root nodes

    let siblingPosition: { x: number; y: number }

    if (parentNode) {
      // Has parent: position to the right
      siblingPosition = {
        x: selectedNode.position.x + siblingOffset,
        y: selectedNode.position.y,
      }
    } else {
      // Root node: position below
      siblingPosition = {
        x: selectedNode.position.x,
        y: selectedNode.position.y + verticalOffset,
      }
    }

    // Get shape from current node or default to rectangle
    const siblingShape = selectedNode.type || selectedNode.data?.shape || 'rectangle'

    // Create sibling node
    const siblingNodeId = addNode(siblingPosition, siblingShape)

    // If there's a parent, connect the new sibling to the same parent
    if (parentNode) {
      setTimeout(() => {
        onConnect({
          source: parentNode.id,
          target: siblingNodeId,
          sourceHandle: null,
          targetHandle: null,
        })
      }, 10)
    }

    // Note: Node selection is handled by the useEffect in Canvas component
    // No need to manually select here to avoid infinite loops

    toast.success(t("toasts.siblingAdded"))
  }

  const handleDeleteSelected = () => {
    if (selectedNode) {
      deleteNode(selectedNode.id)
      toast.success(t("toasts.nodeDeleted"))
    } else if (selectedEdge) {
      deleteEdge(selectedEdge.id)
      toast.success(t("toasts.connectionDeleted"))
    } else {
      toast.error(t("toasts.selectFirst"))
    }
  }

  const handleZoomIn = () => {
    reactFlowInstance.zoomIn()
  }

  const handleZoomOut = () => {
    reactFlowInstance.zoomOut()
  }

  const handleFitView = () => {
    reactFlowInstance.fitView()
  }

  const handleDownloadJSON = () => {
    const mindmapData = {
      nodes,
      edges,
    }
    const dataStr = JSON.stringify(mindmapData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${mindmap?.title || 'mindmap'}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success(t("toasts.downloadSuccess", { format: "JSON" }))
  }

  const handleDownloadImage = async (format: 'png' | 'jpeg') => {
    const container = document.querySelector('.react-flow__renderer') as HTMLElement
    if (!container) return

    const original = reactFlowInstance.getViewport()
    const styleEl = document.createElement('style')
    styleEl.setAttribute('data-export-hide', 'true')
    styleEl.textContent = `.react-flow__handle{display:none !important;opacity:0 !important;}`
    document.head.appendChild(styleEl)
    reactFlowInstance.fitView({ padding: 0.2, duration: 0 })
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    const edgePaths = Array.from(container.querySelectorAll('.react-flow__edge-path')) as SVGPathElement[]
    const revertFns: (() => void)[] = []
    edgePaths.forEach((p) => {
      const prevStroke = p.getAttribute('stroke')
      const prevWidth = p.getAttribute('stroke-width')
      const prevFill = p.getAttribute('fill')
      const cs = getComputedStyle(p)
      p.setAttribute('stroke', cs.stroke || '#b1b1b1')
      p.setAttribute('stroke-width', cs.strokeWidth || '2')
      p.setAttribute('fill', 'none')
      revertFns.push(() => {
        if (prevStroke == null) p.removeAttribute('stroke'); else p.setAttribute('stroke', prevStroke)
        if (prevWidth == null) p.removeAttribute('stroke-width'); else p.setAttribute('stroke-width', prevWidth)
        if (prevFill == null) p.removeAttribute('fill'); else p.setAttribute('fill', prevFill)
      })
    })
    try {
      const dataUrl = format === 'png'
        ? await toPng(container, { backgroundColor: '#ffffff' })
        : await toJpeg(container, { backgroundColor: '#ffffff' })
      const link = document.createElement('a')
      link.download = `${mindmap?.title || 'mindmap'}.${format}`
      link.href = dataUrl
      link.click()
      toast.success(t("toasts.downloadSuccess", { format: format.toUpperCase() }))
    } catch (err) {
      console.error('Error downloading image:', err)
      toast.error(t("toasts.downloadError", { format: "Image" }))
    } finally {
      try { document.head.removeChild(styleEl) } catch { }
      try { revertFns.forEach((fn) => fn()) } catch { }
      reactFlowInstance.setViewport(original)
    }
  }

  const handleDownloadPDF = async () => {
    const container = document.querySelector('.react-flow__renderer') as HTMLElement
    if (!container) return

    const original = reactFlowInstance.getViewport()
    const styleEl = document.createElement('style')
    styleEl.setAttribute('data-export-hide', 'true')
    styleEl.textContent = `.react-flow__handle{display:none !important;opacity:0 !important;}`
    document.head.appendChild(styleEl)
    reactFlowInstance.fitView({ padding: 0.2, duration: 0 })
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    const edgePaths = Array.from(container.querySelectorAll('.react-flow__edge-path')) as SVGPathElement[]
    const revertFns: (() => void)[] = []
    edgePaths.forEach((p) => {
      const prevStroke = p.getAttribute('stroke')
      const prevWidth = p.getAttribute('stroke-width')
      const prevFill = p.getAttribute('fill')
      const cs = getComputedStyle(p)
      p.setAttribute('stroke', cs.stroke || '#b1b1b1')
      p.setAttribute('stroke-width', cs.strokeWidth || '2')
      p.setAttribute('fill', 'none')
      revertFns.push(() => {
        if (prevStroke == null) p.removeAttribute('stroke'); else p.setAttribute('stroke', prevStroke)
        if (prevWidth == null) p.removeAttribute('stroke-width'); else p.setAttribute('stroke-width', prevWidth)
        if (prevFill == null) p.removeAttribute('fill'); else p.setAttribute('fill', prevFill)
      })
    })
    try {
      const dataUrl = await toPng(container, { backgroundColor: '#ffffff' })
      const pdf = new jsPDF({ orientation: 'landscape' })
      const imgProps = pdf.getImageProperties(dataUrl)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`${mindmap?.title || 'mindmap'}.pdf`)
      toast.success(t("toasts.downloadSuccess", { format: "PDF" }))
    } catch (err) {
      console.error('Error downloading PDF:', err)
      toast.error(t("toasts.downloadError", { format: "PDF" }))
    } finally {
      try { document.head.removeChild(styleEl) } catch { }
      try { revertFns.forEach((fn) => fn()) } catch { }
      reactFlowInstance.setViewport(original)
    }
  }

  const handleDownloadText = () => {
    let textContent = `# ${mindmap?.title || 'Untitled Mindmap'}\n\n`

    // Simple text representation - can be improved based on node hierarchy
    nodes.forEach(node => {
      const label = node.data?.label || 'Untitled Node'
      textContent += `- ${label}\n`
    })

    const blob = new Blob([textContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `${mindmap?.title || 'mindmap'}.txt`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
    toast.success(t("toasts.downloadSuccess", { format: "Text" }))
  }



  return (
    <div data-tutorial="toolbar" className={`flex items-center gap-2 rounded-lg border border-border bg-card p-2 shadow-lg backdrop-blur-sm bg-card/95 overflow-x-auto transition-all duration-300 ${isCollapsed ? 'w-fit' : 'max-w-full'}`}>
      {/* Back Button - Always visible */}
      <BackButton />

      {/* Divider */}
      <div className="w-px h-6 bg-border"></div>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <>
          {/* Title & Editing */}
          {mindmap && (
            <div
              onClick={() => userRole !== 'viewer' && setIsEditing?.(true)}
              className={`flex-shrink-0 ${userRole !== 'viewer' ? 'cursor-pointer' : 'cursor-default'}`}
            >
              {isEditing && userRole !== 'viewer' ? (
                <input
                  type="text"
                  value={mindmap?.title || t("toolbar.untitled", { defaultValue: "Untitled Mindmap" })}
                  onChange={(e) => handleTitleChange?.(e.target.value)}
                  onBlur={() => setIsEditing?.(false)}
                  autoFocus
                  className="text-sm font-bold text-foreground bg-input border-2 border-primary rounded px-2 py-1 w-48"
                />
              ) : (
                <h1
                  ref={titleRef}
                  className={`text-sm font-bold text-foreground px-2 py-1 border-2 border-dashed rounded min-w-48 truncate ${userRole !== 'viewer'
                    ? 'border-muted-foreground/30 hover:border-primary hover:text-primary transition-colors'
                    : 'border-transparent'
                    }`}
                  onMouseEnter={userRole !== 'viewer' ? handleTitleHover : undefined}
                  onMouseLeave={userRole !== 'viewer' ? handleTitleLeave : undefined}
                >
                  {mindmap?.title || t("toolbar.untitled", { defaultValue: "Untitled Mindmap" })}
                </h1>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="w-px h-6 bg-border"></div>

          {/* Add Node Tools - Disabled for viewers */}
          <div data-tutorial="add-node" className="flex items-center gap-1 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  title={t("toolbar.addNode")}
                  disabled={userRole === 'viewer'}
                  className="hover:bg-primary/10 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed h-8 w-8"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleAddNode("rectangle")} disabled={userRole === 'viewer'}>
                  <Square className="h-4 w-4 mr-2" />
                  {t("toolbar.shapes.rectangle")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddNode("circle")} disabled={userRole === 'viewer'}>
                  <Circle className="h-4 w-4 mr-2" />
                  {t("toolbar.shapes.circle")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddNode("ellipse")} disabled={userRole === 'viewer'}>
                  <Circle className="h-4 w-4 mr-2" />
                  {t("toolbar.shapes.ellipse")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddNode("diamond")} disabled={userRole === 'viewer'}>
                  <Diamond className="h-4 w-4 mr-2" />
                  {t("toolbar.shapes.diamond")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddNode("hexagon")} disabled={userRole === 'viewer'}>
                  <Hexagon className="h-4 w-4 mr-2" />
                  {t("toolbar.shapes.hexagon")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddNode("roundedRectangle")} disabled={userRole === 'viewer'}>
                  <Square className="h-4 w-4 mr-2" />
                  {t("toolbar.shapes.roundedRectangle")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Add Sibling */}
            <Button
              data-tutorial="add-sibling"
              onClick={handleAddSiblingNode}
              variant="ghost"
              size="icon"
              title={t("toolbar.addSibling")}
              disabled={!selectedNode || userRole === 'viewer'}
              className="hover:bg-primary/10 hover:text-primary h-8 w-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <GitBranch className="h-4 w-4" />
            </Button>

            {/* Delete */}
            <Button
              data-tutorial="delete"
              onClick={handleDeleteSelected}
              variant="ghost"
              size="icon"
              title={t("toolbar.delete")}
              disabled={(!selectedNode && !selectedEdge) || userRole === 'viewer'}
              className="hover:bg-destructive/10 hover:text-destructive h-8 w-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Edit Tools - History */}
          <Button
            data-tutorial="history"
            variant="ghost"
            size="icon"
            onClick={onHistoryClick}
            title={t("toolbar.history")}
            disabled={userRole === 'viewer'}
            className="hover:bg-primary/10 hover:text-primary h-8 w-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <History className="h-4 w-4" />
          </Button>

          {/* Divider */}
          <div className="w-px h-6 bg-border"></div>

          {/* Undo/Redo */}
          <div data-tutorial="undo-redo" className="flex items-center gap-1 flex-shrink-0">
            <Button
              onClick={undo}
              variant="ghost"
              size="icon"
              title={t("toolbar.undo")}
              disabled={!canUndo || userRole === 'viewer'}
              className="hover:bg-primary/10 hover:text-primary h-8 w-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              onClick={redo}
              variant="ghost"
              size="icon"
              title={t("toolbar.redo")}
              disabled={!canRedo || userRole === 'viewer'}
              className="hover:bg-primary/10 hover:text-primary h-8 w-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-border"></div>

          {/* Zoom Controls */}
          <div data-tutorial="zoom-controls" className="flex items-center gap-1 flex-shrink-0">
            <Button
              onClick={handleZoomIn}
              variant="ghost"
              size="icon"
              title={t("toolbar.zoomIn")}
              className="hover:bg-primary/10 hover:text-primary h-8 w-8"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleZoomOut}
              variant="ghost"
              size="icon"
              title={t("toolbar.zoomOut")}
              className="hover:bg-primary/10 hover:text-primary h-8 w-8"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleFitView}
              variant="ghost"
              size="icon"
              title={t("toolbar.fitView")}
              className="hover:bg-primary/10 hover:text-primary h-8 w-8"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-border"></div>

          {/* Export/Import */}
          <div data-tutorial="download" className="flex items-center gap-1 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  title={t("toolbar.download")}
                  className="hover:bg-primary/10 hover:text-primary h-8 w-8"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDownloadImage('png')}>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  {t("toolbar.formats.png")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownloadImage('jpeg')}>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  {t("toolbar.formats.jpg")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadPDF}>
                  <File className="h-4 w-4 mr-2" />
                  {t("toolbar.formats.pdf")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadText}>
                  <FileText className="h-4 w-4 mr-2" />
                  {t("toolbar.formats.text")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadJSON}>
                  <FileJson className="h-4 w-4 mr-2" />
                  {t("toolbar.formats.json")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Tutorial guide and Embed Button */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              data-tutorial="tutorial-btn"
              variant="ghost"
              size="icon"
              title={t("toolbar.tutorial")}
              onClick={onTutorialClick}
              className="hover:bg-primary/10 hover:text-primary h-8 w-8"
            >
              <HandHelping className="h-4 w-4" />
            </Button>
            {/* Cheat Sheet Button */}
            <Button
              data-tutorial="cheatsheet"
              variant="ghost"
              size="icon"
              title={t("toolbar.shortcuts")}
              onClick={onCheatSheetClick}
              className="hover:bg-primary/10 hover:text-primary h-8 w-8"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
            {/* Embed Button - Only for owners (moved next to Tutorial) */}
            {userRole === 'owner' && (
              <Button
                data-tutorial="embed"
                onClick={onEmbedClick}
                variant="ghost"
                size="icon"
                title={t("toolbar.embed")}
                className="hover:bg-primary/10 hover:text-primary h-8 w-8"
              >
                <Code className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Chat and AI */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Hide AI button for viewers */}
            {userRole !== 'viewer' && (
              <Button
                data-tutorial="ai"
                variant="ghost"
                size="icon"
                title={t("toolbar.ai")}
                className={`h-8 w-8 ${aiOpen ? 'bg-primary/10 text-primary' : ''}`}
                onClick={onAiToggle}
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            )}
            <Button
              data-tutorial="chat"
              variant="ghost"
              size="icon"
              title={t("toolbar.chat")}
              className="hover:bg-primary/10 hover:text-primary h-8 w-8"
              onClick={onChatClick}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>

          {/* Divider before right side */}
          <div className="w-px h-6 bg-border"></div>

          {/* Spacer to push right side actions to the end - only when expanded */}
          <div className="flex-1"></div>
        </>
      )}

      {/* Right Side Actions - Always visible */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <PresenceAvatars />
        <div data-tutorial="theme">
          <ThemeSwitcher />
        </div>

        {/* Auto-save Toggle - Hidden for viewers and when collapsed */}
        {!isCollapsed && userRole !== 'viewer' && (
          <div data-tutorial="auto-save" className="flex items-center gap-2 px-2 py-1 rounded-lg border border-border bg-background/50">
            <Switch
              id="auto-save"
              checked={autoSaveEnabled || false}
              onCheckedChange={setAutoSaveEnabled}
              className="h-4 w-8"
            />
            <Label htmlFor="auto-save" className="text-xs font-medium cursor-pointer hidden sm:inline">
              {t("toolbar.autoSave")}
            </Label>
          </div>
        )}

        {/* Permission Label - Right side next to share */}
        {userRole && (
          <div data-tutorial="permission-label" className="flex items-center gap-1 px-2 py-1 rounded-md border border-border bg-muted/50 flex-shrink-0">
            {userRole === 'viewer' ? (
              <Eye className="h-3 w-3 text-muted-foreground" />
            ) : (
              <Edit2 className="h-3 w-3 text-primary" />
            )}
            <span className={`text-xs font-medium ${userRole === 'viewer' ? 'text-muted-foreground' : 'text-primary'}`}>
              {getPermissionLabel()}
            </span>
          </div>
        )}

        {/* Share Button - Always enabled */}
        <Button
          data-tutorial="share"
          onClick={onShareClick}
          variant="ghost"
          size="icon"
          title={t("toolbar.share")}
          className="hover:bg-primary/10 hover:text-primary h-8 w-8"
        >
          <Users className="h-4 w-4" />
        </Button>

        {/* Save Button - Hidden for viewers */}
        {!isCollapsed && userRole !== 'viewer' && !autoSaveEnabled && (
          <Button
            onClick={handleSave}
            disabled={isSaving || saveStatus === 'saved'}
            className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1 text-xs text-primary-foreground font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed h-8 whitespace-nowrap"
          >
            {saveStatus === 'saving' && <Loader2 className="h-3 w-3 animate-spin" />}
            {saveStatus === 'saved' && <Check className="h-3 w-3" />}
            {saveStatus === 'error' && <AlertCircle className="h-3 w-3 text-destructive" />}
            <span>
              {saveStatus === 'saving'
                ? t("toolbar.saving")
                : saveStatus === 'saved'
                  ? t("toolbar.saved")
                  : saveStatus === 'error'
                    ? t("toolbar.retry")
                    : t("toolbar.save")}
            </span>
          </Button>
        )}

        {/* Auto-save Status - Hidden for viewers */}
        {!isCollapsed && userRole !== 'viewer' && autoSaveEnabled && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground px-2">
            {saveStatus === 'saving' && (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
              </>
            )}
            {saveStatus === 'saved' && (
              <Check className="h-3 w-3 text-green-500" />
            )}
            {saveStatus === 'error' && (
              <AlertCircle className="h-3 w-3 text-destructive" />
            )}
          </div>
        )}

        {/* Divider before collapse */}
        <div className="w-px h-6 bg-border"></div>

        {/* Collapse Toggle Button - Inside toolbar at far right */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? t("toolbar.expand") : t("toolbar.collapse")}
          className="h-8 w-8 flex-shrink-0 hover:bg-primary/10"
        >
          {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}

