"use client"

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

export default function Toolbar() {
  const { addNode, deleteNode, deleteEdge, selectedNode, selectedEdge, nodes, edges, undo, redo,onConnect, setSelectedNode, canUndo, canRedo } = useMindmapContext()
  const reactFlowInstance = useReactFlow()

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

  const handleDownload = () => {
    const mindmapData = {
      nodes,
      edges,
    }
    const dataStr = JSON.stringify(mindmapData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "mindmap.json"
    link.click()
    URL.revokeObjectURL(url)
    toast.success("Mindmap downloaded")
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 shadow-lg">
      {/* Add Node Tools */}
      <div className="flex items-center gap-1 border-r border-border pr-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              title="Add Node"
              className="hover:bg-primary/10 hover:text-primary"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleAddNode("rectangle")}>
              <Square className="h-4 w-4 mr-2" />
              Rectangle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddNode("circle")}>
              <Circle className="h-4 w-4 mr-2" />
              Circle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddNode("ellipse")}>
              <Circle className="h-4 w-4 mr-2" />
              Ellipse
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddNode("diamond")}>
              <Diamond className="h-4 w-4 mr-2" />
              Diamond
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddNode("hexagon")}>
              <Hexagon className="h-4 w-4 mr-2" />
              Hexagon
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddNode("roundedRectangle")}>
              <Square className="h-4 w-4 mr-2" />
              Rounded Rectangle
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Edit Tools */}
      <div className="flex items-center gap-1 border-r border-border pr-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleAddSiblingNode}
          title="Thêm node anh em (Enter)"
          disabled={!selectedNode}
          className="hover:bg-primary/10 hover:text-primary disabled:opacity-50"
        >
          <GitBranch className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDeleteSelected}
          title="Delete Selected"
          className="hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-1 border-r border-border pr-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Zoom Tools */}
      <div className="flex items-center gap-1 border-r border-border pr-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          title="Zoom In"
        >
          <ZoomIn className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          <ZoomOut className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFitView}
          title="Fit View"
        >
          <Maximize2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Export */}
      <div className="flex items-center gap-1 ml-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDownload}
          title="Download Mindmap"
          className="hover:bg-primary/10 hover:text-primary"
        >
          <Download className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
