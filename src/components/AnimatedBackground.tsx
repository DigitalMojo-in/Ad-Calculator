import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Sparkles, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

const FloatingGem: React.FC = () => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.2;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={ref} scale={1.6} position={[0, 0, 0]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color={'#FFD700'}
          roughness={0.1}
          metalness={1}
          emissive={'#FFC107'}
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  );
};

const Scene: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1.5} />
      <Sparkles
        count={50}
        speed={0.3}
        scale={[6, 6, 6]}
        size={2}
        color={'#ffffff'}
        opacity={0.8}
      />
      <Environment preset="city" />
      <FloatingGem />
    </>
  );
};

const LuxuryAnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, #0f0f0f, #000000)' }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
        <Scene />
      </Canvas>
    </div>
  );
};

export default LuxuryAnimatedBackground;
