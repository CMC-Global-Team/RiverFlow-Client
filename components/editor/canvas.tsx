"use client"

import { useRef, useEffect } from "react"

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Draw grid
    const gridSize = 20
    ctx.strokeStyle = "rgba(0, 0, 0, 0.05)"
    ctx.lineWidth = 1

    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }

    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Draw sample mindmap structure
    ctx.fillStyle = "rgba(59, 130, 246, 0.1)"
    ctx.strokeStyle = "rgb(59, 130, 246)"
    ctx.lineWidth = 2

    // Center node
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    ctx.beginPath()
    ctx.arc(centerX, centerY, 40, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = "rgb(15, 23, 42)"
    ctx.font = "bold 14px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("Central Idea", centerX, centerY)

    // Branch nodes
    const branches = [
      { x: centerX - 150, y: centerY - 100 },
      { x: centerX + 150, y: centerY - 100 },
      { x: centerX - 150, y: centerY + 100 },
      { x: centerX + 150, y: centerY + 100 },
    ]

    branches.forEach((branch) => {
      // Draw line
      ctx.strokeStyle = "rgba(59, 130, 246, 0.3)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(branch.x, branch.y)
      ctx.stroke()

      // Draw node
      ctx.fillStyle = "rgba(59, 130, 246, 0.05)"
      ctx.strokeStyle = "rgba(59, 130, 246, 0.5)"
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(branch.x, branch.y, 30, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = "rgb(15, 23, 42)"
      ctx.font = "12px sans-serif"
      ctx.fillText("Branch", branch.x, branch.y)
    })
  }, [])

  return (
    <canvas ref={canvasRef} className="w-full h-full bg-background cursor-crosshair rounded-lg border border-border" />
  )
}
