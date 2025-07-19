/**
 * Questions tRPC Router
 *
 * Handles question management including:
 * - CRUD operations for questions
 * - Random question selection
 * - Question analytics and statistics
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@prisma/client'

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from '@/server/api/trpc'

export const questionsRouter = createTRPCRouter({
  // Get random questions for a game
  getRandomQuestions: protectedProcedure
    .input(
      z.object({
        count: z.number().min(1).max(50).default(10),
        difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
        category: z.string().optional(),
        excludeIds: z.array(z.string().cuid()).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where = {
        isActive: true,
        ...(input.difficulty && { difficulty: input.difficulty }),
        ...(input.category && { category: input.category }),
        ...(input.excludeIds && {
          id: { notIn: input.excludeIds },
        }),
      }

      // Get total count for random selection
      const totalCount = await ctx.prisma.question.count({ where })

      if (totalCount === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No questions found matching criteria',
        })
      }

      if (totalCount < input.count) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Only ${totalCount} questions available, but ${input.count} requested`,
        })
      }

      // Get random questions using skip and take
      const questions = await ctx.prisma.question.findMany({
        where,
        select: {
          id: true,
          text: true,
          type: true,
          difficulty: true,
          optionA: true,
          optionB: true,
          optionC: true,
          optionD: true,
          correctAnswer: true,
          explanation: true,
          category: true,
          tags: true,
        },
        orderBy: {
          // Random ordering - in production, use a better random method
          createdAt: 'desc',
        },
        take: input.count * 2, // Take more than needed for randomization
      })

      // Shuffle and take the requested count
      const shuffledQuestions = questions
        .sort(() => Math.random() - 0.5)
        .slice(0, input.count)

      return shuffledQuestions.map(question => ({
        ...question,
        tags: question.tags ? question.tags.split(',').filter(Boolean) : [],
      }))
    }),

  // Get question by ID (admin only - includes correct answer)
  getById: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const question = await ctx.prisma.question.findUnique({
        where: { id: input.id },
        include: {
          gameQuestions: {
            select: {
              game: {
                select: {
                  id: true,
                  name: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      })

      if (!question) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Question not found',
        })
      }

      return {
        ...question,
        tags: question.tags ? question.tags.split(',').filter(Boolean) : [],
      }
    }),

  // Create new question (temporarily public for testing)
  create: publicProcedure
    .input(
      z.object({
        text: z.string().min(10, 'Question text must be at least 10 characters'),
        type: z.enum(['NORMAL', 'FINAL']).default('NORMAL'),
        difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
        optionA: z.string().min(1, 'Option A is required'),
        optionB: z.string().min(1, 'Option B is required'),
        optionC: z.string().min(1, 'Option C is required'),
        optionD: z.string().min(1, 'Option D is required'),
        correctAnswer: z.enum(['A', 'B', 'C', 'D']),
        explanation: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Convert undefined to null for nullable fields to satisfy Prisma types
      const questionData = {
        ...input,
        explanation: input.explanation ?? null,
        category: input.category ?? null,
        tags: input.tags.length > 0 ? input.tags.join(',') : null, // Convert array to comma-separated string
        createdBy: 'test-user-id', // Temporary for testing
      }

      const question = await ctx.prisma.question.create({
        data: questionData as unknown as Prisma.QuestionCreateInput,
        select: {
          id: true,
          text: true,
          type: true,
          difficulty: true,
          category: true,
          tags: true,
          createdAt: true,
        },
      })

      return {
        ...question,
        tags: question.tags ? question.tags.split(',').filter(Boolean) : [],
      }
    }),

  // Update question (temporarily public for testing)
  update: publicProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        text: z.string().min(10).optional(),
        type: z.enum(['NORMAL', 'FINAL']).optional(),
        difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
        optionA: z.string().min(1).optional(),
        optionB: z.string().min(1).optional(),
        optionC: z.string().min(1).optional(),
        optionD: z.string().min(1).optional(),
        correctAnswer: z.enum(['A', 'B', 'C', 'D']).optional(),
        explanation: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Convert undefined to null for nullable fields and filter out undefined properties
      const filteredData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      )

      const questionUpdateData = {
        ...filteredData,
        ...(updateData.explanation !== undefined && { explanation: updateData.explanation ?? null }),
        ...(updateData.category !== undefined && { category: updateData.category ?? null }),
        ...(updateData.tags !== undefined && { 
          tags: updateData.tags && updateData.tags.length > 0 ? updateData.tags.join(',') : null 
        }),
      }

      const question = await ctx.prisma.question.update({
        where: { id },
        data: questionUpdateData as unknown as Prisma.QuestionUpdateInput,
        select: {
          id: true,
          text: true,
          type: true,
          difficulty: true,
          category: true,
          tags: true,
          isActive: true,
          updatedAt: true,
        },
      })

      return {
        ...question,
        tags: question.tags ? question.tags.split(',').filter(Boolean) : [],
      }
    }),

  // Delete question (temporarily public for testing)
  delete: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // Check if question is used in any games
      const usageCount = await ctx.prisma.gameQuestion.count({
        where: { questionId: input.id },
      })

      if (usageCount > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Cannot delete question that has been used in games',
        })
      }

      await ctx.prisma.question.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  // Get all questions with pagination (temporarily public for testing)
  getAll: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
        type: z.enum(['NORMAL', 'FINAL']).optional(),
        category: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit

      const where = {
        ...(input.search && {
          OR: [
            { text: { contains: input.search, mode: 'insensitive' as const } },
            { category: { contains: input.search, mode: 'insensitive' as const } },
          ],
        }),
        ...(input.difficulty && { difficulty: input.difficulty }),
        ...(input.type && { type: input.type }),
        ...(input.category && { category: input.category }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      }

      const [questions, total] = await Promise.all([
        ctx.prisma.question.findMany({
          where,
          select: {
            id: true,
            text: true,
            type: true,
            difficulty: true,
            category: true,
            tags: true,
            isActive: true,
            usageCount: true,
            createdAt: true,
            updatedAt: true,
          },
          skip,
          take: input.limit,
          orderBy: { createdAt: 'desc' },
        }),
        ctx.prisma.question.count({ where }),
      ])

      return {
        questions: questions.map(question => ({
          ...question,
          tags: question.tags ? question.tags.split(',').filter(Boolean) : [],
        })),
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          pages: Math.ceil(total / input.limit),
        },
      }
    }),

  // Get question categories
  getCategories: publicProcedure.query(async ({ ctx }) => {
    const categories = await ctx.prisma.question.groupBy({
      by: ['category'],
      where: {
        category: { not: null },
        isActive: true,
      },
      _count: {
        category: true,
      },
      orderBy: {
        _count: {
          category: 'desc',
        },
      },
    })

    return categories.map((cat) => ({
      name: cat.category!,
      count: cat._count.category,
    }))
  }),

  // Get question statistics (admin only)
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [
      total,
      activeCount,
      difficultyStats,
      typeStats,
      categoryStats,
    ] = await Promise.all([
      ctx.prisma.question.count(),
      ctx.prisma.question.count({ where: { isActive: true } }),
      ctx.prisma.question.groupBy({
        by: ['difficulty'],
        _count: { difficulty: true },
      }),
      ctx.prisma.question.groupBy({
        by: ['type'],
        _count: { type: true },
      }),
      ctx.prisma.question.groupBy({
        by: ['category'],
        _count: { category: true },
        where: { category: { not: null } },
        orderBy: { _count: { category: 'desc' } },
        take: 10,
      }),
    ])

    return {
      total,
      active: activeCount,
      inactive: total - activeCount,
      byDifficulty: difficultyStats.reduce((acc, stat) => {
        acc[stat.difficulty] = stat._count.difficulty
        return acc
      }, {} as Record<string, number>),
      byType: typeStats.reduce((acc, stat) => {
        acc[stat.type] = stat._count.type
        return acc
      }, {} as Record<string, number>),
      topCategories: categoryStats.map((cat) => ({
        name: cat.category!,
        count: cat._count.category,
      })),
    }
  }),
})
