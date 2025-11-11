"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { Node, Edge, Connection, addEdge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange, Viewport } from 'reactflow'
import { getMindmapById, updateMindmap, undoMindmap, redoMindmap } from '@/services/mindmap/mindmap.service' 
import { MindmapResponse, UpdateMindmapRequest } from '@/types/mindmap.types'
import { useToast } from "@/hooks/use-toast"

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
  onViewportChange: (viewport: Viewport) => void
  
  canUndo: boolean 
  canRedo: boolean 
  undo: () => Promise<void> 
  redo: () => Promise<void> 
}

const MindmapContext = createContext<MindmapContextType | undefined>(undefined)

export function MindmapProvider({ children }: { children: React.ReactNode }) {
  const [mindmap, setMindmap] = useState<MindmapResponse | null>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [viewport, setViewport] = useState<Viewport | null>(null)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestMindmapRef = useRef(mindmap);
  const latestNodesRef = useRef(nodes);
  const latestEdgesRef = useRef(edges);
  const latestViewportRef = useRef(viewport);

  useEffect(() => { latestMindmapRef.current = mindmap; }, [mindmap]);
  useEffect(() => { latestNodesRef.current = nodes; }, [nodes]);
  useEffect(() => { latestEdgesRef.current = edges; }, [edges]);
  useEffect(() => { latestViewportRef.current = viewport; }, [viewport]);

  const setFullMindmapState = useCallback((data: MindmapResponse | null) => {
    if (!data) {
      setMindmap(null);
      setNodes([]);
      setEdges([]);
      setViewport(null);
      setCanUndo(false);
      setCanRedo(false);
      return;
    }

    setMindmap(data);

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
    });
    
    if (normalizedNodes.length === 0) {
      let centerX = 400, centerY = 300;
      if (typeof window !== 'undefined') {
        const canvasWidth = window.innerWidth - 256 - 32;
        const canvasHeight = window.innerHeight - 80 - 32;
        centerX = canvasWidth / 2 - 100;
        centerY = canvasHeight / 2 - 50;
      }
      const rootNode: Node = {
        id: `root-node-${Date.now()}`,
        type: 'rectangle',
        position: { x: centerX, y: centerY },
        data: { label: 'Root Node', description: 'Click to edit', color: '#3b82f6', shape: 'rectangle' },
      }
      normalizedNodes = [rootNode];
    }
    
    const normalizedEdges = (data.edges || []).map((edge: any) => ({
      ...edge,
      animated: edge.animated !== undefined ? edge.animated : true,
      type: edge.type || 'smoothstep',
    }));
    
    setNodes(normalizedNodes);
    setEdges(normalizedEdges);
    setViewport(data.viewport || { x: 0, y: 0, zoom: 1 });
    
    setCanUndo(data.canUndo);
    setCanRedo(data.canRedo);

  }, []); // useCallback rỗng vì nó là hàm setter

  // --- Cập nhật 'loadMindmap' ---
  const loadMindmap = useCallback(async (id: string) => {
    try {
      const data = await getMindmapById(id)
      setFullMindmapState(data); // <-- Dùng hàm helper mới
    } catch (error) {
      console.error('Error loading mindmap:', error)
    }
  }, [setFullMindmapState]) // <-- Sửa dependency

  // --- Cập nhật 'saveMindmap' ---
  const saveMindmap = useCallback(async () => {
    const currentMindmap = latestMindmapRef.current;
    if (!currentMindmap) {
      console.error('No mindmap loaded, cannot save.')
      return
    }
    setIsSaving(true)
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    
    try {
      const payload: UpdateMindmapRequest = {
        title: currentMindmap.title,
        nodes: latestNodesRef.current,
        edges: latestEdgesRef.current,
        viewport: latestViewportRef.current || undefined,
      };

      const responseData = await updateMindmap(currentMindmap.id, payload); // <-- Lấy response
      setFullMindmapState(responseData); // <-- Dùng helper để set state VÀ cờ undo/redo
      console.log('Mindmap auto-saved successfully');
    } catch (error) {
      // ... (error handling)
    } finally {
      setIsSaving(false)
    }
  }, [toast, setFullMindmapState])

  const triggerDebouncedSave = useCallback(() => {
    if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
        saveMindmap();
    }, 1500);
  }, [saveMindmap]);

