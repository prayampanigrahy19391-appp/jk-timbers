'use client';

import { TrendingUp, TrendingDown, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const marketData = [
  { id: 1, name: 'Premium Sagwan (Teak)', category: 'Timber', price: 4500, unit: 'cft', trend: 'up', change: '+2.5%', lastUpdated: '1 hour ago' },
  { id: 2, name: 'Gathwa Wood', category: 'Timber', price: 1800, unit: 'cft', trend: 'stable', change: '0.0%', lastUpdated: '3 hours ago' },
  { id: 3, name: 'Sal Wood (Hardwood)', category: 'Timber', price: 2800, unit: 'cft', trend: 'up', change: '+5.0%', lastUpdated: 'Just now' },
  { id: 4, name: 'Standard Hardwood', category: 'Timber', price: 1500, unit: 'cft', trend: 'down', change: '-1.2%', lastUpdated: '5 hours ago' },
  { id: 5, name: 'BWP Marine Ply 18mm', category: 'Plywood', price: 120, unit: 'sq.ft', trend: 'down', change: '-0.5%', lastUpdated: '2 hours ago' },
  { id: 6, name: 'Commercial Ply 12mm', category: 'Plywood', price: 60, unit: 'sq.ft', trend: 'stable', change: '0.0%', lastUpdated: '1 day ago' },
  { id: 7, name: 'MDF Board 18mm', category: 'Engineered', price: 45, unit: 'sq.ft', trend: 'up', change: '+1.5%', lastUpdated: '4 hours ago' },
  { id: 8, name: 'Decorative Walnut Veneer', category: 'Veneers', price: 85, unit: 'sq.ft', trend: 'down', change: '-1.0%', lastUpdated: '3 hours ago' },
  { id: 9, name: 'High-Gloss Laminates', category: 'Laminates', price: 1200, unit: 'sheet', trend: 'up', change: '+3.2%', lastUpdated: '2 days ago' },
  { id: 10, name: 'Solid Wood Flush Doors', category: 'Doors', price: 3500, unit: 'piece', trend: 'stable', change: '0.0%', lastUpdated: '5 hours ago' },
];

export default function MarketPriceDashboard() {
  return (
    <div className="bg-wood-50 dark:bg-timber-950 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-wood-200 dark:border-timber-800 pb-8 gap-6">
          <div>
            <h1 className="text-4xl font-serif font-bold text-wood-950 dark:text-white mb-3 flex items-center gap-4">
              Live Market Prices
              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">
                <span className="w-2 h-2 bg-white rounded-full"></span> LIVE
              </span>
            </h1>
            <p className="text-timber-600 dark:text-timber-400">Track daily wholesale pricing for timber, plywood, and laminates.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-timber-500 font-medium bg-white dark:bg-timber-900 px-4 py-2 rounded-full border border-wood-200 dark:border-timber-700 shadow-sm">
            <Clock size={16} /> Market Closes in 4h 30m
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-wood-800 to-wood-950 p-6 rounded-2xl shadow-lg text-white">
            <h3 className="text-wood-300 font-medium mb-1">Market Trend</h3>
            <div className="text-3xl font-bold mb-4 flex items-center gap-2">
              Bullish <TrendingUp className="text-green-400" size={28} />
            </div>
            <p className="text-sm text-wood-400">Timber demand is up 12% this week due to construction season.</p>
          </div>
          <div className="bg-white dark:bg-timber-900 p-6 rounded-2xl shadow-sm border border-wood-100 dark:border-timber-800">
            <h3 className="text-timber-500 font-medium mb-1">Highest Gainer</h3>
            <div className="text-3xl font-bold text-wood-950 dark:text-white mb-4">Sal Wood</div>
            <p className="text-sm font-bold text-green-500 flex items-center gap-1">+5.0% <span className="text-timber-500 font-normal">increase</span></p>
          </div>
          <div className="bg-white dark:bg-timber-900 p-6 rounded-2xl shadow-sm border border-wood-100 dark:border-timber-800">
            <h3 className="text-timber-500 font-medium mb-1">Most Traded</h3>
            <div className="text-3xl font-bold text-wood-950 dark:text-white mb-4">Marine Ply</div>
            <p className="text-sm font-bold text-blue-500 flex items-center gap-1">High Volume <span className="text-timber-500 font-normal">today</span></p>
          </div>
        </div>

        <div className="bg-white dark:bg-timber-900 rounded-2xl border border-wood-100 dark:border-timber-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-wood-50 dark:bg-timber-950 border-b border-wood-100 dark:border-timber-800">
                  <th className="p-4 font-bold text-wood-900 dark:text-timber-300">Product Name</th>
                  <th className="p-4 font-bold text-wood-900 dark:text-timber-300">Category</th>
                  <th className="p-4 font-bold text-wood-900 dark:text-timber-300 text-right">Wholesale Price</th>
                  <th className="p-4 font-bold text-wood-900 dark:text-timber-300 text-right">Trend</th>
                  <th className="p-4 font-bold text-wood-900 dark:text-timber-300 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {marketData.map((item, index) => (
                  <motion.tr 
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-wood-50 dark:border-timber-800/50 hover:bg-wood-50 dark:hover:bg-timber-800/50 transition-colors"
                  >
                    <td className="p-4 font-bold text-wood-950 dark:text-white">{item.name}</td>
                    <td className="p-4 text-timber-600 dark:text-timber-400">
                      <span className="bg-timber-100 dark:bg-timber-800 px-2 py-1 rounded text-xs font-medium">{item.category}</span>
                    </td>
                    <td className="p-4 text-right font-bold text-lg text-wood-800 dark:text-wood-300">
                      ₹{item.price} <span className="text-sm font-normal text-timber-500">/{item.unit}</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className={`inline-flex items-center gap-1 font-bold ${
                        item.trend === 'up' ? 'text-green-500' : item.trend === 'down' ? 'text-red-500' : 'text-timber-400'
                      }`}>
                        {item.trend === 'up' && <TrendingUp size={16} />}
                        {item.trend === 'down' && <TrendingDown size={16} />}
                        {item.trend === 'stable' && <span className="w-4 text-center">-</span>}
                        {item.change}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-accent hover:text-wood-600 font-bold text-sm inline-flex items-center gap-1 transition-colors">
                        Lock Price <ArrowRight size={14} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
