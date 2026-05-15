'use client';

import Image from 'next/image';
import { ShieldCheck, Trophy, Users, CheckCircle, Leaf, Globe2, Hammer } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <div className="bg-wood-50 dark:bg-timber-950 min-h-screen pt-20 pb-24 overflow-hidden">
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32 text-center relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-6xl md:text-8xl font-serif font-black text-wood-950 dark:text-white mb-6 drop-shadow-[0_10px_10px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_10px_10px_rgba(255,255,255,0.05)]"
          >
            Our <span className="text-accent drop-shadow-[0_5px_5px_rgba(212,175,55,0.3)]">Heritage</span>
          </motion.h1>
          <p className="text-xl md:text-2xl text-timber-600 dark:text-timber-400 max-w-3xl mx-auto leading-relaxed font-medium">
            Rooted in tradition, built on trust. JK Timber has been the cornerstone of quality woodworking in Odisha for over two decades.
          </p>
        </motion.div>
      </section>

      {/* Story Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-timber-800"
          >
            <Image 
              src="https://images.unsplash.com/photo-1610448721566-47369c768e70?q=80&w=1024" 
              alt="Timber Crafting" 
              fill 
              className="object-cover"
            />
            <div className="absolute inset-0 bg-timber-950/20 hover:bg-transparent transition-colors duration-700"></div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <span className="text-accent font-bold tracking-widest uppercase mb-4 block">Established 2000</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-wood-950 dark:text-white mb-6 leading-tight">
              A Legacy of Quality Craftsmanship
            </h2>
            <div className="space-y-6 text-lg text-timber-600 dark:text-timber-300">
              <p>
                Founded at the turn of the millennium, JK Timber began with a simple mission: to provide the highest quality Sagwan (Teak) wood to the local artisans and builders of Berhampur.
              </p>
              <p>
                Over the years, we have grown from a small local supplier to one of Odisha's premier timber and plywood distributors. We now source the finest materials globally, while maintaining our deep roots and commitment to local craftsmanship.
              </p>
              <p className="p-6 bg-white dark:bg-timber-900 rounded-2xl border-l-4 border-accent shadow-sm italic font-medium">
                Our philosophy is simple: <strong className="text-wood-950 dark:text-white">"Strength of Wood, Trust of Generations."</strong> We believe that every piece of wood we sell is the foundation for someone's dream home, office, or piece of art.
              </p>
            </div>
            
            <div className="mt-10 grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-wood-100 dark:bg-timber-800 rounded-full flex items-center justify-center text-accent">
                  <CheckCircle size={20} />
                </div>
                <span className="font-bold text-wood-900 dark:text-wood-100">Premium Quality</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-wood-100 dark:bg-timber-800 rounded-full flex items-center justify-center text-accent">
                  <Leaf size={20} />
                </div>
                <span className="font-bold text-wood-900 dark:text-wood-100">Ethically Sourced</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-wood-100 dark:bg-timber-800 rounded-full flex items-center justify-center text-accent">
                  <Hammer size={20} />
                </div>
                <span className="font-bold text-wood-900 dark:text-wood-100">Expert Guidance</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-wood-100 dark:bg-timber-800 rounded-full flex items-center justify-center text-accent">
                  <Globe2 size={20} />
                </div>
                <span className="font-bold text-wood-900 dark:text-wood-100">Global Standards</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-wood-950 py-24 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/textures/teak.png')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}>
              <Trophy className="mx-auto text-accent mb-6" size={48} />
              <h3 className="text-5xl font-black mb-2 font-serif text-accent drop-shadow-md">24+</h3>
              <p className="text-wood-300 font-medium uppercase tracking-widest text-sm">Years of Excellence</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} viewport={{ once: true }}>
              <Users className="mx-auto text-accent mb-6" size={48} />
              <h3 className="text-5xl font-black mb-2 font-serif text-accent drop-shadow-md">10k+</h3>
              <p className="text-wood-300 font-medium uppercase tracking-widest text-sm">Happy Clients</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} viewport={{ once: true }}>
              <ShieldCheck className="mx-auto text-accent mb-6" size={48} />
              <h3 className="text-5xl font-black mb-2 font-serif text-accent drop-shadow-md">500+</h3>
              <p className="text-wood-300 font-medium uppercase tracking-widest text-sm">Partner Contractors</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} viewport={{ once: true }}>
              <Image src="/logo.jpg" alt="JK Timber" width={48} height={48} className="mx-auto mb-6 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.5)] bg-white" />
              <h3 className="text-5xl font-black mb-2 font-serif text-accent drop-shadow-md">1</h3>
              <p className="text-wood-300 font-medium uppercase tracking-widest text-sm">Trusted Name</p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
