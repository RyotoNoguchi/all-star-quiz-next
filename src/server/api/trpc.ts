/**
 * tRPC Core Configuration
 *
 * This file contains the core configuration for tRPC including:
 * - Context creation
 * - Authentication middleware
 * - Procedure definitions
 * - Error handling
 */

import { initTRPC, TRPCError } from '@trpc/server'
import { type NextRequest } from 'next/server'
import { type Session } from 'next-auth'
import { getServerSession } from 'next-auth/next'
import superjson from 'superjson'
import { ZodError } from 'zod'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * 1. CONTEXT
 */
type CreateContextOptions = {
  session: Session | null
}

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    prisma,
  }
}

export const createTRPCContext = async (_opts: { req: NextRequest }) => {
  // Get the session from the server using the getServerSession wrapper function
  const session = await getServerSession(authOptions)

  return createInnerTRPCContext({
    session,
  })
}

/**
 * 2. INITIALIZATION
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

/**
 * 3. REUSABLE ROUTER AND PROCEDURE HELPERS
 */

// Base router
export const createTRPCRouter = t.router

// Public procedure (no authentication required)
export const publicProcedure = t.procedure

// Authenticated procedure (requires user to be logged in)
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
      prisma: ctx.prisma,
    },
  })
})

// Admin procedure (requires admin role)
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const user = await ctx.prisma.user.findUnique({
    where: { id: ctx.session.user.id },
    select: { role: true },
  })

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required'
    })
  }

  return next({
    ctx: {
      ...ctx,
      user,
    },
  })
})

// Super admin procedure (requires super admin role)
export const superAdminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const user = await ctx.prisma.user.findUnique({
    where: { id: ctx.session.user.id },
    select: { role: true },
  })

  if (!user || user.role !== 'SUPER_ADMIN') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Super admin access required'
    })
  }

  return next({
    ctx: {
      ...ctx,
      user,
    },
  })
})

// Game admin procedure (requires admin role or game ownership)
export const gameAdminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  // This will be used for game-specific admin checks
  // The actual game ownership check happens in individual procedures
  return next({
    ctx,
  })
})
