import { Node, Edge, addEdge, applyNodeChanges, applyEdgeChanges, MarkerType } from 'reactflow'
import { ParticipantInfo } from './types'
import { normalizeEdges } from './nodeEdgeUtils'

export interface SocketHandlerRefs {
    latestMindmapRef: React.MutableRefObject<any>
    latestNodesRef: React.MutableRefObject<Node[]>
    latestEdgesRef: React.MutableRefObject<Edge[]>
    latestViewportRef: React.MutableRefObject<any>
    socketRef: React.MutableRefObject<any>
    roomRef: React.MutableRefObject<string | null>
    currentUserIdRef: React.MutableRefObject<number | string | null>
    isApplyingHistoryRef: React.MutableRefObject<boolean>
    lastPresenceInfoRef: React.MutableRefObject<any>
    lastReannounceAtRef: React.MutableRefObject<number>
}

export interface SocketHandlerSetters {
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
    setViewport: React.Dispatch<React.SetStateAction<any>>
    setSelectedNode: React.Dispatch<React.SetStateAction<Node | null>>
    setSelectedEdge: React.Dispatch<React.SetStateAction<Edge | null>>
    setParticipants: React.Dispatch<React.SetStateAction<Record<string, ParticipantInfo>>>
    setAccessRevoked: React.Dispatch<React.SetStateAction<any>>
    setPermissionChanged: React.Dispatch<React.SetStateAction<any>>
    setCanUndo: React.Dispatch<React.SetStateAction<boolean>>
    setCanRedo: React.Dispatch<React.SetStateAction<boolean>>
    setFullMindmapState: (data: any) => void
    markSynced: (status?: 'idle' | 'saving' | 'saved' | 'error') => void
    toast: (options: { title?: string; description?: string; variant?: string }) => void
    emitPresenceAnnounce: (socket: any, room: string, info: any) => void
}

export interface SocketHandlers {
    onConnect: () => void
    onReconnect: () => void
    onJoined: (res: any) => void
    onNodes: (changes: any[]) => void
    onEdges: (changes: any[]) => void
    onConnectEdge: (connection: any) => void
    onViewportEv: (v: any) => void
    onNodeUpdate: (updated: any) => void
    onEdgeUpdate: (updated: any) => void
    onPresenceState: (list: any[]) => void
    onPresenceAnnounce: (p: any) => void
    onPresenceLeft: (p: any) => void
    onCursorMove: (data: any) => void
    onPresenceActive: (data: any) => void
    onPresenceClear: (data: any) => void
    onHistoryRestore: (payload: any) => void
    onAiUpdated: (data: any) => void
    onAccessRevoked: (data: any) => void
    onCollaboratorRemoved: (data: any) => void
    onPublicPermissionChanged: (data: any) => void
    onCollaboratorRoleChanged: (data: any) => void
    onMindmapDeleted: (data: any) => void
    onUndoResult: (data: any) => void
    onRedoResult: (data: any) => void
    onHistoryState: (data: any) => void
}

