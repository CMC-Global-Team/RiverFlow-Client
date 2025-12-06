"use client"

import { useMemo, useRef } from 'react'
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    MarkerType,
    ReactFlowInstance,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useEmbedMindmapContext } from '@/contexts/mindmap/EmbedMindmapContext'
import {
    RectangleNode,
    CircleNode,
    DiamondNode,
    HexagonNode,
    EllipseNode,
    RoundedRectangleNode,
} from './node-shapes'

export default function EmbedCanvas() {
    const {
        nodes,
        edges,
        setSelectedNode,
        setSelectedEdge,
    } = useEmbedMindmapContext()

    const reactFlowInstance = useRef<ReactFlowInstance | null>(null)

    // Simple node types without long press handlers
    const nodeTypes = useMemo(() => ({
        rectangle: RectangleNode,
        circle: CircleNode,
        diamond: DiamondNode,
        hexagon: HexagonNode,
        ellipse: EllipseNode,
        roundedRectangle: RoundedRectangleNode,
    }), [])

    const defaultEdgeOptions = {
        animated: true,
        type: "smoothstep",
        markerEnd: {
            type: MarkerType.ArrowClosed,
        },
    }

    return (
        <div className="w-full h-full relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onInit={(instance) => {
                    reactFlowInstance.current = instance
                }}
                onNodeClick={(_event, node) => {
                    setSelectedNode(node)
                    setSelectedEdge(null)
                }}
                onEdgeClick={(_event, edge) => {
                    setSelectedEdge(edge)
                    setSelectedNode(null)
                }}
                onPaneClick={() => {
                    setSelectedNode(null)
                    setSelectedEdge(null)
                }}
                nodeTypes={nodeTypes}
                defaultEdgeOptions={defaultEdgeOptions}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                fitView
                className="bg-muted/20"
            >
                <Background color="#aaa" gap={16} />
                <Controls />
                <MiniMap
                    nodeColor={(node) => {
                        return node.data.color || "#3b82f6"
                    }}
                    className="bg-background border"
                />
            </ReactFlow>
        </div>
    )
}
