import { z } from 'zod'

// ============================================================================
// User Schemas
// ============================================================================

export const UserRoleSchema = z.enum(['PLAYER', 'ADMIN', 'SUPER_ADMIN'])

export const CreateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email format'),
  role: UserRoleSchema.default('PLAYER'),
})

export const UpdateUserSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  role: UserRoleSchema.optional(),
})

export const UserStatsSchema = z.object({
  gamesPlayed: z.number().int().min(0),
  gamesWon: z.number().int().min(0),
  totalScore: z.number().int().min(0),
})

// ============================================================================
// Question Schemas
// ============================================================================

export const QuestionTypeSchema = z.enum(['NORMAL', 'FINAL'])
export const QuestionDifficultySchema = z.enum(['EASY', 'MEDIUM', 'HARD'])
export const AnswerOptionSchema = z.enum(['A', 'B', 'C', 'D'])

export const CreateQuestionSchema = z.object({
  text: z.string().min(10, 'Question must be at least 10 characters').max(1000),
  type: QuestionTypeSchema.default('NORMAL'),
  difficulty: QuestionDifficultySchema.default('MEDIUM'),
  optionA: z.string().min(1, 'Option A is required').max(200),
  optionB: z.string().min(1, 'Option B is required').max(200),
  optionC: z.string().min(1, 'Option C is required').max(200),
  optionD: z.string().min(1, 'Option D is required').max(200),
  correctAnswer: AnswerOptionSchema,
  explanation: z.string().max(500).optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).default([]),
})

export const UpdateQuestionSchema = z.object({
  id: z.string().cuid(),
  text: z.string().min(10).max(1000).optional(),
  type: QuestionTypeSchema.optional(),
  difficulty: QuestionDifficultySchema.optional(),
  optionA: z.string().min(1).max(200).optional(),
  optionB: z.string().min(1).max(200).optional(),
  optionC: z.string().min(1).max(200).optional(),
  optionD: z.string().min(1).max(200).optional(),
  correctAnswer: AnswerOptionSchema.optional(),
  explanation: z.string().max(500).optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).optional(),
  isActive: z.boolean().optional(),
})

export const QuestionFilterSchema = z.object({
  type: QuestionTypeSchema.optional(),
  difficulty: QuestionDifficultySchema.optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
})

// ============================================================================
// Game Session Schemas
// ============================================================================

export const GameStatusSchema = z.enum([
  'WAITING',
  'STARTING', 
  'IN_PROGRESS',
  'PAUSED',
  'FINISHED',
  'CANCELLED'
])

export const CreateGameSessionSchema = z.object({
  name: z.string().min(1, 'Game name is required').max(100),
  maxPlayers: z.number().int().min(2).max(50).default(20),
  questionTimeLimit: z.number().int().min(5).max(60).default(10),
  isPublic: z.boolean().default(true),
  totalQuestions: z.number().int().min(5).max(50).default(10),
})

export const UpdateGameSessionSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(100).optional(),
  status: GameStatusSchema.optional(),
  maxPlayers: z.number().int().min(2).max(50).optional(),
  questionTimeLimit: z.number().int().min(5).max(60).optional(),
  isPublic: z.boolean().optional(),
  winnerId: z.string().cuid().optional(),
  winnerScore: z.number().int().min(0).optional(),
})

export const JoinGameSchema = z.object({
  code: z.string().length(6, 'Game code must be 6 characters'),
})

export const GameControlSchema = z.object({
  gameId: z.string().cuid(),
  action: z.enum(['start', 'pause', 'resume', 'end', 'cancel']),
})

// ============================================================================
// Game Participant Schemas
// ============================================================================

export const ParticipantStatusSchema = z.enum([
  'ACTIVE',
  'ELIMINATED',
  'DISCONNECTED',
  'WINNER'
])

export const UpdateParticipantSchema = z.object({
  id: z.string().cuid(),
  status: ParticipantStatusSchema.optional(),
  score: z.number().int().min(0).optional(),
  eliminatedRound: z.number().int().min(1).optional(),
})

