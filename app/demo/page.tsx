"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useCallback } from "react"
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
import {ArrowLeft, PlusCircle} from "lucide-react"
import { Button } from "@/components/ui/button"
import DemoToolbar from "@/components/demo/demo-toolbar"
import DemoCanvas from "@/components/demo/demo-canvas"
import DemoPropertiesPanel from "@/components/demo/demo-properties-panel"
import EdgePropertiesPanel from "@/components/demo/edge-properties-panel"
import { toast } from "sonner"

const initialNodes: Node[] = [
  {
    id: "1",
    type: "rectangle",
    position: { x: 250, y: 100 },
    data: { label: "Central Idea", description: "Main topic", color: "#8b5cf6", shape: "rectangle" },
  },
  {
    id: "2",
    type: "circle",
    position: { x: 100, y: 280 },
    data: { label: "Subtopic 1", description: "First branch", color: "#3b82f6", shape: "circle" },
  },
  {
    id: "3",
    type: "ellipse",
    position: { x: 400, y: 280 },
    data: { label: "Subtopic 2", description: "Second branch", color: "#ec4899", shape: "ellipse" },
  },
]

const initialEdges: Edge[] = [
  { 
    id: "e1-2", 
    source: "1", 
    target: "2", 
    animated: true, 
    type: "smoothstep",
    label: "relates to",
    labelStyle: { fill: '#000000', fontWeight: 500, fontSize: 12 },
    labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9 },
    labelBgPadding: [8, 4] as [number, number],
    labelBgBorderRadius: 4,
    labelShowBg: true,
    interactionWidth: 20,
  },
  { 
    id: "e1-3", 
    source: "1", 
    target: "3", 
    animated: true, 
    type: "smoothstep" 
  },
]

function DemoPageContent() {
  const router = useRouter()
  const reactFlowInstance = useReactFlow()
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null)
    const [openTemplates, setOpenTemplates] = useState(false)

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
        animated: true,
        type: "smoothstep",
      }
      setEdges((eds) => addEdge(newEdge, eds))
    },
    [setEdges]
  )

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
    setSelectedEdge(null)
  }, [])

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge)
    setSelectedNode(null)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
    setSelectedEdge(null)
  }, [])

  const handleAddNode = useCallback(() => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: "rectangle",
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
      data: {
        label: "New Node",
        description: "Add description",
        color: "#3b82f6",
        shape: "rectangle",
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
            // If shape is being changed, update the node type as well
            const updatedNode = {
              ...node,
              data: { ...node.data, ...newData },
            }
            if (newData.shape) {
              updatedNode.type = newData.shape
            }
            return updatedNode
          }
          return node
        })
      )
      setSelectedNode((prev) => {
        if (prev && prev.id === nodeId) {
          const updatedNode = {
            ...prev,
            data: { ...prev.data, ...newData },
          }
          if (newData.shape) {
            updatedNode.type = newData.shape
          }
          return updatedNode
        }
        return prev
      })
    },
    [setNodes]
  )

  const handleUpdateEdge = useCallback(
    (edgeId: string, updates: any) => {
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === edgeId) {
            return { ...edge, ...updates }
          }
          return edge
        })
      )
      setSelectedEdge((prev) => {
        if (prev && prev.id === edgeId) {
          return { ...prev, ...updates }
        }
        return prev
      })
    },
    [setEdges]
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
    link.download = "temp2.json"
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
    reactFlowInstance.zoomIn()
  }, [reactFlowInstance])

  const handleZoomOut = useCallback(() => {
    reactFlowInstance.zoomOut()
  }, [reactFlowInstance])

  const handleFitView = useCallback(() => {
    reactFlowInstance.fitView()
  }, [reactFlowInstance])

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
        <Button
            variant="ghost"
            onClick={() => setOpenTemplates(true)}
            className="absolute top-4 right-4 z-20 bg-background/95 backdrop-blur-sm border shadow-lg"
        >
            <PlusCircle className="h-4 w-4 mr-2" />
            Templates availaible
        </Button>
        <TemplateSelectorModal
            open={openTemplates}
            onOpenChange={setOpenTemplates}
            onSelectTemplate={(path) => {
                fetch(path)
                    .then((res) => res.json())
                    .then((data) => {
                        if (data.nodes && data.edges) {
                            setNodes(data.nodes)
                            setEdges(data.edges)
                            toast.success("Template loaded successfully!")
                        } else {
                            toast.error("Invalid template format")
                        }
                    })
                    .catch(() => toast.error("Error loading template"))
                    .finally(() => setOpenTemplates(false))
            }}
        />
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

      {/* Node Properties Panel */}
      {selectedNode && (
        <DemoPropertiesPanel
          selectedNode={selectedNode}
          onClose={() => setSelectedNode(null)}
          onUpdateNode={handleUpdateNode}
        />
      )}

      {/* Edge Properties Panel */}
      {selectedEdge && (
        <EdgePropertiesPanel
          selectedEdge={selectedEdge}
          onClose={() => setSelectedEdge(null)}
          onUpdateEdge={handleUpdateEdge}
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
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
      />
    </div>
  )
}

function TemplateSelectorModal({
                                   open,
                                   onOpenChange,
                                   onSelectTemplate,
                               }: {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSelectTemplate: (path: string) => void
}) {
    const templates = [
        {
            name: "Basic Mindmap",
            path: "templates/temp1.json",
            desc: "Mindmap mẫu cơ bản với 6 node",
        },
        {
            name: "Flowchart Example",
            path: "templates/temp2.json",
            desc: "tesst2",
        },
        {
            name: "Flowchart Example",
            path: "templates/temp3.json",
            desc: "Sơ đồ quy trình đơn giản",
        },
        {
            name: "Flowchart Example",
            path: "templates/temp4.json",
            desc: "Sơ đồ quy trình đơn giản",
        },
        {
            name: "Flowchart Example",
            path: "templates/temp5.json",
            desc: "Sơ đồ quy trình đơn giản",
        },{
            name: "Flowchart Example",
            path: "templates/temp6.json",
            desc: "Sơ đồ quy trình đơn giản",
        },
    ]
    const itemsPerPage = 3
    const [page, setPage] = useState(1)
    const totalPages = Math.ceil(templates.length / itemsPerPage)
    const startIndex = (page - 1) * itemsPerPage
    const visibleTemplates = templates.slice(startIndex, startIndex + itemsPerPage)
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-center">
                        Template availaible
                    </DialogTitle>
                </DialogHeader>

                {/* Danh sách template có phân trang */}
                <div className="space-y-3 mb-4">
                    {visibleTemplates.map((tpl) => (
                        <Card
                            key={tpl.path}
                            className="cursor-pointer hover:border-primary transition"
                            onClick={() => onSelectTemplate(tpl.path)}
                        >
                            <CardContent className="p-4">
                                <p className="font-medium">{tpl.name}</p>
                                <p className="text-sm text-muted-foreground">{tpl.desc}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Thanh phân trang */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        ← Trang trước
                    </Button>

                    <span className="text-sm text-muted-foreground">
            Trang {page}/{totalPages}
          </span>

                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                        Trang sau →
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default function DemoPage() {
  return (
    <ReactFlowProvider>
      <DemoPageContent />
    </ReactFlowProvider>
  )
}

