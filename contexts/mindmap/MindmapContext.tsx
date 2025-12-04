"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { Node, Edge, Connection, addEdge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange, Viewport, MarkerType } from 'reactflow'
import { getMindmapById, updateMindmap, undoMindmap, redoMindmap, updatePublicMindmap, updateMindmapByTokenFallback } from '@/services/mindmap/mindmap.service'
import { fetchHistory } from '@/services/mindmap/history.service'
import { MindmapResponse, UpdateMindmapRequest } from '@/types/mindmap.types'
import { useToast } from "@/hooks/use-toast"
import { getSocket, joinMindmap, emitNodesChange, emitEdgesChange, emitConnect, emitViewport, emitCursorMove, emitPresenceAnnounce, emitPresenceActive, emitPresenceClear, emitNodeUpdate, emitEdgeUpdate } from '@/lib/realtime'

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
  restoreFromHistory: (snapshot: { nodes?: any[]; edges?: any[]; viewport?: any }, historyId?: string | number | null) => Promise<void>
  participants: Record<string, { clientId: string; userId?: number | string | null; name: string; color: string; avatar?: string | null; cursor?: { x: number; y: number } | null; active?: { type: 'node' | 'edge' | 'label' | 'pane'; id?: string } | null }>
  announcePresence: (info: { name: string; color: string; userId?: number | string | null; avatar?: string | null }) => void
  emitCursor: (cursor: { x: number; y: number }) => void
  emitActive: (active: { type: 'node' | 'edge' | 'label' | 'pane'; id?: string }) => void
  clearActive: () => void
  // Access control state - triggers redirect when access is revoked
  accessRevoked: { revoked: boolean; reason?: string; message?: string } | null
  clearAccessRevoked: () => void
  // Permission changed state - triggers page refresh when permissions change
  permissionChanged: { changed: boolean; type?: 'public' | 'collaborator'; oldValue?: string; newValue?: string } | null
  clearPermissionChanged: () => void
}

