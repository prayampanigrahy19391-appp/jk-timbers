import Link from 'next/link';
import { MapPin, Phone, Mail, Globe } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-timber-950 text-wood-100 pt-16 pb-8 border-t-4 border-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex flex-col items-start gap-4">
              <div className="relative w-32 h-32 bg-white rounded-xl p-2 shadow-lg">
                <Image src="/logo.jpg" alt="JK Timber Logo" fill className="object-contain" />
              </div>
              <h3 className="font-serif text-3xl font-bold text-accent tracking-tight">JK TIMBER</h3>
            </div>
            <p className="text-timber-300 leading-relaxed max-w-xs font-medium">
              STRENGTH OF WOOD, TRUST OF GENERATIONS.
            </p>
            <p className="text-wood-400 text-sm">Estd. 2000 • Made in Odisha, Made for the world.</p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-timber-800 flex items-center justify-center text-wood-300 hover:bg-wood-600 hover:text-white transition-all">
                <Globe size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-timber-800 flex items-center justify-center text-wood-300 hover:bg-wood-600 hover:text-white transition-all">
                <Globe size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-timber-800 flex items-center justify-center text-wood-300 hover:bg-wood-600 hover:text-white transition-all">
                <Globe size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-xl font-semibold mb-6 text-white relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-wood-600 rounded-full"></span>
            </h4>
            <ul className="space-y-3">
              <li><Link href="/catalog" className="text-timber-300 hover:text-accent transition-colors flex items-center before:content-['›'] before:mr-2 before:text-wood-600">Premium Plywood</Link></li>
              <li><Link href="/catalog" className="text-timber-300 hover:text-accent transition-colors flex items-center before:content-['›'] before:mr-2 before:text-wood-600">Sagwan (Teak) Wood</Link></li>
              <li><Link href="/catalog" className="text-timber-300 hover:text-accent transition-colors flex items-center before:content-['›'] before:mr-2 before:text-wood-600">Decorative Laminates</Link></li>
              <li><Link href="/visualizer" className="text-timber-300 hover:text-accent transition-colors flex items-center before:content-['›'] before:mr-2 before:text-wood-600">3D Wood Visualizer</Link></li>
              <li><Link href="/market" className="text-timber-300 hover:text-accent transition-colors flex items-center before:content-['›'] before:mr-2 before:text-wood-600">Live Market Prices</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-serif text-xl font-semibold mb-6 text-white relative inline-block">
              Our Services
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-wood-600 rounded-full"></span>
            </h4>
            <ul className="space-y-3">
              <li><Link href="/calculator" className="text-timber-300 hover:text-accent transition-colors flex items-center before:content-['›'] before:mr-2 before:text-wood-600">Smart Wood Calculator</Link></li>
              <li><Link href="/contractors" className="text-timber-300 hover:text-accent transition-colors flex items-center before:content-['›'] before:mr-2 before:text-wood-600">Contractor Portal</Link></li>
              <li><Link href="/delivery" className="text-timber-300 hover:text-accent transition-colors flex items-center before:content-['›'] before:mr-2 before:text-wood-600">Delivery Tracking</Link></li>
              <li><Link href="/showroom" className="text-timber-300 hover:text-accent transition-colors flex items-center before:content-['›'] before:mr-2 before:text-wood-600">Virtual Showroom</Link></li>
              <li><Link href="/contact" className="text-timber-300 hover:text-accent transition-colors flex items-center before:content-['›'] before:mr-2 before:text-wood-600">Request Callback</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-xl font-semibold mb-6 text-white relative inline-block">
              Contact Us
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-wood-600 rounded-full"></span>
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="text-wood-500 shrink-0 mt-1" size={20} />
                <span className="text-timber-300">Anusiya Vihar, 5th Lane<br />Berhampur, Odisha, India</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-wood-500 shrink-0" size={20} />
                <a href="tel:+919876543210" className="text-timber-300 hover:text-accent transition-colors">+91 98765 43210</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-wood-500 shrink-0" size={20} />
                <a href="mailto:info@jktimbers.com" className="text-timber-300 hover:text-accent transition-colors">info@jktimbers.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-timber-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-timber-400 text-sm">
            &copy; {new Date().getFullYear()} JK Timbers. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-timber-400">
            <Link href="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-accent transition-colors">Terms of Service</Link>
            <Link href="/sitemap" className="hover:text-accent transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