export function createSocketHandlers(
    refs: SocketHandlerRefs,
    setters: SocketHandlerSetters,
    joinPayload: any
): SocketHandlers {
    const {
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
    } = refs

    const {
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
        toast,
        emitPresenceAnnounce,
    } = setters

    const joinMindmapFn = () => {
        const s = socketRef.current
        if (s) {
            s.emit('mindmap:join', joinPayload)
        }
    }

    return {
        onConnect: () => { joinMindmapFn() },
        onReconnect: () => { joinMindmapFn() },
        onJoined: (res: any) => {
            roomRef.current = res?.room || null
            // Record initial snapshot after joining so first action can be undone
            if (res?.room) {
                setTimeout(() => {
                    const s = socketRef.current
                    const room = roomRef.current
                    if (!s || !room) return
                    const snapshot = {
                        nodes: latestNodesRef.current.map((n: any) => ({ ...n, data: { ...(n.data || {}) } })),
                        edges: latestEdgesRef.current.map((e: any) => ({ ...e })),
                        viewport: latestViewportRef.current ? { ...latestViewportRef.current } : null,
                    }
                    console.log('[MindmapContext] Recording initial snapshot with', snapshot.nodes.length, 'nodes')
                    s.emit('mindmap:snapshot', room, { snapshot, isInitial: true })
                }, 500)
            }
        },

        onNodes: (changes: any[]) => {
            setNodes((nds) => applyNodeChanges(changes, nds))
        },

        onEdges: (changes: any[]) => {
            setEdges((eds) => applyEdgeChanges(changes, eds))
        },

        onConnectEdge: (connection: any) => {
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
        },

        onViewportEv: (v: any) => { setViewport(v) },

        onNodeUpdate: (updated: any) => {
            setNodes((nds) => nds.map((n) => (n.id === updated.id ? { ...updated } : n)))
            setSelectedNode((prev) => (prev && prev.id === updated.id ? { ...updated } : prev))
        },

        onEdgeUpdate: (updated: any) => {
            setEdges((eds) => eds.map((e) => (e.id === updated.id ? { ...updated } : e)))
            setSelectedEdge((prev) => (prev && prev.id === updated.id ? { ...updated } : prev))
        },

        onPresenceState: (list: any[]) => {
            const map: any = {}
            for (const p of list || []) {
                map[p.clientId] = {
                    clientId: p.clientId,
                    userId: p.userId || null,
                    name: p.name || '',
                    color: p.color || '#3b82f6',
                    avatar: p.avatar || null,
                    cursor: p.cursor || null,
                    active: p.active || null
                }
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
        },

        onPresenceAnnounce: (p: any) => {
            setParticipants((prev) => ({
                ...prev,
                [p.clientId]: {
                    clientId: p.clientId,
                    userId: p.userId || null,
                    name: p.name || '',
                    color: p.color || '#3b82f6',
                    avatar: p.avatar || null,
                    cursor: prev[p.clientId]?.cursor || null,
                    active: prev[p.clientId]?.active || null
                }
            }))
            const s = socketRef.current
            const room = roomRef.current
            if (s && room && p?.clientId && p.clientId !== s.id) {
                const now = Date.now()
                if (lastPresenceInfoRef.current && now - lastReannounceAtRef.current > 1500) {
                    lastReannounceAtRef.current = now
                    emitPresenceAnnounce(s, room, lastPresenceInfoRef.current)
                }
            }
        },

        onPresenceLeft: (p: any) => {
            setParticipants((prev) => {
                const next = { ...prev }
                delete next[p.clientId]
                return next
            })
        },

        onCursorMove: (data: any) => {
            const c = data?.clientId
            const cursor = data?.cursor
            if (!c || !cursor) return
            setParticipants((prev) => ({
                ...prev,
                [c]: { ...(prev[c] || { clientId: c, name: '', color: '#3b82f6' }), cursor }
            }))
        },

        onPresenceActive: (data: any) => {
            const c = data?.clientId
            setParticipants((prev) => ({
                ...prev,
                [c]: { ...(prev[c] || { clientId: c, name: '', color: '#3b82f6' }), active: data?.active || null }
            }))
        },

        onPresenceClear: (data: any) => {
            const c = data?.clientId
            setParticipants((prev) => ({
                ...prev,
                [c]: { ...(prev[c] || { clientId: c, name: '', color: '#3b82f6' }), active: null }
            }))
        },

        onHistoryRestore: (payload: any) => {
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
        },

        onAiUpdated: (data: any) => {
            const m = latestMindmapRef.current
            if (!m) return

            const currentSocket = socketRef.current
            if (currentSocket && data?.userId === currentSocket.userId) {
                return
            }

            console.log('[MindmapContext] Received AI update from another user:', data?.action)

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
                setEdges(normalizeEdges(data.edges))
            }

            isApplyingHistoryRef.current = false

            toast({
                title: 'AI Update',
                description: 'Mindmap has been updated by AI',
            })
        },

        onAccessRevoked: (data: any) => {
            const m = latestMindmapRef.current
            if (!m || data?.mindmapId !== m.id) return

            if (m.mysqlUserId === currentUserIdRef.current) return

            console.log('[MindmapContext] Access revoked:', data)
            setAccessRevoked({
                revoked: true,
                reason: data?.reason || 'public_access_disabled',
                message: 'This mindmap is no longer publicly accessible.'
            })
        },

        onCollaboratorRemoved: (data: any) => {
            const m = latestMindmapRef.current
            if (!m || data?.mindmapId !== m.id) return

            const currentUserId = currentUserIdRef.current
            if (data?.removedUserId !== currentUserId) return

            console.log('[MindmapContext] Collaborator removed:', data)
            setAccessRevoked({
                revoked: true,
                reason: 'collaborator_removed',
                message: 'You have been removed from this mindmap.'
            })
        },

        onPublicPermissionChanged: (data: any) => {
            const m = latestMindmapRef.current
            if (!m || data?.mindmapId !== m.id) return

            if (m.mysqlUserId === currentUserIdRef.current) return

            console.log('[MindmapContext] Public permission changed:', data)
            setPermissionChanged({
                changed: true,
                type: 'public',
                oldValue: data?.oldAccessLevel,
                newValue: data?.newAccessLevel
            })
        },

        onCollaboratorRoleChanged: (data: any) => {
            const m = latestMindmapRef.current
            if (!m || data?.mindmapId !== m.id) return

            const currentUserId = currentUserIdRef.current
            if (data?.userId !== currentUserId) return

            console.log('[MindmapContext] Collaborator role changed:', data)
            setPermissionChanged({
                changed: true,
                type: 'collaborator',
                oldValue: data?.oldRole,
                newValue: data?.newRole
            })
        },

        onMindmapDeleted: (data: any) => {
            const m = latestMindmapRef.current
            if (!m || data?.mindmapId !== m.id) return

            if (m.mysqlUserId === currentUserIdRef.current) return

            console.log('[MindmapContext] Mindmap deleted by owner:', data)
            setAccessRevoked({
                revoked: true,
                reason: 'mindmap_deleted',
                message: 'This mindmap has been deleted by the owner.'
            })
        },

        onUndoResult: (data: any) => {
            if (!data?.success) {
                console.log('[MindmapContext] Undo failed:', data?.reason)
                return
            }
            const snap = data?.snapshot
            if (snap) {
                isApplyingHistoryRef.current = true
                if (Array.isArray(snap.nodes)) {
                    setNodes(snap.nodes)
                    latestNodesRef.current = snap.nodes
                }
                if (Array.isArray(snap.edges)) {
                    setEdges(normalizeEdges(snap.edges))
                    latestEdgesRef.current = snap.edges
                }
                if (snap.viewport) {
                    setViewport(snap.viewport)
                    latestViewportRef.current = snap.viewport
                }
                isApplyingHistoryRef.current = false
            }
            setCanUndo(data?.canUndo ?? false)
            setCanRedo(data?.canRedo ?? false)
            console.log('[MindmapContext] Undo applied, canUndo:', data?.canUndo, 'canRedo:', data?.canRedo)
        },

        onRedoResult: (data: any) => {
            if (!data?.success) {
                console.log('[MindmapContext] Redo failed:', data?.reason)
                return
            }
            const snap = data?.snapshot
            if (snap) {
                isApplyingHistoryRef.current = true
                if (Array.isArray(snap.nodes)) {
                    setNodes(snap.nodes)
                    latestNodesRef.current = snap.nodes
                }
                if (Array.isArray(snap.edges)) {
                    setEdges(normalizeEdges(snap.edges))
                    latestEdgesRef.current = snap.edges
                }
                if (snap.viewport) {
                    setViewport(snap.viewport)
                    latestViewportRef.current = snap.viewport
                }
                isApplyingHistoryRef.current = false
            }
            setCanUndo(data?.canUndo ?? false)
            setCanRedo(data?.canRedo ?? false)
            console.log('[MindmapContext] Redo applied, canUndo:', data?.canUndo, 'canRedo:', data?.canRedo)
        },

        onHistoryState: (data: any) => {
            setCanUndo(data?.canUndo ?? false)
            setCanRedo(data?.canRedo ?? false)
        },
    }
}

