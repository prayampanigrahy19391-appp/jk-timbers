'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, User, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

// Floating Particles Component
const Particles = () => {
  const [particles, setParticles] = useState<{ x: number, y: number, targetX: number, targetY: number, scale: number, dur: number }[]>([]);
  
  useEffect(() => {
    const newParticles = [...Array(20)].map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      targetX: Math.random() * 200 - 100,
      targetY: Math.random() * -500,
      scale: Math.random() * 0.5 + 0.5,
      dur: Math.random() * 10 + 10,
    }));
    // eslint-disable-next-line
    setParticles(newParticles);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-accent/40 blur-[1px]"
          initial={{
            x: p.x,
            y: p.y,
            scale: p.scale,
          }}
          animate={{
            y: [null, p.targetY],
            x: [null, p.targetX],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export default function AdminLogin() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        identifier,
        password,
      });

      if (result?.error) {
        triggerError('Invalid credentials.');
      } else {
        router.push('/admin');
      }
    } catch {
      triggerError('Network error. Please try again.');
    }
  };

  const triggerError = (msg: string) => {
    setError(msg);
    setIsLoading(false);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-wood-950 overflow-hidden">
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-wood-950/90 via-wood-900/80 to-black/90" />
      
      {/* Cinematic Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-accent/20 blur-[150px] pointer-events-none rounded-full" />
      
      <Particles />

      {/* Login Card */}
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <motion.div 
          animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="backdrop-blur-2xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative"
        >
          {/* Top Section */}
          <div className="text-center mb-8 relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-yellow-600 mb-4 shadow-lg shadow-accent/20">
              <ShieldCheck size={32} className="text-wood-950" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-wide">JK Timbers</h1>
            <p className="text-sm font-medium text-accent tracking-widest uppercase mt-1">Owner & Admin Portal</p>
            <p className="text-xs text-wood-300 mt-2">Secure Timber Management System</p>
          </div>

          <form onSubmit={handleLogin} className="relative z-10 space-y-5">
            <div className="space-y-5">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-wood-400 group-focus-within:text-accent transition-colors" size={20} />
                <input 
                  type="text" 
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Admin ID or Email" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-12 py-4 text-white placeholder-wood-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                />
              </div>
              
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-wood-400 group-focus-within:text-accent transition-colors" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Master Password" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-12 py-4 text-white placeholder-wood-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-wood-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="relative w-full bg-gradient-to-r from-accent to-yellow-600 text-wood-950 font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] transition-all overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform ease-out duration-300" />
              <span className="relative flex items-center justify-center gap-2 text-lg">
                {isLoading ? (
                  <>Verifying Identity <Loader2 size={20} className="animate-spin" /></>
                ) : (
                  <>Secure Login <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </span>
            </button>
          </form>
          
          {/* Decorative Elements */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/20 rounded-full blur-[50px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-wood-500/20 rounded-full blur-[50px] pointer-events-none" />
        </motion.div>
        
        {/* Security Meta */}
        <div className="mt-8 text-center text-wood-500 text-xs flex flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Lock size={12} /> End-to-End Encrypted</span>
            <span className="flex items-center gap-1"><ShieldCheck size={12} /> IP Logged</span>
          </div>
          <p>Unauthorized access is strictly prohibited and monitored.</p>
        </div>
      </motion.div>
    </div>
  );
}
