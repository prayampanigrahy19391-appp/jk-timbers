'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setResult({ success: data.success, message: data.message || data.error });
      if (data.success) setFormData({ firstName: '', lastName: '', phone: '', message: '' });
    } catch {
      setResult({ success: false, message: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-wood-50 dark:bg-timber-950 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-wood-950 dark:text-white mb-6">
            Get In Touch
          </h1>
          <p className="text-xl text-timber-600 dark:text-timber-400">
            Have questions about our timber quality, pricing, or bulk orders? We&apos;re here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Contact Form */}
          <div className="bg-white dark:bg-timber-900 p-8 md:p-12 rounded-3xl border border-wood-100 dark:border-timber-800 shadow-xl">
            <h3 className="text-2xl font-bold text-wood-950 dark:text-white mb-6">Send us a Message</h3>
            
            {result && (
              <div className={`mb-6 p-4 rounded-xl border text-sm font-medium ${
                result.success
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
              }`}>
                {result.success && <CheckCircle className="inline mr-2" size={16} />}
                {result.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-timber-700 dark:text-timber-300 mb-2">First Name *</label>
                  <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="w-full p-3 rounded-xl border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-950 focus:ring-2 focus:ring-accent outline-none text-wood-950 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-timber-700 dark:text-timber-300 mb-2">Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full p-3 rounded-xl border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-950 focus:ring-2 focus:ring-accent outline-none text-wood-950 dark:text-white" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-timber-700 dark:text-timber-300 mb-2">Phone Number *</label>
                <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full p-3 rounded-xl border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-950 focus:ring-2 focus:ring-accent outline-none text-wood-950 dark:text-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-timber-700 dark:text-timber-300 mb-2">Message</label>
                <textarea rows={4} name="message" value={formData.message} onChange={handleChange} className="w-full p-3 rounded-xl border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-950 focus:ring-2 focus:ring-accent outline-none resize-none text-wood-950 dark:text-white" placeholder="Tell us about your requirements..."></textarea>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-wood-950 hover:bg-wood-800 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
                <Send size={18} /> {isSubmitting ? 'Sending...' : 'Request Callback'}
              </button>
            </form>
          </div>

          {/* Contact Details & Map */}
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-wood-950 text-white p-8 rounded-2xl flex flex-col items-start gap-4 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-wood-800 rounded-full flex items-center justify-center">
                  <Phone className="text-accent" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Call Us</h4>
                  <p className="text-wood-400 text-sm mb-2">Mon-Sat, 9am to 8pm</p>
                  <a href="tel:+918260761620" className="text-xl font-bold hover:text-accent transition-colors">+91 8260761620</a>
                </div>
              </div>

              <div className="bg-white dark:bg-timber-900 p-8 rounded-2xl border border-wood-100 dark:border-timber-800 flex flex-col items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-wood-100 dark:bg-timber-800 rounded-full flex items-center justify-center">
                  <Mail className="text-wood-600 dark:text-accent" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-wood-950 dark:text-white text-lg mb-1">Email Us</h4>
                  <p className="text-timber-500 text-sm mb-2">We reply within 24 hours</p>
                  <a href="mailto:info@jktimbers.com" className="text-lg font-bold text-wood-800 dark:text-wood-300 hover:text-accent transition-colors">info@jktimbers.com</a>
                </div>
              </div>
            </div>

            {/* Business Details & Map */}
            <div className="bg-white dark:bg-timber-900 rounded-2xl border border-wood-100 dark:border-timber-800 overflow-hidden shadow-sm">
              <div className="h-64 relative w-full">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15112.569389278912!2d84.7936162!3d19.3175401!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a3d5ea7bbbd43a3%3A0x6b4bb90b6ebfb520!2sNew%20Bus%20Stand%2C%20Berhampur%2C%20Odisha!5e0!3m2!1sen!2sin!4v1715783300000!5m2!1sen!2sin" 
                  className="w-full h-full border-0" 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              <div className="p-8">
                <h3 className="font-bold text-wood-950 dark:text-white text-xl mb-4">Visit Our Showroom</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <MapPin className="text-wood-500 shrink-0 mt-1" size={20} />
                    <span className="text-timber-600 dark:text-timber-300"><strong>JK Timbers Main Branch</strong><br/>Near New Bus Stand<br/>Berhampur, Odisha, India 760001</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="text-wood-500 shrink-0 mt-1" size={20} />
                    <span className="text-timber-600 dark:text-timber-300"><strong>Working Hours</strong><br/>Monday - Saturday: 9:00 AM - 8:00 PM<br/>Sunday: Closed</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
