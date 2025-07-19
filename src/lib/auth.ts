/**
 * NextAuth.js Configuration
 *
 * Authentication configuration for the All Star Quiz application
 * Supports Google OAuth, GitHub OAuth, and database sessions
 */

import { type NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import type { Adapter } from 'next-auth/adapters'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'

import { prisma } from '@/lib/prisma'


export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    // Google OAuth provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),

    // GitHub OAuth provider
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
    }),
  ],

  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    session: async ({ session, user }) => {
      // Fetch user role from database
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true }
      })

      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          role: dbUser?.role || 'PLAYER',
        },
      }
    },

    jwt: async ({ token, user }) => {
      if (user) {
        // Fetch user role from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true }
        })

        token.id = user.id
        token.role = dbUser?.role || 'PLAYER'
      }
      return token
    },

    signIn: async ({ user: _user, account: _account, profile: _profile }) => {
      // Allow sign in
      return true
    },
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  events: {
    createUser: async ({ user }) => {
      // Set default role for new users
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'PLAYER' },
      })
    },
  },
}
