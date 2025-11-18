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
  autoSaveEnabled: boolean
  setAutoSaveEnabled: (enabled: boolean) => void
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  canUndo: boolean 
  canRedo: boolean 
  undo: () => Promise<void> 
  redo: () => Promise<void> 
  setFullMindmapState: (data: MindmapResponse | null) => void
}const MindmapContext = createContext<MindmapContextType | undefined>(undefined)

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface AutoSaveOptions {
  defaultEnabled?: boolean
  debounceMs?: number
  statusResetMs?: number
  setIsSaving?: (value: boolean) => void
  onError?: (error: unknown) => void
}

interface UseMindmapAutoSaveResult {
  autoSaveEnabled: boolean
  setAutoSaveEnabled: (enabled: boolean) => void
  saveStatus: SaveStatus
  scheduleAutoSave: (debounceMsOverride?: number) => void
  saveImmediately: () => Promise<void>
  cancelScheduledSave: () => void
  markSynced: (status?: SaveStatus) => void
}

function useMindmapAutoSave(
  onSave: () => Promise<void>,
  {
    defaultEnabled = true,
    debounceMs = 1500,
    statusResetMs = 2000,
    setIsSaving,
    onError,
  }: AutoSaveOptions = {}
): UseMindmapAutoSaveResult {
  const [autoSaveEnabled, setAutoSaveEnabledState] = useState(defaultEnabled)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const statusTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
        saveTimerRef.current = null
      }
      if (statusTimerRef.current) {
        clearTimeout(statusTimerRef.current)
        statusTimerRef.current = null
      }
    }
  }, [])

  const clearSaveTimer = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }
  }, [])

  const clearStatusTimer = useCallback(() => {
    if (statusTimerRef.current) {
      clearTimeout(statusTimerRef.current)
      statusTimerRef.current = null
    }
  }, [])

  const scheduleStatusReset = useCallback(() => {
    clearStatusTimer()
    statusTimerRef.current = setTimeout(() => {
      if (!isMountedRef.current) return
      setSaveStatus('idle')
    }, statusResetMs)
  }, [clearStatusTimer, statusResetMs])

  const runSave = useCallback(async () => {
    clearSaveTimer()
    clearStatusTimer()
    setIsSaving?.(true)
    setSaveStatus('saving')
    try {
      await onSave()
      if (!isMountedRef.current) return
      setSaveStatus('saved')
      scheduleStatusReset()
    } catch (error) {
      if (isMountedRef.current) {
        setSaveStatus('error')
      }
      onError?.(error)
      throw error
    } finally {
      setIsSaving?.(false)
    }
  }, [clearSaveTimer, clearStatusTimer, onSave, onError, scheduleStatusReset, setIsSaving])

  const scheduleAutoSave = useCallback(
    (debounceMsOverride?: number) => {
      if (!autoSaveEnabled) return
      clearSaveTimer()
      const delay = debounceMsOverride ?? debounceMs
      saveTimerRef.current = setTimeout(() => {
        runSave().catch(() => {})
      }, delay)
    },
    [autoSaveEnabled, clearSaveTimer, debounceMs, runSave]
  )

  const saveImmediately = useCallback(async () => {
    await runSave()
  }, [runSave])

  const cancelScheduledSave = useCallback(() => {
    clearSaveTimer()
  }, [clearSaveTimer])

  const markSynced = useCallback(
    (status: SaveStatus = 'saved') => {
      if (!isMountedRef.current) return
      clearStatusTimer()
      setSaveStatus(status)
      if (status === 'saved') {
        scheduleStatusReset()
      }
    },
    [clearStatusTimer, scheduleStatusReset]
  )

  const handleToggleAutoSave = useCallback(
    (enabled: boolean) => {
      setAutoSaveEnabledState(enabled)
      if (!enabled) {
        cancelScheduledSave()
        clearStatusTimer()
        setSaveStatus('idle')
      }
    },
    [cancelScheduledSave, clearStatusTimer]
  )

  return {
    autoSaveEnabled,
    setAutoSaveEnabled: handleToggleAutoSave,
    saveStatus,
    scheduleAutoSave,
    saveImmediately,
    cancelScheduledSave,
    markSynced,
  }
}

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
  const performSave = useCallback(async () => {
    const currentMindmap = latestMindmapRef.current
    if (!currentMindmap) {
      throw new Error('No mindmap loaded, cannot save.')
    }

    const payload: UpdateMindmapRequest = {
      title: currentMindmap.title,
      nodes: latestNodesRef.current,
      edges: latestEdgesRef.current,
      viewport: latestViewportRef.current || undefined,
    }

    const responseData = await updateMindmap(currentMindmap.id, payload)
    setFullMindmapState(responseData)
  }, [setFullMindmapState])

  const {
    autoSaveEnabled,
    setAutoSaveEnabled,
    saveStatus,
    scheduleAutoSave,
    saveImmediately,
    cancelScheduledSave,
    markSynced,
  } = useMindmapAutoSave(performSave, {
    setIsSaving,
    onError: (error) => {
      console.error('Mindmap save failed:', error)
      toast({
        variant: 'destructive',
        title: 'Save failed',
        description: 'Unable to sync your changes. They will retry shortly.',
      })
    },
  })

  const loadMindmap = useCallback(async (id: string) => {
    try {
      const data = await getMindmapById(id)
      setFullMindmapState(data)
      markSynced('idle')
    } catch (error) {
      console.error('Error loading mindmap:', error)
    }
  }, [markSynced, setFullMindmapState])

  const saveMindmap = useCallback(async () => {
    try {
      await saveImmediately()
    } catch (error) {
      throw error
    }
  }, [saveImmediately])

