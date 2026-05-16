import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/auth/AuthProvider';

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] });
const playfair = Playfair_Display({ variable: '--font-playfair', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'JK Timbers | Premium Plywood & Timber Solutions',
  description: 'Explore our wide range of high-quality Sagwan, Marine Ply, Veneers, and Laminates. Trusted since 2000.',
};

/**
 * Root layout — provides ONLY the HTML shell.
 *
 * Public chrome (Navbar, Footer, CartProvider, AIChat) lives in (public)/layout.tsx.
 * Admin chrome (Sidebar, Topbar, auth gate) lives in admin/(dashboard)/layout.tsx.
 * This separation ensures no public UI bleeds into admin routes and vice versa.
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
