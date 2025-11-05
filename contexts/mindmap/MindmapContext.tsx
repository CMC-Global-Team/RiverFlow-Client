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
  isSaving: boolean
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  setSelectedNode: (node: Node | null) => void
  addNode: (position: { x: number; y: number }) => void
  deleteNode: (nodeId: string) => void
  updateNodeData: (nodeId: string, data: any) => void
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
      setEdges((eds) => addEdge(connection, eds))
    },
    []
  )

  // Add new node
  const addNode = useCallback((position: { x: number; y: number }) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'default',
      position,
      data: { label: 'New Node' },
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

  // Update node data
  const updateNodeData = useCallback((nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...data } }
        }
        return node
      })
    )
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
    isSaving,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNode,
    addNode,
    deleteNode,
    updateNodeData,
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

