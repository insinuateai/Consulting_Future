'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PARTICLE_COUNT = 4000

function Particles() {
  const pointsRef = useRef<THREE.Points>(null)
  const raycaster = useRef(new THREE.Raycaster())
  const intersectionPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), -2))
  const planeHit = useRef(new THREE.Vector3())
  // Start far off-screen so no repulsion on load
  const mouseWorld = useRef(new THREE.Vector3(9999, 9999, 0))

  const { geometry, positions, velocities } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const colors = new Float32Array(PARTICLE_COUNT * 3)
    const velocities = new Float32Array(PARTICLE_COUNT * 3)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Spherical distribution, biased toward center via pow
      const radius = Math.pow(Math.random(), 0.7) * 15
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      positions[i * 3]     = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)

      // Slow, unique drift per particle
      velocities[i * 3]     = (Math.random() - 0.5) * 0.003
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.003
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.002

      // ~30% cyan (#00F0FF at 20% opacity), ~70% warm white (#F0EDE6 at 10% opacity)
      // With AdditiveBlending, bake opacity into brightness
      if (Math.random() < 0.3) {
        const b = 0.18 + Math.random() * 0.12
        colors[i * 3]     = 0
        colors[i * 3 + 1] = 0.941 * b
        colors[i * 3 + 2] = 1.0   * b
      } else {
        const b = 0.08 + Math.random() * 0.10
        colors[i * 3]     = 0.941 * b
        colors[i * 3 + 1] = 0.929 * b
        colors[i * 3 + 2] = 0.902 * b
      }
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color',    new THREE.BufferAttribute(colors, 3))

    return { geometry, positions, velocities }
  }, [])

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((state) => {
    if (!pointsRef.current) return

    // Project mouse NDC → world space via plane intersection
    raycaster.current.setFromCamera(state.mouse, state.camera)
    if (raycaster.current.ray.intersectPlane(intersectionPlane.current, planeHit.current)) {
      mouseWorld.current.lerp(planeHit.current, 0.1)
    }

    const mx = mouseWorld.current.x
    const my = mouseWorld.current.y
    const mz = mouseWorld.current.z

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3
      const iy = ix + 1
      const iz = ix + 2

      // Apply drift
      positions[ix] += velocities[ix]
      positions[iy] += velocities[iy]
      positions[iz] += velocities[iz]

      // Soft spherical boundary (radius 15)
      const d2 = positions[ix] * positions[ix] + positions[iy] * positions[iy] + positions[iz] * positions[iz]
      if (d2 > 225) {
        positions[ix] *= 0.998
        positions[iy] *= 0.998
        positions[iz] *= 0.998
      }

      // Mouse repulsion — influence radius 3 units, force ~0.01
      const dx = positions[ix] - mx
      const dy = positions[iy] - my
      const dz = positions[iz] - mz
      const dist2 = dx * dx + dy * dy + dz * dz

      if (dist2 < 9 && dist2 > 0.0001) {
        const dist = Math.sqrt(dist2)
        const force = (1 - dist / 3) * 0.012
        positions[ix] += (dx / dist) * force
        positions[iy] += (dy / dist) * force
        positions[iz] += (dz / dist) * force
      }
    }

    ;(geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true

    // Very slow Y-axis rotation of the entire field
    pointsRef.current.rotation.y += 0.0001
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        vertexColors
        size={0.07}
        sizeAttenuation
        transparent
        opacity={1}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

export function ParticleField() {
  return (
    <Canvas
      camera={{ fov: 75, position: [0, 0, 5] }}
      gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
      dpr={[1, 1.5]}
      style={{ background: 'transparent' }}
    >
      <Particles />
    </Canvas>
  )
}