// Node changes handler

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds))
      scheduleAutoSave()
    },
    [scheduleAutoSave]
  )

  // Edge changes handler
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds))
      scheduleAutoSave()
    },
    [scheduleAutoSave]
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
      scheduleAutoSave()
    },
    [scheduleAutoSave]
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
    scheduleAutoSave()
    return newNode.id
  }, [scheduleAutoSave])

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

    scheduleAutoSave()
  }, [scheduleAutoSave])

  // Delete edge
  const deleteEdge = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId))
    scheduleAutoSave()
    if (selectedEdge?.id === edgeId) {
      setSelectedEdge(null)
    }
  }, [scheduleAutoSave])

  // Update node data
  const updateNodeData = useCallback((nodeId: string, newData: any) => {
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
          // If scale changed, trigger ReactFlow to recalculate handle positions
          // by incrementing a tiny position change (0.01px is imperceptible)
          if (newData.scale !== undefined) {
            updatedNode.position = {
              x: node.position.x + 0.001,
              y: node.position.y + 0.001,
            }
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
        // If scale changed, trigger ReactFlow to recalculate handle positions
        if (newData.scale !== undefined) {
          updatedNode.position = {
            x: prev.position.x + 0.001,
            y: prev.position.y + 0.001,
          }
        }
        return updatedNode
      }
      return prev
    })
    scheduleAutoSave()
  }, [scheduleAutoSave])

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
    scheduleAutoSave()
  }, [scheduleAutoSave])

  // Set title
  const setTitle = useCallback((title: string) => {
    if (mindmap) {
      setMindmap({ ...mindmap, title })
      scheduleAutoSave()
    }
  }, [mindmap, scheduleAutoSave])

  const onViewportChange = useCallback((viewport: Viewport) => {
    setViewport(viewport);
    scheduleAutoSave() // Kích hoạt lưu khi di chuyển
  }, [scheduleAutoSave]);

  const undo = useCallback(async () => {
      if (!mindmap?.id || !canUndo) return; // Kiểm tra nếu có thể undo

      cancelScheduledSave();
      
      setIsSaving(true); // Hiển thị loading (tùy chọn)
      try {
          const restoredMindmap = await undoMindmap(mindmap.id);
          setFullMindmapState(restoredMindmap); // Cập nhật state với dữ liệu mới
          markSynced('saved');
          toast({ title: "Đã hoàn tác!" });
      } catch (error) {
          console.error("Undo failed:", error);
          toast({ variant: "destructive", title: "Lỗi", description: "Không thể hoàn tác." });
      } finally {
          setIsSaving(false);
      }
  }, [mindmap?.id, canUndo, cancelScheduledSave, markSynced, toast, setFullMindmapState]); // Thêm dependencies

  const redo = useCallback(async () => {
      if (!mindmap?.id || !canRedo) return; // Kiểm tra nếu có thể redo
      
      cancelScheduledSave();
      
      setIsSaving(true);
      try {
          const restoredMindmap = await redoMindmap(mindmap.id);
          setFullMindmapState(restoredMindmap); // Cập nhật state
          markSynced('saved');
          toast({ title: "Đã làm lại!" });
      } catch (error) {
          console.error("Redo failed:", error);
          toast({ variant: "destructive", title: "Lỗi", description: "Không thể làm lại." });
      } finally {
          setIsSaving(false);
      }
  }, [mindmap?.id, canRedo, cancelScheduledSave, markSynced, toast, setFullMindmapState]);

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
    autoSaveEnabled,
    setAutoSaveEnabled,
    saveStatus,
    canUndo,
    canRedo,
    undo,
    redo,
    setFullMindmapState,
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