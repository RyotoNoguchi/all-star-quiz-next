/**
 * Elimination Handler for Socket.io
 * 
 * Handles question timing, answer collection, and elimination processing
 */

import type { Server } from 'socket.io'
import { 
  processAnswersAndDetermineElimination,
  createPlayerAnswer
} from '../game/elimination-logic'
import type { 
  QuestionResult, 
  GameOverResult, 
  TimerUpdate 
} from './types'
import type { GameRoom } from './game-rooms'

const QUESTION_TIME_LIMIT = 10 // seconds

/**
 * Start question timer and handle elimination when time expires
 */
export const startQuestionTimer = (
  gameRoom: GameRoom,
  question: {
    id: string
    correctAnswer: string
    explanation?: string
  },
  io: Server,
  isFinalQuestion = false
): void => {
  // Clear any existing timers
  clearQuestionTimers(gameRoom)

  // Reset answers for new question
  gameRoom.activeAnswers.clear()
  gameRoom.currentQuestionId = question.id

  let remainingTime = QUESTION_TIME_LIMIT

  // Start countdown timer
  gameRoom.timerInterval = setInterval(() => {
    remainingTime -= 1
    
    const timerUpdate: TimerUpdate = {
      remainingTime,
      isUrgent: remainingTime <= 3
    }
    
    io.to(gameRoom.code).emit('timer-update', timerUpdate)
    
    if (remainingTime <= 0) {
      // Time's up - process elimination
      processQuestionResults(gameRoom, question, io, isFinalQuestion)
    }
  }, 1000)

  // Main timer that triggers elimination
  gameRoom.questionTimer = setTimeout(() => {
    processQuestionResults(gameRoom, question, io, isFinalQuestion)
  }, QUESTION_TIME_LIMIT * 1000)

  // Send initial timer update
  io.to(gameRoom.code).emit('timer-update', {
    remainingTime: QUESTION_TIME_LIMIT,
    isUrgent: false
  } as TimerUpdate)
}

/**
 * Process answers and determine elimination/winner
 */
const processQuestionResults = (
  gameRoom: GameRoom,
  question: {
    id: string
    correctAnswer: string
    explanation?: string
  },
  io: Server,
  isFinalQuestion = false
): void => {
  // Clear timers
  clearQuestionTimers(gameRoom)

  // Get all answers for this question
  const answers = Array.from(gameRoom.activeAnswers.values())
    .filter(answer => answer.questionId === question.id)

  // Process elimination logic
  const eliminationResult = processAnswersAndDetermineElimination(
    answers,
    question.correctAnswer,
    isFinalQuestion
  )

  // Update eliminated players set
  if (eliminationResult.eliminatedPlayerId) {
    gameRoom.eliminatedPlayers.add(eliminationResult.eliminatedPlayerId)
  }

  // Calculate survivors (active players who are not eliminated)
  const survivors = Array.from(gameRoom.players).filter(
    playerId => !gameRoom.eliminatedPlayers.has(playerId)
  )

  // Prepare question result
  const questionResult: QuestionResult = {
    questionId: question.id,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation || undefined,
    eliminatedPlayerId: eliminationResult.eliminatedPlayerId,
    winnerId: eliminationResult.winnerId,
    correctAnswerers: eliminationResult.correctAnswerers,
    incorrectAnswerers: eliminationResult.incorrectAnswerers,
    survivors,
    isFinalQuestion
  }

  // Broadcast question results
  io.to(gameRoom.code).emit('question-result', questionResult)

  // Send individual elimination notification
  if (eliminationResult.eliminatedPlayerId) {
    io.to(gameRoom.code).emit('player-eliminated', {
      playerId: eliminationResult.eliminatedPlayerId,
      questionId: question.id,
      correctAnswer: question.correctAnswer
    })
  }

  // Check for game end conditions
  if (isFinalQuestion || eliminationResult.winnerId || survivors.length <= 1) {
    handleGameEnd(gameRoom, eliminationResult.winnerId || survivors[0] || null, io)
  }
}

/**
 * Handle game end and send final results
 */
const handleGameEnd = (
  gameRoom: GameRoom,
  winnerId: string | null,
  io: Server
): void => {
  gameRoom.status = 'finished'

  // Create final ranking (simplified for now)
  const finalRanking = [
    {
      playerId: winnerId || 'unknown',
      playerName: `Player ${winnerId || 'unknown'}`, // Would need to get actual name
      rank: 1,
      questionsAnswered: gameRoom.currentQuestion
    }
  ]

  const gameOverResult: GameOverResult = {
    winnerId: winnerId || 'unknown',
    finalRanking
  }

  io.to(gameRoom.code).emit('game-over', gameOverResult)
}

/**
 * Handle answer submission
 */
export const handleAnswerSubmission = (
  gameRoom: GameRoom,
  playerId: string,
  questionId: string,
  selectedAnswer: string,
  responseTime: number
): boolean => {
  // Validate submission
  if (
    gameRoom.currentQuestionId !== questionId ||
    gameRoom.eliminatedPlayers.has(playerId) ||
    gameRoom.activeAnswers.has(playerId)
  ) {
    return false
  }

  // Create and store answer
  const playerAnswer = createPlayerAnswer(
    playerId,
    questionId,
    selectedAnswer,
    responseTime
  )
  
  gameRoom.activeAnswers.set(playerId, playerAnswer)

  // Check if all active players have answered
  const activePlayers = Array.from(gameRoom.players).filter(
    id => !gameRoom.eliminatedPlayers.has(id)
  )
  
  if (gameRoom.activeAnswers.size >= activePlayers.length) {
    // All players answered - this will trigger elimination processing
    // The actual processing happens in the socket handler when it detects
    // all answers are collected via the activeAnswersCount check
    clearQuestionTimers(gameRoom)
  }

  return true
}

/**
 * Clear all timers for a game room
 */
export const clearQuestionTimers = (gameRoom: GameRoom): void => {
  if (gameRoom.questionTimer) {
    clearTimeout(gameRoom.questionTimer)
    gameRoom.questionTimer = null
  }
  
  if (gameRoom.timerInterval) {
    clearInterval(gameRoom.timerInterval)
    gameRoom.timerInterval = null
  }
}

/**
 * Get active players count (non-eliminated)
 */
export const getActivePlayersCount = (gameRoom: GameRoom): number => {
  return Array.from(gameRoom.players).filter(
    playerId => !gameRoom.eliminatedPlayers.has(playerId)
  ).length
}