'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, MapPin, Phone, Mail, Save, Loader2, CheckCircle, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface ProfileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export default function ProfileEditorModal({ isOpen, onClose, userEmail }: ProfileEditorModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: { street: '', city: '', zipCode: '' }
  });

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.user.name || '',
          phone: data.user.phone || '',
          address: {
            street: data.address?.street || '',
            city: data.address?.city || '',
            zipCode: data.address?.zipCode || '',
          }
        });
      }
    } catch (error) {
      console.error('Error fetching profile', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const timer = window.setTimeout(() => {
      void fetchProfile();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchProfile, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => {
          onClose();
          router.refresh();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error occurred.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-timber-900 rounded-3xl shadow-2xl z-[61] overflow-hidden border border-wood-100 dark:border-timber-800"
          >
            <div className="flex justify-between items-center p-6 border-b border-wood-100 dark:border-timber-800 bg-wood-50 dark:bg-timber-950">
              <h2 className="text-xl font-bold font-serif text-wood-950 dark:text-white flex items-center gap-2">
                <User className="text-accent" size={24} /> My Profile
              </h2>
              <button onClick={onClose} className="text-timber-500 hover:text-wood-950 dark:hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="animate-spin text-accent" size={32} />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {message && (
                    <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
                      message.type === 'success' 
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800' 
                        : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800'
                    }`}>
                      {message.type === 'success' && <CheckCircle size={16} />}
                      {message.text}
                    </div>
                  )}

                  <div className="bg-wood-50 dark:bg-timber-950 p-4 rounded-xl border border-wood-100 dark:border-timber-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-wood-200 dark:bg-timber-800 rounded-full flex items-center justify-center">
                      <Mail className="text-timber-600 dark:text-timber-400" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-timber-500 font-bold uppercase tracking-wider">Account Email</p>
                      <p className="text-wood-950 dark:text-white font-medium">{userEmail}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-wood-950 dark:text-white border-b border-wood-100 dark:border-timber-800 pb-2">Personal Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-timber-700 dark:text-timber-300 mb-1">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-timber-400" size={18} />
                          <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full pl-10 p-3 rounded-xl border border-wood-200 dark:border-timber-700 bg-white dark:bg-timber-950 focus:ring-2 focus:ring-accent outline-none text-wood-950 dark:text-white" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-timber-700 dark:text-timber-300 mb-1">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-timber-400" size={18} />
                          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-10 p-3 rounded-xl border border-wood-200 dark:border-timber-700 bg-white dark:bg-timber-950 focus:ring-2 focus:ring-accent outline-none text-wood-950 dark:text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-wood-950 dark:text-white border-b border-wood-100 dark:border-timber-800 pb-2 flex items-center gap-2">
                      <MapPin size={18} className="text-timber-500" /> Default Delivery Address
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-timber-700 dark:text-timber-300 mb-1">Street Address</label>
                      <input type="text" name="address.street" value={formData.address.street} onChange={handleChange} className="w-full p-3 rounded-xl border border-wood-200 dark:border-timber-700 bg-white dark:bg-timber-950 focus:ring-2 focus:ring-accent outline-none text-wood-950 dark:text-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-timber-700 dark:text-timber-300 mb-1">City</label>
                        <input type="text" name="address.city" value={formData.address.city} onChange={handleChange} className="w-full p-3 rounded-xl border border-wood-200 dark:border-timber-700 bg-white dark:bg-timber-950 focus:ring-2 focus:ring-accent outline-none text-wood-950 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-timber-700 dark:text-timber-300 mb-1">PIN / Zip Code</label>
                        <input type="text" name="address.zipCode" value={formData.address.zipCode} onChange={handleChange} className="w-full p-3 rounded-xl border border-wood-200 dark:border-timber-700 bg-white dark:bg-timber-950 focus:ring-2 focus:ring-accent outline-none text-wood-950 dark:text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-3">
                    <button type="submit" disabled={isSaving} className="flex-1 bg-accent hover:bg-yellow-500 disabled:opacity-50 text-wood-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                      {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
                      {isSaving ? 'Saving...' : 'Save Profile'}
                    </button>
                    <button type="button" onClick={() => signOut()} className="px-6 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                      <LogOut size={18} /> Sign Out
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
