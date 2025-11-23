"use client"

import { Background } from "reactflow"
import ReactFlow from "reactflow"
import "reactflow/dist/style.css"

export default function BackgroundCanvas({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <ReactFlow nodes={[]} edges={[]} proOptions={{ hideAttribution: true }} fitView className="bg-muted/20">
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  )
}

