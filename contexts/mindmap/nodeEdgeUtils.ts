import { Node, Edge, MarkerType } from 'reactflow'

/**
 * Normalize nodes with default values
 */
export function normalizeNodes(nodes: any[]): Node[] {
    let normalizedNodes = (nodes || []).map((node: any) => {
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

    // Create a root node if empty
    if (normalizedNodes.length === 0) {
        let centerX = 400, centerY = 300
        if (typeof window !== 'undefined') {
            const canvasWidth = window.innerWidth - 256 - 32
            const canvasHeight = window.innerHeight - 80 - 32
            centerX = canvasWidth / 2 - 100
            centerY = canvasHeight / 2 - 50
        }
        const rootNode: Node = {
            id: `root-node-${Date.now()}`,
            type: 'rectangle',
            position: { x: centerX, y: centerY },
            data: { label: 'Root Node', description: 'Click to edit', color: '#3b82f6', shape: 'rectangle' },
        }
        normalizedNodes = [rootNode]
    }

    return normalizedNodes
}

/**
 * Normalize edges with default values and deduplicate
 */
export function normalizeEdges(incomingEdges: any[]): Edge[] {
    const edges = Array.isArray(incomingEdges) ? incomingEdges : []
    const edgeIds = new Set<string>()
    const edgeSigs = new Set<string>()
    const normalizedEdges: Edge[] = []

    for (let i = 0; i < edges.length; i++) {
        const e: any = edges[i] || {}
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

    return normalizedEdges
}

/**
 * Generate a unique edge ID
 */
export function generateEdgeId(source: string, target: string): string {
    return `edge-${source}-${target}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Generate a unique node ID
 */
export function generateNodeId(): string {
    return `node-${Date.now()}`
}
