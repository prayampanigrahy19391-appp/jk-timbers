import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';

import { products as woodTypes } from '@/data/products';

export default function ShowroomPage() {
  return (
    <div className="bg-wood-50 dark:bg-timber-950 min-h-screen pt-12 pb-24">
      {/* Header */}
      <section className="text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <span className="text-accent font-bold tracking-widest uppercase mb-4 block">Virtual Experience</span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-wood-950 dark:text-white mb-6">
          The JK Timber Showroom
        </h1>
        <p className="text-xl text-timber-600 dark:text-timber-400">
          Explore our premium collection of timber and engineered wood. Discover the unique specialties and grain patterns that make every piece of wood a work of art.
        </p>
      </section>

      {/* Wood Types Display */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-24">
          {woodTypes.map((wood, index) => (
            <div key={wood.id} className={`flex flex-col lg:flex-row gap-12 items-center ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
              
              {/* Image Side */}
              <div className="w-full lg:w-1/2">
                <div className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-timber-900">
                  <Image 
                    src={wood.image} 
                    alt={wood.name} 
                    fill 
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 hover:scale-110"
                  />
                </div>
              </div>

              {/* Content Side */}
              <div className="w-full lg:w-1/2">
                <div className="flex items-center gap-2 text-accent mb-4">
                  <Star size={20} fill="currentColor" />
                  <span className="font-bold tracking-widest uppercase text-sm">{wood.badge || wood.category}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-wood-950 dark:text-white mb-6">
                  {wood.name}
                </h2>
                <p className="text-lg text-timber-600 dark:text-timber-300 mb-8 leading-relaxed">
                  {wood.description}
                </p>
                
                <ul className="space-y-4 mb-10">
                  {wood.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-wood-800 dark:text-wood-200 font-medium">
                      <div className="w-2 h-2 rounded-full bg-accent"></div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link href="/catalog" className="inline-flex items-center gap-2 px-8 py-4 bg-wood-950 hover:bg-wood-800 text-white rounded-full font-bold transition-colors">
                  View Pricing <ArrowRight size={20} />
                </Link>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* Interactive CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32">
        <div className="bg-wood-950 rounded-3xl p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/textures/walnut.webp')] opacity-20 mix-blend-overlay"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">Want to see it in your room?</h2>
            <p className="text-xl text-wood-300 mb-10 max-w-2xl mx-auto">
              Use our interactive 3D tools to visualize these wood grains on your own furniture or room settings before making a purchase.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/visualizer" className="px-8 py-4 bg-accent hover:bg-yellow-500 text-wood-950 rounded-full font-bold transition-all shadow-lg hover:shadow-accent/50">
                Open 3D Visualizer
              </Link>
              <Link href="/room-preview" className="px-8 py-4 bg-wood-800 hover:bg-wood-700 text-white rounded-full font-bold transition-colors">
                Try Room Preview
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
