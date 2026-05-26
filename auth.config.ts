import type { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import env from '@/config/env';
import { Role } from '@prisma/client';

const secureCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  secure: env.NODE_ENV === 'production',
};

const sessionCookieName =
  env.NODE_ENV === 'production'
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token';

export const authConfig: NextAuthConfig = {
  // Use the Prisma adapter in production. Disable in development to avoid
  // adapter-related runtime assertions while using Credentials + JWT.
  adapter: env.NODE_ENV === 'production' ? PrismaAdapter(prisma) : undefined,
  secret: env.AUTH_SECRET,
  session: {
    // Use JWT strategy to support CredentialsProvider sign-in in this setup.
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Refresh session once every 24 hours
  },
  cookies: {
    sessionToken: {
      name: sessionCookieName,
      options: secureCookieOptions,
    },
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            profile(profile) {
              return {
                id: profile.sub,
                name: profile.name,
                email: profile.email,
                image: profile.picture,
                role: Role.CUSTOMER,
              };
            },
          }),
        ]
      : []),
    ...(env.ENABLE_CREDENTIALS === 'true'
      ? [
          CredentialsProvider({
            name: 'Credentials',
            credentials: {
              identifier: { label: 'Email or Phone', type: 'text' },
              password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
              if (!credentials?.identifier || !credentials?.password) {
                return null;
              }

              const identifier = String(credentials.identifier).trim();
              const isEmail = identifier.includes('@');
              const normalizedEmail = identifier.toLowerCase();
              const normalizedPhone = identifier.replace(/\D/g, '');

              // Allow 'simon' to map to the admin email
              const lookupEmail = normalizedEmail === 'simon' ? 'simon69193@gmail.com' : normalizedEmail;

              const user = await prisma.user.findFirst({
                where: {
                  OR: [
                    { email: lookupEmail },
                    ...(isEmail ? [{ email: normalizedEmail }] : []),
                    ...(!isEmail && normalizedPhone ? [{ phone: normalizedPhone }] : []),
                  ],
                },
              });

              if (!user?.password) {
                return null;
              }

              const passwordMatch = await bcrypt.compare(
                String(credentials.password),
                user.password
              );

              if (!passwordMatch) {
                return null;
              }

              return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
              };
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as Role;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