const MindmapContext = createContext<MindmapContextType | undefined>(undefined)

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
        runSave().catch(() => { })
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
  const lastConnectedAtRef = useRef<number>(0)
  const latestViewportRef = useRef(viewport);
  const socketRef = useRef<any>(null)
  const roomRef = useRef<string | null>(null)
  const [participants, setParticipants] = useState<Record<string, { clientId: string; userId?: number | string | null; name: string; color: string; avatar?: string | null; cursor?: { x: number; y: number } | null; active?: { type: 'node' | 'edge' | 'label' | 'pane'; id?: string } | null }>>({})
  const lastPresenceInfoRef = useRef<{ name: string; color: string; userId?: number | string | null; avatar?: string | null } | null>(null)
  const lastReannounceAtRef = useRef<number>(0)
  const historyRef = useRef<{ past: { nodes: Node[]; edges: Edge[]; viewport: Viewport | null }[]; future: { nodes: Node[]; edges: Edge[]; viewport: Viewport | null }[] }>({ past: [], future: [] })
  const serverHistoryCursorRef = useRef<number | null>(null)
  const isApplyingHistoryRef = useRef(false)

  // Access control state - set when owner revokes access or removes collaborator
  const [accessRevoked, setAccessRevoked] = useState<{ revoked: boolean; reason?: string; message?: string } | null>(null)
  const currentUserIdRef = useRef<number | string | null>(null)

  // Permission changed state - triggers page refresh when permissions change
  const [permissionChanged, setPermissionChanged] = useState<{ changed: boolean; type?: 'public' | 'collaborator'; oldValue?: string; newValue?: string } | null>(null)

  const getSnapshot = useCallback(() => {
    return {
      nodes: latestNodesRef.current.map((n) => ({ ...n, data: { ...(n.data || {}) } })),
      edges: latestEdgesRef.current.map((e) => ({ ...e })),
      viewport: latestViewportRef.current ? { ...latestViewportRef.current } : null,
    }
  }, [])

  const recordSnapshot = useCallback(() => {
    if (isApplyingHistoryRef.current) return
    const snap = getSnapshot()
    historyRef.current.past.push(snap)
    historyRef.current.future = []
    setCanUndo(historyRef.current.past.length > 0)
    setCanRedo(historyRef.current.future.length > 0)
  }, [getSnapshot])

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

    setNodes(normalizedNodes);
    setEdges(normalizedEdges);
    setViewport(data.viewport || { x: 0, y: 0, zoom: 1 });
    historyRef.current = { past: [], future: [] }

    setCanUndo(historyRef.current.past.length > 0)
    setCanRedo(historyRef.current.future.length > 0)

  }, []);

  useEffect(() => {
    if (!mindmap) return
    const s = getSocket()
    socketRef.current = s
    const payload: any = mindmap.isPublic === true && mindmap.shareToken
      ? { shareToken: mindmap.shareToken }
      : { mindmapId: mindmap.id }
    joinMindmap(s, payload)
    const onConnect = () => { joinMindmap(s, payload) }
    const onReconnect = () => { joinMindmap(s, payload) }
    const onJoined = (res: any) => { roomRef.current = res?.room || null }
    const onNodes = (changes: any[]) => { setNodes((nds) => applyNodeChanges(changes, nds)) }
    const onEdges = (changes: any[]) => { setEdges((eds) => applyEdgeChanges(changes, eds)) }
    const onConnectEdge = (connection: any) => {
      const src = connection?.source
      const tgt = connection?.target
      setEdges((eds) => {
        if (!src || !tgt) return eds
        const exists = eds.some(
          (e) =>
            e.source === src &&
            e.target === tgt &&
            ((e.sourceHandle || null) === (connection?.sourceHandle || null)) &&
            ((e.targetHandle || null) === (connection?.targetHandle || null))
        )
        if (exists) return eds
        const newEdge = {
          id: `edge-${src}-${tgt}-${Date.now()}`,
          ...connection,
          animated: true,
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed },
        }
        return addEdge(newEdge as any, eds)
      })
    }
    const onViewportEv = (v: any) => { setViewport(v) }
    const onNodeUpdate = (updated: any) => {
      setNodes((nds) => nds.map((n) => (n.id === updated.id ? { ...updated } : n)))
      setSelectedNode((prev) => (prev && prev.id === updated.id ? { ...updated } : prev))
    }
    const onEdgeUpdate = (updated: any) => {
      setEdges((eds) => eds.map((e) => (e.id === updated.id ? { ...updated } : e)))
      setSelectedEdge((prev) => (prev && prev.id === updated.id ? { ...updated } : prev))
    }
    const onPresenceState = (list: any[]) => {
      const map: any = {}
      for (const p of list || []) {
        map[p.clientId] = { clientId: p.clientId, userId: p.userId || null, name: p.name || '', color: p.color || '#3b82f6', avatar: p.avatar || null, cursor: p.cursor || null, active: p.active || null }
      }
      setParticipants(map)
      const s = socketRef.current
      const room = roomRef.current
      if (s && room && lastPresenceInfoRef.current) {
        const now = Date.now()
        if (now - lastReannounceAtRef.current > 1500) {
          lastReannounceAtRef.current = now
          emitPresenceAnnounce(s, room, lastPresenceInfoRef.current)
        }
      }
    }
    const onPresenceAnnounce = (p: any) => {
      setParticipants((prev) => ({ ...prev, [p.clientId]: { clientId: p.clientId, userId: p.userId || null, name: p.name || '', color: p.color || '#3b82f6', avatar: p.avatar || null, cursor: prev[p.clientId]?.cursor || null, active: prev[p.clientId]?.active || null } }))
      const s = socketRef.current
      const room = roomRef.current
      if (s && room && p?.clientId && p.clientId !== s.id) {
        const now = Date.now()
        if (lastPresenceInfoRef.current && now - lastReannounceAtRef.current > 1500) {
          lastReannounceAtRef.current = now
          emitPresenceAnnounce(s, room, lastPresenceInfoRef.current)
        }
      }
    }
    const onPresenceLeft = (p: any) => {
      setParticipants((prev) => {
        const next = { ...prev }
        delete next[p.clientId]
        return next
      })
    }
    const onCursorMove = (data: any) => {
      const c = data?.clientId
      const cursor = data?.cursor
      if (!c || !cursor) return
      setParticipants((prev) => ({ ...prev, [c]: { ...(prev[c] || { clientId: c, name: '', color: '#3b82f6' }), cursor } }))
    }
    const onPresenceActive = (data: any) => {
      const c = data?.clientId
      setParticipants((prev) => ({ ...prev, [c]: { ...(prev[c] || { clientId: c, name: '', color: '#3b82f6' }), active: data?.active || null } }))
    }
    const onPresenceClear = (data: any) => {
      const c = data?.clientId
      setParticipants((prev) => ({ ...prev, [c]: { ...(prev[c] || { clientId: c, name: '', color: '#3b82f6' }), active: null } }))
    }
    s.on('mindmap:joined', onJoined)
    s.on('connect', onConnect)
    s.on('reconnect', onReconnect)
    s.on('mindmap:nodes:change', onNodes)
    s.on('mindmap:edges:change', onEdges)
    s.on('mindmap:connect', onConnectEdge)
    s.on('mindmap:viewport', onViewportEv)
    s.on('presence:state', onPresenceState)
    s.on('presence:announce', onPresenceAnnounce)
    s.on('presence:left', onPresenceLeft)
    s.on('cursor:move', onCursorMove)
    s.on('presence:active', onPresenceActive)
    s.on('presence:clear', onPresenceClear)
    s.on('mindmap:nodes:update', onNodeUpdate)
    s.on('mindmap:edges:update', onEdgeUpdate)
    const onHistoryRestore = (payload: any) => {
      const snap: any = payload?.snapshot || null
      const m = latestMindmapRef.current
      if (!m || !snap) return
      const nextState: any = {
        ...m,
        nodes: Array.isArray(snap.nodes) ? snap.nodes : latestNodesRef.current,
        edges: Array.isArray(snap.edges) ? snap.edges : latestEdgesRef.current,
        viewport: snap.viewport || latestViewportRef.current,
      }
      isApplyingHistoryRef.current = true
      latestNodesRef.current = nextState.nodes
      latestEdgesRef.current = nextState.edges
      latestViewportRef.current = nextState.viewport || null
      setFullMindmapState(nextState)
      isApplyingHistoryRef.current = false
      markSynced('idle')
    }
    s.on('history:restore', onHistoryRestore)

    // Handle AI updates from other users - sync the entire mindmap state
    const onAiUpdated = (data: any) => {
      const m = latestMindmapRef.current
      if (!m) return

      // Check if this update is from another user
      const currentSocket = socketRef.current
      if (currentSocket && data?.userId === currentSocket.userId) {
        // This is our own update, skip (we already have the changes)
        return
      }

      console.log('[MindmapContext] Received AI update from another user:', data?.action)

      // Apply the new nodes and edges from AI
      if (data?.nodes && Array.isArray(data.nodes)) {
        isApplyingHistoryRef.current = true
        setNodes(data.nodes.map((node: any) => {
          const nodeType = node.type === 'default' ? 'rectangle' : node.type
          return {
            ...node,
            type: nodeType,
            data: {
              label: 'Node',
              description: '',
              color: '#3b82f6',
              ...node.data,
              shape: node.data?.shape || nodeType || 'rectangle',
            }
          }
        }))
      }

      if (data?.edges && Array.isArray(data.edges)) {
        const incomingEdges = data.edges
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
        setEdges(normalizedEdges)
      }

      isApplyingHistoryRef.current = false

      // Show notification about AI update
      toast({
        title: 'AI Update',
        description: 'Mindmap has been updated by AI',
      })
    }
    s.on('mindmap:ai:updated', onAiUpdated)

    // Handle access revocation - when owner turns off public access or changes to private
    const onAccessRevoked = (data: any) => {
      const m = latestMindmapRef.current
      if (!m || data?.mindmapId !== m.id) return

      // Don't redirect the owner
      if (m.mysqlUserId === currentUserIdRef.current) return

      console.log('[MindmapContext] Access revoked:', data)
      setAccessRevoked({
        revoked: true,
        reason: data?.reason || 'public_access_disabled',
        message: 'This mindmap is no longer publicly accessible.'
      })
    }
    s.on('mindmap:access:revoked', onAccessRevoked)

    // Handle collaborator removal - when owner removes a collaborator
    const onCollaboratorRemoved = (data: any) => {
      const m = latestMindmapRef.current
      if (!m || data?.mindmapId !== m.id) return

      // Only redirect the removed user
      const currentUserId = currentUserIdRef.current
      if (data?.removedUserId !== currentUserId) return

      console.log('[MindmapContext] Collaborator removed:', data)
      setAccessRevoked({
        revoked: true,
        reason: 'collaborator_removed',
        message: 'You have been removed from this mindmap.'
      })
    }
    s.on('mindmap:collaborator:removed', onCollaboratorRemoved)

    // Handle public permission change - when owner changes view/edit permission
    const onPublicPermissionChanged = (data: any) => {
      const m = latestMindmapRef.current
      if (!m || data?.mindmapId !== m.id) return

      // Don't refresh the owner's page
      if (m.mysqlUserId === currentUserIdRef.current) return

      console.log('[MindmapContext] Public permission changed:', data)
      setPermissionChanged({
        changed: true,
        type: 'public',
        oldValue: data?.oldAccessLevel,
        newValue: data?.newAccessLevel
      })
    }
    s.on('mindmap:public:permission:changed', onPublicPermissionChanged)

    // Handle collaborator role change - when owner changes a collaborator's role
    const onCollaboratorRoleChanged = (data: any) => {
      const m = latestMindmapRef.current
      if (!m || data?.mindmapId !== m.id) return

      // Only trigger for the affected collaborator
      const currentUserId = currentUserIdRef.current
      if (data?.userId !== currentUserId) return

      console.log('[MindmapContext] Collaborator role changed:', data)
      setPermissionChanged({
        changed: true,
        type: 'collaborator',
        oldValue: data?.oldRole,
        newValue: data?.newRole
      })
    }
    s.on('mindmap:collaborator:role:changed', onCollaboratorRoleChanged)

    return () => {
      s.off('mindmap:joined', onJoined)
      s.off('connect', onConnect)
      s.off('reconnect', onReconnect)
      s.off('mindmap:nodes:change', onNodes)
      s.off('mindmap:edges:change', onEdges)
      s.off('mindmap:connect', onConnectEdge)
      s.off('mindmap:viewport', onViewportEv)
      s.off('presence:state', onPresenceState)
      s.off('presence:announce', onPresenceAnnounce)
      s.off('presence:left', onPresenceLeft)
      s.off('cursor:move', onCursorMove)
      s.off('presence:active', onPresenceActive)
      s.off('presence:clear', onPresenceClear)
      s.off('mindmap:nodes:update', onNodeUpdate)
      s.off('mindmap:edges:update', onEdgeUpdate)
      s.off('history:restore', onHistoryRestore)
      s.off('mindmap:ai:updated', onAiUpdated)
      s.off('mindmap:access:revoked', onAccessRevoked)
      s.off('mindmap:collaborator:removed', onCollaboratorRemoved)
      s.off('mindmap:public:permission:changed', onPublicPermissionChanged)
      s.off('mindmap:collaborator:role:changed', onCollaboratorRoleChanged)
    }
  }, [mindmap])

  useEffect(() => {
    const run = async () => {
      const m = latestMindmapRef.current
      if (!m) return
      try {
        const list = await fetchHistory(m.id, { limit: 50 })
        const hasSnap = Array.isArray(list) && list.some((it: any) => {
          const s = it?.snapshot
          return s && (Array.isArray(s.nodes) || Array.isArray(s.edges) || s.viewport)
        })
        setCanUndo(!!hasSnap)
        setCanRedo(false)
      } catch { }
    }
    run()
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

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      recordSnapshot()
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
      recordSnapshot()
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
          id: `edge-${src}-${tgt}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
    const s = socketRef.current
    const room = roomRef.current
    if (s && room) emitNodesChange(s, room, Array.from(toDelete).map((id) => ({ type: 'remove', id })))
  }, [scheduleAutoSave, recordSnapshot])

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
  }, [scheduleAutoSave, recordSnapshot])

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    recordSnapshot()
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
              y: node.position.y + 0.001,
            }
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
        if (newData.scale !== undefined) {
          updatedNode.position = {
            x: prev.position.x + 0.001,
            y: prev.position.y + 0.001,
          }
        }
        updatedNodeRef = updatedNode
        return updatedNode
      }
      return prev
    })
    scheduleAutoSave()
    const s = socketRef.current
    const room = roomRef.current
    if (s && room && updatedNodeRef) {
      emitNodeUpdate(s, room, updatedNodeRef)
    }
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
        let uid = `edge-${(e as any).source}-${(e as any).target}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        while (edgeIds.has(uid)) {
          uid = `edge-${(e as any).source}-${(e as any).target}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
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

  const updateEdgeData = useCallback((edgeId: string, updates: any) => {
    recordSnapshot()
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
    recordSnapshot()
    setViewport(viewport);
    scheduleAutoSave()
    const s = socketRef.current
    const room = roomRef.current
    if (s && room) emitViewport(s, room, viewport as any)
  }, [scheduleAutoSave, recordSnapshot]);

  const undo = useCallback(async () => {
    const m = latestMindmapRef.current
    if (!m) return
    const list = await fetchHistory(m.id, { limit: 200 })
    if (!list || list.length === 0) return
    const start = serverHistoryCursorRef.current == null ? 0 : serverHistoryCursorRef.current + 1
    let idx = -1
    for (let i = start; i < list.length; i++) {
      const s: any = list[i]?.snapshot
      if (s && (Array.isArray(s.nodes) || Array.isArray(s.edges) || s.viewport)) { idx = i; break }
    }
    if (idx < 0) return
    const snap: any = list[idx].snapshot
    const nextState: any = {
      ...m,
      nodes: Array.isArray(snap.nodes) ? snap.nodes : latestNodesRef.current,
      edges: Array.isArray(snap.edges) ? snap.edges : latestEdgesRef.current,
      viewport: snap.viewport || latestViewportRef.current,
    }
    isApplyingHistoryRef.current = true
    latestNodesRef.current = nextState.nodes
    latestEdgesRef.current = nextState.edges
    latestViewportRef.current = nextState.viewport || null
    setFullMindmapState(nextState)
    await saveMindmap()
    isApplyingHistoryRef.current = false
    serverHistoryCursorRef.current = idx
    const s = socketRef.current
    const room = roomRef.current
    if (s && room) s.emit('history:restore', room, { historyId: list[idx].id, snapshot: snap })
    markSynced('idle')
  }, [setFullMindmapState, saveMindmap, markSynced])

  const redo = useCallback(async () => {
    const m = latestMindmapRef.current
    if (!m) return
    const list = await fetchHistory(m.id, { limit: 200 })
    if (!list || list.length === 0) return
    const start = serverHistoryCursorRef.current == null ? 0 : Math.max(0, serverHistoryCursorRef.current - 1)
    let idx = -1
    for (let i = start; i >= 0; i--) {
      const s: any = list[i]?.snapshot
      if (s && (Array.isArray(s.nodes) || Array.isArray(s.edges) || s.viewport)) { idx = i; break }
    }
    if (idx < 0) return
    const snap: any = list[idx].snapshot
    const nextState: any = {
      ...m,
      nodes: Array.isArray(snap.nodes) ? snap.nodes : latestNodesRef.current,
      edges: Array.isArray(snap.edges) ? snap.edges : latestEdgesRef.current,
      viewport: snap.viewport || latestViewportRef.current,
    }
    isApplyingHistoryRef.current = true
    latestNodesRef.current = nextState.nodes
    latestEdgesRef.current = nextState.edges
    latestViewportRef.current = nextState.viewport || null
    setFullMindmapState(nextState)
    await saveMindmap()
    isApplyingHistoryRef.current = false
    serverHistoryCursorRef.current = idx
    const s = socketRef.current
    const room = roomRef.current
    if (s && room) s.emit('history:restore', room, { historyId: list[idx].id, snapshot: snap })
    markSynced('idle')
  }, [setFullMindmapState, saveMindmap, markSynced])

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
    applyStreamingAdditions,
    restoreFromHistory: async (snapshot: any, historyId?: string | number | null) => {
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
    },
    participants,
    announcePresence: (info) => {
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
    },
    emitCursor: (cursor) => {
      const s = socketRef.current
      const room = roomRef.current
      if (s && room) emitCursorMove(s, room, cursor)
    },
    emitActive: (active) => {
      const s = socketRef.current
      const room = roomRef.current
      if (s && room) emitPresenceActive(s, room, active)
    },
    clearActive: () => {
      const s = socketRef.current
      const room = roomRef.current
      if (s && room) emitPresenceClear(s, room)
    },
    accessRevoked,
    clearAccessRevoked: () => setAccessRevoked(null),
    permissionChanged,
    clearPermissionChanged: () => setPermissionChanged(null),
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
