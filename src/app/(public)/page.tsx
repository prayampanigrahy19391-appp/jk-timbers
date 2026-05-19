import Link from 'next/link';
import { ArrowRight, ShieldCheck, Truck, Trophy, Users, Star, Phone } from 'lucide-react';
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
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero_bg.webp"
            alt="Premium Timber Background"
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1c140c]/90 via-[#1c140c]/70 to-transparent" />
        </div>

        <div className="relative z-10 px-4 sm:px-6 lg:px-12 max-w-7xl w-full mx-auto mt-20">
          <MotionDiv
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-start max-w-3xl"
          >
            <div className="bg-[#4a3622]/40 backdrop-blur-sm border border-[#7a5938]/30 px-4 py-1.5 rounded-full mb-6">
              <span className="text-[#dba24a] font-medium tracking-wide text-sm">
                Estd. 2000 — Trusted for 25+ Years
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-[1.1]">
              Premium Timber & <br />
              <span className="text-[#dba24a]">Wood Solutions</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl leading-relaxed">
              Your one-stop destination for Sagwan, Sal, Sheesham, Plywood, WPC Boards, and complete interior wood solutions in Odisha.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link href="/catalog" className="w-full sm:w-auto px-8 py-3.5 bg-[#dba24a] hover:bg-[#c28e3d] text-black rounded-lg font-bold text-base transition-all flex items-center justify-center gap-2">
                Explore Products <ArrowRight size={18} />
              </Link>
              <a href="tel:+918260761620" className="w-full sm:w-auto px-8 py-3.5 bg-[#3a2a1a]/60 hover:bg-[#4a3622]/80 border border-[#5a442e] text-white rounded-lg font-medium text-base transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
                <Phone size={18} /> Call: +91 8260761620
              </a>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mt-6 pt-6 border-t border-[#7a5938]/30">
              <HeroCartButton />
              <Link href="/track" className="w-full sm:w-auto px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
                <Truck size={16} /> Track Order
              </Link>
            </div>
          </MotionDiv>
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

      {/* Testimonials */}
      <section className="py-24 bg-white dark:bg-timber-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-wood-950 dark:text-wood-50 mb-4">
              Trusted by Professionals
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="bg-wood-50 dark:bg-timber-800 p-8 rounded-2xl border border-wood-100 dark:border-timber-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-1 text-accent mb-6">
                  <Star fill="currentColor" size={20} />
                  <Star fill="currentColor" size={20} />
                  <Star fill="currentColor" size={20} />
                  <Star fill="currentColor" size={20} />
                  <Star fill="currentColor" size={20} />
                </div>
                <p className="text-timber-700 dark:text-timber-300 italic mb-6">
                  &quot;The quality of Sagwan wood we received from JK Timbers was exceptional. Their delivery was on time, and the pricing was very competitive for bulk orders.&quot;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-wood-200 dark:bg-timber-600" />
                  <div>
                    <h4 className="font-bold text-wood-950 dark:text-wood-50">Rahul Sharma</h4>
                    <p className="text-sm text-timber-500 dark:text-timber-400">Architect, Design Studio</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
