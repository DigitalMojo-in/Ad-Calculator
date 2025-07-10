import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// Minimal classy real estate floating building block
function FloatingBuilding({ position, color, scale = 1 }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={meshRef} position={position} scale={scale}>
        <mesh>
          <boxGeometry args={[0.2, 0.6, 0.2]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0.25, -0.2, 0]}>
          <boxGeometry args={[0.15, 0.4, 0.15]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
    </Float>
  );
}

function Scene() {
  const isMobile = window.innerWidth < 768;
  const buildings = isMobile
    ? [
        { position: [-1, 0.3, -1], color: '#ffffff33', scale: 0.8 },
        { position: [1, -0.5, -2], color: '#ffffff44', scale: 0.8 },
      ]
    : [
        { position: [-2, 1.2, -3], color: '#ffffff22', scale: 1 },
        { position: [2, -0.6, -4], color: '#ffffff33', scale: 1 },
        { position: [1.5, 2, -5], color: '#ffffff55', scale: 1 },
      ];

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.7} color={'#ffcc88'} />
      {buildings.map((b, i) => (
        <FloatingBuilding key={i} position={b.position} color={b.color} scale={b.scale} />
      ))}
    </>
  );
}

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 65 }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
};

export default AnimatedBackground;
