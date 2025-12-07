"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { Node, Edge, Connection, addEdge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange, Viewport, MarkerType } from 'reactflow'
import { getMindmapById, updateMindmap, updatePublicMindmap, updateMindmapByTokenFallback } from '@/services/mindmap/mindmap.service'
import { MindmapResponse, UpdateMindmapRequest } from '@/types/mindmap.types'
import { useToast } from "@/hooks/use-toast"
import { getSocket, joinMindmap, emitNodesChange, emitEdgesChange, emitConnect, emitViewport, emitCursorMove, emitPresenceAnnounce, emitPresenceActive, emitPresenceClear, emitNodeUpdate, emitEdgeUpdate } from '@/lib/realtime'

// Import from modular files
import {
  MindmapContextType,
  ParticipantInfo,
  AccessRevokedState,
  PermissionChangedState,
  PresenceInfo,
} from './types'
import { useMindmapAutoSave } from './useMindmapAutoSave'
import { normalizeNodes, normalizeEdges, generateEdgeId } from './nodeEdgeUtils'
import { createSocketHandlers, attachSocketListeners, detachSocketListeners, SocketHandlerRefs, SocketHandlerSetters } from './socketHandlers'

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

  // Refs for latest state
  const latestMindmapRef = useRef(mindmap)
  const latestNodesRef = useRef(nodes)
  const latestEdgesRef = useRef(edges)
  const lastConnectedAtRef = useRef<number>(0)
  const latestViewportRef = useRef(viewport)
  const socketRef = useRef<any>(null)
  const roomRef = useRef<string | null>(null)
  const [participants, setParticipants] = useState<Record<string, ParticipantInfo>>({})
  const lastPresenceInfoRef = useRef<PresenceInfo | null>(null)
  const lastReannounceAtRef = useRef<number>(0)
  const isApplyingHistoryRef = useRef(false)

  // Access control state
  const [accessRevoked, setAccessRevoked] = useState<AccessRevokedState | null>(null)
  const currentUserIdRef = useRef<number | string | null>(null)

  // Permission changed state
  const [permissionChanged, setPermissionChanged] = useState<PermissionChangedState | null>(null)

  // Debounce ref for snapshot recording
  const lastSnapshotAtRef = useRef<number>(0)
  const MIN_SNAPSHOT_INTERVAL = 500 // ms

  // Record snapshot to server for undo/redo
  // Use setTimeout to ensure React has updated the refs with new state
  const recordSnapshot = useCallback(() => {
    // Debounce: skip if too soon after last snapshot
    const now = Date.now()
    if (now - lastSnapshotAtRef.current < MIN_SNAPSHOT_INTERVAL) {
      return
    }
    lastSnapshotAtRef.current = now

    // Use setTimeout to ensure refs are updated after React state changes
    setTimeout(() => {
      const s = socketRef.current
      const room = roomRef.current
      if (!s || !room) return

      const snapshot = {
        nodes: latestNodesRef.current.map(n => ({ ...n, data: { ...(n.data || {}) } })),
        edges: latestEdgesRef.current.map(e => ({ ...e })),
        viewport: latestViewportRef.current ? { ...latestViewportRef.current } : null,
      }
      console.log('[MindmapContext] Recording snapshot with', snapshot.nodes.length, 'nodes')
      s.emit('mindmap:snapshot', room, { snapshot })
    }, 50)
  }, [])

  // Sync refs with state
  useEffect(() => { latestMindmapRef.current = mindmap }, [mindmap])
  useEffect(() => { latestNodesRef.current = nodes }, [nodes])
  useEffect(() => { latestEdgesRef.current = edges }, [edges])
  useEffect(() => { latestViewportRef.current = viewport }, [viewport])

  const setFullMindmapState = useCallback((data: MindmapResponse | null) => {
    if (!data) {
      setMindmap(null)
      setNodes([])
      setEdges([])
      setViewport(null)
      setCanUndo(false)
      setCanRedo(false)
      return
    }

    setMindmap(data)
    const normalizedNodes = normalizeNodes(data.nodes || [])
    const normalizedEdges = normalizeEdges(data.edges || [])

    setNodes(normalizedNodes)
    setEdges(normalizedEdges)
    setViewport(data.viewport || { x: 0, y: 0, zoom: 1 })

    // Update refs immediately for initial snapshot
    latestNodesRef.current = normalizedNodes
    latestEdgesRef.current = normalizedEdges
    latestViewportRef.current = data.viewport || { x: 0, y: 0, zoom: 1 }

    // Use server-provided flags
    setCanUndo(data.canUndo ?? false)
    setCanRedo(data.canRedo ?? false)
  }, [])

  // Socket connection and handlers
  useEffect(() => {
    if (!mindmap) return
    if (!mindmap.id) return // Skip for embed mode

    const s = getSocket()
    socketRef.current = s

    const payload: any = mindmap.isPublic === true && mindmap.shareToken
      ? { shareToken: mindmap.shareToken }
      : { mindmapId: mindmap.id }

    joinMindmap(s, payload)

    const refs: SocketHandlerRefs = {
      latestMindmapRef,
      latestNodesRef,
      latestEdgesRef,
      latestViewportRef,
      socketRef,
      roomRef,
      currentUserIdRef,
      isApplyingHistoryRef,
      lastPresenceInfoRef,
      lastReannounceAtRef,
    }

    const setters: SocketHandlerSetters = {
      setNodes,
      setEdges,
      setViewport,
      setSelectedNode,
      setSelectedEdge,
      setParticipants,
      setAccessRevoked,
      setPermissionChanged,
      setCanUndo,
      setCanRedo,
      setFullMindmapState,
      markSynced,
      toast: (opts) => toast(opts as any),
      emitPresenceAnnounce,
    }

    const handlers = createSocketHandlers(refs, setters, payload)
    attachSocketListeners(s, handlers)

    return () => {
      detachSocketListeners(s, handlers)
    }
  }, [mindmap, setFullMindmapState])

  // Sync canUndo/canRedo from mindmap
  useEffect(() => {
    if (mindmap) {
      setCanUndo(mindmap.canUndo ?? false)
      setCanRedo(mindmap.canRedo ?? false)
    }
  }, [mindmap])

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

    let responseData: MindmapResponse
    if (currentMindmap.isPublic === true && currentMindmap.publicAccessLevel === 'edit' && currentMindmap.shareToken) {
      try {
        const payloadWithId = { ...(payload as any), id: currentMindmap.id }
        responseData = await updatePublicMindmap(currentMindmap.shareToken, payloadWithId)
      } catch (e: any) {
        const status = e?.response?.status
        if (status && status < 500) {
          responseData = await updateMindmapByTokenFallback(currentMindmap.id, currentMindmap.shareToken, payload)
        } else {
          throw e
        }
      }
    } else {
      responseData = await updateMindmap(currentMindmap.id, payload)
    }
    setFullMindmapState(responseData)
  }, [setFullMindmapState])

  const {
    autoSaveEnabled,
    setAutoSaveEnabled,
    setAutoSaveEnabledExternal,
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

  // Socket listeners for auto-save and undo/redo sync
  useEffect(() => {
    const s = socketRef.current
    if (!s) return

    const onAutoSaveSync = (data: any) => {
      if (data?.enabled !== undefined) {
        console.log('[MindmapContext] Auto-save synced:', data.enabled, 'from clientId:', data.clientId)
        setAutoSaveEnabledExternal(data.enabled)
      }
    }

    const onUndoPerformed = (data: any) => {
      if (data?.snapshot) {
        console.log('[MindmapContext] Undo synced with snapshot', 'from clientId:', data.clientId)
        const snap = data.snapshot
        const nextState: any = {
          ...latestMindmapRef.current,
          nodes: Array.isArray(snap.nodes) ? snap.nodes : latestNodesRef.current,
          edges: Array.isArray(snap.edges) ? snap.edges : latestEdgesRef.current,
          viewport: snap.viewport || latestViewportRef.current,
          canUndo: snap.canUndo ?? latestMindmapRef.current?.canUndo,
          canRedo: snap.canRedo ?? latestMindmapRef.current?.canRedo,
        }

        isApplyingHistoryRef.current = true
        latestNodesRef.current = nextState.nodes
        latestEdgesRef.current = nextState.edges
        latestViewportRef.current = nextState.viewport || null
        setFullMindmapState(nextState)
        isApplyingHistoryRef.current = false
      }
    }

    const onRedoPerformed = (data: any) => {
      if (data?.snapshot) {
        console.log('[MindmapContext] Redo synced with snapshot', 'from clientId:', data.clientId)
        const snap = data.snapshot
        const nextState: any = {
          ...latestMindmapRef.current,
          nodes: Array.isArray(snap.nodes) ? snap.nodes : latestNodesRef.current,
          edges: Array.isArray(snap.edges) ? snap.edges : latestEdgesRef.current,
          viewport: snap.viewport || latestViewportRef.current,
          canUndo: snap.canUndo ?? latestMindmapRef.current?.canUndo,
          canRedo: snap.canRedo ?? latestMindmapRef.current?.canRedo,
        }

        isApplyingHistoryRef.current = true
        latestNodesRef.current = nextState.nodes
        latestEdgesRef.current = nextState.edges
        latestViewportRef.current = nextState.viewport || null
        setFullMindmapState(nextState)
        isApplyingHistoryRef.current = false
      }
    }

    s.on('autosave:sync', onAutoSaveSync)
    s.on('undo:performed', onUndoPerformed)
    s.on('redo:performed', onRedoPerformed)

    return () => {
      s.off('autosave:sync', onAutoSaveSync)
      s.off('undo:performed', onUndoPerformed)
      s.off('redo:performed', onRedoPerformed)
    }
  }, [setAutoSaveEnabledExternal, setFullMindmapState])

  // Synced auto-save toggle
  const handleSyncedAutoSaveToggle = useCallback((enabled: boolean) => {
    setAutoSaveEnabled(enabled)
    const s = socketRef.current
    const room = roomRef.current
    if (s && room) {
      s.emit('autosave:toggle', room, { enabled })
    }
  }, [setAutoSaveEnabled])

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

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const hasSignificantChanges = changes.some(c => c.type !== 'select')
      if (hasSignificantChanges) {
        recordSnapshot()
      }
      setNodes((nds) => applyNodeChanges(changes, nds))
      scheduleAutoSave()
      const s = socketRef.current
      const room = roomRef.current
      if (s && room) emitNodesChange(s, room, changes as any)
    },
    [scheduleAutoSave, recordSnapshot]
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const now = Date.now()
      const suppressRemove = now - lastConnectedAtRef.current < 400
      const filtered = suppressRemove ? changes.filter((ch: any) => ch?.type !== 'remove') : changes

      const hasSignificantChanges = filtered.some(c => c.type !== 'select')
      if (hasSignificantChanges) {
        recordSnapshot()
      }

      setEdges((eds) => applyEdgeChanges(filtered, eds))
      scheduleAutoSave()
      const s = socketRef.current
      const room = roomRef.current
      if (s && room) emitEdgesChange(s, room, filtered as any)
    },
    [scheduleAutoSave, recordSnapshot]
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      const src = (connection as any)?.source
      const tgt = (connection as any)?.target
      if (!src || !tgt) return
      lastConnectedAtRef.current = Date.now()
      recordSnapshot()
      setEdges((eds) => {
        const exists = eds.some(
          (e) =>
            e.source === src &&
            e.target === tgt &&
            ((e.sourceHandle || null) === ((connection as any).sourceHandle || null)) &&
            ((e.targetHandle || null) === ((connection as any).targetHandle || null))
        )
        if (exists) return eds
        const newEdge = {
          id: generateEdgeId(src, tgt),
          ...connection,
          animated: true,
          type: "smoothstep",
          markerEnd: { type: MarkerType.ArrowClosed },
        } as any
        return addEdge(newEdge, eds)
      })
      scheduleAutoSave()
      const s = socketRef.current
      const room = roomRef.current
      if (s && room) emitConnect(s, room, connection as any)
    },
    [scheduleAutoSave, recordSnapshot]
  )

  const addNode = useCallback((position: { x: number; y: number }, shape: string = 'rectangle') => {
    recordSnapshot()
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
    const s = socketRef.current
    const room = roomRef.current
    if (s && room) emitNodesChange(s, room, [{ type: 'add', item: newNode }])
    return newNode.id
  }, [scheduleAutoSave, recordSnapshot])

  const deleteNode = useCallback((nodeId: string) => {
    recordSnapshot()
    const edgesSnapshot = latestEdgesRef.current
    const toDelete = new Set<string>()
    const queue: string[] = [nodeId]
    toDelete.add(nodeId)

    while (queue.length > 0) {
      const current = queue.shift() as string
      const outgoing = edgesSnapshot.filter(e => e.source === current)
      for (const e of outgoing) {
        if (!toDelete.has(e.target)) {
          toDelete.add(e.target)
          queue.push(e.target)
        }
      }
    }

    setNodes((nds) => nds.filter((node) => !toDelete.has(node.id)))
    setEdges((eds) => eds.filter((edge) => !(toDelete.has(edge.source) || toDelete.has(edge.target))))

    if (selectedNode && toDelete.has(selectedNode.id)) {
      setSelectedNode(null)
    }
    if (selectedEdge && (toDelete.has(selectedEdge.source) || toDelete.has(selectedEdge.target))) {
      setSelectedEdge(null)
    }

    scheduleAutoSave()
    const s = socketRef.current
    const room = roomRef.current
    if (s && room) emitNodesChange(s, room, Array.from(toDelete).map((id) => ({ type: 'remove', id })))
  }, [scheduleAutoSave, recordSnapshot, selectedNode, selectedEdge])

  const deleteEdge = useCallback((edgeId: string) => {
    recordSnapshot()
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId))
    scheduleAutoSave()
    if (selectedEdge?.id === edgeId) {
      setSelectedEdge(null)
    }
    const s = socketRef.current
    const room = roomRef.current
    if (s && room) emitEdgesChange(s, room, [{ type: 'remove', id: edgeId }])
  }, [scheduleAutoSave, recordSnapshot, selectedEdge])

  const updateNodeData = useCallback((nodeId: string, newData: any, skipSnapshot = false) => {
    const transientKeys = ['isEditing', 'isHovered', 'isResizing']
    const hasSignificantChanges = Object.keys(newData).some(k => !transientKeys.includes(k))

    if (!skipSnapshot && hasSignificantChanges) {
      recordSnapshot()
    } else {
      console.log('[MindmapContext] updateNodeData skipping snapshot', { skipSnapshot, hasSignificantChanges, keys: Object.keys(newData) })
    }

    let updatedNodeRef: any = null
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
          if (newData.scale !== undefined) {
            updatedNode.position = {
              x: node.position.x + 0.001,
              y: node.position.y + 0.001
            }
            requestAnimationFrame(() => {
              setNodes((n) => n.map(x => x.id === nodeId ? { ...x, position: { x: x.position.x - 0.001, y: x.position.y - 0.001 } } : x))
            })
          }

          updatedNodeRef = updatedNode
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

    scheduleAutoSave()
    const s = socketRef.current
    const room = roomRef.current
    if (s && room && updatedNodeRef) emitNodeUpdate(s, room, updatedNodeRef)
  }, [scheduleAutoSave, recordSnapshot])

  const applyStreamingAdditions = useCallback((addNodes: any[] = [], addEdges: any[] = []) => {
    const existingNodes = latestNodesRef.current || []
    const existingEdges = latestEdgesRef.current || []
    const nodeIds = new Set<string>(existingNodes.map((n: any) => String(n.id)))
    const edgeIds = new Set<string>(existingEdges.map((e: any) => String(e.id)))
    const edgeSigs = new Set<string>(existingEdges.map((e: any) => `${e.source}|${e.target}|${e.sourceHandle || ''}|${e.targetHandle || ''}`))

    const finalNodes: any[] = []
    for (let n of addNodes) {
      const nid = String(n.id)
      if (!nodeIds.has(nid)) {
        nodeIds.add(nid)
        finalNodes.push(n)
      }
    }

    const finalEdges: any[] = []
    for (let e of addEdges) {
      let id = String((e as any).id || '')
      const sig = `${(e as any).source}|${(e as any).target}|${(e as any).sourceHandle || ''}|${(e as any).targetHandle || ''}`
      if (edgeSigs.has(sig)) continue
      if (!id || edgeIds.has(id)) {
        let uid = generateEdgeId((e as any).source, (e as any).target)
        while (edgeIds.has(uid)) {
          uid = generateEdgeId((e as any).source, (e as any).target)
        }
        (e as any).id = uid
        id = uid
      }
      edgeIds.add(id)
      edgeSigs.add(sig)
      finalEdges.push({ ...e })
    }

    if (finalNodes.length === 0 && finalEdges.length === 0) return

    recordSnapshot()
    if (finalNodes.length > 0) setNodes((nds) => [...nds, ...finalNodes])
    if (finalEdges.length > 0) setEdges((eds) => [...eds, ...finalEdges])
    scheduleAutoSave()
    const s = socketRef.current
    const room = roomRef.current
    if (s && room) {
      if (finalNodes.length > 0) emitNodesChange(s, room, finalNodes.map((n) => ({ type: 'add', item: n })) as any)
      if (finalEdges.length > 0) emitEdgesChange(s, room, finalEdges.map((e) => ({ type: 'add', item: e })) as any)
    }
  }, [scheduleAutoSave, recordSnapshot])

  const updateEdgeData = useCallback((edgeId: string, updates: any, skipSnapshot = false) => {
    const transientKeys = ['isEditing', 'isHovered', 'isResizing', 'selected']
    const hasSignificantChanges = Object.keys(updates).some(k => !transientKeys.includes(k))

    if (!skipSnapshot && hasSignificantChanges) {
      recordSnapshot()
    }

    let updated: any = null
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === edgeId) {
          updated = { ...edge, ...updates }
          return updated
        }
        return edge
      })
    )

    setSelectedEdge((prev) => {
      if (prev && prev.id === edgeId) {
        const next = { ...prev, ...updates }
        updated = next
        return next
      }
      return prev
    })

    scheduleAutoSave()
    const s = socketRef.current
    const room = roomRef.current
    if (s && room && updated) {
      emitEdgeUpdate(s, room, updated)
    }
  }, [scheduleAutoSave, recordSnapshot])

  const setTitle = useCallback((title: string) => {
    if (mindmap) {
      setMindmap({ ...mindmap, title })
      scheduleAutoSave()
    }
  }, [mindmap, scheduleAutoSave])

  const onViewportChange = useCallback((viewport: Viewport) => {
    setViewport(viewport)
    scheduleAutoSave()
    const s = socketRef.current
    const room = roomRef.current
    if (s && room) emitViewport(s, room, viewport as any)
  }, [scheduleAutoSave])

  const undo = useCallback(() => {
    const s = socketRef.current
    const room = roomRef.current
    if (!s || !room) {
      toast({
        variant: 'destructive',
        title: 'Undo failed',
        description: 'Not connected to realtime server.'
      })
      return
    }
    s.emit('undo:request', room)
  }, [toast])

  const redo = useCallback(() => {
    const s = socketRef.current
    const room = roomRef.current
    if (!s || !room) {
      toast({
        variant: 'destructive',
        title: 'Redo failed',
        description: 'Not connected to realtime server.'
      })
      return
    }
    s.emit('redo:request', room)
  }, [toast])

  const restoreFromHistory = useCallback(async (snapshot: any, historyId?: string | number | null) => {
    const m = latestMindmapRef.current
    if (!m || !snapshot) return
    const nextState: any = {
      ...m,
      nodes: Array.isArray(snapshot.nodes) ? snapshot.nodes : latestNodesRef.current,
      edges: Array.isArray(snapshot.edges) ? snapshot.edges : latestEdgesRef.current,
      viewport: snapshot.viewport || latestViewportRef.current,
    }
    isApplyingHistoryRef.current = true
    latestNodesRef.current = nextState.nodes
    latestEdgesRef.current = nextState.edges
    latestViewportRef.current = nextState.viewport || null
    setFullMindmapState(nextState)
    await saveMindmap()
    isApplyingHistoryRef.current = false
    const s = socketRef.current
    const room = roomRef.current
    if (s && room) s.emit('history:restore', room, { historyId, snapshot })
    markSynced('idle')
  }, [setFullMindmapState, saveMindmap, markSynced])

  const announcePresence = useCallback((info: PresenceInfo) => {
    const s = socketRef.current
    const room = roomRef.current
    if (s && room) {
      lastPresenceInfoRef.current = info
      currentUserIdRef.current = info?.userId || null
      emitPresenceAnnounce(s, room, info)
      setParticipants((prev) => ({
        ...prev,
        [s.id]: {
          clientId: s.id,
          userId: info?.userId || null,
          name: info?.name || '',
          color: info?.color || '#3b82f6',
          avatar: info?.avatar || null,
          cursor: prev[s.id]?.cursor || null,
          active: prev[s.id]?.active || null,
        },
      }))
    }
  }, [])

  const emitCursor = useCallback((cursor: { x: number; y: number }) => {
    const s = socketRef.current
    const room = roomRef.current
    if (s && room) emitCursorMove(s, room, cursor)
  }, [])

  const emitActive = useCallback((active: { type: 'node' | 'edge' | 'label' | 'pane'; id?: string }) => {
    const s = socketRef.current
    const room = roomRef.current
    if (s && room) emitPresenceActive(s, room, active)
  }, [])

  const clearActive = useCallback(() => {
    const s = socketRef.current
    const room = roomRef.current
    if (s && room) emitPresenceClear(s, room)
  }, [])

  const clearAccessRevoked = useCallback(() => setAccessRevoked(null), [])
  const clearPermissionChanged = useCallback(() => setPermissionChanged(null), [])

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
    setAutoSaveEnabled: handleSyncedAutoSaveToggle,
    saveStatus,
    canUndo,
    canRedo,
    undo,
    redo,
    setFullMindmapState,
    applyStreamingAdditions,
    restoreFromHistory,
    participants,
    announcePresence,
    emitCursor,
    emitActive,
    clearActive,
    accessRevoked,
    clearAccessRevoked,
    permissionChanged,
    clearPermissionChanged,
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

// Re-export types for convenience
export * from './types'
