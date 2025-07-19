/**
 * Elimination Logic for All Star Quiz
 * 
 * Core game logic for processing answers and determining eliminated players
 * Implements the "slowest correct responder is eliminated" rule
 */

export type PlayerAnswer = {
  playerId: string
  questionId: string
  selectedAnswer: string
  responseTime: number
  serverTimestamp: Date
  isCorrect?: boolean
}

export type EliminationResult = {
  eliminatedPlayerId: string | null
  winnerId: string | null
  correctAnswerers: string[]
  incorrectAnswerers: string[]
  allAnswers: PlayerAnswer[]
}

/**
 * Process all answers and determine elimination based on All Star Quiz rules
 * - Normal questions: slowest correct answerer is eliminated
 * - Final question: fastest correct answerer wins
 */
export const processAnswersAndDetermineElimination = (
  answers: PlayerAnswer[],
  correctAnswer: string,
  isFinalQuestion = false
): EliminationResult => {
  // Mark correct/incorrect answers
  const processedAnswers = answers.map(answer => ({
    ...answer,
    isCorrect: answer.selectedAnswer === correctAnswer
  }))

  // Separate correct and incorrect answerers
  const correctAnswerers = processedAnswers
    .filter(answer => answer.isCorrect)
    .sort((a, b) => a.serverTimestamp.getTime() - b.serverTimestamp.getTime())

  const incorrectAnswerers = processedAnswers
    .filter(answer => !answer.isCorrect)

  let eliminatedPlayerId: string | null = null
  let winnerId: string | null = null

  if (isFinalQuestion) {
    // Final question: fastest correct answerer wins
    if (correctAnswerers.length > 0) {
      winnerId = correctAnswerers[0]?.playerId || null
    }
  } else {
    // Normal question: slowest correct answerer is eliminated
    if (correctAnswerers.length > 1) {
      // Multiple correct answers - eliminate the slowest
      eliminatedPlayerId = correctAnswerers[correctAnswerers.length - 1]?.playerId || null
    }
    // If only 0 or 1 correct answer, no elimination occurs
  }

  return {
    eliminatedPlayerId,
    winnerId,
    correctAnswerers: correctAnswerers.map(a => a.playerId),
    incorrectAnswerers: incorrectAnswerers.map(a => a.playerId),
    allAnswers: processedAnswers
  }
}

/**
 * Validate if a player can submit an answer
 */
export const canPlayerSubmitAnswer = (
  playerId: string,
  questionId: string,
  existingAnswers: PlayerAnswer[]
): boolean => {
  // Check if player already answered this question
  return !existingAnswers.some(
    answer => answer.playerId === playerId && answer.questionId === questionId
  )
}

/**
 * Create a standardized player answer object
 */
export const createPlayerAnswer = (
  playerId: string,
  questionId: string,
  selectedAnswer: string,
  responseTime: number
): PlayerAnswer => ({
  playerId,
  questionId,
  selectedAnswer,
  responseTime,
  serverTimestamp: new Date()
})