// Node changes handler

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds))
      triggerDebouncedSave();
    },
    [triggerDebouncedSave]

  )

  // Edge changes handler
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds))
      triggerDebouncedSave();
    },
    [triggerDebouncedSave]
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
      triggerDebouncedSave();
    },
    [triggerDebouncedSave]
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
    triggerDebouncedSave();
    return newNode.id
  }, [triggerDebouncedSave])

  const deleteNode = useCallback((nodeId: string) => {
     const edgesSnapshot = latestEdgesRef.current;
    const toDelete = new Set<string>();
    const queue: string[] = [nodeId];
    toDelete.add(nodeId);

    while (queue.length > 0) {
      const current = queue.shift() as string;
      const outgoing = edgesSnapshot.filter(e => e.source === current);
      for (const e of outgoing) {
        if (!toDelete.has(e.target)) {
          toDelete.add(e.target);
          queue.push(e.target);
        }
      }
    }

    setNodes((nds) => nds.filter((node) => !toDelete.has(node.id)));
    setEdges((eds) => eds.filter((edge) => !(toDelete.has(edge.source) || toDelete.has(edge.target))));

     if (selectedNode && toDelete.has(selectedNode.id)) {
      setSelectedNode(null);
    }
    if (selectedEdge && (toDelete.has(selectedEdge.source) || toDelete.has(selectedEdge.target))) {
      setSelectedEdge(null);
    }

    triggerDebouncedSave();
  }, [triggerDebouncedSave])

  // Delete edge
  const deleteEdge = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId))
    triggerDebouncedSave();
    if (selectedEdge?.id === edgeId) {
      setSelectedEdge(null)
    }
  }, [triggerDebouncedSave])

  // Update node data
  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    // Handle undefined values by removing the property
    const cleanedData = Object.fromEntries(
      Object.entries(newData).filter(([_, value]) => value !== undefined)
    )
    const dataToMerge = Object.keys(newData).some((key) => newData[key] === undefined)
      ? { ...newData, ...Object.fromEntries(Object.keys(newData).filter(k => newData[k] === undefined).map(k => [k, undefined])) }
      : newData
    
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const updatedData = { ...node.data }
          Object.keys(newData).forEach((key) => {
            if (newData[key] === undefined) {
              delete updatedData[key]
            } else {
              updatedData[key] = newData[key]
            }
          })
          const updatedNode = {
            ...node,
            data: updatedData,
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
        const updatedData = { ...prev.data }
        Object.keys(newData).forEach((key) => {
          if (newData[key] === undefined) {
            delete updatedData[key]
          } else {
            updatedData[key] = newData[key]
          }
        })
        const updatedNode = {
          ...prev,
          data: updatedData,
        }
        if (newData.shape) {
          updatedNode.type = newData.shape
        }
        return updatedNode
      }
      return prev
    })
    triggerDebouncedSave();
  }, [triggerDebouncedSave])

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
    triggerDebouncedSave();
  }, [triggerDebouncedSave])

  // Set title
  const setTitle = useCallback((title: string) => {
    if (mindmap) {
      setMindmap({ ...mindmap, title })
      triggerDebouncedSave();
    }
  }, [mindmap, triggerDebouncedSave])

  const onViewportChange = useCallback((viewport: Viewport) => {
    setViewport(viewport);
    triggerDebouncedSave(); // Kích hoạt lưu khi di chuyển
  }, [triggerDebouncedSave]);

  const undo = useCallback(async () => {
      if (!mindmap?.id || !canUndo) return; // Kiểm tra nếu có thể undo

      // Hủy mọi thay đổi đang chờ lưu (debounce)
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      
      setIsSaving(true); // Hiển thị loading (tùy chọn)
      try {
          const restoredMindmap = await undoMindmap(mindmap.id);
          setFullMindmapState(restoredMindmap); // Cập nhật state với dữ liệu mới
          toast({ title: "Đã hoàn tác!" });
      } catch (error) {
          console.error("Undo failed:", error);
          toast({ variant: "destructive", title: "Lỗi", description: "Không thể hoàn tác." });
      } finally {
          setIsSaving(false);
      }
  }, [mindmap?.id, canUndo, toast, setFullMindmapState]); // Thêm dependencies

  const redo = useCallback(async () => {
      if (!mindmap?.id || !canRedo) return; // Kiểm tra nếu có thể redo
      
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      
      setIsSaving(true);
      try {
          const restoredMindmap = await redoMindmap(mindmap.id);
          setFullMindmapState(restoredMindmap); // Cập nhật state
          toast({ title: "Đã làm lại!" });
      } catch (error) {
          console.error("Redo failed:", error);
          toast({ variant: "destructive", title: "Lỗi", description: "Không thể làm lại." });
      } finally {
          setIsSaving(false);
      }
  }, [mindmap?.id, canRedo, toast, setFullMindmapState]);

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
    onViewportChange,
    canUndo,
    canRedo,
    undo,
    redo,
  }

  return <MindmapContext.Provider value={value}>{children}</MindmapContext.Provider>
}

// (Hook useMindmapContext giữ nguyên)
export function useMindmapContext() {
  const context = useContext(MindmapContext)
  if (context === undefined) {
    throw new Error('useMindmapContext must be used within a MindmapProvider')
  }
  return context
}