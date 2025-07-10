import React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRef } from 'react';

function Building({ position, height, color }: { position: [number, number, number]; height: number; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });
  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.5, height, 0.5]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Scene() {
  const buildings = Array.from({ length: 30 }, (_, i) => ({
    position: [
      (Math.random() - 0.5) * 20,
      Math.random() * 2 - 1,
      (Math.random() - 0.5) * 20,
    ] as [number, number, number],
    height: Math.random() * 3 + 1,
    color: `hsl(${Math.random() * 40 + 30}, 100%, 70%)`,
  }));

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      {buildings.map((b, i) => (
        <Building key={i} position={b.position} height={b.height} color={b.color} />
      ))}
    </>
  );
}

const AnimatedBuildingBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 5, 15], fov: 50 }} style={{ background: 'transparent' }}>
        <Scene />
      </Canvas>
    </div>
  );
};

export default AnimatedBuildingBackground;
