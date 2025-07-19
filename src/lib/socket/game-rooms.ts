/**
 * Game Room Management Utilities
 * 
 * Centralized management for Socket.io game rooms and player sessions
 */

import type { Server } from 'socket.io'

// Game room management types
export type GameRoomStatus = 'waiting' | 'starting' | 'in_progress' | 'finished'

export type GameRoom = {
  code: string
  adminId: string
  players: Set<string>
  status: GameRoomStatus
  currentQuestion: number
  maxPlayers: number
  // New fields for elimination system
  activeAnswers: Map<string, import('../game/elimination-logic').PlayerAnswer>
  questionTimer: NodeJS.Timeout | null
  timerInterval: NodeJS.Timeout | null
  eliminatedPlayers: Set<string>
  currentQuestionId: string | null
  totalQuestions: number
}

export type PlayerSession = {
  playerId: string
  gameCode: string | null
  socketId: string
  isActive: boolean
}

// Global state management
export const gameRooms = new Map<string, GameRoom>()
export const playerSessions = new Map<string, PlayerSession>()

// Game room management functions
export const createGameRoom = (code: string, adminId: string, maxPlayers: number = 20): { success: boolean; gameCode: string } => {
  gameRooms.set(code, {
    code,
    adminId,
    players: new Set(),
    status: 'waiting',
    currentQuestion: 0,
    maxPlayers,
    // Initialize new elimination system fields
    activeAnswers: new Map(),
    questionTimer: null,
    timerInterval: null,
    eliminatedPlayers: new Set(),
    currentQuestionId: null,
    totalQuestions: 10
  })
  
  return { success: true, gameCode: code }
}

export const getGameRoom = (code: string): GameRoom | undefined => {
  return gameRooms.get(code)
}

export const deleteGameRoom = (code: string, io?: Server): { success: boolean; error?: string } => {
  const gameRoom = gameRooms.get(code)
  if (gameRoom) {
    // Notify all players that the game room is being deleted
    io?.to(code).emit('game-room-deleted', {
      message: 'Game room has been closed by the administrator'
    })
    
    // Remove all players from the room
    gameRoom.players.clear()
    gameRooms.delete(code)
    
    return { success: true }
  }
  
  return { success: false, error: 'Game room not found' }
}

export const getAllActiveRooms = (): GameRoom[] => {
  return Array.from(gameRooms.values())
}

export const getActivePlayersCount = (): number => {
  return playerSessions.size
}

export const getPlayerSession = (socketId: string): PlayerSession | undefined => {
  return playerSessions.get(socketId)
}

export const updatePlayerSession = (socketId: string, session: PlayerSession): void => {
  playerSessions.set(socketId, session)
}

export const removePlayerSession = (socketId: string): void => {
  playerSessions.delete(socketId)
}