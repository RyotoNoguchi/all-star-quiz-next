/**
 * Games tRPC Router
 * 
 * Handles game session operations including:
 * - Game creation and management
 * - Player participation
 * - Answer submission and validation
 * - Real-time game state updates
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from '@/server/api/trpc'

// Helper function to generate game code
const generateGameCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export const gamesRouter = createTRPCRouter({
  // Create a new game session
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Game name is required').max(100),
        maxPlayers: z.number().min(2).max(50).default(20),
        questionTimeLimit: z.number().min(5).max(60).default(10),
        isPublic: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Generate unique game code
      let gameCode: string
      let codeExists = true
      let attempts = 0

      do {
        gameCode = generateGameCode()
        const existingGame = await ctx.prisma.gameSession.findUnique({
          where: { code: gameCode },
        })
        codeExists = !!existingGame
        attempts++
      } while (codeExists && attempts < 10)

      if (codeExists) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate unique game code',
        })
      }

      const game = await ctx.prisma.gameSession.create({
        data: {
          name: input.name,
          code: gameCode,
          adminId: ctx.session.user.id,
          maxPlayers: input.maxPlayers,
          questionTimeLimit: input.questionTimeLimit,
          isPublic: input.isPublic,
        },
        select: {
          id: true,
          name: true,
          code: true,
          status: true,
          maxPlayers: true,
          questionTimeLimit: true,
          isPublic: true,
          createdAt: true,
        },
      })

      return game
    }),

  // Join a game by code
  join: protectedProcedure
    .input(z.object({ code: z.string().length(6) }))
    .mutation(async ({ ctx, input }) => {
      const game = await ctx.prisma.gameSession.findUnique({
        where: { code: input.code.toUpperCase() },
        include: {
          participants: {
            select: {
              playerId: true,
              status: true,
            },
          },
        },
      })

      if (!game) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Game not found',
        })
      }

      if (game.status !== 'WAITING') {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Game has already started',
        })
      }

      // Check if player is already in the game
      const existingParticipant = game.participants.find(
        (p) => p.playerId === ctx.session.user.id
      )

      if (existingParticipant) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'You are already in this game',
        })
      }

      // Check if game is full
      const activeParticipants = game.participants.filter(
        (p) => p.status === 'ACTIVE'
      )

      if (activeParticipants.length >= game.maxPlayers) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Game is full',
        })
      }

      // Add player to game
      await ctx.prisma.gameParticipant.create({
        data: {
          gameId: game.id,
          playerId: ctx.session.user.id,
        },
      })

      return {
        gameId: game.id,
        gameName: game.name,
        participantCount: activeParticipants.length + 1,
        maxPlayers: game.maxPlayers,
      }
    }),

  // Get game details
  getById: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const game = await ctx.prisma.gameSession.findUnique({
        where: { id: input.id },
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          participants: {
            include: {
              player: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: { joinedAt: 'asc' },
          },
          gameQuestions: {
            include: {
              question: {
                select: {
                  id: true,
                  text: true,
                  type: true,
                  difficulty: true,
                  // Don't include options or correct answer for security
                },
              },
            },
            orderBy: { questionOrder: 'asc' },
          },
        },
      })

      if (!game) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Game not found',
        })
      }

      // Check if user is participant or admin
      const isParticipant = game.participants.some(
        (p) => p.playerId === ctx.session.user.id
      )
      const isAdmin = game.adminId === ctx.session.user.id

      if (!isParticipant && !isAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not part of this game',
        })
      }

      return game
    }),

  // Start a game (admin only)
  start: protectedProcedure
    .input(
      z.object({
        gameId: z.string().cuid(),
        questionCount: z.number().min(1).max(50).default(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const game = await ctx.prisma.gameSession.findUnique({
        where: { id: input.gameId },
        include: {
          participants: {
            where: { status: 'ACTIVE' },
          },
        },
      })

      if (!game) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Game not found',
        })
      }

      if (game.adminId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the game admin can start the game',
        })
      }

      if (game.status !== 'WAITING') {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Game has already started',
        })
      }

      if (game.participants.length < 2) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'At least 2 players are required to start the game',
        })
      }

      // Get random questions
      const questions = await ctx.prisma.question.findMany({
        where: { isActive: true },
        take: input.questionCount * 2, // Get extra for randomization
        orderBy: { createdAt: 'desc' },
      })

      if (questions.length < input.questionCount) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Not enough questions available. Found ${questions.length}, need ${input.questionCount}`,
        })
      }

      // Shuffle and select questions
      const selectedQuestions = questions
        .sort(() => Math.random() - 0.5)
        .slice(0, input.questionCount)

      // Update game status and add questions
      const updatedGame = await ctx.prisma.$transaction(async (tx) => {
        // Update game
        await tx.gameSession.update({
          where: { id: input.gameId },
          data: {
            status: 'STARTING',
            startedAt: new Date(),
            totalQuestions: input.questionCount,
          },
        })

        // Add questions to game
        await tx.gameQuestion.createMany({
          data: selectedQuestions.map((question, index) => ({
            gameId: input.gameId,
            questionId: question.id,
            questionOrder: index + 1,
          })),
        })

        return tx.gameSession.findUnique({
          where: { id: input.gameId },
          select: {
            id: true,
            status: true,
            startedAt: true,
            totalQuestions: true,
          },
        })
      })

      return updatedGame
    }),

  // Submit an answer
  submitAnswer: protectedProcedure
    .input(
      z.object({
        gameId: z.string().cuid(),
        questionOrder: z.number().min(1),
        selectedAnswer: z.enum(['A', 'B', 'C', 'D']),
        responseTime: z.number().min(0).max(60), // seconds
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get game and question
      const gameQuestion = await ctx.prisma.gameQuestion.findFirst({
        where: {
          gameId: input.gameId,
          questionOrder: input.questionOrder,
        },
        include: {
          game: {
            select: {
              status: true,
              currentQuestionIndex: true,
            },
          },
          question: {
            select: {
              correctAnswer: true,
            },
          },
        },
      })

      if (!gameQuestion) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Question not found',
        })
      }

      if (gameQuestion.game.status !== 'IN_PROGRESS') {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Game is not in progress',
        })
      }

      // Check if player is in the game
      const participant = await ctx.prisma.gameParticipant.findFirst({
        where: {
          gameId: input.gameId,
          playerId: ctx.session.user.id,
          status: 'ACTIVE',
        },
      })

      if (!participant) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not an active participant in this game',
        })
      }

      // Check if answer already submitted
      const existingAnswer = await ctx.prisma.playerAnswer.findFirst({
        where: {
          gameId: input.gameId,
          participantId: participant.id,
          gameQuestionId: gameQuestion.id,
        },
      })

      if (existingAnswer) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Answer already submitted for this question',
        })
      }

      const isCorrect = input.selectedAnswer === gameQuestion.question.correctAnswer

      // Create answer record
      const answer = await ctx.prisma.playerAnswer.create({
        data: {
          gameId: input.gameId,
          participantId: participant.id,
          questionId: gameQuestion.questionId,
          gameQuestionId: gameQuestion.id,
          selectedAnswer: input.selectedAnswer,
          isCorrect,
          responseTime: input.responseTime,
          answeredAt: new Date(),
        },
        select: {
          id: true,
          selectedAnswer: true,
          isCorrect: true,
          responseTime: true,
          answeredAt: true,
        },
      })

      return answer
    }),

  // Get current game state for participants
  getCurrentState: protectedProcedure
    .input(z.object({ gameId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const game = await ctx.prisma.gameSession.findUnique({
        where: { id: input.gameId },
        include: {
          participants: {
            include: {
              player: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: { score: 'desc' },
          },
        },
      })

      if (!game) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Game not found',
        })
      }

      // Get game questions separately after we have the game data
      const gameQuestions = await ctx.prisma.gameQuestion.findMany({
        where: {
          gameId: input.gameId,
          questionOrder: { lte: game.currentQuestionIndex || 0 },
        },
        include: {
          question: {
            select: {
              id: true,
              text: true,
              type: true,
              optionA: true,
              optionB: true,
              optionC: true,
              optionD: true,
              // Don't include correct answer for security
            },
          },
        },
        orderBy: { questionOrder: 'asc' },
      })

      // Check if user is participant
      const userParticipant = game.participants.find(
        (p: { playerId: string }) => p.playerId === ctx.session.user.id
      )

      if (!userParticipant) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not part of this game',
        })
      }

      return {
        id: game.id,
        name: game.name,
        status: game.status,
        currentQuestionIndex: game.currentQuestionIndex,
        totalQuestions: game.totalQuestions,
        questionTimeLimit: game.questionTimeLimit,
        participants: game.participants,
        currentQuestion: gameQuestions[game.currentQuestionIndex - 1] || null,
        userParticipant,
      }
    }),

  // Admin: Get all games with detailed info
  getAllGames: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        status: z.enum(['WAITING', 'STARTING', 'IN_PROGRESS', 'PAUSED', 'FINISHED', 'CANCELLED']).optional(),
        adminId: z.string().cuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit

      const where = {
        ...(input.search && {
          OR: [
            { name: { contains: input.search, mode: 'insensitive' as const } },
            { code: { contains: input.search, mode: 'insensitive' as const } },
          ],
        }),
        ...(input.status && { status: input.status }),
        ...(input.adminId && { adminId: input.adminId }),
      }

      const [games, total] = await Promise.all([
        ctx.prisma.gameSession.findMany({
          where,
          include: {
            admin: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            _count: {
              select: {
                participants: true,
                gameQuestions: true,
                playerAnswers: true,
              },
            },
          },
          skip,
          take: input.limit,
          orderBy: { createdAt: 'desc' },
        }),
        ctx.prisma.gameSession.count({ where }),
      ])

      return {
        games,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          pages: Math.ceil(total / input.limit),
        },
      }
    }),

  // Admin: Update game status
  updateGameStatus: adminProcedure
    .input(
      z.object({
        gameId: z.string().cuid(),
        status: z.enum(['WAITING', 'STARTING', 'IN_PROGRESS', 'PAUSED', 'FINISHED', 'CANCELLED']),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const game = await ctx.prisma.gameSession.findUnique({
        where: { id: input.gameId },
        select: { id: true, status: true, adminId: true },
      })

      if (!game) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Game not found',
        })
      }

      const updatedGame = await ctx.prisma.gameSession.update({
        where: { id: input.gameId },
        data: {
          status: input.status,
          ...(input.status === 'FINISHED' && !game.adminId && { endedAt: new Date() }),
          ...(input.status === 'CANCELLED' && { endedAt: new Date() }),
        },
        select: {
          id: true,
          name: true,
          code: true,
          status: true,
          updatedAt: true,
        },
      })

      return updatedGame
    }),

  // Admin: Delete game
  deleteGame: adminProcedure
    .input(z.object({ gameId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const game = await ctx.prisma.gameSession.findUnique({
        where: { id: input.gameId },
        include: {
          _count: {
            select: {
              participants: true,
              playerAnswers: true,
            },
          },
        },
      })

      if (!game) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Game not found',
        })
      }

      if (game.status === 'IN_PROGRESS') {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Cannot delete a game that is currently in progress',
        })
      }

      await ctx.prisma.gameSession.delete({
        where: { id: input.gameId },
      })

      return { success: true }
    }),

  // Admin: Get game statistics
  getGameStats: adminProcedure.query(async ({ ctx }) => {
    const [
      totalGames,
      gamesByStatus,
      recentGames,
      averageParticipants,
      totalParticipants,
    ] = await Promise.all([
      ctx.prisma.gameSession.count(),
      ctx.prisma.gameSession.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      ctx.prisma.gameSession.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
      ctx.prisma.gameParticipant.aggregate({
        _avg: { score: true },
      }),
      ctx.prisma.gameParticipant.count(),
    ])

    return {
      totalGames,
      totalParticipants,
      recentGames,
      averageScore: averageParticipants._avg.score || 0,
      gamesByStatus: gamesByStatus.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status
        return acc
      }, {} as Record<string, number>),
    }
  }),

  // Get public game list
  getPublicGames: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(10),
        status: z.enum(['WAITING', 'STARTING', 'IN_PROGRESS']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit

      const where = {
        isPublic: true,
        ...(input.status && { status: input.status }),
      }

      const [games, total] = await Promise.all([
        ctx.prisma.gameSession.findMany({
          where,
          select: {
            id: true,
            name: true,
            code: true,
            status: true,
            maxPlayers: true,
            createdAt: true,
            admin: {
              select: {
                name: true,
                image: true,
              },
            },
            _count: {
              select: {
                participants: {
                  where: { status: 'ACTIVE' },
                },
              },
            },
          },
          skip,
          take: input.limit,
          orderBy: { createdAt: 'desc' },
        }),
        ctx.prisma.gameSession.count({ where }),
      ])

      return {
        games: games.map((game) => ({
          ...game,
          participantCount: game._count.participants,
        })),
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          pages: Math.ceil(total / input.limit),
        },
      }
    }),
})