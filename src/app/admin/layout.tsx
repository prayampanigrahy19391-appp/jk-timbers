import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JK Timbers — Admin',
  robots: { index: false, follow: false },
};

/**
 * Admin root layout.
 *
 * Intentionally does NOT include <html>, <body>, Navbar, Footer, CartProvider,
 * or AIChat. These are public-facing concerns and must not appear in admin routes.
 *
 * The (dashboard) route group has its own layout that handles
 * authentication verification and the admin sidebar/topbar.
 *
 * Note: <html> and <body> are provided by the root layout (app/layout.tsx).
 * Nesting html/body causes React hydration errors.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
