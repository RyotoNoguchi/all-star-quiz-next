/**
 * Users tRPC Router
 * 
 * Handles user-related operations including:
 * - Profile management
 * - User statistics
 * - Role management (admin only)
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from '@/server/api/trpc'

export const usersRouter = createTRPCRouter({
  // Get current user profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        gamesPlayed: true,
        gamesWon: true,
        totalScore: true,
        createdAt: true,
      },
    })

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      })
    }

    return user
  }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: { name: input.name },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
      })

      return updatedUser
    }),

  // Get user statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const stats = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        gamesPlayed: true,
        gamesWon: true,
        totalScore: true,
      },
    })

    if (!stats) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User stats not found',
      })
    }

    const winRate = stats.gamesPlayed > 0 ? (stats.gamesWon / stats.gamesPlayed) * 100 : 0
    const averageScore = stats.gamesPlayed > 0 ? stats.totalScore / stats.gamesPlayed : 0

    return {
      ...stats,
      winRate: Math.round(winRate * 100) / 100,
      averageScore: Math.round(averageScore * 100) / 100,
    }
  }),

  // Get leaderboard
  getLeaderboard: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        sortBy: z.enum(['gamesWon', 'totalScore', 'winRate']).default('gamesWon'),
      })
    )
    .query(async ({ ctx, input }) => {
      const users = await ctx.prisma.user.findMany({
        where: {
          gamesPlayed: { gt: 0 },
        },
        select: {
          id: true,
          name: true,
          image: true,
          gamesPlayed: true,
          gamesWon: true,
          totalScore: true,
        },
        take: input.limit,
        orderBy:
          input.sortBy === 'winRate'
            ? [
                { gamesWon: 'desc' },
                { gamesPlayed: 'asc' },
              ]
            : { [input.sortBy]: 'desc' },
      })

      return users.map((user, index) => ({
        ...user,
        rank: index + 1,
        winRate: user.gamesPlayed > 0 ? (user.gamesWon / user.gamesPlayed) * 100 : 0,
        averageScore: user.gamesPlayed > 0 ? user.totalScore / user.gamesPlayed : 0,
      }))
    }),

  // Admin: Get all users
  getAllUsers: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        role: z.enum(['PLAYER', 'ADMIN', 'SUPER_ADMIN']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit

      const where = {
        ...(input.search && {
          OR: [
            { name: { contains: input.search, mode: 'insensitive' as const } },
            { email: { contains: input.search, mode: 'insensitive' as const } },
          ],
        }),
        ...(input.role && { role: input.role }),
      }

      const [users, total] = await Promise.all([
        ctx.prisma.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            gamesPlayed: true,
            gamesWon: true,
            totalScore: true,
            createdAt: true,
          },
          skip,
          take: input.limit,
          orderBy: { createdAt: 'desc' },
        }),
        ctx.prisma.user.count({ where }),
      ])

      return {
        users,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          pages: Math.ceil(total / input.limit),
        },
      }
    }),

  // Admin: Update user role
  updateUserRole: adminProcedure
    .input(
      z.object({
        userId: z.string().cuid(),
        role: z.enum(['PLAYER', 'ADMIN', 'SUPER_ADMIN']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Prevent non-super-admins from creating super-admins
      const currentUser = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true },
      })

      if (
        currentUser?.role !== 'SUPER_ADMIN' &&
        input.role === 'SUPER_ADMIN'
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only super admins can promote users to super admin',
        })
      }

      const updatedUser = await ctx.prisma.user.update({
        where: { id: input.userId },
        data: { role: input.role },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      })

      return updatedUser
    }),
})