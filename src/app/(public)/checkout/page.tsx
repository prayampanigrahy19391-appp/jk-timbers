'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/components/cart/CartContext';
import { ShieldCheck, Truck, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { parsePrice } from '@/utils/price';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function CheckoutPage() {
  const { items, cartTotal, clearCart, cartToken } = useCart();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [paymentProvider, setPaymentProvider] = useState('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/checkout');
    }
  }, [status, router]);

  // Pre-fill profile details from API
  useEffect(() => {
    if (status !== 'authenticated') return;

    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          setFormData({
            name: data.user.name || '',
            email: data.user.email || '',
            phone: data.user.phone || '',
            address: data.address?.street || '',
            city: data.address?.city || '',
            zipCode: data.address?.zipCode || '',
          });
        }
      } catch (error) {
        console.error('Error fetching user profile for checkout:', error);
      }
    };

    fetchProfile();
  }, [status]);

  const providerOptions = [
    { value: 'UPI', label: 'Generic UPI' },
    { value: 'PHONEPE', label: 'PhonePe' },
    { value: 'GOOGLE_PAY', label: 'Google Pay' },
    { value: 'PAYTM', label: 'Paytm UPI' },
    { value: 'BHIM', label: 'BHIM UPI' },
    { value: 'RAZORPAY', label: 'Razorpay (UPI & cards)' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.hasOwnProperty('Razorpay')) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    setIsSubmitting(true);
    setSubmitError('');

    // Validations
    if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      setSubmitError('Name can only contain letters and spaces.');
      setIsSubmitting(false);
      return;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      setSubmitError('Phone number must be exactly 10 digits.');
      setIsSubmitting(false);
      return;
    }
    if (!/^[a-zA-Z\s]+$/.test(formData.city)) {
      setSubmitError('City can only contain letters and spaces.');
      setIsSubmitting(false);
      return;
    }
    if (!/^\d{6}$/.test(formData.zipCode)) {
      setSubmitError('PIN/Zip Code must be exactly 6 digits.');
      setIsSubmitting(false);
      return;
    }
    
    try {
      let activeCartToken = cartToken;

      if (!activeCartToken) {
        const cartResponse = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map((item) => ({ sku: item.id, quantity: item.quantity })),
          }),
        });

        if (!cartResponse.ok) {
          throw new Error('Unable to validate your cart. Please refresh and try again.');
        }

        const cartData = await cartResponse.json();
        activeCartToken = cartData?.cart?.token;
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartToken: activeCartToken,
          customer: formData,
          paymentMethod,
          paymentProvider: paymentMethod === 'COD' ? undefined : paymentProvider,
          total: cartTotal
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const paymentData = data.data?.payment;
        if (paymentMethod !== 'COD' && paymentProvider === 'RAZORPAY' && paymentData?.razorpayOrderId) {
          const scriptLoaded = await loadRazorpayScript();
          if (!scriptLoaded) {
            throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
          }

          const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_51MzS24e8g1',
            amount: paymentData.amount,
            currency: paymentData.currency || 'INR',
            name: 'JK Timbers',
            description: `Payment for Order ${data.orderNumber}`,
            order_id: paymentData.razorpayOrderId,
            prefill: {
              name: formData.name,
              email: formData.email,
              contact: formData.phone,
            },
            theme: {
              color: '#6b4c2a',
            },
            handler: async function (res: any) {
              try {
                setIsSubmitting(true);
                const verifyRes = await fetch('/api/payments/verify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    razorpay_order_id: res.razorpay_order_id,
                    razorpay_payment_id: res.razorpay_payment_id,
                    razorpay_signature: res.razorpay_signature,
                    orderId: data.orderId,
                  }),
                });
                const verifyData = await verifyRes.json();
                if (verifyData.success) {
                  clearCart();
                  router.push(`/checkout/success?orderId=${encodeURIComponent(data.orderNumber ?? data.orderId)}`);
                } else {
                  setSubmitError(verifyData.error || 'Payment signature verification failed.');
                }
              } catch (err) {
                setSubmitError('Verification request failed. Please contact support.');
              } finally {
                setIsSubmitting(false);
              }
            },
            modal: {
              ondismiss: function () {
                setIsSubmitting(false);
                setSubmitError('Payment process was cancelled by user.');
              }
            }
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        } else {
          // COD or generic bank transfer (which redirects directly for offline payments)
          clearCart();
          router.push(`/checkout/success?orderId=${encodeURIComponent(data.orderNumber ?? data.orderId)}`);
        }
      } else {
        setSubmitError(data.error ?? 'There was an error processing your order.');
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Network error. Please try again.');
    } finally {
      if (paymentMethod === 'COD') {
        setIsSubmitting(false);
      }
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-wood-50 dark:bg-timber-950">
        <Loader2 className="animate-spin text-accent mb-4" size={48} />
        <p className="text-wood-950 dark:text-white font-medium">Checking authorization...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-wood-50 dark:bg-timber-950">
        <h2 className="text-3xl font-serif font-bold text-wood-950 dark:text-white mb-4">Your cart is empty</h2>
        <Link href="/catalog" className="text-accent font-bold hover:underline">Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className="bg-wood-50 dark:bg-timber-950 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link href="/catalog" className="inline-flex items-center gap-2 text-timber-500 hover:text-wood-950 dark:hover:text-white font-medium mb-8 transition-colors">
          <ArrowLeft size={20} /> Back to Catalog
        </Link>

        <h1 className="text-4xl font-serif font-bold text-wood-950 dark:text-white mb-10">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left Column: Form */}
          <div className="w-full lg:w-2/3">
            <form id="checkout-form" onSubmit={handleSubmit} className="bg-white dark:bg-timber-900 rounded-3xl p-8 border border-wood-100 dark:border-timber-800 shadow-sm mb-8">
              <h2 className="text-2xl font-bold text-wood-950 dark:text-white mb-6 border-b border-wood-100 dark:border-timber-800 pb-4">Customer Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-timber-600 dark:text-timber-400 mb-2">Full Name *</label>
                  <input 
                    required 
                    type="text" 
                    name="name" 
                    pattern="^[a-zA-Z\s]+$" 
                    title="Name can only contain letters and spaces" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    className="w-full px-4 py-3 rounded-xl border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-950 text-wood-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent" 
                    placeholder="e.g. Rahul Kumar" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-timber-600 dark:text-timber-400 mb-2">Email Address *</label>
                  <input 
                    required 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    className="w-full px-4 py-3 rounded-xl border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-950 text-wood-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent" 
                    placeholder="e.g. rahul@example.com" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-timber-600 dark:text-timber-400 mb-2">WhatsApp / Phone Number *</label>
                  <input 
                    required 
                    type="tel" 
                    name="phone" 
                    pattern="^\d{10}$" 
                    maxLength={10} 
                    title="Phone number must be exactly 10 digits" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    className="w-full px-4 py-3 rounded-xl border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-950 text-wood-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent" 
                    placeholder="e.g. 9876543210" 
                  />
                  <p className="text-xs text-timber-500 mt-1">We will send delivery updates to this number.</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-wood-950 dark:text-white mb-6 border-b border-wood-100 dark:border-timber-800 pb-4">Delivery Address</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-timber-600 dark:text-timber-400 mb-2">Street Address *</label>
                  <input required type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-950 text-wood-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent" placeholder="123 Main St, Apartment/Suite" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-timber-600 dark:text-timber-400 mb-2">City *</label>
                  <input 
                    required 
                    type="text" 
                    name="city" 
                    pattern="^[a-zA-Z\s]+$" 
                    title="City name can only contain letters and spaces" 
                    value={formData.city} 
                    onChange={handleInputChange} 
                    className="w-full px-4 py-3 rounded-xl border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-950 text-wood-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent" 
                    placeholder="Bhubaneswar" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-timber-600 dark:text-timber-400 mb-2">PIN / Zip Code *</label>
                  <input 
                    required 
                    type="text" 
                    name="zipCode" 
                    pattern="^\d{6}$" 
                    maxLength={6} 
                    title="PIN/Zip code must be exactly 6 digits" 
                    value={formData.zipCode} 
                    onChange={handleInputChange} 
                    className="w-full px-4 py-3 rounded-xl border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-950 text-wood-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent" 
                    placeholder="751001" 
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Right Column: Order Summary & Payment */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white dark:bg-timber-900 rounded-3xl p-8 border border-wood-100 dark:border-timber-800 shadow-lg sticky top-24">
              <h2 className="text-2xl font-bold text-wood-950 dark:text-white mb-6">Order Summary</h2>
              
              <ul className="space-y-4 mb-6 pb-6 border-b border-wood-100 dark:border-timber-800">
                {items.map(item => (
                  <li key={item.id} className="flex justify-between text-sm">
                    <span className="text-timber-700 dark:text-timber-300">
                      {item.quantity}x {item.name}
                    </span>
                      ₹{(parsePrice(item.price) * item.quantity).toLocaleString('en-IN')}
                  </li>
                ))}
              </ul>

              <div className="flex justify-between items-center mb-8">
                <span className="text-lg font-bold text-timber-600 dark:text-timber-400">Total</span>
                <span className="text-3xl font-black text-accent">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>

              <h3 className="font-bold text-wood-950 dark:text-white mb-4">Payment Method</h3>
              <div className="space-y-3 mb-6">
                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-accent bg-accent/5' : 'border-wood-200 dark:border-timber-700'}`}>
                  <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-accent w-5 h-5" />
                  <span className="font-medium text-wood-950 dark:text-white">Cash on Delivery / Pay at Site</span>
                </label>
                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'BANK' ? 'border-accent bg-accent/5' : 'border-wood-200 dark:border-timber-700'}`}>
                  <input type="radio" name="payment" value="BANK" checked={paymentMethod === 'BANK'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-accent w-5 h-5" />
                  <span className="font-medium text-wood-950 dark:text-white">Bank Transfer / UPI (Pre-paid)</span>
                </label>
              </div>

              {paymentMethod !== 'COD' && (
                <div className="mb-8">
                  <h4 className="text-base font-semibold text-wood-950 dark:text-white mb-3">Choose UPI provider</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {providerOptions.map((option) => (
                      <label key={option.value} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${paymentProvider === option.value ? 'border-accent bg-accent/5' : 'border-wood-200 dark:border-timber-700'}`}>
                        <input
                          type="radio"
                          name="paymentProvider"
                          value={option.value}
                          checked={paymentProvider === option.value}
                          onChange={(e) => setPaymentProvider(e.target.value)}
                          className="accent-accent w-5 h-5"
                        />
                        <span className="font-medium text-wood-950 dark:text-white">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <button 
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full bg-wood-950 hover:bg-wood-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg shadow-lg"
              >
                {isSubmitting ? 'Processing...' : 'Place Order'} <ArrowRight size={20} />
              </button>

              {submitError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                  {submitError}
                </div>
              )}

              <div className="mt-6 flex flex-col gap-2">
                <div className="flex items-center justify-center gap-2 text-sm text-timber-500 font-medium">
                  <ShieldCheck size={16} className="text-accent" /> 100% Secure Checkout
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-timber-500 font-medium">
                  <Truck size={16} className="text-accent" /> Fast Delivery across Odisha
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
