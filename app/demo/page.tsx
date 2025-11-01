"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import DemoToolbar from "@/components/demo/demo-toolbar"
import DemoCanvas from "@/components/demo/demo-canvas"
import DemoPropertiesPanel from "@/components/demo/demo-properties-panel"
import { toast } from "sonner"

const initialNodes: Node[] = [
  {
    id: "1",
    type: "customNode",
    position: { x: 250, y: 100 },
    data: { label: "Central Idea", description: "Main topic", color: "#8b5cf6" },
  },
  {
    id: "2",
    type: "customNode",
    position: { x: 100, y: 250 },
    data: { label: "Subtopic 1", description: "First branch", color: "#3b82f6" },
  },
  {
    id: "3",
    type: "customNode",
    position: { x: 400, y: 250 },
    data: { label: "Subtopic 2", description: "Second branch", color: "#ec4899" },
  },
]

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true },
  { id: "e1-3", source: "1", target: "3", animated: true },
]

function DemoPageContent() {
  const router = useRouter()
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const reactFlowInstance = useRef<any>(null)

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds))
    },
    [setEdges]
  )

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const handleAddNode = useCallback(() => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: "customNode",
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
      data: {
        label: "New Node",
        description: "Add description",
        color: "#3b82f6",
      },
    }
    setNodes((nds) => [...nds, newNode])
    toast.success("Node added successfully")
  }, [setNodes])

  const handleDeleteSelected = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id))
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id)
      )
      setSelectedNode(null)
      toast.success("Node deleted successfully")
    } else {
      toast.error("Please select a node first")
    }
  }, [selectedNode, setNodes, setEdges])

  const handleUpdateNode = useCallback(
    (nodeId: string, newData: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: { ...node.data, ...newData },
            }
          }
          return node
        })
      )
      setSelectedNode((prev) => {
        if (prev && prev.id === nodeId) {
          return {
            ...prev,
            data: { ...prev.data, ...newData },
          }
        }
        return prev
      })
    },
    [setNodes]
  )

  const handleSave = useCallback(() => {
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
    toast.success("Mindmap saved successfully")
  }, [nodes, edges])

  const handleLoad = useCallback(() => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "application/json"
    input.onchange = (e: any) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event: any) => {
          try {
            const data = JSON.parse(event.target.result)
            if (data.nodes && data.edges) {
              setNodes(data.nodes)
              setEdges(data.edges)
              toast.success("Mindmap loaded successfully")
            } else {
              toast.error("Invalid mindmap file")
            }
          } catch (error) {
            toast.error("Error loading mindmap file")
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }, [setNodes, setEdges])

  const handleZoomIn = useCallback(() => {
    if (reactFlowInstance.current) {
      reactFlowInstance.current.zoomIn()
    }
  }, [])

  const handleZoomOut = useCallback(() => {
    if (reactFlowInstance.current) {
      reactFlowInstance.current.zoomOut()
    }
  }, [])

  const handleFitView = useCallback(() => {
    if (reactFlowInstance.current) {
      reactFlowInstance.current.fitView()
    }
  }, [])

  return (
    <div className="relative w-screen h-screen">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/")}
        className="absolute top-4 left-4 z-20 bg-background/95 backdrop-blur-sm border shadow-lg"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Button>

      {/* Toolbar */}
      <DemoToolbar
        onAddNode={handleAddNode}
        onDeleteSelected={handleDeleteSelected}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
        onSave={handleSave}
        onLoad={handleLoad}
      />

      {/* Properties Panel */}
      {selectedNode && (
        <DemoPropertiesPanel
          selectedNode={selectedNode}
          onClose={() => setSelectedNode(null)}
          onUpdateNode={handleUpdateNode}
        />
      )}

      {/* Canvas */}
      <DemoCanvas
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
      />
    </div>
  )
}

export default function DemoPage() {
  return (
    <ReactFlowProvider>
      <DemoPageContent />
    </ReactFlowProvider>
  )
}

