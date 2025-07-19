/**
 * Socket event and game data types
 * Shared between client and context
 */

export type GameStatus = 'waiting' | 'starting' | 'in_progress' | 'finished'

export type Question = {
  id: string
  text: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: string
  explanation?: string
}

export type Player = {
  id: string
  name: string
  score?: number
  rank?: number
  isConnected?: boolean
}

export type AdminPayload = 
  | { type: 'start-game'; countdown?: number }
  | { type: 'next-question'; questionId?: string }
  | { type: 'end-game'; reason?: string }
  | { type: 'pause-game'; reason?: string }
  | Record<string, unknown>

export type JoinedGameData = {
  gameCode: string
  playerCount: number
  maxPlayers: number
  status: GameStatus
}

export type PlayerJoinedData = {
  playerId: string
  playerName: string
  playerCount: number
  maxPlayers: number
}

export type PlayerLeftData = {
  playerId: string
  playerCount: number
}