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

// New types for elimination system
export type QuestionResult = {
  questionId: string
  correctAnswer: string
  explanation?: string | undefined
  eliminatedPlayerId: string | null
  winnerId: string | null
  correctAnswerers: string[]
  incorrectAnswerers: string[]
  survivors: string[]
  isFinalQuestion: boolean
}

export type GameOverResult = {
  winnerId: string
  finalRanking: Array<{
    playerId: string
    playerName: string
    rank: number
    questionsAnswered: number
  }>
}

export type TimerUpdate = {
  remainingTime: number
  isUrgent: boolean
}

export type PlayerAnswerSubmission = {
  gameCode: string
  playerId: string
  questionId: string
  selectedAnswer: string
  responseTime: number
}