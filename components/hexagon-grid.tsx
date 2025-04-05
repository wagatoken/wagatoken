"use client"

import { useEffect, useRef } from "react"

export default function HexagonGrid({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let time = 0

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const drawHexagons = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const hexSize = 30
      const hexHeight = hexSize * Math.sqrt(3)
      const hexWidth = hexSize * 2
      const columns = Math.ceil(canvas.width / (hexWidth * 0.75)) + 1
      const rows = Math.ceil(canvas.height / hexHeight) + 1

      time += 0.005

      for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * hexWidth * 0.75
          const y = j * hexHeight + (i % 2 === 0 ? 0 : hexHeight / 2)

          // Skip some hexagons for a more sparse look
          if (Math.random() > 0.7) continue

          const distanceFromCenter = Math.sqrt(
            Math.pow((x - canvas.width / 2) / canvas.width, 2) + Math.pow((y - canvas.height / 2) / canvas.height, 2),
          )

          const pulseIntensity = Math.sin(time + distanceFromCenter * 5) * 0.5 + 0.5
          const alpha = 0.05 + pulseIntensity * 0.05

          ctx.beginPath()
          for (let k = 0; k < 6; k++) {
            const angle = (k * Math.PI) / 3
            const xPos = x + hexSize * Math.cos(angle)
            const yPos = y + hexSize * Math.sin(angle)

            if (k === 0) {
              ctx.moveTo(xPos, yPos)
            } else {
              ctx.lineTo(xPos, yPos)
            }
          }
          ctx.closePath()

          // Use emerald and purple colors for hexagons
          const colors = [
            `rgba(16, 185, 129, ${alpha})`, // emerald-500
            `rgba(52, 211, 153, ${alpha})`, // emerald-400
            `rgba(5, 150, 105, ${alpha})`, // emerald-600
            `rgba(147, 51, 234, ${alpha})`, // purple-600
            `rgba(168, 85, 247, ${alpha})`, // purple-500
          ]

          const color = colors[i % colors.length]

          ctx.strokeStyle = color
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }

      animationFrameId = requestAnimationFrame(drawHexagons)
    }

    window.addEventListener("resize", resizeCanvas)

    resizeCanvas()
    drawHexagons()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className={`fixed inset-0 z-0 pointer-events-none ${className}`} />
}