/**
 * Attach socket event listeners
 */
export function attachSocketListeners(socket: any, handlers: SocketHandlers): void {
    socket.on('mindmap:joined', handlers.onJoined)
    socket.on('connect', handlers.onConnect)
    socket.on('reconnect', handlers.onReconnect)
    socket.on('mindmap:nodes:change', handlers.onNodes)
    socket.on('mindmap:edges:change', handlers.onEdges)
    socket.on('mindmap:connect', handlers.onConnectEdge)
    socket.on('mindmap:viewport', handlers.onViewportEv)
    socket.on('presence:state', handlers.onPresenceState)
    socket.on('presence:announce', handlers.onPresenceAnnounce)
    socket.on('presence:left', handlers.onPresenceLeft)
    socket.on('cursor:move', handlers.onCursorMove)
    socket.on('presence:active', handlers.onPresenceActive)
    socket.on('presence:clear', handlers.onPresenceClear)
    socket.on('mindmap:nodes:update', handlers.onNodeUpdate)
    socket.on('mindmap:edges:update', handlers.onEdgeUpdate)
    socket.on('history:restore', handlers.onHistoryRestore)
    socket.on('mindmap:ai:updated', handlers.onAiUpdated)
    socket.on('mindmap:access:revoked', handlers.onAccessRevoked)
    socket.on('mindmap:collaborator:removed', handlers.onCollaboratorRemoved)
    socket.on('mindmap:public:permission:changed', handlers.onPublicPermissionChanged)
    socket.on('mindmap:collaborator:role:changed', handlers.onCollaboratorRoleChanged)
    socket.on('mindmap:deleted', handlers.onMindmapDeleted)
    socket.on('undo:result', handlers.onUndoResult)
    socket.on('redo:result', handlers.onRedoResult)
    socket.on('history:state', handlers.onHistoryState)
}

