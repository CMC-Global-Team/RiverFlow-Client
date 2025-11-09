"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { Node, Edge, Connection, addEdge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from 'reactflow'
import { getMindmapById, updateMindmap } from '@/services/mindmap/mindmap.service'
import { MindmapResponse } from '@/types/mindmap.types'

interface MindmapContextType {
  mindmap: MindmapResponse | null
  nodes: Node[]
  edges: Edge[]
  selectedNode: Node | null
  selectedEdge: Edge | null
  isSaving: boolean
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  setSelectedNode: (node: Node | null) => void
  setSelectedEdge: (edge: Edge | null) => void
  addNode: (position: { x: number; y: number }, shape?: string) => string
  deleteNode: (nodeId: string) => void
  deleteEdge: (edgeId: string) => void
  updateNodeData: (nodeId: string, data: any) => void
  updateEdgeData: (edgeId: string, updates: any) => void
  saveMindmap: () => Promise<void>
  loadMindmap: (id: string) => Promise<void>
  setTitle: (title: string) => void
}

const MindmapContext = createContext<MindmapContextType | undefined>(undefined)

export function MindmapProvider({ children }: { children: React.ReactNode }) {
  const [mindmap, setMindmap] = useState<MindmapResponse | null>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Load mindmap by ID
  const loadMindmap = useCallback(async (id: string) => {
    try {
      const data = await getMindmapById(id)
      console.log('Loaded mindmap data:', data)
      console.log('Loaded nodes:', data.nodes)
      console.log('Loaded edges:', data.edges)
      
      setMindmap(data)
      
      // Normalize nodes - ensure all have required properties
      let normalizedNodes = (data.nodes || []).map((node: any) => {
        // If node doesn't have shape in data, infer from type or set default
        const nodeType = node.type === 'default' ? 'rectangle' : node.type
        const nodeShape = node.data?.shape || nodeType || 'rectangle'
        
        return {
          ...node,
          type: nodeType, // Convert 'default' to 'rectangle'
          data: {
            // Set defaults first
            label: 'Node',
            description: '',
            color: '#3b82f6',
            // Then override with existing data
            ...node.data,
            // Ensure shape is always set correctly based on type
            shape: node.data?.shape || nodeShape,
          }
        }
      })
      
      // If mindmap is empty (no nodes), create a root node at the center of the screen
      if (normalizedNodes.length === 0) {
        // Calculate center position based on viewport size
        // ReactFlow uses its own coordinate system, so we calculate based on typical canvas dimensions
        // The canvas area is typically the viewport minus sidebar (256px) and accounting for padding
        let centerX = 400 // Default center X
        let centerY = 300 // Default center Y
        
        if (typeof window !== 'undefined') {
          // Calculate based on window dimensions
          // Canvas width = window width - sidebar (256px) - properties panel (320px when open, but assume closed initially) - padding
          const canvasWidth = window.innerWidth - 256 - 32 // sidebar + padding
          const canvasHeight = window.innerHeight - 80 - 32 // header (~80px) + padding
          
          // Center position in ReactFlow coordinates (accounting for typical node size ~200x100)
          centerX = canvasWidth / 2 - 100
          centerY = canvasHeight / 2 - 50
        }
        
        const rootNode: Node = {
          id: `root-node-${Date.now()}`,
          type: 'rectangle',
          position: { x: centerX, y: centerY },
          data: {
            label: 'Root Node',
            description: 'Click to edit',
            color: '#3b82f6',
            shape: 'rectangle',
          },
        }
        normalizedNodes = [rootNode]
        console.log('Created root node at center:', rootNode)
      }
      
      // Normalize edges - ensure all have required properties
      const normalizedEdges = (data.edges || []).map((edge: any) => {
        return {
          ...edge,
          animated: edge.animated !== undefined ? edge.animated : true,
          type: edge.type || 'smoothstep',
          // Preserve any existing edge properties (label, labelStyle, etc.)
        }
      })
      
      setNodes(normalizedNodes)
      setEdges(normalizedEdges)
      
      console.log('Normalized nodes:', normalizedNodes)
      console.log('Normalized edges:', normalizedEdges)
    } catch (error) {
      console.error('Error loading mindmap:', error)
    }
  }, [])

  // Node changes handler
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds))
    },
    []
  )

  // Edge changes handler
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds))
    },
    []
  )

  // Connection handler
  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
        animated: true,
        type: "smoothstep",
      }
      setEdges((eds) => addEdge(newEdge, eds))
    },
    []
  )

  // Add new node
  const addNode = useCallback((position: { x: number; y: number }, shape: string = 'rectangle') => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: shape,
      position,
      data: { 
        label: 'New Node', 
        description: 'Add description',
        color: '#3b82f6',
        shape,
      },
    }
    setNodes((nds) => [...nds, newNode])
    return newNode.id
  }, [])

  // Delete node
  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId))
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null)
    }
  }, [selectedNode])

  // Delete edge
  const deleteEdge = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId))
    if (selectedEdge?.id === edgeId) {
      setSelectedEdge(null)
    }
  }, [selectedEdge])

  // Update node data
  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
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
  }, [])

  // Update edge data
  const updateEdgeData = useCallback((edgeId: string, updates: any) => {
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
  }, [])

  // Set title
  const setTitle = useCallback((title: string) => {
    if (mindmap) {
      setMindmap({ ...mindmap, title })
    }
  }, [mindmap])

  // Save mindmap
  const saveMindmap = useCallback(async () => {
    if (!mindmap?.id) {
      console.error('No mindmap loaded')
      return
    }

    setIsSaving(true)
    try {
      console.log('Saving mindmap with nodes:', nodes)
      console.log('Saving mindmap with edges:', edges)
      
      await updateMindmap(mindmap.id, {
        title: mindmap.title,
        nodes,
        edges,
      })
      console.log('Mindmap saved successfully')
    } catch (error) {
      console.error('Error saving mindmap:', error)
      throw error
    } finally {
      setIsSaving(false)
    }
  }, [mindmap, nodes, edges])

  const value: MindmapContextType = {
    mindmap,
    nodes,
    edges,
    selectedNode,
    selectedEdge,
    isSaving,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNode,
    setSelectedEdge,
    addNode,
    deleteNode,
    deleteEdge,
    updateNodeData,
    updateEdgeData,
    saveMindmap,
    loadMindmap,
    setTitle,
  }

  return <MindmapContext.Provider value={value}>{children}</MindmapContext.Provider>
}

export function useMindmapContext() {
  const context = useContext(MindmapContext)
  if (context === undefined) {
    throw new Error('useMindmapContext must be used within a MindmapProvider')
  }
  return context
}

