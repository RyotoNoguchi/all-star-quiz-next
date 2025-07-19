import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import {
  UpdateParticipantSchema,
  IdSchema,
  PaginationSchema,
  ParticipantStatusSchema,
} from '@/schemas/gameSchemas'
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
  gameAdminProcedure,
  participantProcedure,
} from '@/server/api/trpc'

export const participantsRouter = createTRPCRouter({
  // ============================================================================
  // Protected Procedures
  // ============================================================================

  /**
   * Get participants of a game
   */
  getGameParticipants: protectedProcedure
    .input(z.object({
      gameId: z.string().cuid(),
      includeEliminated: z.boolean().default(true),
    }))
    .query(async ({ ctx, input }) => {
      const { gameId, includeEliminated } = input

      // Verify user has access to this game
      const game = await ctx.prisma.gameSession.findUnique({
        where: { id: gameId },
        select: {
          id: true,
          adminId: true,
          participants: {
            where: {
              playerId: ctx.session.user.id,
            },
            select: { id: true },
          },
        },
      })

      if (!game) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Game not found',
        })
      }

      const isAdmin = game.adminId === ctx.session.user.id
      const isParticipant = game.participants.length > 0

      if (!isAdmin && !isParticipant) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this game',
        })
      }

      const whereClause: any = {
        gameId,
        ...(includeEliminated ? {} : {
          status: { in: ['ACTIVE', 'DISCONNECTED', 'WINNER'] },
        }),
      }

      const participants = await ctx.prisma.gameParticipant.findMany({
        where: whereClause,
        select: {
          id: true,
          status: true,
          score: true,
          correctAnswers: true,
          incorrectAnswers: true,
          eliminatedRound: true,
          averageResponseTime: true,
          fastestResponse: true,
          slowestResponse: true,
          joinedAt: true,
          eliminatedAt: true,
          player: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: [
          { status: 'asc' }, // Active participants first
          { score: 'desc' },
          { joinedAt: 'asc' },
        ],
      })

      return participants.map((participant, index) => ({
        ...participant,
        rank: participant.status === 'ACTIVE' || participant.status === 'WINNER'
          ? index + 1
          : null,
      }))
    }),

  /**
   * Get participant details
   */
  getParticipantDetails: protectedProcedure
    .input(IdSchema)
    .query(async ({ ctx, input }) => {
      const participant = await ctx.prisma.gameParticipant.findUnique({
        where: { id: input.id },
        include: {
          player: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true,
            },
          },
          game: {
            select: {
              id: true,
              name: true,
              status: true,
              adminId: true,
              totalQuestions: true,
              currentQuestionIndex: true,
            },
          },
          answers: {
            select: {
              id: true,
              selectedAnswer: true,
              isCorrect: true,
              isTimeout: true,
              responseTime: true,
              answeredAt: true,
              wasEliminated: true,
              eliminationReason: true,
              gameQuestion: {
                select: {
                  questionOrder: true,
                  question: {
                    select: {
                      id: true,
                      text: true,
                      type: true,
                      difficulty: true,
                      correctAnswer: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              gameQuestion: {
                questionOrder: 'asc',
              },
            },
          },
        },
      })

      if (!participant) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Participant not found',
        })
      }

      // Check access rights
      const isAdmin = participant.game.adminId === ctx.session.user.id
      const isOwnParticipation = participant.player.id === ctx.session.user.id

      if (!isAdmin && !isOwnParticipation) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this participant data',
        })
      }

      // Calculate additional statistics
      const totalAnswers = participant.answers.length
      const responseTimes = participant.answers
        .filter(a => a.responseTime !== null)
        .map(a => a.responseTime!)

      const stats = {
        totalAnswers,
        correctAnswers: participant.correctAnswers,
        incorrectAnswers: participant.incorrectAnswers,
        timeoutAnswers: participant.answers.filter(a => a.isTimeout).length,
        averageResponseTime: responseTimes.length > 0
          ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
          : null,
        fastestResponse: responseTimes.length > 0 ? Math.min(...responseTimes) : null,
        slowestResponse: responseTimes.length > 0 ? Math.max(...responseTimes) : null,
        accuracy: totalAnswers > 0 ? (participant.correctAnswers / totalAnswers) * 100 : 0,
      }

      return {
        ...participant,
        statistics: stats,
      }
    }),

  /**
   * Get my participation in a game
   */
  getMyParticipation: protectedProcedure
    .input(z.object({
      gameId: z.string().cuid(),
    }))
    .query(async ({ ctx, input }) => {
      const participant = await ctx.prisma.gameParticipant.findUnique({
        where: {
          gameId_playerId: {
            gameId: input.gameId,
            playerId: ctx.session.user.id,
          },
        },
        include: {
          game: {
            select: {
              id: true,
              name: true,
              status: true,
              currentQuestionIndex: true,
              totalQuestions: true,
            },
          },
          answers: {
            select: {
              id: true,
              selectedAnswer: true,
              isCorrect: true,
              isTimeout: true,
              responseTime: true,
              answeredAt: true,
              gameQuestion: {
                select: {
                  questionOrder: true,
                },
              },
            },
            orderBy: {
              gameQuestion: {
                questionOrder: 'asc',
              },
            },
          },
        },
      })

      if (!participant) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'You are not a participant in this game',
        })
      }

      return participant
    }),

  // ============================================================================
  // Game Admin Procedures
  // ============================================================================

  /**
   * Update participant status (game admin only)
   */
  updateStatus: gameAdminProcedure
    .input(z.object({
      gameId: z.string().cuid(),
      participantId: z.string().cuid(),
      status: ParticipantStatusSchema,
      eliminationReason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { gameId, participantId, status, eliminationReason } = input

      const participant = await ctx.prisma.gameParticipant.findUnique({
        where: { id: participantId },
        select: {
          id: true,
          gameId: true,
          status: true,
        },
      })

      if (!participant || participant.gameId !== gameId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Participant not found in this game',
        })
      }

      const updateData: any = { status }

      if (status === 'ELIMINATED') {
        updateData.eliminatedAt = new Date()
        if (eliminationReason) {
          // This would need to be added to the schema if tracking elimination reasons at participant level
        }
      }

      const updatedParticipant = await ctx.prisma.gameParticipant.update({
        where: { id: participantId },
        data: updateData,
        select: {
          id: true,
          status: true,
          eliminatedAt: true,
          player: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      return updatedParticipant
    }),

  /**
   * Remove participant from game (game admin only)
   */
  removeFromGame: gameAdminProcedure
    .input(z.object({
      gameId: z.string().cuid(),
      participantId: z.string().cuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { gameId, participantId } = input

      const participant = await ctx.prisma.gameParticipant.findUnique({
        where: { id: participantId },
        include: {
          game: {
            select: {
              status: true,
            },
          },
        },
      })

      if (!participant || participant.gameId !== gameId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Participant not found in this game',
        })
      }

      // Only allow removal if game hasn't started or is waiting
      if (!['WAITING', 'CANCELLED'].includes(participant.game.status)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot remove participants from active games',
        })
      }

      await ctx.prisma.gameParticipant.delete({
        where: { id: participantId },
      })

      return { success: true }
    }),

  /**
   * Get participant statistics for a game (game admin only)
   */
  getGameStats: gameAdminProcedure
    .input(z.object({
      gameId: z.string().cuid(),
    }))
    .query(async ({ ctx, input }) => {
      const { gameId } = input

      const participants = await ctx.prisma.gameParticipant.findMany({
        where: { gameId },
        select: {
          id: true,
          status: true,
          score: true,
          correctAnswers: true,
          incorrectAnswers: true,
          averageResponseTime: true,
          fastestResponse: true,
          slowestResponse: true,
          eliminatedRound: true,
          joinedAt: true,
          eliminatedAt: true,
          player: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          answers: {
            select: {
              isCorrect: true,
              isTimeout: true,
              responseTime: true,
            },
          },
        },
      })

      // Calculate aggregate statistics
      const totalParticipants = participants.length
      const activeParticipants = participants.filter(p => p.status === 'ACTIVE').length
      const eliminatedParticipants = participants.filter(p => p.status === 'ELIMINATED').length
      const disconnectedParticipants = participants.filter(p => p.status === 'DISCONNECTED').length

      const totalAnswers = participants.reduce((sum, p) => sum + p.answers.length, 0)
      const totalCorrectAnswers = participants.reduce((sum, p) => sum + p.correctAnswers, 0)
      const totalIncorrectAnswers = participants.reduce((sum, p) => sum + p.incorrectAnswers, 0)
      const totalTimeouts = participants.reduce((sum, p) => 
        sum + p.answers.filter(a => a.isTimeout).length, 0)

      const allResponseTimes = participants.flatMap(p => 
        p.answers.filter(a => a.responseTime !== null).map(a => a.responseTime!))
      
      const averageResponseTime = allResponseTimes.length > 0
        ? allResponseTimes.reduce((sum, time) => sum + time, 0) / allResponseTimes.length
        : null

      const fastestOverallResponse = allResponseTimes.length > 0 
        ? Math.min(...allResponseTimes) 
        : null

      const slowestOverallResponse = allResponseTimes.length > 0 
        ? Math.max(...allResponseTimes) 
        : null

      return {
        participants: participants.map((p, index) => ({
          ...p,
          rank: ['ACTIVE', 'WINNER'].includes(p.status) ? index + 1 : null,
          answerCount: p.answers.length,
          timeoutCount: p.answers.filter(a => a.isTimeout).length,
        })),
        statistics: {
          totalParticipants,
          activeParticipants,
          eliminatedParticipants,
          disconnectedParticipants,
          totalAnswers,
          totalCorrectAnswers,
          totalIncorrectAnswers,
          totalTimeouts,
          averageResponseTime,
          fastestOverallResponse,
          slowestOverallResponse,
          accuracyPercentage: totalAnswers > 0 ? (totalCorrectAnswers / totalAnswers) * 100 : 0,
        },
      }
    }),

  // ============================================================================
  // Admin Procedures
  // ============================================================================

  /**
   * Get all participants across all games (admin only)
   */
  getAll: adminProcedure
    .input(PaginationSchema.extend({
      gameId: z.string().cuid().optional(),
      status: ParticipantStatusSchema.optional(),
      playerId: z.string().cuid().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { limit, offset, gameId, status, playerId } = input

      const whereClause: any = {
        ...(gameId && { gameId }),
        ...(status && { status }),
        ...(playerId && { playerId }),
      }

      const [participants, total] = await Promise.all([
        ctx.prisma.gameParticipant.findMany({
          where: whereClause,
          include: {
            player: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            game: {
              select: {
                id: true,
                name: true,
                code: true,
                status: true,
                createdAt: true,
              },
            },
          },
          orderBy: { joinedAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        ctx.prisma.gameParticipant.count({ where: whereClause }),
      ])

      return {
        participants,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      }
    }),

  /**
   * Update participant manually (admin only)
   */
  updateParticipant: adminProcedure
    .input(UpdateParticipantSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      const updatedParticipant = await ctx.prisma.gameParticipant.update({
        where: { id },
        data: updateData,
        include: {
          player: {
            select: {
              id: true,
              name: true,
            },
          },
          game: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      return updatedParticipant
    }),
})