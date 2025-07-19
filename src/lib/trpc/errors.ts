import { TRPCError } from '@trpc/server'
import { type TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc'

/**
 * Standardized error codes for the All Star Quiz application
 */
export const APP_ERROR_CODES = {
  // User-related errors
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Game-related errors
  GAME_NOT_FOUND: 'GAME_NOT_FOUND',
  GAME_FULL: 'GAME_FULL',
  GAME_ALREADY_STARTED: 'GAME_ALREADY_STARTED',
  GAME_NOT_STARTED: 'GAME_NOT_STARTED',
  GAME_ALREADY_ENDED: 'GAME_ALREADY_ENDED',
  INVALID_GAME_CODE: 'INVALID_GAME_CODE',
  INSUFFICIENT_PLAYERS: 'INSUFFICIENT_PLAYERS',
  
  // Question-related errors
  QUESTION_NOT_FOUND: 'QUESTION_NOT_FOUND',
  INSUFFICIENT_QUESTIONS: 'INSUFFICIENT_QUESTIONS',
  INVALID_ANSWER: 'INVALID_ANSWER',
  ANSWER_ALREADY_SUBMITTED: 'ANSWER_ALREADY_SUBMITTED',
  ANSWER_TIME_EXPIRED: 'ANSWER_TIME_EXPIRED',
  
  // Participant-related errors
  NOT_PARTICIPANT: 'NOT_PARTICIPANT',
  ALREADY_PARTICIPANT: 'ALREADY_PARTICIPANT',
  PARTICIPANT_ELIMINATED: 'PARTICIPANT_ELIMINATED',
  PARTICIPANT_DISCONNECTED: 'PARTICIPANT_DISCONNECTED',
  
  // Permission-related errors
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  NOT_GAME_ADMIN: 'NOT_GAME_ADMIN',
  CANNOT_MODIFY_ACTIVE_GAME: 'CANNOT_MODIFY_ACTIVE_GAME',
  
  // System-related errors
  SYSTEM_MAINTENANCE: 'SYSTEM_MAINTENANCE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const

export type AppErrorCode = typeof APP_ERROR_CODES[keyof typeof APP_ERROR_CODES]

/**
 * Error message mappings for user-friendly display
 */
export const ERROR_MESSAGES: Record<AppErrorCode, string> = {
  // User-related errors
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'A user with this email already exists',
  INVALID_CREDENTIALS: 'Invalid email or password',
  
  // Game-related errors
  GAME_NOT_FOUND: 'Game not found',
  GAME_FULL: 'This game is full and cannot accept more players',
  GAME_ALREADY_STARTED: 'Cannot join a game that has already started',
  GAME_NOT_STARTED: 'This action requires the game to be in progress',
  GAME_ALREADY_ENDED: 'This game has already ended',
  INVALID_GAME_CODE: 'Invalid game code',
  INSUFFICIENT_PLAYERS: 'Not enough players to start the game',
  
  // Question-related errors
  QUESTION_NOT_FOUND: 'Question not found',
  INSUFFICIENT_QUESTIONS: 'Not enough questions available for this game',
  INVALID_ANSWER: 'Invalid answer provided',
  ANSWER_ALREADY_SUBMITTED: 'You have already answered this question',
  ANSWER_TIME_EXPIRED: 'Time has expired for this question',
  
  // Participant-related errors
  NOT_PARTICIPANT: 'You are not a participant in this game',
  ALREADY_PARTICIPANT: 'You are already a participant in this game',
  PARTICIPANT_ELIMINATED: 'You have been eliminated from this game',
  PARTICIPANT_DISCONNECTED: 'Player is disconnected from the game',
  
  // Permission-related errors
  INSUFFICIENT_PERMISSIONS: 'You do not have permission to perform this action',
  NOT_GAME_ADMIN: 'You are not the administrator of this game',
  CANNOT_MODIFY_ACTIVE_GAME: 'Cannot modify a game that is currently active',
  
  // System-related errors
  SYSTEM_MAINTENANCE: 'The system is currently under maintenance',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later',
  DATABASE_ERROR: 'A database error occurred. Please try again',
}

/**
 * Maps application error codes to tRPC error codes
 */
export const TRPC_ERROR_CODE_MAP: Record<AppErrorCode, TRPC_ERROR_CODE_KEY> = {
  // User-related errors
  USER_NOT_FOUND: 'NOT_FOUND',
  USER_ALREADY_EXISTS: 'CONFLICT',
  INVALID_CREDENTIALS: 'UNAUTHORIZED',
  
  // Game-related errors
  GAME_NOT_FOUND: 'NOT_FOUND',
  GAME_FULL: 'CONFLICT',
  GAME_ALREADY_STARTED: 'CONFLICT',
  GAME_NOT_STARTED: 'BAD_REQUEST',
  GAME_ALREADY_ENDED: 'CONFLICT',
  INVALID_GAME_CODE: 'NOT_FOUND',
  INSUFFICIENT_PLAYERS: 'BAD_REQUEST',
  
  // Question-related errors
  QUESTION_NOT_FOUND: 'NOT_FOUND',
  INSUFFICIENT_QUESTIONS: 'BAD_REQUEST',
  INVALID_ANSWER: 'BAD_REQUEST',
  ANSWER_ALREADY_SUBMITTED: 'CONFLICT',
  ANSWER_TIME_EXPIRED: 'BAD_REQUEST',
  
  // Participant-related errors
  NOT_PARTICIPANT: 'FORBIDDEN',
  ALREADY_PARTICIPANT: 'CONFLICT',
  PARTICIPANT_ELIMINATED: 'FORBIDDEN',
  PARTICIPANT_DISCONNECTED: 'CONFLICT',
  
  // Permission-related errors
  INSUFFICIENT_PERMISSIONS: 'FORBIDDEN',
  NOT_GAME_ADMIN: 'FORBIDDEN',
  CANNOT_MODIFY_ACTIVE_GAME: 'CONFLICT',
  
  // System-related errors
  SYSTEM_MAINTENANCE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'TOO_MANY_REQUESTS',
  DATABASE_ERROR: 'INTERNAL_SERVER_ERROR',
}

/**
 * Creates a standardized tRPC error with app-specific error code
 */
export const createAppError = (
  appErrorCode: AppErrorCode,
  customMessage?: string,
  cause?: unknown
): TRPCError => {
  const message = customMessage || ERROR_MESSAGES[appErrorCode]
  const trpcCode = TRPC_ERROR_CODE_MAP[appErrorCode]
  
  const error = new TRPCError({
    code: trpcCode,
    message,
    cause,
  })
  
  // Add custom data to the error
  ;(error as any).data = {
    appErrorCode,
  }
  
  return error
}

/**
 * Checks if an error is an app-specific error
 */
export const isAppError = (error: unknown): error is TRPCError & { data: { appErrorCode: AppErrorCode } } => {
  return (
    error instanceof TRPCError &&
    typeof (error as any).data === 'object' &&
    (error as any).data !== null &&
    'appErrorCode' in (error as any).data &&
    Object.values(APP_ERROR_CODES).includes((error as any).data.appErrorCode as AppErrorCode)
  )
}

/**
 * Gets the user-friendly message for an error
 */
export const getErrorMessage = (error: unknown): string => {
  if (isAppError(error)) {
    return ERROR_MESSAGES[(error as any).data.appErrorCode]
  }
  
  if (error instanceof TRPCError) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'An unexpected error occurred'
}

/**
 * Logs errors in a standardized format
 */
export const logError = (error: unknown, context?: string) => {
  const timestamp = new Date().toISOString()
  const contextInfo = context ? `[${context}]` : ''
  
  if (isAppError(error)) {
    console.error(
      `${timestamp} ${contextInfo} App Error:`,
      {
        appErrorCode: (error as any).data.appErrorCode,
        trpcCode: error.code,
        message: error.message,
        data: (error as any).data,
        cause: error.cause,
      }
    )
  } else if (error instanceof TRPCError) {
    console.error(
      `${timestamp} ${contextInfo} tRPC Error:`,
      {
        code: error.code,
        message: error.message,
        data: error.data,
        cause: error.cause,
      }
    )
  } else if (error instanceof Error) {
    console.error(
      `${timestamp} ${contextInfo} Error:`,
      {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    )
  } else {
    console.error(
      `${timestamp} ${contextInfo} Unknown Error:`,
      error
    )
  }
}

/**
 * Error handling middleware for consistent error processing
 */
export const errorHandler = (error: unknown, context?: string): never => {
  logError(error, context)
  
  if (isAppError(error) || error instanceof TRPCError) {
    throw error
  }
  
  // Convert unknown errors to internal server errors
  throw createAppError('DATABASE_ERROR', 'An unexpected error occurred')
}