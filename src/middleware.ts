import NextAuth from 'next-auth';
import { authConfig } from '@/../auth.config';
import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { hasPermission } from '@/lib/permissions';

const { auth } = NextAuth(authConfig);

// Define protected route prefixes and their minimum required roles
const routePermissions: Record<string, Role> = {
  '/admin': Role.STAFF,
  '/api/admin': Role.STAFF,
  '/contractor': Role.CONTRACTOR,
};

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role as Role | undefined;

  // Protect Admin Routes
  if (nextUrl.pathname.startsWith('/admin') && !nextUrl.pathname.startsWith('/admin/login')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/admin/login', nextUrl));
    }
    
    // Check RBAC
    if (userRole && !hasPermission(userRole, routePermissions['/admin'])) {
      // User is logged in but doesn't have required privileges
      return NextResponse.redirect(new URL('/unauthorized', nextUrl));
    }
  }

  // You can easily extend this logic for contractor portals or customer portals
  // e.g., if (nextUrl.pathname.startsWith('/account')) { ... }

  return NextResponse.next();
});

// Match all routes except static assets, api/auth, and next internals
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|textures|images|.*\\.png$).*)',
  ],
};
