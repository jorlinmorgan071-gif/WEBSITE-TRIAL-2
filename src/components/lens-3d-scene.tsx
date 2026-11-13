"use client";

import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
} from "@react-three/drei";

/**
 * React Three Fiber — a procedural OBSCURA lens you can rotate.
 * Environment is generated locally from Lightformers (no network fetch).
 */
export function Lens3DScene({ autoRotate }: { autoRotate: boolean }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [3.6, 1.7, 4.8], fov: 30 }}
      gl={{ antialias: true, alpha: true }}
      className="!touch-none"
    >
      {/* Key + rim lights over the local Lightformer environment */}
      <spotLight
        position={[6, 7, 6]}
        intensity={140}
        angle={0.5}
        penumbra={0.8}
        color="#fff5ec"
      />
      <pointLight position={[-6, -2, -4]} intensity={30} color="#ff5a1f" />
      <ambientLight intensity={0.12} />

      <Environment resolution={256} frames={1}>
        <Lightformer
          intensity={2.2}
          position={[0, 5, 0]}
          rotation-x={Math.PI / 2}
          scale={[10, 10, 1]}
          color="#f5f2ea"
        />
        <Lightformer
          intensity={1.4}
          position={[-5, 1, -1]}
          rotation-y={Math.PI / 2}
          scale={[7, 2, 1]}
          color="#ff5a1f"
        />
        <Lightformer
          intensity={0.9}
          position={[5, -1, 2]}
          rotation-y={-Math.PI / 2}
          scale={[5, 3, 1]}
          color="#9a9aa0"
        />
      </Environment>

      <group rotation={[0.12, -0.5, 0.04]}>
        {/* Main barrel */}
        <mesh rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[1.14, 1.2, 1.75, 96]} />
          <meshStandardMaterial
            color="#141417"
            metalness={0.92}
            roughness={0.34}
          />
        </mesh>

        {/* Rear mount taper */}
        <mesh position={[0, 0, -1.15]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[1.2, 0.92, 0.55, 96]} />
          <meshStandardMaterial
            color="#101013"
            metalness={0.9}
            roughness={0.4}
          />
        </mesh>

        {/* Knurled focus ring */}
        <group position={[0, 0, 0.32]}>
          <mesh rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[1.26, 1.26, 0.5, 96]} />
            <meshStandardMaterial
              color="#17171b"
              metalness={0.9}
              roughness={0.28}
            />
          </mesh>
          {Array.from({ length: 72 }).map((_, i) => {
            const a = (i / 72) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[Math.cos(a) * 1.27, Math.sin(a) * 1.27, 0]}
                rotation-z={a}
              >
                <boxGeometry args={[0.035, 0.44, 0.028]} />
                <meshStandardMaterial
                  color="#232329"
                  metalness={0.95}
                  roughness={0.22}
                />
              </mesh>
            );
          })}
        </group>

        {/* Signal-orange accent ring */}
        <mesh position={[0, 0, -0.42]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[1.215, 1.215, 0.07, 96]} />
          <meshStandardMaterial
            color="#ff5a1f"
            emissive="#ff5a1f"
            emissiveIntensity={0.42}
            metalness={0.55}
            roughness={0.32}
          />
        </mesh>

        {/* Front bezel */}
        <mesh position={[0, 0, 0.9]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[1.06, 1.14, 0.12, 96]} />
          <meshStandardMaterial
            color="#0c0c0f"
            metalness={0.85}
            roughness={0.3}
          />
        </mesh>

        {/* Front glass element */}
        <mesh position={[0, 0, 0.94]}>
          <sphereGeometry args={[1.0, 64, 32, 0, Math.PI * 2, 0, 0.62]} />
          <meshPhysicalMaterial
            color="#0b0b10"
            metalness={0}
            transmission={0.92}
            thickness={1.4}
            roughness={0.06}
            ior={1.52}
            clearcoat={1}
            clearcoatRoughness={0.08}
            envMapIntensity={2.2}
          />
        </mesh>

        {/* Inner element with a violet coating flare */}
        <mesh position={[0, 0, 0.52]}>
          <sphereGeometry args={[0.62, 48, 24, 0, Math.PI * 2, 0, 0.7]} />
          <meshPhysicalMaterial
            color="#151422"
            metalness={0.1}
            transmission={0.75}
            thickness={0.9}
            roughness={0.12}
            ior={1.7}
            envMapIntensity={1.4}
          />
        </mesh>

        {/* Aperture glow deep inside the barrel */}
        <pointLight
          position={[0, 0, 0.1]}
          intensity={2.4}
          distance={3.4}
          color="#ffb28a"
        />
      </group>

      <ContactShadows
        position={[0, -2.1, 0]}
        opacity={0.62}
        scale={9}
        blur={2.6}
        far={4}
        color="#000000"
      />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={autoRotate}
        autoRotateSpeed={0.75}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.7}
      />
    </Canvas>
  );
}
