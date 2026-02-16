"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, ContactShadows, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

/**
 * GeometricShape: A reusable 3D shape component with random properties
 */
function GeometricShape({ position, color, speed, rotationSpeed, scale, type }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Random rotation for variety
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * rotationSpeed;
      meshRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  const geometry = useMemo(() => {
    switch (type) {
      case 'torus': return <torusGeometry args={[1, 0.3, 16, 32]} />;
      case 'octahedron': return <octahedronGeometry args={[1, 0]} />;
      case 'icosahedron': return <icosahedronGeometry args={[1, 0]} />;
      default: return <sphereGeometry args={[1, 32, 32]} />;
    }
  }, [type]);

  return (
    <Float
      speed={speed} // Animation speed
      rotationIntensity={1} // Float rotation intensity
      floatIntensity={2} // Float height intensity
      position={position}
    >
      <mesh ref={meshRef} scale={scale} castShadow receiveShadow>
        {geometry}
        <meshStandardMaterial 
            color={color} 
            roughness={0.2} 
            metalness={0.8}
            transparent
            opacity={0.9}
        />
      </mesh>
    </Float>
  );
}

/**
 * HeroScene: The main scene containing the camera, lights, and shapes.
 */
function HeroScene() {
    // Generate random shapes
    const shapes = useMemo(() => {
        const items = [];
        const colors = ["#ffffff", "#e2e8f0", "#94a3b8", "#3b82f6"]; // Theme colors (white, slate, blue)
        const types = ['torus', 'octahedron', 'icosahedron'];
        
        for (let i = 0; i < 8; i++) {
            items.push({
                position: [
                    (Math.random() - 0.5) * 15, 
                    (Math.random() - 0.5) * 15, 
                    (Math.random() - 0.5) * 10
                ],
                scale: Math.random() * 0.8 + 0.4,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: Math.random() * 2 + 1,
                rotationSpeed: Math.random() * 0.5,
                type: types[Math.floor(Math.random() * types.length)]
            });
        }
        return items;
    }, []);

    // Mouse parallax effect on the camera group
    const groupRef = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (groupRef.current) {
            const { x, y } = state.pointer;
            // Smoothly interpolate current rotation to target rotation based on mouse position
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, x * 0.1, 0.1);
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -y * 0.1, 0.1);
        }
    });

    return (
        <group ref={groupRef}>
            {shapes.map((shape, i) => (
                <GeometricShape key={i} {...shape} />
            ))}
            <ContactShadows position={[0, -5, 0]} opacity={0.4} scale={20} blur={2.5} far={10} />
        </group>
    );
}

/**
 * HeroBackground: The public component exporting the Canvas.
 * Lazy loads the 3D scene for performance.
 */
export default function HeroBackground({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas shadows dpr={[1, 2]} className="w-full h-full">
        <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={50} />
        
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="blue" />
        
        <HeroScene />
        
        {/* Soft studio lighting environment */}
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