// ============================================================================
// Player Answer Schemas
// ============================================================================

export const SubmitAnswerSchema = z.object({
  gameId: z.string().cuid(),
  gameQuestionId: z.string().cuid(),
  selectedAnswer: AnswerOptionSchema.optional(), // null for timeout
  responseTime: z.number().min(0).max(60), // seconds
})

export const AnswerResultSchema = z.object({
  isCorrect: z.boolean(),
  isTimeout: z.boolean(),
  wasEliminated: z.boolean(),
  eliminationReason: z.string().optional(),
  correctAnswer: AnswerOptionSchema,
  explanation: z.string().optional(),
})

// ============================================================================
// Game Statistics Schemas
// ============================================================================

export const GameStatsFilterSchema = z.object({
  gameId: z.string().cuid().optional(),
  playerId: z.string().cuid().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
})

export const LeaderboardSchema = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  timeframe: z.enum(['daily', 'weekly', 'monthly', 'all_time']).default('all_time'),
})

// ============================================================================
// System Settings Schemas
// ============================================================================

export const UpdateSystemSettingsSchema = z.object({
  defaultQuestionTimeLimit: z.number().int().min(5).max(60).optional(),
  defaultMaxPlayers: z.number().int().min(2).max(50).optional(),
  minimumPlayers: z.number().int().min(2).max(10).optional(),
  maximumPlayers: z.number().int().min(10).max(100).optional(),
  questionsPerGame: z.number().int().min(5).max(50).optional(),
  finalQuestionThreshold: z.number().int().min(2).max(10).optional(),
  maintenanceMode: z.boolean().optional(),
  allowPublicGames: z.boolean().optional(),
  allowGuestPlayers: z.boolean().optional(),
  maxGamesPerHour: z.number().int().min(1).max(20).optional(),
  maxQuestionsPerDay: z.number().int().min(10).max(1000).optional(),
})

// ============================================================================
// Common Utility Schemas
// ============================================================================

export const PaginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
})

export const SortSchema = z.object({
  field: z.string(),
  direction: z.enum(['asc', 'desc']).default('desc'),
})

export const IdSchema = z.object({
  id: z.string().cuid(),
})

export const CodeSchema = z.object({
  code: z.string().length(6),
})

// ============================================================================
// Type Exports (for use in components)
// ============================================================================

export type UserRole = z.infer<typeof UserRoleSchema>
export type CreateUser = z.infer<typeof CreateUserSchema>
export type UpdateUser = z.infer<typeof UpdateUserSchema>

export type QuestionType = z.infer<typeof QuestionTypeSchema>
export type QuestionDifficulty = z.infer<typeof QuestionDifficultySchema>
export type AnswerOption = z.infer<typeof AnswerOptionSchema>
export type CreateQuestion = z.infer<typeof CreateQuestionSchema>
export type UpdateQuestion = z.infer<typeof UpdateQuestionSchema>
export type QuestionFilter = z.infer<typeof QuestionFilterSchema>

export type GameStatus = z.infer<typeof GameStatusSchema>
export type CreateGameSession = z.infer<typeof CreateGameSessionSchema>
export type UpdateGameSession = z.infer<typeof UpdateGameSessionSchema>
export type JoinGame = z.infer<typeof JoinGameSchema>
export type GameControl = z.infer<typeof GameControlSchema>

export type ParticipantStatus = z.infer<typeof ParticipantStatusSchema>
export type UpdateParticipant = z.infer<typeof UpdateParticipantSchema>

export type SubmitAnswer = z.infer<typeof SubmitAnswerSchema>
export type AnswerResult = z.infer<typeof AnswerResultSchema>

export type GameStatsFilter = z.infer<typeof GameStatsFilterSchema>
export type Leaderboard = z.infer<typeof LeaderboardSchema>

export type UpdateSystemSettings = z.infer<typeof UpdateSystemSettingsSchema>

export type Pagination = z.infer<typeof PaginationSchema>
export type Sort = z.infer<typeof SortSchema>