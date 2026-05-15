'use client';

import { useState } from 'react';
import { Truck, Search, CheckCircle, Clock, MapPin, Package } from 'lucide-react';

const mockTracking = {
  id: 'TRK-982374',
  status: 'In Transit',
  eta: 'Today, 4:30 PM',
  items: '12x Marine Ply 18mm, 5x Teak Planks',
  steps: [
    { title: 'Order Confirmed', time: '10 May, 10:00 AM', completed: true },
    { title: 'Material Processed', time: '11 May, 02:30 PM', completed: true },
    { title: 'Dispatched from Warehouse', time: '12 May, 08:00 AM', completed: true },
    { title: 'Out for Delivery', time: '12 May, 01:15 PM', completed: true },
    { title: 'Delivered', time: 'Pending', completed: false },
  ]
};

export default function DeliveryTracking() {
  const [trackingId, setTrackingId] = useState('');
  const [isTracking, setIsTracking] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId.trim()) {
      setIsTracking(true);
    }
  };

  return (
    <div className="bg-wood-50 dark:bg-timber-950 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <Truck className="mx-auto text-accent mb-6" size={48} />
          <h1 className="text-4xl font-serif font-bold text-wood-950 dark:text-white mb-4">
            Track Your Delivery
          </h1>
          <p className="text-timber-600 dark:text-timber-400">
            Enter your order tracking ID to view live dispatch and delivery updates.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white dark:bg-timber-900 p-6 md:p-8 rounded-3xl border border-wood-100 dark:border-timber-800 shadow-lg mb-12">
          <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-timber-400" size={20} />
              <input 
                type="text" 
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="e.g. TRK-123456" 
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-950 text-wood-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent font-medium text-lg uppercase"
              />
            </div>
            <button type="submit" className="bg-wood-950 hover:bg-wood-800 text-white font-bold py-4 px-8 rounded-xl transition-colors md:w-auto w-full">
              Track Order
            </button>
          </form>
        </div>

        {/* Tracking Results */}
        {isTracking && (
          <div className="bg-white dark:bg-timber-900 rounded-3xl border border-wood-100 dark:border-timber-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="p-8 border-b border-wood-100 dark:border-timber-800 bg-wood-950 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <p className="text-wood-400 text-sm mb-1">Tracking ID: {mockTracking.id}</p>
                <h2 className="text-2xl font-bold text-accent">{mockTracking.status}</h2>
              </div>
              <div className="flex items-center gap-4 bg-wood-900 px-6 py-4 rounded-xl border border-wood-800">
                <Clock className="text-accent" size={24} />
                <div>
                  <p className="text-xs text-wood-400">Estimated Arrival</p>
                  <p className="font-bold">{mockTracking.eta}</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="flex items-start gap-4 mb-10 pb-8 border-b border-wood-100 dark:border-timber-800">
                <Package className="text-timber-400 mt-1" size={24} />
                <div>
                  <h4 className="font-bold text-wood-950 dark:text-white mb-1">Items in this shipment:</h4>
                  <p className="text-timber-600 dark:text-timber-400">{mockTracking.items}</p>
                </div>
              </div>

              <div className="relative pl-8 space-y-8 before:absolute before:inset-0 before:ml-10 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-wood-200 dark:before:via-timber-700 before:to-transparent">
                {mockTracking.steps.map((step, index) => (
                  <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    
                    {/* Icon */}
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-timber-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2 -translate-x-1/2 z-10 ${
                      step.completed ? 'bg-accent text-wood-950' : 'bg-wood-100 dark:bg-timber-800 text-timber-400'
                    }`}>
                      {step.completed ? <CheckCircle size={16} /> : <MapPin size={16} />}
                    </div>
                    
                    {/* Content */}
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-wood-100 dark:border-timber-800 bg-wood-50 dark:bg-timber-950 shadow-sm ml-8 md:ml-0 md:group-odd:text-right">
                      <h4 className={`font-bold ${step.completed ? 'text-wood-950 dark:text-white' : 'text-timber-500'}`}>
                        {step.title}
                      </h4>
                      <p className="text-sm text-timber-500 mt-1">{step.time}</p>
                    </div>

                  </div>
                ))}
              </div>
            </div>
            
          </div>
        )}

      </div>
    </div>
  );
}
