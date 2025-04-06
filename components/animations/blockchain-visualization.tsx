"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"

// Node component representing a block in the blockchain
function Node({ position, color, pulse = false, size = 1 }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current && pulse) {
      meshRef.current.scale.setScalar(1 + 0.05 * Math.sin(state.clock.getElapsedTime() * 2))
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} emissive={color} emissiveIntensity={0.4} />
    </mesh>
  )
}

// Connection component representing links between blocks
function Connection({ start, end, color }) {
  const ref = useRef<THREE.Mesh>(null)

  // Calculate the midpoint and direction
  const { position, length } = useMemo(() => {
    const direction = new THREE.Vector3().subVectors(end, start).normalize()
    const length = new THREE.Vector3().subVectors(end, start).length()
    const position = new THREE.Vector3().addVectors(start, direction.clone().multiplyScalar(length / 2))
    return { position, length }
  }, [start, end])

  // Use useFrame instead of useEffect for rotation
  useFrame(() => {
    if (ref.current) {
      // Create a temporary vector to look at
      const lookAtVector = new THREE.Vector3().copy(end)
      ref.current.lookAt(lookAtVector)
      ref.current.rotateX(Math.PI / 2)
    }
  })

  return (
    <mesh ref={ref} position={position}>
      <cylinderGeometry args={[0.05, 0.05, length, 8]} />
      <meshStandardMaterial color={color} transparent={true} opacity={0.6} emissive={color} emissiveIntensity={0.4} />
    </mesh>
  )
}

// Main blockchain component
function BlockchainModel({ nodeCount = 10, variant = "default" }) {
  // Generate nodes in a chain-like pattern
  const nodes = useMemo(() => {
    const nodesArray = []

    for (let i = 0; i < nodeCount; i++) {
      // Different patterns based on variant
      let position

      if (variant === "circular") {
        const angle = (i / nodeCount) * Math.PI * 2
        const radius = 4
        position = [Math.cos(angle) * radius, Math.sin(i / 2) * 2, Math.sin(angle) * radius]
      } else if (variant === "grid") {
        const gridSize = Math.ceil(Math.sqrt(nodeCount))
        const x = (i % gridSize) * 2 - gridSize
        const z = Math.floor(i / gridSize) * 2 - gridSize
        position = [x, Math.sin(i * 0.5) * 1.5, z]
      } else {
        // Default chain-like pattern
        position = [Math.sin(i * 0.5) * 3, Math.cos(i * 0.3) * 2, i - nodeCount / 2]
      }

      // Alternate colors for nodes
      const color =
        i % 3 === 0
          ? "#10b981" // emerald
          : i % 3 === 1
            ? "#8b5cf6" // purple
            : "#06b6d4" // cyan

      nodesArray.push({
        id: i,
        position,
        color,
        pulse: i % 4 === 0, // Only some nodes pulse
      })
    }

    return nodesArray
  }, [nodeCount, variant])

  // Generate connections between nodes
  const connections = useMemo(() => {
    const connectionsArray = []

    for (let i = 0; i < nodes.length - 1; i++) {
      // Connect to next node
      connectionsArray.push({
        id: `${i}-${i + 1}`,
        start: new THREE.Vector3(...nodes[i].position),
        end: new THREE.Vector3(...nodes[i + 1].position),
        color: nodes[i].color,
      })

      // Add some cross connections for more complex networks
      if (i < nodes.length - 3 && i % 3 === 0) {
        connectionsArray.push({
          id: `${i}-${i + 3}`,
          start: new THREE.Vector3(...nodes[i].position),
          end: new THREE.Vector3(...nodes[i + 3].position),
          color: nodes[i].color,
        })
      }
    }

    return connectionsArray
  }, [nodes])

  // Animate the entire blockchain
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {nodes.map((node) => (
        <Node key={node.id} position={node.position} color={node.color} pulse={node.pulse} size={0.8} />
      ))}

      {connections.map((connection) => (
        <Connection key={connection.id} start={connection.start} end={connection.end} color={connection.color} />
      ))}
    </group>
  )
}

// Wrapper component that provides the Canvas and controls
export function BlockchainVisualization({
  className = "",
  variant = "default",
  nodeCount = 10,
  autoRotate = true,
  height = "100%",
}) {
  return (
    <div className={`${className}`} style={{ height }}>
      <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <BlockchainModel nodeCount={nodeCount} variant={variant} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate={autoRotate} autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  )
}

