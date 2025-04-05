"use client"

import { useEffect, useRef } from "react"

export default function BlockchainBoxGrid() {
  const containerRef = useRef<HTMLDivElement>(null)
  const boxesRef = useRef<(HTMLDivElement | null)[]>([])

  // Create a 3x3 grid of boxes
  const boxCount = 9

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let time = 0
    let requestId: number

    const animate = () => {
      time += 0.01

      // Rotate the entire container slowly
      container.style.transform = `rotateX(20deg) rotateY(${time * 5}deg)`

      // Animate each box with different phases
      boxesRef.current.forEach((box, index) => {
        if (!box) return

        const row = Math.floor(index / 3)
        const col = index % 3

        // Different phase for each box based on position
        const phaseOffset = (row + col) * (Math.PI / 4)

        // Calculate scale factor based on sine wave for pulsing effect
        const baseScale = 0.6
        const scaleAmplitude = 0.4
        const scaleFrequency = 1.0
        const scale = baseScale + scaleAmplitude * Math.sin(time * scaleFrequency + phaseOffset)

        // Apply scale transformation
        box.style.transform = `scale3d(${scale}, ${scale}, ${scale})`

        // Use emerald colors with varying opacity
        const opacity = 0.2 + 0.3 * Math.sin(time * scaleFrequency + phaseOffset)
        if ((row + col) % 2 === 0) {
          box.style.backgroundColor = `rgba(16, 185, 129, ${opacity})`
          box.style.borderColor = `rgba(16, 185, 129, ${opacity + 0.3})`
        } else {
          box.style.backgroundColor = `rgba(16, 185, 129, ${opacity * 0.8})`
          box.style.borderColor = `rgba(16, 185, 129, ${opacity * 0.8 + 0.3})`
        }
      })

      requestId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(requestId)
    }
  }, [])

  // Create grid positions
  const gridPositions = Array.from({ length: boxCount }).map((_, index) => {
    const row = Math.floor(index / 3) - 1
    const col = (index % 3) - 1
    return { x: col * 50, y: row * 50, z: 0 }
  })

  return (
    <div className="box-grid-wrapper h-full w-full perspective-500">
      <div
        ref={containerRef}
        className="box-grid relative h-full w-full transform-style-3d transition-transform duration-300"
        style={{ transformStyle: "preserve-3d" }}
      >
        {gridPositions.map((pos, index) => (
          <div
            key={index}
            ref={(el) => (boxesRef.current[index] = el)}
            className="absolute h-12 w-12 rounded-md border border-emerald-500/50 bg-emerald-500/20 transition-all duration-300"
            style={{
              transform: `translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px)`,
              left: "calc(50% - 24px)",
              top: "calc(50% - 24px)",
              transformStyle: "preserve-3d",
            }}
          />
        ))}
      </div>

      {/* Add a subtle glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/10 to-emerald-400/10 blur-xl animate-pulse-on-hover"></div>
    </div>
  )
}

