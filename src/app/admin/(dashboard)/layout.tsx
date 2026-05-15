'use client';

import { useState, useEffect } from 'react';
import { Package, ShoppingCart, Users, TrendingUp, Menu, Search, Bell, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const auth = sessionStorage.getItem('jk-admin-auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    } else {
      router.push('/admin/login');
    }
    setIsLoading(false);
  }, [router]);



  const handleLogout = () => {
    sessionStorage.removeItem('jk-admin-auth');
    setIsAuthenticated(false);
    router.push('/admin/login');
  };

  if (isLoading) {
    return <div className="min-h-screen bg-wood-950 flex items-center justify-center text-accent">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  const navLinks = [
    { href: '/admin', label: 'Dashboard', icon: TrendingUp },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/products', label: 'Inventory', icon: Package },
    { href: '/admin/users', label: 'Customers', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-timber-100 dark:bg-timber-950 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <div className="w-full md:w-64 bg-wood-950 text-white flex flex-col shrink-0 min-h-screen sticky top-0">
        <div className="p-6 border-b border-wood-800 flex justify-between items-center">
          <h2 className="font-serif text-2xl font-bold text-accent">JK Admin</h2>
          <button onClick={handleLogout} className="text-timber-400 hover:text-white md:hidden"><LogOut size={20} /></button>
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
        <div className="p-4 border-t border-wood-800 hidden md:block">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition-colors font-medium">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <header className="bg-white dark:bg-timber-900 border-b border-wood-200 dark:border-timber-800 h-16 flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Menu className="text-wood-950 dark:text-white md:hidden" />
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-timber-400" size={16} />
              <input type="text" placeholder="Search orders, products..." className="pl-9 pr-4 py-2 rounded-full border border-wood-200 dark:border-timber-700 bg-wood-50 dark:bg-timber-950 text-sm focus:outline-none focus:border-accent w-64 text-wood-950 dark:text-white" />
            </div>
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
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
