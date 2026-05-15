'use client';

import { useState, Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { products } from '@/data/products';

// --- 3D MODELS ---

function PlywoodSheet({ textureUrl, width, height, thickness }: any) {
  const texture = useTexture(textureUrl);
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
  const texture = useTexture(textureUrl);
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
  const texture = useTexture(textureUrl);
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

// --- MAIN PAGE ---

export default function VisualizerPage() {
  const [activeProduct, setActiveProduct] = useState(products[0]);
  const [formFactor, setFormFactor] = useState<'sheet' | 'door' | 'log'>('sheet');
  const [sizeMultiplier, setSizeMultiplier] = useState(1);

  // Derive Dimensions based on form factor and multiplier
  // Returns [width, height, thickness] in meters (roughly 1 unit = 1 meter for scale)
  const dimensions = useMemo(() => {
    switch(formFactor) {
      case 'sheet': return [1.22 * sizeMultiplier, 2.44 * sizeMultiplier, 0.018]; // 4x8 ft
      case 'door': return [0.91 * sizeMultiplier, 2.13 * sizeMultiplier, 0.035];  // 3x7 ft
      case 'log': return [0.2 * sizeMultiplier, 2.44 * sizeMultiplier, 0.2 * sizeMultiplier]; // thick log
      default: return [1, 1, 1];
    }
  }, [formFactor, sizeMultiplier]);

  const displayDimensions = useMemo(() => {
    switch(formFactor) {
      case 'sheet': return `${(4 * sizeMultiplier).toFixed(1)}ft x ${(8 * sizeMultiplier).toFixed(1)}ft`;
      case 'door': return `${(3 * sizeMultiplier).toFixed(1)}ft x ${(7 * sizeMultiplier).toFixed(1)}ft`;
      case 'log': return `${(8 * sizeMultiplier).toFixed(1)}in x ${(8 * sizeMultiplier).toFixed(1)}in x ${(8 * sizeMultiplier).toFixed(1)}ft length`;
      default: return '';
    }
  }, [formFactor, sizeMultiplier]);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] bg-timber-950">
      
      {/* 3D Canvas Area */}
      <div className="w-full lg:w-3/4 h-[50vh] lg:h-full relative">
        <div className="absolute top-6 left-6 z-10 glass-dark p-4 rounded-xl border border-timber-800 shadow-2xl">
          <h2 className="text-2xl font-serif text-white mb-1">Advanced 3D Visualizer</h2>
          <p className="text-timber-400 text-sm">Drag to rotate • Scroll to zoom</p>
          <div className="mt-4 inline-block bg-wood-900 text-accent px-3 py-1 rounded-full text-xs font-bold border border-accent/30">
            {activeProduct.name} • {formFactor.toUpperCase()}
          </div>
        </div>
        
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
      </div>

      {/* Controls Sidebar */}
      <div className="w-full lg:w-1/4 h-full bg-timber-900 border-l border-timber-800 flex flex-col overflow-hidden">
        
        <div className="p-6 border-b border-timber-800 shrink-0">
          <h3 className="text-xl font-bold text-white mb-4">Form Factor</h3>
          <div className="flex bg-timber-950 p-1 rounded-xl">
            {['sheet', 'door', 'log'].map((ff) => (
              <button
                key={ff}
                onClick={() => setFormFactor(ff as any)}
                className={`flex-1 py-2 text-sm font-bold capitalize rounded-lg transition-colors ${
                  formFactor === ff ? 'bg-wood-800 text-accent shadow-md' : 'text-timber-500 hover:text-white'
                }`}
              >
                {ff}
              </button>
            ))}
          </div>

          <h3 className="text-sm font-bold text-timber-400 mt-6 mb-3 uppercase tracking-wider">Size Scale</h3>
          <input 
            type="range" 
            min="0.5" max="1.5" step="0.1" 
            value={sizeMultiplier} 
            onChange={(e) => setSizeMultiplier(parseFloat(e.target.value))}
            className="w-full accent-accent"
          />
          <div className="flex justify-between text-xs text-timber-500 mt-2 font-mono">
            <span>Small</span>
            <span className="text-white font-bold">{displayDimensions}</span>
            <span>Large</span>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <h3 className="text-sm font-bold text-timber-400 mb-4 uppercase tracking-wider">Select Wood Material</h3>
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => setActiveProduct(product)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all text-center border-2 ${
                  activeProduct.id === product.id 
                    ? 'bg-wood-800/80 border-accent shadow-[0_0_15px_rgba(234,179,8,0.1)]' 
                    : 'bg-timber-950/50 border-transparent hover:border-timber-700'
                }`}
              >
                <div 
                  className="w-16 h-16 rounded-full bg-cover bg-center border-2 border-timber-800 shadow-inner"
                  style={{ backgroundImage: `url(${product.image})` }}
                />
                <span className="text-white font-medium text-xs line-clamp-2">{product.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-timber-800 shrink-0 bg-timber-900">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-timber-400 text-xs uppercase tracking-wider font-bold mb-1">Estimated Market Price</p>
              <p className="text-2xl font-black text-white">{activeProduct.price}</p>
            </div>
            <p className="text-timber-500 text-sm font-medium">/ {activeProduct.unit}</p>
          </div>
          
          <button className="w-full bg-gradient-to-r from-accent to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-wood-950 font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)]">
            Proceed to Checkout
          </button>
        </div>
        
      </div>
    </div>
  );
}
