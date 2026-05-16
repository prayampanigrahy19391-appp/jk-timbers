import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import dynamic from 'next/dynamic';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/components/cart/CartContext";
import CartSidebar from "@/components/cart/CartSidebar";

const AIChat = dynamic(() => import('@/components/AIChat'));

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JK Timbers | Premium Plywood & Timber Solutions",
  description: "Explore our wide range of high-quality Sagwan, Marine Ply, Veneers, and Laminates. Trusted since 2000.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <CartProvider>
          <Navbar />
          <CartSidebar />
          <main className="flex-grow pt-20">
            {children}
          </main>
          <Footer />
          <AIChat />
        </CartProvider>
      </body>
    </html>
  );
}
