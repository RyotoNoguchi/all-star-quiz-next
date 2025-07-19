/**
 * NextAuth.js Configuration
 * 
 * Authentication configuration for the All Star Quiz application
 * Supports Google OAuth, GitHub OAuth, and database sessions
 */

import { type NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'

import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
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
    session: ({ session, user }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          role: user.role,
        },
      }
    },
    
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    
    signIn: async ({ user, account, profile }) => {
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