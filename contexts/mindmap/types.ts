import { Node, Edge, NodeChange, EdgeChange, Connection, Viewport } from 'reactflow'
import { MindmapResponse } from '@/types/mindmap.types'

// Save status types
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

// Auto-save hook options
export interface AutoSaveOptions {
    defaultEnabled?: boolean
    debounceMs?: number
    statusResetMs?: number
    setIsSaving?: (value: boolean) => void
    onError?: (error: unknown) => void
}

// Auto-save hook result
export interface UseMindmapAutoSaveResult {
    autoSaveEnabled: boolean
    setAutoSaveEnabled: (enabled: boolean) => void
    setAutoSaveEnabledExternal: (enabled: boolean) => void
    saveStatus: SaveStatus
    scheduleAutoSave: (debounceMsOverride?: number) => void
    saveImmediately: () => Promise<void>
    cancelScheduledSave: () => void
    markSynced: (status?: SaveStatus) => void
}

// Participant presence information
export interface ParticipantInfo {
    clientId: string
    userId?: number | string | null
    name: string
    color: string
    avatar?: string | null
    cursor?: { x: number; y: number } | null
    active?: { type: 'node' | 'edge' | 'label' | 'pane'; id?: string } | null
}

// Active element type for presence
export interface ActiveElement {
    type: 'node' | 'edge' | 'label' | 'pane'
    id?: string
}

// Access revoked state
export interface AccessRevokedState {
    revoked: boolean
    reason?: string
    message?: string
}

// Permission changed state
export interface PermissionChangedState {
    changed: boolean
    type?: 'public' | 'collaborator'
    oldValue?: string
    newValue?: string
}

// Presence info for announcing
export interface PresenceInfo {
    name: string
    color: string
    userId?: number | string | null
    avatar?: string | null
}

// Main context type
export interface MindmapContextType {
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
    saveStatus: SaveStatus
    canUndo: boolean
    canRedo: boolean
    undo: () => Promise<void>
    redo: () => Promise<void>
    setFullMindmapState: (data: MindmapResponse | null) => void
    applyStreamingAdditions: (addNodes?: any[], addEdges?: any[]) => void
    restoreFromHistory: (snapshot: { nodes?: any[]; edges?: any[]; viewport?: any }, historyId?: string | number | null) => Promise<void>
    participants: Record<string, ParticipantInfo>
    announcePresence: (info: PresenceInfo) => void
    emitCursor: (cursor: { x: number; y: number }) => void
    emitActive: (active: ActiveElement) => void
    clearActive: () => void
    accessRevoked: AccessRevokedState | null
    clearAccessRevoked: () => void
    permissionChanged: PermissionChangedState | null
    clearPermissionChanged: () => void
}
