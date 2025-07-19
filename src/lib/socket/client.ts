/**
 * Socket.io Client Configuration
 * 
 * Manages WebSocket connections for real-time All Star Quiz functionality
 */

import { io, Socket } from 'socket.io-client'
import type { Question, Player, AdminPayload } from './types'

// Socket.io client instance
let socket: Socket | null = null

// Socket connection configuration
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002'

/**
 * Initialize Socket.io connection
 */
export const initializeSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000
    })

    // Connection event handlers
    socket.on('connect', () => {
      console.log('🔌 Connected to Socket.io server:', socket?.id)
    })

    socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from Socket.io server:', reason)
    })

    socket.on('connect_error', (error) => {
      console.error('🔌 Socket.io connection error:', error)
    })

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔌 Reconnected to Socket.io server, attempt:', attemptNumber)
    })

    socket.on('reconnect_error', (error) => {
      console.error('🔌 Socket.io reconnection error:', error)
    })
  }

  return socket
}

/**
 * Get the current socket instance
 */
export const getSocket = (): Socket | null => {
  return socket
}

/**
 * Connect to Socket.io server
 */
export const connectSocket = (): void => {
  if (socket && !socket.connected) {
    socket.connect()
  }
}

/**
 * Disconnect from Socket.io server
 */
export const disconnectSocket = (): void => {
  if (socket && socket.connected) {
    socket.disconnect()
  }
}

/**
 * Clean up socket instance
 */
export const cleanupSocket = (): void => {
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }
}


// Socket event types for type safety
export interface GameEvents {
  // Player events
  'join-game': (data: { gameCode: string; playerId: string; playerName: string }) => void
  'leave-game': (data: { gameCode: string; playerId: string }) => void
  'submit-answer': (data: { 
    gameCode: string
    playerId: string
    questionId: string
    selectedAnswer: string
    responseTime: number
  }) => void

  // Admin events
  'admin-action': (data: {
    action: 'start-game' | 'next-question' | 'end-game' | 'pause-game'
    gameCode: string
    adminId: string
    payload?: AdminPayload
  }) => void

  // Server responses
  'joined-game': (data: {
    gameCode: string
    playerCount: number
    maxPlayers: number
    status: string
  }) => void

  'player-joined': (data: {
    playerId: string
    playerName: string
    playerCount: number
    maxPlayers: number
  }) => void

  'player-left': (data: {
    playerId: string
    playerCount: number
  }) => void

  'player-disconnected': (data: {
    playerId: string
    playerCount: number
  }) => void

  'game-starting': (data: {
    countdown: number
    message: string
  }) => void

  'game-started': (data: {
    currentQuestion: number
    totalQuestions: number
  }) => void

  'next-question': (data: {
    questionNumber: number
    question: Question
    timeLimit: number
  }) => void

  'answer-submitted': (data: {
    playerId: string
    questionId: string
    selectedAnswer: string
    responseTime: number
    timestamp: string
  }) => void

  'game-ended': (data: {
    winner: Player | null
    finalScores: Player[]
  }) => void

  'game-paused': (data: {
    reason: string
  }) => void

  'game-room-deleted': (data: {
    message: string
  }) => void

  'error': (data: { message: string }) => void
}

/**
 * Type-safe socket event emitter
 */
export const emitSocketEvent = <K extends keyof GameEvents>(
  event: K,
  data: Parameters<GameEvents[K]>[0]
): void => {
  if (socket && socket.connected) {
    socket.emit(event, data)
  } else {
    console.warn('Socket not connected, cannot emit event:', event)
  }
}

/**
 * Type-safe socket event listener
 */
export const onSocketEvent = <K extends keyof GameEvents>(
  event: K,
  listener: GameEvents[K]
): void => {
  if (socket) {
    socket.on(event as string, listener as (...args: unknown[]) => void)
  }
}

/**
 * Remove socket event listener
 */
export const offSocketEvent = <K extends keyof GameEvents>(
  event: K,
  listener?: GameEvents[K]
): void => {
  if (socket) {
    if (listener) {
      socket.off(event as string, listener as (...args: unknown[]) => void)
    } else {
      socket.removeAllListeners(event as string)
    }
  }
}