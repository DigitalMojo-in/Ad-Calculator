import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

function RealEstateIcon({ geometry, color, position }: { geometry: JSX.Element, color: string, position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.2;
      meshRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime()) * 0.2;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={position}>
        {geometry}
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
      </mesh>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Stars radius={30} depth={60} count={2000} factor={4} saturation={0} fade speed={2} />

      {/* Floating Real Estate Related Icons */}
      <RealEstateIcon
        geometry={<boxGeometry args={[0.8, 0.6, 0.8]} />} // House Block
        color="#D4AF37"
        position={[-2, 0, -5]}
      />
      <RealEstateIcon
        geometry={<cylinderGeometry args={[0.3, 0.3, 0.1, 32]} />} // Coin
        color="#FFD700"
        position={[0, 1, -4]}
      />
      <RealEstateIcon
        geometry={<coneGeometry args={[0.5, 1, 4]} />} // Roof
        color="#8B0000"
        position={[2, 0.5, -6]}
      />
      <RealEstateIcon
        geometry={<torusGeometry args={[0.4, 0.1, 16, 100]} />} // Key ring
        color="#B0C4DE"
        position={[-1, -1, -4]}
      />
    </>
  );
}

const RealEstateAnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 opacity-50 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 7], fov: 50 }} style={{ background: 'transparent' }}>
        <Scene />
      </Canvas>
    </div>
  );
};

export default RealEstateAnimatedBackground;
