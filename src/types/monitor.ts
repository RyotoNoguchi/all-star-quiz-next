/**
 * Monitor Display Types
 * 
 * Type definitions for monitor display system
 */

// Basic game types for monitor display
export type GamePlayer = {
  userId: string
  userName: string
  status: 'ACTIVE' | 'ELIMINATED' | 'DISCONNECTED' | 'WINNER'
  eliminationOrder?: number
}

export type Question = {
  id: string
  text: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: 'A' | 'B' | 'C' | 'D'
  type: 'NORMAL' | 'FINAL'
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  explanation?: string
  category?: string
  questionNumber?: number
}

export type PlayerResult = {
  userId: string
  selectedAnswer?: string
  isCorrect: boolean
  responseTime: number
}

export type QuestionResult = {
  correctAnswer: 'A' | 'B' | 'C' | 'D'
  results: PlayerResult[]
}