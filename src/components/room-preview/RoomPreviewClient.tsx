'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Upload, Camera, Download, Layers } from 'lucide-react';

const presetRooms = [
  { id: 'living', name: 'Living Room', url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1024' },
  { id: 'bedroom', name: 'Bedroom', url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=1024' },
  { id: 'kitchen', name: 'Kitchen', url: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=1024' },
];

const woodTextures = [
  { id: 'teak', name: 'Sagwan (Teak)', color: 'rgba(193, 133, 83, 0.4)' },
  { id: 'walnut', name: 'Dark Walnut', color: 'rgba(74, 51, 32, 0.5)' },
  { id: 'oak', name: 'White Oak', color: 'rgba(224, 192, 151, 0.4)' },
  { id: 'marine', name: 'Marine Ply Finish', color: 'rgba(180, 140, 100, 0.3)' },
];

export function RoomPreviewClient() {
  const [activeRoom, setActiveRoom] = useState(presetRooms[0].url);
  const [activeTexture, setActiveTexture] = useState(woodTextures[0]);

  return (
    <div className="bg-wood-50 dark:bg-timber-950 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <Layers className="mx-auto text-accent mb-4" size={48} />
          <h1 className="text-4xl font-serif font-bold text-wood-950 dark:text-white mb-4">Interior Room Preview</h1>
          <p className="text-timber-600 dark:text-timber-400">Visualize our premium wood textures directly in your space.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Controls Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white dark:bg-timber-900 p-6 rounded-2xl border border-wood-100 dark:border-timber-800 shadow-sm">
              <h3 className="font-bold text-wood-950 dark:text-white mb-4">1. Choose Your Space</h3>
              
              <div className="space-y-4 mb-6">
                <button className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-timber-300 dark:border-timber-600 hover:border-accent p-6 rounded-xl transition-colors text-timber-600 dark:text-timber-400 hover:text-accent group">
                  <Upload size={24} className="group-hover:-translate-y-1 transition-transform" />
                  <span className="font-medium">Upload Room Photo</span>
                </button>
                <div className="text-center text-xs text-timber-500">OR SELECT A PRESET</div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {presetRooms.map(room => (
                  <button 
                    key={room.id}
                    onClick={() => setActiveRoom(room.url)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 ${activeRoom === room.url ? 'border-accent' : 'border-transparent'}`}
                  >
                    <Image src={room.url} alt={room.name} fill sizes="33vw" className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-timber-900 p-6 rounded-2xl border border-wood-100 dark:border-timber-800 shadow-sm">
              <h3 className="font-bold text-wood-950 dark:text-white mb-4">2. Select Wood Finish</h3>
              
              <div className="space-y-3">
                {woodTextures.map(tex => (
                  <button
                    key={tex.id}
                    onClick={() => setActiveTexture(tex)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${activeTexture.id === tex.id ? 'bg-wood-100 dark:bg-timber-800 border border-wood-300 dark:border-timber-600' : 'hover:bg-wood-50 dark:hover:bg-timber-800 border border-transparent'}`}
                  >
                    <div className="w-8 h-8 rounded-full shadow-inner" style={{ backgroundColor: tex.color.replace(/, 0\.[0-9]+\)/, ', 1)') }} />
                    <span className="font-medium text-wood-950 dark:text-white">{tex.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <button className="w-full shadow-lg hover:shadow-xl bg-wood-950 text-white hover:bg-wood-800 transition-colors py-3 px-6 rounded-xl flex items-center justify-center gap-2 font-medium text-lg">
              <Download size={20} />
              Save Design
            </button>
          </div>

          {/* Preview Area */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-timber-900 p-4 rounded-3xl border border-wood-100 dark:border-timber-800 shadow-lg h-full min-h-[600px] flex flex-col">
              
              <div className="flex justify-between items-center px-4 mb-4">
                <h3 className="font-serif font-bold text-xl text-wood-950 dark:text-white">Live Preview</h3>
                <div className="flex items-center gap-2 text-sm text-timber-500">
                  <Camera size={16} /> Before / After
                </div>
              </div>

              <div className="relative flex-grow rounded-2xl overflow-hidden bg-timber-100 dark:bg-timber-950">
                {/* Base Image */}
                <Image src={activeRoom} alt="Room" fill sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" />
                
                {/* Simulated AR Overlay (Blend Mode trick for quick visualizer) */}
                <div 
                  className="absolute inset-0 mix-blend-multiply transition-colors duration-500" 
                  style={{ backgroundColor: activeTexture.color }}
                />
                
                {/* Decorative UI Overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <div className="glass-dark px-4 py-2 rounded-lg text-white">
                    <p className="text-xs text-timber-300 uppercase tracking-wider">Applied Finish</p>
                    <p className="font-bold">{activeTexture.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
