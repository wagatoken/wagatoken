"use client"

import { useEffect, useRef } from "react"

export default function BlockchainCube() {
  const cubeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cube = cubeRef.current
    if (!cube) return

    let time = 0
    let requestId: number

    const animate = () => {
      time += 0.01

      // Calculate scale factor based on sine wave for pulsing effect
      const baseScale = 1.0
      const scaleAmplitude = 0.15
      const scaleFrequency = 0.5
      const scale = baseScale + scaleAmplitude * Math.sin(time * scaleFrequency)

      // Calculate rotation for subtle movement
      const rotateY = time * 15
      const rotateX = 10 * Math.sin(time * 0.5)

      // Apply transformations
      cube.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`

      requestId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(requestId)
    }
  }, [])

  return (
    <div className="cube-wrapper h-full w-full perspective-500">
      <div
        ref={cubeRef}
        className="cube relative h-full w-full transform-style-3d transition-transform duration-300"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front face */}
        <div
          className="cube-face absolute inset-0 flex items-center justify-center border border-emerald-500/30 bg-black/30 backdrop-blur-sm"
          style={{ transform: "translateZ(80px)" }}
        >
          <div className="h-12 w-12 rounded-md border border-emerald-500/50 bg-emerald-500/20"></div>
        </div>

        {/* Back face */}
        <div
          className="cube-face absolute inset-0 flex items-center justify-center border border-emerald-500/30 bg-black/30 backdrop-blur-sm"
          style={{ transform: "rotateY(180deg) translateZ(80px)" }}
        >
          <div className="h-12 w-12 rounded-md border border-emerald-500/50 bg-emerald-500/20"></div>
        </div>

        {/* Right face */}
        <div
          className="cube-face absolute inset-0 flex items-center justify-center border border-emerald-500/30 bg-black/30 backdrop-blur-sm"
          style={{ transform: "rotateY(90deg) translateZ(80px)" }}
        >
          <div className="h-12 w-12 rounded-md border border-emerald-500/50 bg-emerald-500/20"></div>
        </div>

        {/* Left face */}
        <div
          className="cube-face absolute inset-0 flex items-center justify-center border border-emerald-500/30 bg-black/30 backdrop-blur-sm"
          style={{ transform: "rotateY(-90deg) translateZ(80px)" }}
        >
          <div className="h-12 w-12 rounded-md border border-emerald-500/50 bg-emerald-500/20"></div>
        </div>

        {/* Top face */}
        <div
          className="cube-face absolute inset-0 flex items-center justify-center border border-emerald-500/30 bg-black/30 backdrop-blur-sm"
          style={{ transform: "rotateX(90deg) translateZ(80px)" }}
        >
          <div className="h-12 w-12 rounded-md border border-emerald-500/50 bg-emerald-500/20"></div>
        </div>

        {/* Bottom face */}
        <div
          className="cube-face absolute inset-0 flex items-center justify-center border border-emerald-500/30 bg-black/30 backdrop-blur-sm"
          style={{ transform: "rotateX(-90deg) translateZ(80px)" }}
        >
          <div className="h-12 w-12 rounded-md border border-emerald-500/50 bg-emerald-500/20"></div>
        </div>
      </div>

      {/* Add a subtle glow effect */}
      <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-xl animate-pulse-on-hover"></div>
    </div>
  )
}

