import dynamic from 'next/dynamic';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { CartProvider } from '@/components/cart/CartContext';
import CartSidebar from '@/components/cart/CartSidebar';

const AIChat = dynamic(() => import('@/components/AIChat'));

/**
 * Public layout — wraps all customer-facing routes.
 *
 * Provides: Navbar, Footer, CartProvider, CartSidebar, AIChat.
 * Does NOT include <html> or <body> (those live in the root layout).
 * Admin routes are in a sibling segment and do NOT inherit this layout.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Navbar />
      <CartSidebar />
      <main className="flex-grow pt-20">
        {children}
      </main>
      <Footer />
      <AIChat />
    </CartProvider>
  );
}
