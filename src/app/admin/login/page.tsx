'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, User, ShieldCheck, ArrowRight, Loader2, KeyRound, Smartphone } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Floating Particles Component
const Particles = () => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-accent/40 blur-[1px]"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            y: [null, Math.random() * -500],
            x: [null, Math.random() * 200 - 100],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
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
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate real-time validation & API Call
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (loginMethod === 'password') {
      if (identifier === 'admin' && password === 'admin123') {
        sessionStorage.setItem('jk-admin-auth', 'true');
        router.push('/admin');
      } else {
        triggerError('Invalid credentials or unauthorized device detected.');
      }
    } else {
      if (otp === '123456') {
        sessionStorage.setItem('jk-admin-auth', 'true');
        router.push('/admin');
      } else {
        triggerError('Invalid OTP code.');
      }
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
      {/* Background Image & Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-overlay"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1622322300063-4c9b33a57757?q=80&w=2070&auto=format&fit=crop")' }}
      />
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
            
            {/* Input Group */}
            <AnimatePresence mode="wait">
              {loginMethod === 'password' ? (
                <motion.div
                  key="password-mode"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-5"
                >
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
                </motion.div>
              ) : (
                <motion.div
                  key="otp-mode"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="relative group">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-wood-400 group-focus-within:text-accent transition-colors" size={20} />
                    <input 
                      type="text" 
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="WhatsApp Number" 
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-12 py-4 text-white placeholder-wood-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                    />
                  </div>
                  <div className="relative group">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-wood-400 group-focus-within:text-accent transition-colors" size={20} />
                    <input 
                      type="text" 
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP" 
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-12 py-4 text-white placeholder-wood-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all tracking-widest font-mono"
                      maxLength={6}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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

            {/* Actions */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-wood-300 hover:text-white transition-colors">
                <input type="checkbox" className="accent-accent w-4 h-4 rounded" />
                Remember this device
              </label>
              <button type="button" className="text-accent hover:text-white transition-colors">
                Forgot Access?
              </button>
            </div>

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

          {/* Toggle Login Method */}
          <div className="mt-8 text-center border-t border-white/10 pt-6 relative z-10">
            <button 
              onClick={() => setLoginMethod(prev => prev === 'password' ? 'otp' : 'password')}
              className="text-wood-400 hover:text-accent transition-colors text-sm font-medium"
            >
              {loginMethod === 'password' ? 'Use WhatsApp OTP Instead' : 'Use Master Password Instead'}
            </button>
          </div>
          
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
