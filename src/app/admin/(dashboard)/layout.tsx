'use client';

import React from 'react';
import { Building2, Package, ShoppingCart, Users, TrendingUp, Menu, Search, Bell, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin/login' });
  };

  const navLinks = [
    { href: '/admin', label: 'Dashboard', icon: TrendingUp },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/products', label: 'Inventory', icon: Package },
    { href: '/admin/contractors', label: 'Contractors', icon: Building2 },
    { href: '/admin/users', label: 'Customers', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-timber-100 dark:bg-timber-950 flex flex-col md:flex-row">
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex w-64 bg-wood-950 text-white flex-col shrink-0 min-h-screen sticky top-0">
        <div className="p-6 border-b border-wood-800">
          <h2 className="font-serif text-2xl font-bold text-accent">JK Admin</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-wood-800 text-white font-medium' : 'text-wood-300 hover:bg-wood-800/50 hover:text-white'}`}>
                <Icon size={20} /> {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-wood-800">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition-colors font-medium">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:h-screen md:overflow-hidden">
        {/* Topbar/Header */}
        <header className="bg-wood-950 md:bg-white dark:md:bg-timber-900 border-b border-wood-800 md:border-wood-200 dark:md:border-timber-800 h-16 flex items-center justify-between px-4 md:px-6 shrink-0 sticky top-0 z-20">
          {/* Mobile navigation header */}
          <div className="flex items-center gap-2 md:hidden w-full justify-between">
            <span className="font-serif text-base font-black text-accent tracking-tight">JK Admin</span>
            
            {/* Dropdown Menu for Navigation on Mobile */}
            <div className="relative flex-grow max-w-[170px] mx-2">
              <select
                value={pathname}
                onChange={(e) => router.push(e.target.value)}
                className="w-full bg-wood-900/90 text-white text-xs font-semibold py-2 pl-3 pr-8 rounded-lg border border-wood-800 appearance-none focus:outline-none focus:border-accent cursor-pointer"
              >
                {navLinks.map((link) => (
                  <option key={link.href} value={link.href} className="bg-wood-950 text-white">
                    {link.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-wood-400 pointer-events-none">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            <button onClick={handleLogout} className="p-2 text-red-400 hover:bg-wood-900/50 rounded-lg transition-colors" title="Logout">
              <LogOut size={16} />
            </button>
          </div>

          {/* Desktop header options */}
          <div className="hidden md:flex items-center justify-between w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-timber-400" size={16} />
              <input type="text" placeholder="Search orders, products..." className="pl-9 pr-4 py-2 rounded-full border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-950 text-sm focus:outline-none focus:border-accent w-64 text-wood-950 dark:text-white" />
            </div>
            <div className="flex items-center gap-4">
              <button className="relative text-wood-600 dark:text-wood-400 hover:text-wood-950 dark:hover:text-white transition-colors">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-8 h-8 rounded-full bg-accent text-wood-950 flex items-center justify-center font-bold text-sm">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
