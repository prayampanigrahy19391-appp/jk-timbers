'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { StaticProduct } from '@/types/product';

const VisualizerCanvas = dynamic(() => import('@/components/visualizer/VisualizerCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#131613]">
      <div className="text-accent animate-pulse font-bold tracking-wider">LOADING 3D ENGINE...</div>
    </div>
  )
});

// --- MAIN PAGE ---

export default function VisualizerClient({ products }: { products: StaticProduct[] }) {
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
    <div className="flex flex-col lg:flex-row h-[calc(100dvh-80px)] bg-timber-950 overflow-hidden">
      
      {/* 3D Canvas Area */}
      <div className="w-full lg:w-3/4 h-[40dvh] lg:h-full relative shrink-0">
        <div className="absolute top-3 left-3 md:top-6 md:left-6 z-10 glass-dark p-3 md:p-4 rounded-xl border border-timber-800 shadow-2xl max-w-[calc(100%-24px)]">
          <h2 className="text-lg md:text-2xl font-serif text-white mb-0.5 leading-tight">Advanced 3D Visualizer</h2>
          <p className="text-timber-400 text-[10px] md:text-sm">Drag to rotate • Scroll to zoom</p>
          <div className="mt-2 md:mt-4 inline-block bg-wood-900 text-accent px-2.5 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold border border-accent/30">
            {activeProduct.name} • {formFactor.toUpperCase()}
          </div>
        </div>
        
        <VisualizerCanvas 
          formFactor={formFactor} 
          activeProduct={activeProduct} 
          dimensions={dimensions} 
        />
      </div>

      {/* Controls Sidebar */}
      <div className="w-full lg:w-1/4 flex-grow flex flex-col bg-timber-900 border-t lg:border-t-0 lg:border-l border-timber-800 overflow-hidden min-h-0">
        
        <div className="p-4 md:p-6 border-b border-timber-800 shrink-0">
          <h3 className="text-base md:text-xl font-bold text-white mb-3">Form Factor</h3>
          <div className="flex bg-timber-950 p-1 rounded-xl">
            {['sheet', 'door', 'log'].map((ff) => (
              <button
                key={ff}
                onClick={() => setFormFactor(ff as 'sheet' | 'door' | 'log')}
                className={`flex-1 py-1.5 md:py-2 text-xs md:text-sm font-bold capitalize rounded-lg transition-colors ${
                  formFactor === ff ? 'bg-wood-800 text-accent shadow-md' : 'text-timber-500 hover:text-white'
                }`}
              >
                {ff}
              </button>
            ))}
          </div>

          <h3 className="text-xs font-bold text-timber-400 mt-4 md:mt-6 mb-2 uppercase tracking-wider">Size Scale</h3>
          <input 
            type="range" 
            min="0.5" max="1.5" step="0.1" 
            value={sizeMultiplier} 
            onChange={(e) => setSizeMultiplier(parseFloat(e.target.value))}
            className="w-full accent-accent cursor-pointer"
          />
          <div className="flex justify-between text-[10px] md:text-xs text-timber-500 mt-1 md:mt-2 font-mono">
            <span>Small</span>
            <span className="text-white font-bold">{displayDimensions}</span>
            <span>Large</span>
          </div>
        </div>

        <div className="p-4 md:p-6 flex-grow overflow-y-auto min-h-0">
          <h3 className="text-xs font-bold text-timber-400 mb-3 uppercase tracking-wider">Select Wood Material</h3>
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => setActiveProduct(product)}
                className={`flex flex-col items-center gap-1.5 md:gap-2 p-2 md:p-3 rounded-xl transition-all text-center border-2 ${
                  activeProduct.id === product.id 
                    ? 'bg-wood-800/80 border-accent shadow-[0_0_15px_rgba(234,179,8,0.1)]' 
                    : 'bg-timber-950/50 border-transparent hover:border-timber-700'
                }`}
              >
                <div 
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-cover bg-center border border-timber-800 shadow-inner"
                  style={{ backgroundImage: `url(${product.image})` }}
                />
                <span className="text-white font-medium text-[10px] md:text-xs line-clamp-2">{product.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 md:p-6 border-t border-timber-800 shrink-0 bg-timber-900">
          <div className="flex justify-between items-end mb-3 md:mb-4">
            <div>
              <p className="text-timber-400 text-[10px] uppercase tracking-wider font-bold mb-0.5">Estimated Market Price</p>
              <p className="text-xl md:text-2xl font-black text-white">{activeProduct.price}</p>
            </div>
            <p className="text-timber-500 text-xs md:text-sm font-medium">/ {activeProduct.unit}</p>
          </div>
          
          <button className="w-full bg-gradient-to-r from-accent to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-wood-950 font-bold py-3 md:py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] text-sm md:text-base">
            Proceed to Checkout
          </button>
        </div>
        
      </div>
    </div>
  );
}
