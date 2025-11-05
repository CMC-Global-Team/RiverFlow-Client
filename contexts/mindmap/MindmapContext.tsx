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
  addNode: (position: { x: number; y: number }, shape?: string) => void
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
      setMindmap(data)
      
      // Convert API data to ReactFlow format
      setNodes(data.nodes || [])
      setEdges(data.edges || [])
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

