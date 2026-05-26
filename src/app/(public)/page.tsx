import Link from 'next/link';
import { ArrowRight, ShieldCheck, Truck, Trophy, Users, Phone, Boxes, Eye, Calculator } from 'lucide-react';
import Image from 'next/image';
import { MotionDiv } from '@/components/ui/MotionDiv';
import { HeroCartButton } from '@/components/home/HeroCartButton';

const categories = [
  { name: 'Sagwan (Teak) Wood', image: '/textures/teak.webp', delay: 0.1 },
  { name: 'Premium Plywood', image: '/textures/marine_plywood.webp', delay: 0.2 },
  { name: 'Decorative Laminates', image: '/textures/laminate.webp', delay: 0.3 },
  { name: 'Interior Veneers', image: '/textures/walnut.webp', delay: 0.4 },
];

export default function Home() {

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] lg:min-h-screen flex items-center overflow-hidden py-24 lg:py-0">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero_bg.webp"
            alt="Premium Timber Background"
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1c140c]/95 via-[#1c140c]/80 to-[#1c140c]/40" />
        </div>

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto mt-20 lg:mt-24">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
            
            {/* Left Column: Hero Text */}
            <MotionDiv
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-start w-full lg:w-[48%] max-w-2xl text-left"
            >
              <div className="bg-[#4a3622]/40 backdrop-blur-sm border border-[#7a5938]/30 px-4 py-1.5 rounded-full mb-6">
                <span className="text-[#dba24a] font-semibold tracking-wide text-xs md:text-sm">
                  Estd. 2000 — Trusted for 25+ Years
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-black text-white mb-6 leading-[1.15]">
                Premium Timber & <br />
                <span className="text-[#dba24a]">Wood Solutions</span>
              </h1>

              <p className="text-base md:text-lg text-gray-300 mb-10 leading-relaxed max-w-xl">
                Your one-stop destination for Sagwan, Sal, Sheesham, Plywood, WPC Boards, and complete interior wood solutions in Odisha.
              </p>

              <div className="flex flex-wrap items-center gap-6 w-full pt-8 border-t border-[#7a5938]/30 text-sm">
                <a href="tel:+918018827170" className="flex items-center gap-2.5 text-gray-200 hover:text-[#dba24a] transition-all hover:scale-[1.02]">
                  <Phone size={18} className="text-[#dba24a]" /> 
                  <span className="font-semibold text-sm">Call Us: +91 80188 27170</span>
                </a>
                <span className="text-[#7a5938]/40 hidden sm:inline">|</span>
                <div className="flex items-center gap-4">
                  <HeroCartButton />
                </div>
              </div>
            </MotionDiv>

            {/* Right Column: Premium Action Cards */}
            <MotionDiv
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full lg:w-[48%] flex flex-col justify-center"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {/* Products Card */}
                <Link href="/catalog" className="flex items-center gap-4 p-5 bg-[#3a2a1a]/60 hover:bg-[#dba24a] hover:text-black border border-[#7a5938]/30 rounded-2xl transition-all duration-300 group cursor-pointer backdrop-blur-md hover:scale-[1.02] hover:shadow-lg hover:shadow-accent/10">
                  <div className="p-3 bg-[#dba24a]/10 group-hover:bg-black/10 rounded-xl transition-colors">
                    <Boxes size={24} className="text-[#dba24a] group-hover:text-black transition-colors" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-white group-hover:text-black transition-colors text-base">Products</span>
                    <span className="text-xs text-gray-400 group-hover:text-black/80 transition-colors mt-0.5">Explore our catalog</span>
                  </div>
                </Link>

                {/* 3D Viewer Card */}
                <Link href="/visualizer" className="flex items-center gap-4 p-5 bg-[#3a2a1a]/60 hover:bg-[#dba24a] hover:text-black border border-[#7a5938]/30 rounded-2xl transition-all duration-300 group cursor-pointer backdrop-blur-md hover:scale-[1.02] hover:shadow-lg hover:shadow-accent/10">
                  <div className="p-3 bg-[#dba24a]/10 group-hover:bg-black/10 rounded-xl transition-colors">
                    <Eye size={24} className="text-[#dba24a] group-hover:text-black transition-colors" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-white group-hover:text-black transition-colors text-base">3D Viewer</span>
                    <span className="text-xs text-gray-400 group-hover:text-black/80 transition-colors mt-0.5">Interactive 3D preview</span>
                  </div>
                </Link>

                {/* Calculator Card */}
                <Link href="/calculator" className="flex items-center gap-4 p-5 bg-[#3a2a1a]/60 hover:bg-[#dba24a] hover:text-black border border-[#7a5938]/30 rounded-2xl transition-all duration-300 group cursor-pointer backdrop-blur-md hover:scale-[1.02] hover:shadow-lg hover:shadow-accent/10">
                  <div className="p-3 bg-[#dba24a]/10 group-hover:bg-black/10 rounded-xl transition-colors">
                    <Calculator size={24} className="text-[#dba24a] group-hover:text-black transition-colors" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-white group-hover:text-black transition-colors text-base">Calculator</span>
                    <span className="text-xs text-gray-400 group-hover:text-black/80 transition-colors mt-0.5">Estimate material needs</span>
                  </div>
                </Link>

                {/* Bulk Orders Card */}
                <Link href="/contractors" className="flex items-center gap-4 p-5 bg-[#3a2a1a]/60 hover:bg-[#dba24a] hover:text-black border border-[#7a5938]/30 rounded-2xl transition-all duration-300 group cursor-pointer backdrop-blur-md hover:scale-[1.02] hover:shadow-lg hover:shadow-accent/10">
                  <div className="p-3 bg-[#dba24a]/10 group-hover:bg-black/10 rounded-xl transition-colors">
                    <Users size={24} className="text-[#dba24a] group-hover:text-black transition-colors" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-white group-hover:text-black transition-colors text-base">Bulk Orders</span>
                    <span className="text-xs text-gray-400 group-hover:text-black/80 transition-colors mt-0.5">Contractor pricing</span>
                  </div>
                </Link>

                {/* Track Order Card */}
                <Link href="/track" className="flex items-center gap-4 p-5 bg-[#3a2a1a]/60 hover:bg-[#dba24a] hover:text-black border border-[#7a5938]/30 rounded-2xl transition-all duration-300 group cursor-pointer backdrop-blur-md hover:scale-[1.02] hover:shadow-lg hover:shadow-accent/10">
                  <div className="p-3 bg-[#dba24a]/10 group-hover:bg-black/10 rounded-xl transition-colors">
                    <Truck size={24} className="text-[#dba24a] group-hover:text-black transition-colors" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-white group-hover:text-black transition-colors text-base">Track Order</span>
                    <span className="text-xs text-gray-400 group-hover:text-black/80 transition-colors mt-0.5">Check delivery status</span>
                  </div>
                </Link>

                {/* Contact Us Card */}
                <Link href="/contact" className="flex items-center gap-4 p-5 bg-[#3a2a1a]/60 hover:bg-[#dba24a] hover:text-black border border-[#7a5938]/30 rounded-2xl transition-all duration-300 group cursor-pointer backdrop-blur-md hover:scale-[1.02] hover:shadow-lg hover:shadow-accent/10">
                  <div className="p-3 bg-[#dba24a]/10 group-hover:bg-black/10 rounded-xl transition-colors">
                    <Phone size={24} className="text-[#dba24a] group-hover:text-black transition-colors" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-white group-hover:text-black transition-colors text-base">Contact Us</span>
                    <span className="text-xs text-gray-400 group-hover:text-black/80 transition-colors mt-0.5">Get in touch with us</span>
                  </div>
                </Link>
              </div>
            </MotionDiv>

          </div>
        </div>
      </section>

      {/* Trust Counters */}
      <section className="py-12 bg-timber-900 border-y border-timber-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <Trophy className="text-accent mb-4" size={40} />
              <h3 className="text-4xl font-bold text-white mb-2">24+</h3>
              <p className="text-timber-300">Years Experience</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Users className="text-accent mb-4" size={40} />
              <h3 className="text-4xl font-bold text-white mb-2">10k+</h3>
              <p className="text-timber-300">Happy Customers</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <ShieldCheck className="text-accent mb-4" size={40} />
              <h3 className="text-4xl font-bold text-white mb-2">100%</h3>
              <p className="text-timber-300">Quality Guarantee</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Truck className="text-accent mb-4" size={40} />
              <h3 className="text-4xl font-bold text-white mb-2">Fast</h3>
              <p className="text-timber-300">Secure Delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Categories */}
      <section className="py-24 bg-wood-50 dark:bg-timber-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-wood-950 dark:text-wood-50 mb-4">
              Premium Collections
            </h2>
            <p className="text-lg text-timber-600 dark:text-timber-300 max-w-2xl mx-auto">
              Discover our curated selection of high-grade materials, carefully sourced and processed to meet your exacting standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category) => (
              <Link href="/catalog" key={category.name}>
                <MotionDiv 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: category.delay, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-lg"
                >
                  <Image 
                    src={category.image} 
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-timber-950/90 via-timber-950/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <h3 className="text-2xl font-serif font-bold text-white mb-2">{category.name}</h3>
                    <div className="flex items-center text-accent group-hover:text-white transition-colors">
                      <span className="font-medium mr-2">View Products</span>
                      <ArrowRight size={16} className="transform group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </MotionDiv>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Virtual Showroom CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-wood-950 z-0" />
        <div
          className="absolute inset-0 z-0 opacity-30"
          style={{ backgroundImage: 'radial-gradient(circle at top left, rgba(255,255,255,0.08), transparent 35%)' }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            Experience Our Virtual Showroom
          </h2>
          <p className="text-xl text-wood-200 mb-10 max-w-3xl mx-auto">
            Take a 3D tour of our extensive inventory. Rotate, zoom, and explore wood grains in stunning detail before making a purchase.
          </p>
          <Link href="/showroom" className="inline-block px-10 py-5 bg-accent hover:bg-yellow-500 text-wood-950 rounded-full font-bold text-xl transition-all shadow-lg hover:shadow-accent/50">
            Enter Virtual Showroom
          </Link>
        </div>
      </section>


    </div>
  );
}
