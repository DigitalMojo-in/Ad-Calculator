import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// Geometric shapes for marketing/real estate
function FloatingShape({ position, shape, color, scale = 1 }: {
  position: [number, number, number],
  shape: 'house' | 'chart' | 'coin' | 'key' | 'building',
  color: string,
  scale?: number
}) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  const renderShape = () => {
    switch (shape) {
      case 'house':
        return (
          <group>
            {/* House base */}
            <mesh position={[0, -0.1, 0]}>
              <boxGeometry args={[0.4, 0.3, 0.4]} />
              <meshStandardMaterial color={color} />
            </mesh>
            {/* House roof */}
            <mesh position={[0, 0.1, 0]} rotation={[0, Math.PI/4, 0]}>
              <coneGeometry args={[0.3, 0.2, 4]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
          </group>
        );
      
      case 'chart':
        return (
          <group>
            <mesh position={[-0.1, -0.1, 0]}>
              <boxGeometry args={[0.05, 0.2, 0.05]} />
              <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.05, 0.3, 0.05]} />
              <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0.1, 0.05, 0]}>
              <boxGeometry args={[0.05, 0.4, 0.05]} />
              <meshStandardMaterial color={color} />
            </mesh>
          </group>
        );
      
      case 'coin':
        return (
          <mesh>
            <cylinderGeometry args={[0.15, 0.15, 0.03, 16]} />
            <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
          </mesh>
        );
      
      case 'key':
        return (
          <group>
            {/* Key shaft */}
            <mesh position={[0.1, 0, 0]}>
              <boxGeometry args={[0.3, 0.05, 0.05]} />
              <meshStandardMaterial color={color} />
            </mesh>
            {/* Key head */}
            <mesh position={[-0.1, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.05, 8]} />
              <meshStandardMaterial color={color} />
            </mesh>
          </group>
        );
      
      case 'building':
        return (
          <group>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.2, 0.6, 0.2]} />
              <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0.25, -0.1, 0]}>
              <boxGeometry args={[0.15, 0.4, 0.15]} />
              <meshStandardMaterial color={color} />
            </mesh>
          </group>
        );
      
      default:
        return (
          <mesh>
            <sphereGeometry args={[0.1]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
    }
  };

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={meshRef} position={position} scale={scale}>
        {renderShape()}
      </group>
    </Float>
  );
}

// Main 3D Scene
function Scene() {
  const shapes = [
    { position: [-4, 2, -2] as [number, number, number], shape: 'house' as const, color: '#FFA500' },
    { position: [4, 1, -3] as [number, number, number], shape: 'chart' as const, color: '#32CD32' },
    { position: [-3, -1, -1] as [number, number, number], shape: 'coin' as const, color: '#FFD700' },
    { position: [3, 3, -4] as [number, number, number], shape: 'key' as const, color: '#87CEEB' },
    { position: [-2, 3, -2] as [number, number, number], shape: 'building' as const, color: '#DDA0DD' },
    { position: [2, -2, -3] as [number, number, number], shape: 'house' as const, color: '#FF6347' },
    { position: [-4, -2, -4] as [number, number, number], shape: 'chart' as const, color: '#98FB98' },
    { position: [4, -1, -2] as [number, number, number], shape: 'coin' as const, color: '#F0E68C' },
  ];

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ffd700" />
      
      {shapes.map((item, index) => (
        <FloatingShape
          key={index}
          position={item.position}
          shape={item.shape}
          color={item.color}
          scale={1}
        />
      ))}
    </>
  );
}

// Main Component
const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 opacity-60 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
};

export default AnimatedBackground;