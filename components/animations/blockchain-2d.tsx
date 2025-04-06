"use client"

import { useEffect, useRef } from "react"

interface BlockchainCanvasProps {
  variant?: "default" | "circular" | "grid"
  nodeCount?: number
  className?: string
}

export function BlockchainCanvas({ variant = "default", nodeCount = 15, className = "" }: BlockchainCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions to match container
    const resizeCanvas = () => {
      if (!canvas) return
      const container = canvas.parentElement
      if (!container) return

      const { width, height } = container.getBoundingClientRect()
      if (width > 0 && height > 0) {
        canvas.width = width
        canvas.height = height
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Node class
    class Node {
      x: number
      y: number
      radius: number
      color: string
      connections: Node[]
      pulseRadius: number
      pulseOpacity: number
      pulseSpeed: number
      dataPackets: { position: number; speed: number; size: number; color: string }[]

      constructor(x: number, y: number, radius: number, color: string) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.connections = []
        this.pulseRadius = radius
        this.pulseOpacity = 0.8
        this.pulseSpeed = 0.3 + Math.random() * 0.5
        this.dataPackets = []
      }

      draw(ctx: CanvasRenderingContext2D) {
        // Draw pulse
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.pulseRadius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${this.getColorValues()}, ${this.pulseOpacity})`
        ctx.fill()

        // Draw node
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()

        // Draw connections
        this.connections.forEach((node) => {
          ctx.beginPath()
          ctx.moveTo(this.x, this.y)
          ctx.lineTo(node.x, node.y)
          ctx.strokeStyle = `rgba(${this.getColorValues()}, 0.3)`
          ctx.lineWidth = 1
          ctx.stroke()

          // Draw data packets
          this.dataPackets.forEach((packet) => {
            const dx = node.x - this.x
            const dy = node.y - this.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance > 0) {
              const x = this.x + (dx * packet.position) / distance
              const y = this.y + (dy * packet.position) / distance

              ctx.beginPath()
              ctx.arc(x, y, packet.size, 0, Math.PI * 2)
              ctx.fillStyle = packet.color
              ctx.fill()

              // Update packet position
              packet.position += packet.speed

              // Reset packet when it reaches the destination
              if (packet.position > distance) {
                packet.position = 0
                // Randomly decide whether to create a new packet
                if (Math.random() > 0.7) {
                  this.dataPackets = this.dataPackets.filter((p) => p !== packet)
                }
              }
            }
          })
        })
      }

      update() {
        // Update pulse
        this.pulseRadius += this.pulseSpeed
        this.pulseOpacity -= 0.01

        if (this.pulseOpacity <= 0) {
          this.pulseRadius = this.radius
          this.pulseOpacity = 0.8
        }

        // Randomly create new data packets
        if (this.connections.length > 0 && Math.random() > 0.99) {
          const randomConnection = Math.floor(Math.random() * this.connections.length)
          this.dataPackets.push({
            position: 0,
            speed: 1 + Math.random() * 2,
            size: 2 + Math.random() * 2,
            color: `rgba(${this.getColorValues()}, 0.8)`,
          })
        }
      }

      getColorValues(): string {
        // Extract RGB values from color string
        const colorMatch = this.color.match(/rgba?$$(\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?$$/)
        if (colorMatch) {
          return `${colorMatch[1]}, ${colorMatch[2]}, ${colorMatch[3]}`
        }
        return "255, 255, 255" // Default to white if color format is not recognized
      }
    }

    // Create nodes based on variant
    const nodes: Node[] = []
    const colors = [
      "rgba(139, 92, 246, 0.8)", // purple
      "rgba(59, 130, 246, 0.8)", // blue
      "rgba(45, 212, 191, 0.8)", // teal
      "rgba(236, 72, 153, 0.8)", // pink
      "rgba(245, 158, 11, 0.8)", // amber
    ]

    const createNodes = () => {
      if (!canvas) return []

      const width = canvas.width
      const height = canvas.height

      if (variant === "circular") {
        // Create nodes in a circular pattern
        const centerX = width / 2
        const centerY = height / 2
        const radius = Math.min(width, height) * 0.4

        for (let i = 0; i < nodeCount; i++) {
          const angle = (i / nodeCount) * Math.PI * 2
          const x = centerX + Math.cos(angle) * radius
          const y = centerY + Math.sin(angle) * radius
          const color = colors[i % colors.length]
          nodes.push(new Node(x, y, 4, color))
        }

        // Connect nodes in a circle
        for (let i = 0; i < nodes.length; i++) {
          const nextIndex = (i + 1) % nodes.length
          nodes[i].connections.push(nodes[nextIndex])

          // Add some cross connections for more complexity
          if (i % 3 === 0 && nodes.length > 5) {
            const crossIndex = (i + Math.floor(nodes.length / 2)) % nodes.length
            nodes[i].connections.push(nodes[crossIndex])
          }
        }
      } else if (variant === "grid") {
        // Create nodes in a grid pattern
        const cols = Math.ceil(Math.sqrt(nodeCount))
        const rows = Math.ceil(nodeCount / cols)
        const cellWidth = width / (cols + 1)
        const cellHeight = height / (rows + 1)

        let index = 0
        for (let row = 0; row < rows && index < nodeCount; row++) {
          for (let col = 0; col < cols && index < nodeCount; col++) {
            const x = cellWidth * (col + 1)
            const y = cellHeight * (row + 1)
            const color = colors[index % colors.length]
            nodes.push(new Node(x, y, 4, color))
            index++
          }
        }

        // Connect nodes in a grid
        for (let i = 0; i < nodes.length; i++) {
          const row = Math.floor(i / cols)
          const col = i % cols

          // Connect to right neighbor
          if (col < cols - 1 && i + 1 < nodes.length) {
            nodes[i].connections.push(nodes[i + 1])
          }

          // Connect to bottom neighbor
          if (row < rows - 1 && i + cols < nodes.length) {
            nodes[i].connections.push(nodes[i + cols])
          }

          // Add some diagonal connections for more complexity
          if (row < rows - 1 && col < cols - 1 && i + cols + 1 < nodes.length && Math.random() > 0.5) {
            nodes[i].connections.push(nodes[i + cols + 1])
          }
        }
      } else {
        // Default: Create nodes in a chain/blockchain pattern
        const startX = width * 0.1
        const endX = width * 0.9
        const centerY = height / 2
        const xStep = (endX - startX) / (nodeCount - 1)
        const yVariation = height * 0.2

        for (let i = 0; i < nodeCount; i++) {
          const x = startX + xStep * i
          const y = centerY + (Math.random() - 0.5) * yVariation
          const color = colors[i % colors.length]
          nodes.push(new Node(x, y, 4, color))
        }

        // Connect nodes in a chain
        for (let i = 0; i < nodes.length - 1; i++) {
          nodes[i].connections.push(nodes[i + 1])
        }

        // Add some cross connections for more complexity
        for (let i = 0; i < nodes.length - 2; i++) {
          if (Math.random() > 0.7) {
            nodes[i].connections.push(nodes[i + 2])
          }
        }
      }

      return nodes
    }

    createNodes()

    // Animation loop
    const animate = () => {
      if (!canvas || !ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw and update nodes
      nodes.forEach((node) => {
        node.update()
        node.draw(ctx)
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [variant, nodeCount])

  return <canvas ref={canvasRef} className={`w-full h-full ${className}`} style={{ display: "block" }} />
}

