'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// --- 3D MODELS ---

function PlywoodSheet({ textureUrl, width, height, thickness }: any) {
  const texture = useTexture(textureUrl) as any;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(width / 4, height / 4); // Scale texture based on size

  return (
    <mesh castShadow receiveShadow position={[0, height / 2, 0]}>
      <boxGeometry args={[width, height, thickness]} />
      <meshStandardMaterial attach="material-0" color="#5a3d24" roughness={0.9} />
      <meshStandardMaterial attach="material-1" color="#5a3d24" roughness={0.9} />
      <meshStandardMaterial attach="material-2" color="#5a3d24" roughness={0.9} />
      <meshStandardMaterial attach="material-3" color="#5a3d24" roughness={0.9} />
      <meshStandardMaterial attach="material-4" map={texture} roughness={0.8} />
      <meshStandardMaterial attach="material-5" map={texture} roughness={0.8} />
    </mesh>
  );
}

function DoorPanel({ textureUrl, width, height, thickness }: any) {
  const texture = useTexture(textureUrl) as any;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(width / 4, height / 4);

  return (
    <group position={[0, height / 2, 0]}>
      {/* Main Door Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, thickness]} />
        <meshStandardMaterial attach="material-0" color="#4a2e15" roughness={0.9} />
        <meshStandardMaterial attach="material-1" color="#4a2e15" roughness={0.9} />
        <meshStandardMaterial attach="material-2" color="#4a2e15" roughness={0.9} />
        <meshStandardMaterial attach="material-3" color="#4a2e15" roughness={0.9} />
        <meshStandardMaterial attach="material-4" map={texture} roughness={0.6} />
        <meshStandardMaterial attach="material-5" map={texture} roughness={0.6} />
      </mesh>
      
      {/* Door Handle */}
      <mesh position={[width / 2 - 0.15, 0, thickness / 2 + 0.02]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 16]} />
        <meshStandardMaterial color="#cccccc" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Handle Connectors */}
      <mesh position={[width / 2 - 0.15, 0.1, thickness / 2 + 0.01]} rotation={[Math.PI/2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.01, 0.01, 0.04, 16]} />
        <meshStandardMaterial color="#cccccc" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[width / 2 - 0.15, -0.1, thickness / 2 + 0.01]} rotation={[Math.PI/2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.01, 0.01, 0.04, 16]} />
        <meshStandardMaterial color="#cccccc" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

function TimberLog({ textureUrl, width, height, thickness }: any) {
  const texture = useTexture(textureUrl) as any;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, height / 2);

  return (
    <mesh castShadow receiveShadow position={[0, height / 2, 0]}>
      {/* A thick rectangular log */}
      <boxGeometry args={[width, height, thickness]} />
      <meshStandardMaterial attach="material-0" map={texture} roughness={0.9} /> {/* Side */}
      <meshStandardMaterial attach="material-1" map={texture} roughness={0.9} /> {/* Side */}
      <meshStandardMaterial attach="material-2" color="#8b5a2b" roughness={0.9} /> {/* Top end grain */}
      <meshStandardMaterial attach="material-3" color="#8b5a2b" roughness={0.9} /> {/* Bottom end grain */}
      <meshStandardMaterial attach="material-4" map={texture} roughness={0.9} /> {/* Front */}
      <meshStandardMaterial attach="material-5" map={texture} roughness={0.9} /> {/* Back */}
    </mesh>
  );
}

export default function VisualizerCanvas({ formFactor, activeProduct, dimensions }: any) {
  return (
    <Canvas shadows camera={{ position: [3, 2, 4], fov: 45 }}>
      <color attach="background" args={['#131613']} />
      <ambientLight intensity={0.6} />
      <directionalLight castShadow position={[5, 10, 5]} intensity={1.5} shadow-mapSize={[2048, 2048]} shadow-bias={-0.0001} />
      <directionalLight position={[-5, 5, -5]} intensity={0.5} />
      
      <Suspense fallback={null}>
        {formFactor === 'sheet' && <PlywoodSheet textureUrl={activeProduct.image} width={dimensions[0]} height={dimensions[1]} thickness={dimensions[2]} />}
        {formFactor === 'door' && <DoorPanel textureUrl={activeProduct.image} width={dimensions[0]} height={dimensions[1]} thickness={dimensions[2]} />}
        {formFactor === 'log' && <TimberLog textureUrl={activeProduct.image} width={dimensions[0]} height={dimensions[1]} thickness={dimensions[2]} />}
        <Environment preset="warehouse" />
      </Suspense>

      <ContactShadows position={[0, 0, 0]} opacity={0.7} scale={10} blur={2.5} far={4} color="#000000" />
      <OrbitControls 
        enablePan={true} 
        autoRotate
        autoRotateSpeed={2}
        minDistance={2}
        maxDistance={10}
        target={[0, 1, 0]}
      />
    </Canvas>
  );
}
