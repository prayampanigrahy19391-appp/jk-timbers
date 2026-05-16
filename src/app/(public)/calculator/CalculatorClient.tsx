'use client';

import { useState, useMemo } from 'react';
import { Calculator, HardHat, Package, Receipt, CheckCircle } from 'lucide-react';
import type { StaticProduct } from '@/types/product';
import { parsePrice } from '@/utils/price';

export default function CalculatorClient({ products }: { products: StaticProduct[] }) {
  const [activeTab, setActiveTab] = useState<'sqft' | 'cuft' | 'doors'>('sqft');
  const [saved, setSaved] = useState(false);
  
  // Categorized Products
  const sheetProducts = products.filter(p => ['Plywood', 'Engineered', 'Laminates', 'Veneers'].includes(p.category));
  const timberProducts = products.filter(p => p.category === 'Timber');
  const doorProducts = products.filter(p => p.category === 'Doors');

  // SqFt State (Sheets)
  const [lengthSq, setLengthSq] = useState('');
  const [widthSq, setWidthSq] = useState('');
  const [selectedSheetId, setSelectedSheetId] = useState(sheetProducts[0]?.id || '');
  const [labourRateSq, setLabourRateSq] = useState('40'); // default 40 per sqft
  
  // CuFt State (Timber)
  const [lengthCu, setLengthCu] = useState('');
  const [widthCu, setWidthCu] = useState('');
  const [thicknessCu, setThicknessCu] = useState('');
  const [selectedTimberId, setSelectedTimberId] = useState(timberProducts[0]?.id || '');
  const [labourRateCu, setLabourRateCu] = useState('100'); // default 100 per cft

  // Doors State
  const [doorCount, setDoorCount] = useState('');
  const [selectedDoorId, setSelectedDoorId] = useState(doorProducts[0]?.id || '');
  const [labourRateDoor, setLabourRateDoor] = useState('500'); // default 500 per door

  // --- Calculations ---
  
  const sqFtResult = useMemo(() => {
    const l = parseFloat(lengthSq) || 0;
    const w = parseFloat(widthSq) || 0;
    const lRate = parseFloat(labourRateSq) || 0;
    
    const baseArea = l * w;
    
    // Automatic Waste Calculation:
    // 1. Add 5% for standard saw kerf (cutting waste)
    const areaWithCutWaste = baseArea * 1.05;
    
    // 2. We must buy full sheets (8x4 = 32 sqft)
    const sheets = Math.ceil(areaWithCutWaste / 32); 
    const purchasedArea = sheets * 32;
    
    // 3. The actual waste is the difference between what we must buy and the net area
    const autoWastePercentage = baseArea > 0 ? ((purchasedArea - baseArea) / baseArea) * 100 : 0;
    
    const product = sheetProducts.find(p => p.id === selectedSheetId);
    const unitPrice = product ? parsePrice(product.price) : 0;
    
    // Costs are based on the full sheets we have to buy (purchasedArea)
    const materialCost = purchasedArea * unitPrice;
    const labourCost = purchasedArea * lRate;
    
    return { 
      baseArea: baseArea.toFixed(2),
      purchasedArea: purchasedArea.toFixed(2), 
      sheets,
      autoWastePercentage: autoWastePercentage.toFixed(1),
      materialCost, 
      labourCost, 
      total: materialCost + labourCost,
      unitPrice
    };
  }, [lengthSq, widthSq, selectedSheetId, labourRateSq, sheetProducts]);

  const cuFtResult = useMemo(() => {
    const l = parseFloat(lengthCu) || 0;
    const w = parseFloat(widthCu) || 0;
    const t = parseFloat(thicknessCu) || 0;
    const lRate = parseFloat(labourRateCu) || 0;
    
    // (L(ft) * W(inch) * T(inch)) / 144 = CuFt
    const volume = (l * w * t) / 144;
    
    const product = timberProducts.find(p => p.id === selectedTimberId);
    const unitPrice = product ? parsePrice(product.price) : 0;
    
    const materialCost = volume * unitPrice;
    const labourCost = volume * lRate;
    
    return { 
      volume: volume.toFixed(2), 
      materialCost, 
      labourCost, 
      total: materialCost + labourCost,
      unitPrice
    };
  }, [lengthCu, widthCu, thicknessCu, selectedTimberId, labourRateCu, timberProducts]);

  const doorResult = useMemo(() => {
    const count = parseInt(doorCount) || 0;
    const lRate = parseFloat(labourRateDoor) || 0;
    
    const product = doorProducts.find(p => p.id === selectedDoorId);
    const unitPrice = product ? parsePrice(product.price) : 0;
    
    const materialCost = count * unitPrice;
    const labourCost = count * lRate;
    
    return {
      count,
      materialCost,
      labourCost,
      total: materialCost + labourCost,
      unitPrice
    };
  }, [doorCount, selectedDoorId, labourRateDoor, doorProducts]);


  return (
    <div className="bg-wood-50 dark:bg-timber-950 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <Calculator className="mx-auto text-accent mb-4" size={48} />
          <h1 className="text-4xl font-serif font-bold text-wood-950 dark:text-white mb-4">Advanced Project Estimator</h1>
          <p className="text-timber-600 dark:text-timber-400">Calculate material requirements, wood pricing, and carpenter labour costs instantly.</p>
        </div>

        <div className="bg-white dark:bg-timber-900 rounded-3xl shadow-xl overflow-hidden border border-wood-100 dark:border-timber-800">
          
          <div className="flex flex-col sm:flex-row border-b border-wood-100 dark:border-timber-800">
            <button 
              onClick={() => setActiveTab('sqft')}
              className={`flex-1 py-4 font-bold transition-colors ${activeTab === 'sqft' ? 'bg-wood-600 text-white' : 'text-timber-600 dark:text-timber-400 hover:bg-wood-50 dark:hover:bg-timber-800'}`}
            >
              Sheets / Plywood (Sq.Ft)
            </button>
            <button 
              onClick={() => setActiveTab('cuft')}
              className={`flex-1 py-4 font-bold transition-colors border-y sm:border-y-0 sm:border-x border-wood-100 dark:border-timber-800 ${activeTab === 'cuft' ? 'bg-wood-600 text-white' : 'text-timber-600 dark:text-timber-400 hover:bg-wood-50 dark:hover:bg-timber-800'}`}
            >
              Timber Logs (Cubic.Ft)
            </button>
            <button 
              onClick={() => setActiveTab('doors')}
              className={`flex-1 py-4 font-bold transition-colors ${activeTab === 'doors' ? 'bg-wood-600 text-white' : 'text-timber-600 dark:text-timber-400 hover:bg-wood-50 dark:hover:bg-timber-800'}`}
            >
              Doors & Panels
            </button>
          </div>

          <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* Input Section */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* === PLYWOOD / SHEETS === */}
              {activeTab === 'sqft' && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-xl font-bold text-wood-950 dark:text-white flex items-center gap-2"><Package size={20} className="text-accent"/> Material Selection</h3>
                  <select 
                    value={selectedSheetId} 
                    onChange={e => setSelectedSheetId(e.target.value)}
                    className="w-full p-4 rounded-xl border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-950 text-wood-900 dark:text-white focus:ring-2 focus:ring-accent outline-none font-medium"
                  >
                    {sheetProducts.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - {p.price}/{p.unit}</option>
                    ))}
                  </select>

                  <h3 className="text-xl font-bold text-wood-950 dark:text-white mt-8 pt-6 border-t border-wood-100 dark:border-timber-800">Dimensions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-timber-700 dark:text-timber-300 mb-2">Total Length (Feet)</label>
                      <input type="number" value={lengthSq} onChange={e => setLengthSq(e.target.value)} className="w-full p-3 rounded-xl border border-wood-200 dark:border-timber-700 bg-white dark:bg-timber-950 text-wood-900 dark:text-white focus:ring-2 focus:ring-accent outline-none" placeholder="e.g. 12" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-timber-700 dark:text-timber-300 mb-2">Total Width (Feet)</label>
                      <input type="number" value={widthSq} onChange={e => setWidthSq(e.target.value)} className="w-full p-3 rounded-xl border border-wood-200 dark:border-timber-700 bg-white dark:bg-timber-950 text-wood-900 dark:text-white focus:ring-2 focus:ring-accent outline-none" placeholder="e.g. 10" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-wood-950 dark:text-white mt-8 pt-6 border-t border-wood-100 dark:border-timber-800 flex items-center gap-2"><HardHat size={20} className="text-accent"/> Labour & Factors</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                    <div>
                      <label className="block text-sm font-medium text-timber-700 dark:text-timber-300 mb-2">Labour Rate (₹ per Sq.Ft)</label>
                      <input type="number" value={labourRateSq} onChange={e => setLabourRateSq(e.target.value)} className="w-full p-3 rounded-xl border border-wood-200 dark:border-timber-700 bg-white dark:bg-timber-950 text-wood-900 dark:text-white focus:ring-2 focus:ring-accent outline-none" />
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-timber-900/50 rounded-xl border border-yellow-200 dark:border-timber-800">
                      <p className="text-sm text-timber-600 dark:text-timber-400 mb-1">Auto-Estimated Waste</p>
                      <p className="text-2xl font-bold text-accent">{sqFtResult.autoWastePercentage}%</p>
                      <p className="text-xs text-timber-500 mt-1">Calculated via sheet rounding & cut allowance.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* === TIMBER / CUBIC FEET === */}
              {activeTab === 'cuft' && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-xl font-bold text-wood-950 dark:text-white flex items-center gap-2"><Package size={20} className="text-accent"/> Material Selection</h3>
                  <select 
                    value={selectedTimberId} 
                    onChange={e => setSelectedTimberId(e.target.value)}
                    className="w-full p-4 rounded-xl border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-950 text-wood-900 dark:text-white focus:ring-2 focus:ring-accent outline-none font-medium"
                  >
                    {timberProducts.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - {p.price}/{p.unit}</option>
                    ))}
                  </select>

                  <h3 className="text-xl font-bold text-wood-950 dark:text-white mt-8 pt-6 border-t border-wood-100 dark:border-timber-800">Dimensions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-timber-700 dark:text-timber-300 mb-2">Length (Feet)</label>
                      <input type="number" value={lengthCu} onChange={e => setLengthCu(e.target.value)} className="w-full p-3 rounded-xl border border-wood-200 dark:border-timber-700 bg-white dark:bg-timber-950 text-wood-900 dark:text-white focus:ring-2 focus:ring-accent outline-none" placeholder="e.g. 7" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-timber-700 dark:text-timber-300 mb-2">Width (Inches)</label>
                      <input type="number" value={widthCu} onChange={e => setWidthCu(e.target.value)} className="w-full p-3 rounded-xl border border-wood-200 dark:border-timber-700 bg-white dark:bg-timber-950 text-wood-900 dark:text-white focus:ring-2 focus:ring-accent outline-none" placeholder="e.g. 4" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-timber-700 dark:text-timber-300 mb-2">Thickness (Inches)</label>
                      <input type="number" value={thicknessCu} onChange={e => setThicknessCu(e.target.value)} className="w-full p-3 rounded-xl border border-wood-200 dark:border-timber-700 bg-white dark:bg-timber-950 text-wood-900 dark:text-white focus:ring-2 focus:ring-accent outline-none" placeholder="e.g. 3" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-wood-950 dark:text-white mt-8 pt-6 border-t border-wood-100 dark:border-timber-800 flex items-center gap-2"><HardHat size={20} className="text-accent"/> Labour & Factors</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-timber-700 dark:text-timber-300 mb-2">Labour Rate (₹ per cft)</label>
                      <input type="number" value={labourRateCu} onChange={e => setLabourRateCu(e.target.value)} className="w-full p-3 rounded-xl border border-wood-200 dark:border-timber-700 bg-white dark:bg-timber-950 text-wood-900 dark:text-white focus:ring-2 focus:ring-accent outline-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* === DOORS === */}
              {activeTab === 'doors' && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-xl font-bold text-wood-950 dark:text-white flex items-center gap-2"><Package size={20} className="text-accent"/> Material Selection</h3>
                  <select 
                    value={selectedDoorId} 
                    onChange={e => setSelectedDoorId(e.target.value)}
                    className="w-full p-4 rounded-xl border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-950 text-wood-900 dark:text-white focus:ring-2 focus:ring-accent outline-none font-medium"
                  >
                    {doorProducts.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - {p.price}/{p.unit}</option>
                    ))}
                  </select>

                  <h3 className="text-xl font-bold text-wood-950 dark:text-white mt-8 pt-6 border-t border-wood-100 dark:border-timber-800">Quantity</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-timber-700 dark:text-timber-300 mb-2">Number of Doors</label>
                      <input type="number" value={doorCount} onChange={e => setDoorCount(e.target.value)} className="w-full p-3 rounded-xl border border-wood-200 dark:border-timber-700 bg-white dark:bg-timber-950 text-wood-900 dark:text-white focus:ring-2 focus:ring-accent outline-none" placeholder="e.g. 5" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-wood-950 dark:text-white mt-8 pt-6 border-t border-wood-100 dark:border-timber-800 flex items-center gap-2"><HardHat size={20} className="text-accent"/> Labour & Factors</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-timber-700 dark:text-timber-300 mb-2">Installation Rate (₹ per door)</label>
                      <input type="number" value={labourRateDoor} onChange={e => setLabourRateDoor(e.target.value)} className="w-full p-3 rounded-xl border border-wood-200 dark:border-timber-700 bg-white dark:bg-timber-950 text-wood-900 dark:text-white focus:ring-2 focus:ring-accent outline-none" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Results Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-timber-950 rounded-2xl p-6 text-white sticky top-24 shadow-2xl">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-timber-800 text-accent">
                  <Receipt size={24} />
                  <h3 className="text-xl font-bold">Project Estimate</h3>
                </div>

                {activeTab === 'sqft' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-timber-400">Net Area</span>
                      <span className="font-mono font-bold">{sqFtResult.baseArea} sqft</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-timber-400">Total Billable Area</span>
                      <span className="font-mono font-bold text-accent">{sqFtResult.purchasedArea} sqft</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-timber-400">Sheets Required</span>
                      <span className="font-mono font-bold">{sqFtResult.sheets} (8x4ft)</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-4 border-t border-timber-800/50">
                      <span className="text-timber-400">Material Cost</span>
                      <span className="font-mono">₹{sqFtResult.materialCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-timber-400">Labour Cost</span>
                      <span className="font-mono">₹{sqFtResult.labourCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pt-6 mt-4 border-t border-timber-800">
                      <p className="text-xs text-timber-400 uppercase tracking-wider mb-1">Total Estimated Cost</p>
                      <p className="text-3xl font-black text-accent">₹{sqFtResult.total.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'cuft' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-timber-400">Total Volume</span>
                      <span className="font-mono font-bold">{cuFtResult.volume} cft</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-4 border-t border-timber-800/50">
                      <span className="text-timber-400">Material Cost</span>
                      <span className="font-mono">₹{cuFtResult.materialCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-timber-400">Labour Cost</span>
                      <span className="font-mono">₹{cuFtResult.labourCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pt-6 mt-4 border-t border-timber-800">
                      <p className="text-xs text-timber-400 uppercase tracking-wider mb-1">Total Estimated Cost</p>
                      <p className="text-3xl font-black text-accent">₹{cuFtResult.total.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'doors' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-timber-400">Total Doors</span>
                      <span className="font-mono font-bold">{doorResult.count}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-4 border-t border-timber-800/50">
                      <span className="text-timber-400">Material Cost</span>
                      <span className="font-mono">₹{doorResult.materialCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-timber-400">Installation Cost</span>
                      <span className="font-mono">₹{doorResult.labourCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pt-6 mt-4 border-t border-timber-800">
                      <p className="text-xs text-timber-400 uppercase tracking-wider mb-1">Total Estimated Cost</p>
                      <p className="text-3xl font-black text-accent">₹{doorResult.total.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => {
                    const estimate = {
                      type: activeTab,
                      total: activeTab === 'sqft' ? sqFtResult.total : activeTab === 'cuft' ? cuFtResult.total : doorResult.total,
                      materialCost: activeTab === 'sqft' ? sqFtResult.materialCost : activeTab === 'cuft' ? cuFtResult.materialCost : doorResult.materialCost,
                      labourCost: activeTab === 'sqft' ? sqFtResult.labourCost : activeTab === 'cuft' ? cuFtResult.labourCost : doorResult.labourCost,
                      savedAt: new Date().toISOString(),
                    };
                    const existing = JSON.parse(localStorage.getItem('jk-estimates') || '[]');
                    existing.push(estimate);
                    localStorage.setItem('jk-estimates', JSON.stringify(existing));
                    setSaved(true);
                    setTimeout(() => setSaved(false), 2500);
                  }}
                  className="w-full mt-8 bg-timber-800 hover:bg-timber-700 text-white font-bold py-3 rounded-xl transition-colors text-sm border border-timber-700 flex items-center justify-center gap-2"
                >
                  {saved ? <><CheckCircle size={16} /> Saved!</> : 'Save Estimate'}
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
