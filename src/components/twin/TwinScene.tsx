'use client'

import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import type { DigitalTwin, TwinEdge, TwinNode } from '@/lib/twin/types'

const COLUMN_X = [-6, -2, 2, 6]
const ROW_GAP = 1.8

function nodePosition(nodes: TwinNode[], id: string): [number, number, number] {
  const n = nodes.find((x) => x.id === id)
  if (!n) return [0, 0, 0]
  const col = Math.max(0, Math.min(3, n.column))
  const peers = nodes.filter((x) => x.column === col)
  const idx = peers.findIndex((x) => x.id === id)
  const y = (idx - (peers.length - 1) / 2) * ROW_GAP
  return [COLUMN_X[col], y, 0]
}

function colorForState(
  node: TwinNode,
  mode: 'current' | 'future'
): string {
  if (mode === 'current') {
    switch (node.currentState) {
      case 'bottleneck':
        return '#ff3860'
      case 'manual':
        return '#ffb800'
      case 'healthy':
        return '#00f0ff'
      case 'missing':
        return '#444'
    }
  }
  switch (node.futureState) {
    case 'automated':
      return '#00ff88'
    case 'augmented':
      return '#00f0ff'
    case 'healthy':
      return '#00f0ff'
    case 'retired':
      return '#444'
  }
}

function glowIntensity(node: TwinNode, mode: 'current' | 'future') {
  if (mode === 'current' && node.currentState === 'bottleneck') return 1.6
  if (mode === 'future' && node.futureState === 'automated') return 1.3
  return 0.5
}

function NodeMesh({
  node,
  position,
  mode,
}: {
  node: TwinNode
  position: [number, number, number]
  mode: 'current' | 'future'
}) {
  const ref = useRef<THREE.Mesh>(null)
  const color = colorForState(node, mode)
  const glow = glowIntensity(node, mode)

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime
    const base = 0.9
    const pulse =
      mode === 'current' && node.currentState === 'bottleneck'
        ? base + Math.sin(t * 3) * 0.06
        : base
    ref.current.scale.set(pulse, pulse, pulse)
  })

  return (
    <group position={position}>
      <mesh ref={ref}>
        <boxGeometry args={[1.4, 0.9, 0.3]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={glow}
          metalness={0.3}
          roughness={0.5}
        />
      </mesh>
      <Html center distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div className="pointer-events-none -translate-y-1 rounded bg-black/75 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-warm">
          {node.label}
        </div>
      </Html>
    </group>
  )
}

function EdgeLine({
  edge,
  nodes,
  mode,
}: {
  edge: TwinEdge
  nodes: TwinNode[]
  mode: 'current' | 'future'
}) {
  const from = nodePosition(nodes, edge.from)
  const to = nodePosition(nodes, edge.to)
  const color =
    mode === 'current' && edge.slow ? '#ff3860' : mode === 'future' ? '#00ff88' : '#00f0ff'
  const points = useMemo(
    () => [new THREE.Vector3(...from), new THREE.Vector3(...to)],
    [from, to]
  )
  return (
    <Line
      points={points}
      color={color}
      lineWidth={edge.weight}
      transparent
      opacity={mode === 'current' && edge.slow ? 0.6 : 0.9}
    />
  )
}

export function TwinScene({
  twin,
  mode,
}: {
  twin: DigitalTwin
  mode: 'current' | 'future'
}) {
  return (
    <div className="relative h-[560px] w-full rounded-lg border border-white/[0.08] bg-black/60">
      <Canvas
        camera={{ position: [0, 0, 14], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <directionalLight position={[4, 4, 6]} intensity={0.6} />
          <pointLight position={[0, 0, 8]} intensity={0.5} color="#00f0ff" />
          {twin.edges.map((e, i) => (
            <EdgeLine key={i} edge={e} nodes={twin.nodes} mode={mode} />
          ))}
          {twin.nodes.map((n) => (
            <NodeMesh key={n.id} node={n} position={nodePosition(twin.nodes, n.id)} mode={mode} />
          ))}
          <OrbitControls enablePan={false} minDistance={8} maxDistance={20} />
        </Suspense>
      </Canvas>
    </div>
  )
}