/**
 * Detach socket event listeners
 */
export function detachSocketListeners(socket: any, handlers: SocketHandlers): void {
    socket.off('mindmap:joined', handlers.onJoined)
    socket.off('connect', handlers.onConnect)
    socket.off('reconnect', handlers.onReconnect)
    socket.off('mindmap:nodes:change', handlers.onNodes)
    socket.off('mindmap:edges:change', handlers.onEdges)
    socket.off('mindmap:connect', handlers.onConnectEdge)
    socket.off('mindmap:viewport', handlers.onViewportEv)
    socket.off('presence:state', handlers.onPresenceState)
    socket.off('presence:announce', handlers.onPresenceAnnounce)
    socket.off('presence:left', handlers.onPresenceLeft)
    socket.off('cursor:move', handlers.onCursorMove)
    socket.off('presence:active', handlers.onPresenceActive)
    socket.off('presence:clear', handlers.onPresenceClear)
    socket.off('mindmap:nodes:update', handlers.onNodeUpdate)
    socket.off('mindmap:edges:update', handlers.onEdgeUpdate)
    socket.off('history:restore', handlers.onHistoryRestore)
    socket.off('mindmap:ai:updated', handlers.onAiUpdated)
    socket.off('mindmap:access:revoked', handlers.onAccessRevoked)
    socket.off('mindmap:collaborator:removed', handlers.onCollaboratorRemoved)
    socket.off('mindmap:public:permission:changed', handlers.onPublicPermissionChanged)
    socket.off('mindmap:collaborator:role:changed', handlers.onCollaboratorRoleChanged)
    socket.off('mindmap:deleted', handlers.onMindmapDeleted)
    socket.off('undo:result', handlers.onUndoResult)
    socket.off('redo:result', handlers.onRedoResult)
    socket.off('history:state', handlers.onHistoryState)
}
