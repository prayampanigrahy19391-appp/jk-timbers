import NextAuth from 'next-auth';
import { authConfig } from '@/../auth.config';
import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { hasPermission } from '@/lib/permissions';
import { rateLimit } from '@/lib/rateLimiter';
import { matchesRoutePrefix } from '@/lib/routeMatching';

const { auth } = NextAuth(authConfig);

const PROTECTED_ROUTES = [
  { prefix: '/admin', requiredRole: Role.STAFF, api: false, redirect: '/admin/login' },
  { prefix: '/api/admin', requiredRole: Role.STAFF, api: true },
  { prefix: '/api/user', requiredRole: Role.USER, api: true },
  { prefix: '/contractor', requiredRole: Role.CONTRACTOR, api: false, redirect: '/login' },
];

const isProduction = process.env.NODE_ENV === 'production';

const securityHeaders: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};

if (isProduction) {
  securityHeaders['Content-Security-Policy'] = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://api.razorpay.com https://checkout.razorpay.com",
    "frame-src https://api.razorpay.com https://checkout.razorpay.com",
    "frame-ancestors 'none'",
  ].join('; ');
  securityHeaders['Strict-Transport-Security'] = 'max-age=63072000; includeSubDomains; preload';
}

const applySecurityHeaders = (response: NextResponse) => {
  for (const [name, value] of Object.entries(securityHeaders)) {
    response.headers.set(name, value);
  }
  return response;
};

export default auth(async (req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const isLoggedIn = !!req.auth?.user;
  const userRole = req.auth?.user?.role as Role | undefined;

  if (pathname.startsWith('/api')) {
    const sensitiveApi =
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/api/checkout') ||
      pathname.startsWith('/api/cart') ||
      pathname.startsWith('/api/contact') ||
      pathname.startsWith('/api/contractors/register');
    const rateLimitResult = await rateLimit(
      req,
      sensitiveApi ? 30 : 80,
      15 * 60 * 1000,
      pathname,
    );
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: securityHeaders,
        },
      );
    }
  }

  for (const route of PROTECTED_ROUTES) {
    if (!matchesRoutePrefix(pathname, route.prefix)) {
      continue;
    }

    if (route.redirect && pathname === route.redirect) {
      continue;
    }

    if (!isLoggedIn) {
      if (route.api) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          {
            status: 401,
            headers: securityHeaders,
          },
        );
      }
      return NextResponse.redirect(new URL(route.redirect ?? '/login', nextUrl));
    }

    if (!userRole || !hasPermission(userRole, route.requiredRole)) {
      if (route.api) {
        return NextResponse.json(
          { error: 'Forbidden' },
          {
            status: 403,
            headers: securityHeaders,
          },
        );
      }
      return NextResponse.redirect(new URL('/unauthorized', nextUrl));
    }
  }

  const response = NextResponse.next();
  return applySecurityHeaders(response);
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|textures|images|.*\\.(?:png|jpg|jpeg|svg|webp|gif)$).*)',
    '/api/:path*',
    '/api/admin/:path*',
    '/api/user/:path*',
  ],
};
