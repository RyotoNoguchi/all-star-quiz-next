/**
 * Unit Tests for Elimination Logic
 *
 * Comprehensive test suite for All Star Quiz elimination logic
 * Covers all game scenarios: normal questions, final questions, edge cases
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  processAnswersAndDetermineElimination,
  canPlayerSubmitAnswer,
  createPlayerAnswer,
  type PlayerAnswer,
} from '../elimination-logic'

describe('Elimination Logic', () => {
  let mockDate: Date

  beforeEach(() => {
    // Mock consistent timestamps for predictable testing
    mockDate = new Date('2024-01-01T12:00:00Z')
    vi.useFakeTimers()
    vi.setSystemTime(mockDate)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('processAnswersAndDetermineElimination', () => {
    describe('Normal Questions (isFinalQuestion = false)', () => {
      it('should eliminate slowest correct answerer when multiple correct answers', () => {
        // Arrange
        const answers: PlayerAnswer[] = [
          {
            playerId: 'player1',
            questionId: 'q1',
            selectedAnswer: 'A',
            responseTime: 5.2,
            serverTimestamp: new Date('2024-01-01T12:00:01Z') // Fastest
          },
          {
            playerId: 'player2',
            questionId: 'q1',
            selectedAnswer: 'A',
            responseTime: 7.8,
            serverTimestamp: new Date('2024-01-01T12:00:03Z') // Slowest - should be eliminated
          },
          {
            playerId: 'player3',
            questionId: 'q1',
            selectedAnswer: 'A',
            responseTime: 6.1,
            serverTimestamp: new Date('2024-01-01T12:00:02Z') // Middle
          }
        ]

        // Act
        const result = processAnswersAndDetermineElimination(answers, 'A', false)

        // Assert
        expect(result.eliminatedPlayerId).toBe('player2')
        expect(result.winnerId).toBeNull()
        expect(result.correctAnswerers).toEqual(['player1', 'player3', 'player2'])
        expect(result.incorrectAnswerers).toEqual([])
        expect(result.allAnswers).toHaveLength(3)
      })

      it('should not eliminate anyone when only one correct answer', () => {
        // Arrange
        const answers: PlayerAnswer[] = [
          {
            playerId: 'player1',
            questionId: 'q1',
            selectedAnswer: 'A',
            responseTime: 5.0,
            serverTimestamp: new Date('2024-01-01T12:00:01Z')
          },
          {
            playerId: 'player2',
            questionId: 'q1',
            selectedAnswer: 'B',
            responseTime: 3.0,
            serverTimestamp: new Date('2024-01-01T12:00:02Z')
          }
        ]

        // Act
        const result = processAnswersAndDetermineElimination(answers, 'A', false)

        // Assert
        expect(result.eliminatedPlayerId).toBeNull()
        expect(result.winnerId).toBeNull()
        expect(result.correctAnswerers).toEqual(['player1'])
        expect(result.incorrectAnswerers).toEqual(['player2'])
      })

      it('should not eliminate anyone when no correct answers', () => {
        // Arrange
        const answers: PlayerAnswer[] = [
          {
            playerId: 'player1',
            questionId: 'q1',
            selectedAnswer: 'B',
            responseTime: 5.0,
            serverTimestamp: new Date('2024-01-01T12:00:01Z')
          },
          {
            playerId: 'player2',
            questionId: 'q1',
            selectedAnswer: 'C',
            responseTime: 3.0,
            serverTimestamp: new Date('2024-01-01T12:00:02Z')
          }
        ]

        // Act
        const result = processAnswersAndDetermineElimination(answers, 'A', false)

        // Assert
        expect(result.eliminatedPlayerId).toBeNull()
        expect(result.winnerId).toBeNull()
        expect(result.correctAnswerers).toEqual([])
        expect(result.incorrectAnswerers).toEqual(['player1', 'player2'])
      })

      it('should handle empty answers array', () => {
        // Arrange
        const answers: PlayerAnswer[] = []

        // Act
        const result = processAnswersAndDetermineElimination(answers, 'A', false)

        // Assert
        expect(result.eliminatedPlayerId).toBeNull()
        expect(result.winnerId).toBeNull()
        expect(result.correctAnswerers).toEqual([])
        expect(result.incorrectAnswerers).toEqual([])
        expect(result.allAnswers).toEqual([])
      })
    })

    describe('Final Questions (isFinalQuestion = true)', () => {
      it('should declare winner as fastest correct answerer', () => {
        // Arrange
        const answers: PlayerAnswer[] = [
          {
            playerId: 'player1',
            questionId: 'q1',
            selectedAnswer: 'A',
            responseTime: 7.8,
            serverTimestamp: new Date('2024-01-01T12:00:03Z') // Slowest correct
          },
          {
            playerId: 'player2',
            questionId: 'q1',
            selectedAnswer: 'A',
            responseTime: 5.2,
            serverTimestamp: new Date('2024-01-01T12:00:01Z') // Fastest correct - should win
          },
          {
            playerId: 'player3',
            questionId: 'q1',
            selectedAnswer: 'B',
            responseTime: 2.0,
            serverTimestamp: new Date('2024-01-01T12:00:00Z') // Fastest incorrect
          }
        ]

        // Act
        const result = processAnswersAndDetermineElimination(answers, 'A', true)

        // Assert
        expect(result.winnerId).toBe('player2')
        expect(result.eliminatedPlayerId).toBeNull()
        expect(result.correctAnswerers).toEqual(['player2', 'player1'])
        expect(result.incorrectAnswerers).toEqual(['player3'])
      })

      it('should handle no winner when no correct answers in final question', () => {
        // Arrange
        const answers: PlayerAnswer[] = [
          {
            playerId: 'player1',
            questionId: 'q1',
            selectedAnswer: 'B',
            responseTime: 5.0,
            serverTimestamp: new Date('2024-01-01T12:00:01Z')
          },
          {
            playerId: 'player2',
            questionId: 'q1',
            selectedAnswer: 'C',
            responseTime: 3.0,
            serverTimestamp: new Date('2024-01-01T12:00:02Z')
          }
        ]

        // Act
        const result = processAnswersAndDetermineElimination(answers, 'A', true)

        // Assert
        expect(result.winnerId).toBeNull()
        expect(result.eliminatedPlayerId).toBeNull()
        expect(result.correctAnswerers).toEqual([])
        expect(result.incorrectAnswerers).toEqual(['player1', 'player2'])
      })

      it('should handle single correct answer in final question', () => {
        // Arrange
        const answers: PlayerAnswer[] = [
          {
            playerId: 'player1',
            questionId: 'q1',
            selectedAnswer: 'A',
            responseTime: 5.0,
            serverTimestamp: new Date('2024-01-01T12:00:01Z')
          }
        ]

        // Act
        const result = processAnswersAndDetermineElimination(answers, 'A', true)

        // Assert
        expect(result.winnerId).toBe('player1')
        expect(result.eliminatedPlayerId).toBeNull()
        expect(result.correctAnswerers).toEqual(['player1'])
        expect(result.incorrectAnswerers).toEqual([])
      })
    })

    describe('Edge Cases and Validation', () => {
      it('should handle identical timestamps correctly', () => {
        // Arrange
        const sameTimestamp = new Date('2024-01-01T12:00:01Z')
        const answers: PlayerAnswer[] = [
          {
            playerId: 'player1',
            questionId: 'q1',
            selectedAnswer: 'A',
            responseTime: 5.0,
            serverTimestamp: sameTimestamp
          },
          {
            playerId: 'player2',
            questionId: 'q1',
            selectedAnswer: 'A',
            responseTime: 5.0,
            serverTimestamp: sameTimestamp
          }
        ]

        // Act
        const result = processAnswersAndDetermineElimination(answers, 'A', false)

        // Assert
        expect(result.eliminatedPlayerId).toBe('player2') // Last in array when timestamps equal
        expect(result.correctAnswerers).toHaveLength(2)
      })

      it('should preserve original answer data integrity', () => {
        // Arrange
        const originalAnswers: PlayerAnswer[] = [
          {
            playerId: 'player1',
            questionId: 'q1',
            selectedAnswer: 'A',
            responseTime: 5.0,
            serverTimestamp: new Date('2024-01-01T12:00:01Z')
          }
        ]

        // Act
        const result = processAnswersAndDetermineElimination(originalAnswers, 'A', false)

        // Assert
        expect(originalAnswers[0]?.isCorrect).toBeUndefined() // Original should not be mutated
        expect(result.allAnswers[0]?.isCorrect).toBe(true) // Result should have isCorrect
      })

      it('should handle special characters in player IDs and answers', () => {
        // Arrange
        const answers: PlayerAnswer[] = [
          {
            playerId: 'player-1_test@domain.com',
            questionId: 'question_123',
            selectedAnswer: 'A',
            responseTime: 5.0,
            serverTimestamp: new Date('2024-01-01T12:00:01Z')
          }
        ]

        // Act
        const result = processAnswersAndDetermineElimination(answers, 'A', false)

        // Assert
        expect(result.correctAnswerers).toEqual(['player-1_test@domain.com'])
        expect(result.allAnswers[0]?.playerId).toBe('player-1_test@domain.com')
      })
    })

    describe('Type Safety and Error Handling', () => {
      it('should handle malformed answer objects gracefully', () => {
        // Arrange
        const answers: PlayerAnswer[] = [
          {
            playerId: '',
            questionId: '',
            selectedAnswer: '',
            responseTime: 0,
            serverTimestamp: new Date('2024-01-01T12:00:01Z')
          }
        ]

        // Act & Assert
        expect(() => processAnswersAndDetermineElimination(answers, 'A', false)).not.toThrow()
      })

      it('should return correct type structure', () => {
        // Arrange
        const answers: PlayerAnswer[] = []

        // Act
        const result = processAnswersAndDetermineElimination(answers, 'A', false)

        // Assert - Type structure validation
        expect(result).toHaveProperty('eliminatedPlayerId')
        expect(result).toHaveProperty('winnerId')
        expect(result).toHaveProperty('correctAnswerers')
        expect(result).toHaveProperty('incorrectAnswerers')
        expect(result).toHaveProperty('allAnswers')
        expect(Array.isArray(result.correctAnswerers)).toBe(true)
        expect(Array.isArray(result.incorrectAnswerers)).toBe(true)
        expect(Array.isArray(result.allAnswers)).toBe(true)
      })
    })
  })

  describe('canPlayerSubmitAnswer', () => {
    const questionId = 'q1'
    const playerId = 'player1'

    it('should return true when player has not answered this question', () => {
      // Arrange
      const existingAnswers: PlayerAnswer[] = [
        {
          playerId: 'player2',
          questionId: 'q1',
          selectedAnswer: 'A',
          responseTime: 5.0,
          serverTimestamp: new Date()
        }
      ]

      // Act
      const canSubmit = canPlayerSubmitAnswer(playerId, questionId, existingAnswers)

      // Assert
      expect(canSubmit).toBe(true)
    })

    it('should return false when player has already answered this question', () => {
      // Arrange
      const existingAnswers: PlayerAnswer[] = [
        {
          playerId: 'player1',
          questionId: 'q1',
          selectedAnswer: 'A',
          responseTime: 5.0,
          serverTimestamp: new Date()
        }
      ]

      // Act
      const canSubmit = canPlayerSubmitAnswer(playerId, questionId, existingAnswers)

      // Assert
      expect(canSubmit).toBe(false)
    })

    it('should return true when player answered different question', () => {
      // Arrange
      const existingAnswers: PlayerAnswer[] = [
        {
          playerId: 'player1',
          questionId: 'q2', // Different question
          selectedAnswer: 'A',
          responseTime: 5.0,
          serverTimestamp: new Date()
        }
      ]

      // Act
      const canSubmit = canPlayerSubmitAnswer(playerId, questionId, existingAnswers)

      // Assert
      expect(canSubmit).toBe(true)
    })

    it('should handle empty answers array', () => {
      // Arrange
      const existingAnswers: PlayerAnswer[] = []

      // Act
      const canSubmit = canPlayerSubmitAnswer(playerId, questionId, existingAnswers)

      // Assert
      expect(canSubmit).toBe(true)
    })

    it('should handle case-sensitive player ID matching', () => {
      // Arrange
      const existingAnswers: PlayerAnswer[] = [
        {
          playerId: 'Player1', // Different case
          questionId: 'q1',
          selectedAnswer: 'A',
          responseTime: 5.0,
          serverTimestamp: new Date()
        }
      ]

      // Act
      const canSubmit = canPlayerSubmitAnswer('player1', questionId, existingAnswers)

      // Assert
      expect(canSubmit).toBe(true) // Should be case-sensitive
    })
  })

  describe('createPlayerAnswer', () => {
    it('should create valid PlayerAnswer object with current timestamp', () => {
      // Arrange
      const playerId = 'player1'
      const questionId = 'q1'
      const selectedAnswer = 'A'
      const responseTime = 5.5

      // Act
      const playerAnswer = createPlayerAnswer(playerId, questionId, selectedAnswer, responseTime)

      // Assert
      expect(playerAnswer.playerId).toBe(playerId)
      expect(playerAnswer.questionId).toBe(questionId)
      expect(playerAnswer.selectedAnswer).toBe(selectedAnswer)
      expect(playerAnswer.responseTime).toBe(responseTime)
      expect(playerAnswer.serverTimestamp).toBeInstanceOf(Date)
      expect(playerAnswer.serverTimestamp.getTime()).toBe(mockDate.getTime())
    })

    it('should handle zero response time', () => {
      // Act
      const playerAnswer = createPlayerAnswer('player1', 'q1', 'A', 0)

      // Assert
      expect(playerAnswer.responseTime).toBe(0)
    })

    it('should handle negative response time', () => {
      // Act
      const playerAnswer = createPlayerAnswer('player1', 'q1', 'A', -1)

      // Assert
      expect(playerAnswer.responseTime).toBe(-1)
    })

    it('should handle empty string values', () => {
      // Act
      const playerAnswer = createPlayerAnswer('', '', '', 5.0)

      // Assert
      expect(playerAnswer.playerId).toBe('')
      expect(playerAnswer.questionId).toBe('')
      expect(playerAnswer.selectedAnswer).toBe('')
    })

    it('should create new timestamp for each call', () => {
      // Arrange
      vi.setSystemTime(new Date('2024-01-01T12:00:00Z'))
      const answer1 = createPlayerAnswer('p1', 'q1', 'A', 5.0)

      vi.setSystemTime(new Date('2024-01-01T12:00:01Z'))
      const answer2 = createPlayerAnswer('p2', 'q1', 'B', 6.0)

      // Assert
      expect(answer1.serverTimestamp.getTime()).not.toBe(answer2.serverTimestamp.getTime())
      expect(answer2.serverTimestamp.getTime() - answer1.serverTimestamp.getTime()).toBe(1000)
    })

    it('should not have isCorrect property initially', () => {
      // Act
      const playerAnswer = createPlayerAnswer('player1', 'q1', 'A', 5.0)

      // Assert
      expect(playerAnswer.isCorrect).toBeUndefined()
    })
  })

  describe('Integration Tests', () => {
    it('should work end-to-end for typical game scenario', () => {
      // Arrange - Simulate a complete question round
      const questionId = 'q1'
      const correctAnswer = 'A'

      // Players submit answers at different times
      const answers: PlayerAnswer[] = []

      // Alice answers correctly first
      answers.push(createPlayerAnswer('alice', questionId, 'A', 4.2))
      vi.advanceTimersByTime(1000)

      // Bob answers incorrectly
      answers.push(createPlayerAnswer('bob', questionId, 'C', 3.8))
      vi.advanceTimersByTime(1000)

      // Charlie answers correctly but slowly
      answers.push(createPlayerAnswer('charlie', questionId, 'A', 8.1))
      vi.advanceTimersByTime(1000)

      // Diana answers correctly at medium speed
      answers.push(createPlayerAnswer('diana', questionId, 'A', 6.5))

      // Act
      const result = processAnswersAndDetermineElimination(answers, correctAnswer, false)

      // Assert - Diana should be eliminated (slowest correct based on timestamp)
      // Note: Sorting is by serverTimestamp, not responseTime
      expect(result.eliminatedPlayerId).toBe('diana')
      expect(result.correctAnswerers).toEqual(['alice', 'charlie', 'diana'])
      expect(result.incorrectAnswerers).toEqual(['bob'])
      expect(result.winnerId).toBeNull()
    })

    it('should validate player submission rights before processing', () => {
      // Arrange
      const existingAnswers: PlayerAnswer[] = [
        createPlayerAnswer('alice', 'q1', 'A', 5.0)
      ]

      // Act & Assert
      expect(canPlayerSubmitAnswer('alice', 'q1', existingAnswers)).toBe(false)
      expect(canPlayerSubmitAnswer('bob', 'q1', existingAnswers)).toBe(true)
      expect(canPlayerSubmitAnswer('alice', 'q2', existingAnswers)).toBe(true)
    })
  })
})
