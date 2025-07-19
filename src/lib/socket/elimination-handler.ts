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

  // Store current question data for elimination processing
  gameRoom.currentQuestionData = {
    id: question.id,
    correctAnswer: question.correctAnswer,
    ...(question.explanation && { explanation: question.explanation }),
    isFinalQuestion
  }

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
      processQuestionResults(gameRoom, question, io, isFinalQuestion).catch(error => {
        console.error('Error processing question results:', error)
      })
    }
  }, 1000)

  // Main timer that triggers elimination
  gameRoom.questionTimer = setTimeout(() => {
    processQuestionResults(gameRoom, question, io, isFinalQuestion).catch(error => {
      console.error('Error processing question results:', error)
    })
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
export const processQuestionResults = async (
  gameRoom: GameRoom,
  question: {
    id: string
    correctAnswer: string
    explanation?: string
  },
  io: Server,
  isFinalQuestion = false
): Promise<void> => {
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

  // TODO: Save all answers to database
  // Note: This requires implementing full game session management with proper
  // gameId, participantId, and gameQuestionId relationships
  // For now, we'll skip database persistence and focus on real-time game logic
  try {
    if (eliminationResult.allAnswers.length > 0) {
      console.log(`📊 Question results: ${eliminationResult.allAnswers.length} answers processed`)
      console.log(`✅ Correct: ${eliminationResult.correctAnswerers.length}, ❌ Incorrect: ${eliminationResult.incorrectAnswerers.length}`)
      if (eliminationResult.eliminatedPlayerId) {
        console.log(`🚫 Eliminated: ${eliminationResult.eliminatedPlayerId}`)
      }
      if (eliminationResult.winnerId) {
        console.log(`🏆 Winner: ${eliminationResult.winnerId}`)
      }

      // Database save will be implemented when game session management is complete
      // await prisma.playerAnswer.createMany({
      //   data: eliminationResult.allAnswers.map(answer => ({
      //     gameId: gameRoom.gameSessionId, // Required field not yet available
      //     participantId: answer.playerId, // Need to map player ID to participant ID
      //     questionId: answer.questionId,
      //     gameQuestionId: answer.gameQuestionId, // Required field not yet available
      //     selectedAnswer: answer.selectedAnswer,
      //     responseTime: answer.responseTime,
      //     isCorrect: answer.isCorrect || false,
      //     isTimeout: answer.selectedAnswer === '',
      //     answeredAt: answer.serverTimestamp
      //   })),
      //   skipDuplicates: true
      // })
    }
  } catch (error) {
    console.error('Error processing question results:', error)
    // Continue with game logic even if processing fails
  }

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
  const activePlayersCount = getActivePlayersCount(gameRoom)

  if (gameRoom.activeAnswers.size >= activePlayersCount) {
    // All active players have answered - trigger immediate processing
    clearQuestionTimers(gameRoom)

    // We need to trigger processQuestionResults here, but we need the question data
    // This will be handled by the socket event handler that calls this function
    // by checking if all answers are collected after this function returns
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
