"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'
import { Node, Edge, Viewport, MarkerType } from 'reactflow'
import { MindmapResponse } from '@/types/mindmap.types'

interface EmbedMindmapContextType {
    mindmap: MindmapResponse | null
    nodes: Node[]
    edges: Edge[]
    selectedNode: Node | null
    selectedEdge: Edge | null
    setSelectedNode: (node: Node | null) => void
    setSelectedEdge: (edge: Edge | null) => void
    setFullMindmapState: (data: MindmapResponse | null) => void
    // Stub functions for compatibility with Canvas component
    onNodesChange: (changes: any[]) => void
    onEdgesChange: (changes: any[]) => void
    onConnect: (connection: any) => void
    addNode: (position: { x: number; y: number }, shape?: string) => string
    deleteNode: (nodeId: string) => void
    deleteEdge: (edgeId: string) => void
    updateNodeData: (nodeId: string, data: any) => void
    updateEdgeData: (edgeId: string, updates: any) => void
    onViewportChange: (viewport: Viewport) => void
    canUndo: boolean
    canRedo: boolean
    undo: () => Promise<void>
    redo: () => Promise<void>
}

const EmbedMindmapContext = createContext<EmbedMindmapContextType | undefined>(undefined)

export function useEmbedMindmapContext() {
    const context = useContext(EmbedMindmapContext)
    if (!context) {
        throw new Error('useEmbedMindmapContext must be used within EmbedMindmapProvider')
    }
    return context
}

export function EmbedMindmapProvider({ children }: { children: React.ReactNode }) {
    const [mindmap, setMindmap] = useState<MindmapResponse | null>(null)
    const [nodes, setNodes] = useState<Node[]>([])
    const [edges, setEdges] = useState<Edge[]>([])
    const [selectedNode, setSelectedNode] = useState<Node | null>(null)
    const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null)

    const setFullMindmapState = useCallback((data: MindmapResponse | null) => {
        if (!data) {
            setMindmap(null)
            setNodes([])
            setEdges([])
            return
        }

        setMindmap(data)

        // Normalize nodes
        let normalizedNodes = (data.nodes || []).map((node: any) => {
            const nodeType = node.type === 'default' ? 'rectangle' : node.type
            const nodeShape = node.data?.shape || nodeType || 'rectangle'
            return {
                ...node,
                type: nodeType,
                data: {
                    label: 'Node',
                    description: '',
                    color: '#3b82f6',
                    ...node.data,
                    shape: node.data?.shape || nodeShape,
                }
            }
        })

        // Normalize edges
        const incomingEdges = Array.isArray(data.edges) ? data.edges : []
        const edgeIds = new Set<string>()
        const edgeSigs = new Set<string>()
        const normalizedEdges: any[] = []

        for (let i = 0; i < incomingEdges.length; i++) {
            const e: any = incomingEdges[i] || {}
            const base = {
                ...e,
                animated: e.animated !== undefined ? e.animated : true,
                type: e.type || 'smoothstep',
                markerEnd: e.markerEnd || { type: MarkerType.ArrowClosed },
            }
            const sig = `${String(base.source || '')}|${String(base.target || '')}|${String(base.sourceHandle || '')}|${String(base.targetHandle || '')}`
            if (edgeSigs.has(sig)) continue
            let id = String(base.id || '')
            if (!id || edgeIds.has(id)) {
                let uid = `edge-${String(base.source || 'S')}-${String(base.target || 'T')}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
                while (edgeIds.has(uid)) {
                    uid = `edge-${String(base.source || 'S')}-${String(base.target || 'T')}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
                }
                base.id = uid
                id = uid
            }
            edgeIds.add(id)
            edgeSigs.add(sig)
            normalizedEdges.push(base)
        }

        setNodes(normalizedNodes)
        setEdges(normalizedEdges)
    }, [])

    // Stub functions - read-only mode, no operations allowed
    const noOp = useCallback(() => { }, [])
    const noOpAsync = useCallback(async () => { }, [])
    const noOpAddNode = useCallback(() => '', [])

    const value: EmbedMindmapContextType = {
        mindmap,
        nodes,
        edges,
        selectedNode,
        selectedEdge,
        setSelectedNode,
        setSelectedEdge,
        setFullMindmapState,
        // Stub functions for read-only mode
        onNodesChange: noOp,
        onEdgesChange: noOp,
        onConnect: noOp,
        addNode: noOpAddNode,
        deleteNode: noOp,
        deleteEdge: noOp,
        updateNodeData: noOp,
        updateEdgeData: noOp,
        onViewportChange: noOp,
        canUndo: false,
        canRedo: false,
        undo: noOpAsync,
        redo: noOpAsync,
    }

    return (
        <EmbedMindmapContext.Provider value={value}>
            {children}
        </EmbedMindmapContext.Provider>
    )
}
