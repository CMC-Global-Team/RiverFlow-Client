"use client"

import { useEffect } from "react"
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
  Users,
  Loader2,
  Check,
  AlertCircle,
  ArrowLeft,
  HandHelping,
  History,
  FileText,
  Image as ImageIcon,
  FileJson,
  File,
  MessageSquare,
  Menu
} from "lucide-react"
import { useMindmapContext } from "@/contexts/mindmap/MindmapContext"
import { useReactFlow } from "reactflow"
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
  userRole?: 'owner' | 'editor' | 'viewer' | null
  onHistoryClick?: () => void
  onChatClick?: () => void
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
  userRole,
  onHistoryClick,
  onChatClick,
}: ToolbarProps = {}) {
  const { addNode, deleteNode, deleteEdge, selectedNode, selectedEdge, nodes, edges, undo, redo, onConnect, setSelectedNode, canUndo, canRedo } = useMindmapContext()
  const reactFlowInstance = useReactFlow()

  // Debug logging for userRole
  useEffect(() => {
    console.log('Toolbar - userRole:', userRole, 'isViewer:', userRole === 'viewer')
  }, [userRole])

  const handleAddNode = (shape: string) => {
    addNode(
      {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
      shape
    )
    toast.success(`${shape} node added`)
  }

  const handleAddSiblingNode = () => {
    if (!selectedNode) {
      toast.error("Vui lòng chọn một node trước")
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

    toast.success("Node anh em đã được thêm")
  }

  const handleDeleteSelected = () => {
    if (selectedNode) {
      deleteNode(selectedNode.id)
      toast.success("Node deleted")
    } else if (selectedEdge) {
      deleteEdge(selectedEdge.id)
      toast.success("Connection deleted")
    } else {
      toast.error("Please select a node or connection first")
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
    toast.success("Mindmap downloaded as JSON")
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
      toast.success(`Mindmap downloaded as ${format.toUpperCase()}`)
    } catch (err) {
      console.error('Error downloading image:', err)
      toast.error("Failed to download image")
    } finally {
      try { document.head.removeChild(styleEl) } catch {}
      try { revertFns.forEach((fn) => fn()) } catch {}
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
      toast.success("Mindmap downloaded as PDF")
    } catch (err) {
      console.error('Error downloading PDF:', err)
      toast.error("Failed to download PDF")
    } finally {
      try { document.head.removeChild(styleEl) } catch {}
      try { revertFns.forEach((fn) => fn()) } catch {}
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
    toast.success("Mindmap downloaded as Text")
  }



  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 shadow-lg backdrop-blur-sm bg-card/95 max-w-full overflow-x-auto">
      {/* Back Button */}
      <BackButton />

      {/* Divider */}
      <div className="w-px h-6 bg-border"></div>

      {/* Title & Editing */}
      {mindmap && (
        <div
          onClick={() => userRole !== 'viewer' && setIsEditing?.(true)}
          className={`flex-shrink-0 ${userRole !== 'viewer' ? 'cursor-pointer' : 'cursor-default'}`}
        >
          {isEditing && userRole !== 'viewer' ? (
            <input
              type="text"
              value={mindmap?.title || "Untitled Mindmap"}
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
              {mindmap?.title || "Untitled Mindmap"}
            </h1>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="w-px h-6 bg-border"></div>

      {/* Add Node Tools - Disabled for viewers */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              title="Add Node"
              disabled={userRole === 'viewer'}
              className="hover:bg-primary/10 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleAddNode("rectangle")} disabled={userRole === 'viewer'}>
              <Square className="h-4 w-4 mr-2" />
              Rectangle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddNode("circle")} disabled={userRole === 'viewer'}>
              <Circle className="h-4 w-4 mr-2" />
              Circle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddNode("ellipse")} disabled={userRole === 'viewer'}>
              <Circle className="h-4 w-4 mr-2" />
              Ellipse
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddNode("diamond")} disabled={userRole === 'viewer'}>
              <Diamond className="h-4 w-4 mr-2" />
              Diamond
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddNode("hexagon")} disabled={userRole === 'viewer'}>
              <Hexagon className="h-4 w-4 mr-2" />
              Hexagon
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddNode("roundedRectangle")} disabled={userRole === 'viewer'}>
              <Square className="h-4 w-4 mr-2" />
              Rounded Rectangle
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Edit Tools - Disabled for viewers */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleAddSiblingNode}
          title="Thêm node anh em (Enter)"
          disabled={!selectedNode || userRole === 'viewer'}
          className="hover:bg-primary/10 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed h-8 w-8"
        >
          <GitBranch className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDeleteSelected}
          title="Delete Selected"
          disabled={userRole === 'viewer'}
          className="hover:bg-destructive/10 hover:text-destructive disabled:opacity-50 disabled:cursor-not-allowed h-8 w-8"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onHistoryClick}
          title="Lịch sử thay đổi"
          disabled={userRole === 'viewer'}
          className="hover:bg-primary/10 hover:text-primary h-8 w-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <History className="h-4 w-4" />
        </Button>
      </div>

      {/* Undo/Redo - Disabled for viewers */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={undo}
          disabled={!canUndo || userRole === 'viewer'}
          title="Undo (Ctrl+Z)"
          className="h-8 w-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={redo}
          disabled={!canRedo || userRole === 'viewer'}
          title="Redo (Ctrl+Y)"
          className="h-8 w-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Zoom Tools */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          title="Zoom In"
          className="h-8 w-8"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          title="Zoom Out"
          className="h-8 w-8"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFitView}
          title="Fit View"
          className="h-8 w-8"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Export */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              title="Download Options"
              disabled={userRole === 'viewer'}
              className="hover:bg-primary/10 hover:text-primary h-8 w-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleDownloadImage('png')}>
              <ImageIcon className="h-4 w-4 mr-2" />
              PNG Image
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownloadImage('jpeg')}>
              <ImageIcon className="h-4 w-4 mr-2" />
              JPG Image
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownloadPDF}>
              <File className="h-4 w-4 mr-2" />
              PDF Document
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownloadText}>
              <FileText className="h-4 w-4 mr-2" />
              Text File
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownloadJSON}>
              <FileJson className="h-4 w-4 mr-2" />
              JSON Data
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/*Tutorial guide*/}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          title="Tutorial"
          disabled={userRole === 'viewer'}
          className="hover:bg-primary/10 hover:text-primary h-8 w-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <HandHelping className="h-4 w-4" />
        </Button>
      </div>

      {/* Chat */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          title="Chat"
          className="hover:bg-primary/10 hover:text-primary h-8 w-8"
          onClick={onChatClick}
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
      </div>


      {/* Divider */}
      <div className="w-px h-6 bg-border ml-auto flex-shrink-0"></div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <PresenceAvatars />
        <ThemeSwitcher />

        {/* Auto-save Toggle - Hidden for viewers */}
        {userRole !== 'viewer' && (
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg border border-border bg-background/50">
            <Switch
              id="auto-save"
              checked={autoSaveEnabled || false}
              onCheckedChange={setAutoSaveEnabled}
              className="h-4 w-8"
            />
            <Label htmlFor="auto-save" className="text-xs font-medium cursor-pointer hidden sm:inline">
              Auto
            </Label>
          </div>
        )}

        {/* Share Button - Always enabled */}
        <Button
          onClick={onShareClick}
          variant="ghost"
          size="icon"
          title="Share"
          className="hover:bg-primary/10 hover:text-primary h-8 w-8"
        >
          <Users className="h-4 w-4" />
        </Button>

        {/* Save Button - Hidden for viewers */}
        {userRole !== 'viewer' && !autoSaveEnabled && (
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
                ? 'Saving...'
                : saveStatus === 'saved'
                  ? 'Saved'
                  : saveStatus === 'error'
                    ? 'Retry'
                    : 'Save'}
            </span>
          </Button>
        )}

        {/* Auto-save Status - Hidden for viewers */}
        {userRole !== 'viewer' && autoSaveEnabled && (
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
      </div>
    </div>
  )
}
