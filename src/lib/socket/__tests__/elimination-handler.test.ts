/**
 * Unit Tests for Elimination Handler
 *
 * Comprehensive test suite for Socket.io elimination handler
 * Tests timer management, answer handling, and game flow logic
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { Server } from 'socket.io'
import {
  startQuestionTimer,
  handleAnswerSubmission,
  clearQuestionTimers,
  getActivePlayersCount
} from '../elimination-handler'
import type { GameRoom } from '../game-rooms'

// Mock Socket.io Server
const createMockIo = () => ({
  to: vi.fn().mockReturnValue({
    emit: vi.fn()
  })
}) as unknown as Server

// Create mock game room
const createMockGameRoom = (): GameRoom => ({
  code: 'ABC123',
  adminId: 'admin1',
  players: new Set(['player1', 'player2', 'player3']),
  eliminatedPlayers: new Set(),
  status: 'waiting',
  activeAnswers: new Map(),
  currentQuestion: 1,
  currentQuestionId: null,
  maxPlayers: 10,
  questionTimer: null,
  timerInterval: null,
  totalQuestions: 10,
  currentQuestionData: null
})

describe('Elimination Handler', () => {
  let mockIo: Server
  let gameRoom: GameRoom

  beforeEach(() => {
    vi.useFakeTimers()
    mockIo = createMockIo()
    gameRoom = createMockGameRoom()
  })

  afterEach(() => {
    vi.useRealTimers()
    clearQuestionTimers(gameRoom)
  })

  describe('startQuestionTimer', () => {
    const testQuestion = {
      id: 'q1',
      correctAnswer: 'A',
      explanation: 'Test explanation'
    }

    it('should initialize timer and reset game state', () => {
      // Arrange
      gameRoom.activeAnswers.set('player1', {
        playerId: 'player1',
        questionId: 'old-q',
        selectedAnswer: 'B',
        responseTime: 5.0,
        serverTimestamp: new Date()
      })

      // Act
      startQuestionTimer(gameRoom, testQuestion, mockIo, false)

      // Assert
      expect(gameRoom.currentQuestionId).toBe('q1')
      expect(gameRoom.activeAnswers.size).toBe(0)
      expect(gameRoom.questionTimer).not.toBeNull()
      expect(gameRoom.timerInterval).not.toBeNull()
    })

    it('should emit initial timer update', () => {
      // Act
      startQuestionTimer(gameRoom, testQuestion, mockIo, false)

      // Assert
      expect(mockIo.to).toHaveBeenCalledWith('ABC123')
      const mockToFn = vi.mocked(mockIo.to)
      const ioInstance = mockToFn.mock.results[0]?.value
      expect(ioInstance.emit).toHaveBeenCalledWith('timer-update', {
        remainingTime: 10,
        isUrgent: false
      })
    })

    it('should emit timer updates every second', () => {
      // Act
      startQuestionTimer(gameRoom, testQuestion, mockIo, false)

      // Fast-forward 1 second
      vi.advanceTimersByTime(1000)

      // Assert
      const mockToFn = vi.mocked(mockIo.to)
      const ioInstance = mockToFn.mock.results[1]?.value
      expect(ioInstance.emit).toHaveBeenCalledWith('timer-update', {
        remainingTime: 9,
        isUrgent: false
      })
    })

    it('should mark timer as urgent when 3 seconds or less remain', () => {
      // Act
      startQuestionTimer(gameRoom, testQuestion, mockIo, false)

      // Fast-forward to 7 seconds (remaining = 3)
      vi.advanceTimersByTime(7000)

      // Assert
      const mockToFn = vi.mocked(mockIo.to)
      const ioInstance = mockToFn.mock.results[7]?.value
      expect(ioInstance.emit).toHaveBeenCalledWith('timer-update', {
        remainingTime: 3,
        isUrgent: true
      })
    })

    it('should clear existing timers before starting new ones', () => {
      // Arrange - Start first timer
      startQuestionTimer(gameRoom, testQuestion, mockIo, false)
      const firstTimer = gameRoom.questionTimer
      const firstInterval = gameRoom.timerInterval

      // Act - Start second timer
      startQuestionTimer(gameRoom, { ...testQuestion, id: 'q2' }, mockIo, false)

      // Assert
      expect(gameRoom.questionTimer).not.toBe(firstTimer)
      expect(gameRoom.timerInterval).not.toBe(firstInterval)
      expect(gameRoom.currentQuestionId).toBe('q2')
    })

    it('should process question results when timer expires', () => {
      // Act
      startQuestionTimer(gameRoom, testQuestion, mockIo, false)
      vi.advanceTimersByTime(10000)

      // Assert - Since processQuestionResults is internal, we test behavior indirectly
      // by checking that timers are cleared after expiration
      expect(gameRoom.questionTimer).toBeNull()
      expect(gameRoom.timerInterval).toBeNull()
    })
  })

  describe('handleAnswerSubmission', () => {
    beforeEach(() => {
      gameRoom.currentQuestionId = 'q1'
    })

    it('should accept valid answer submission', () => {
      // Act
      const result = handleAnswerSubmission(
        gameRoom,
        'player1',
        'q1',
        'A',
        5.5
      )

      // Assert
      expect(result).toBe(true)
      expect(gameRoom.activeAnswers.size).toBe(1)
      expect(gameRoom.activeAnswers.get('player1')).toMatchObject({
        playerId: 'player1',
        questionId: 'q1',
        selectedAnswer: 'A',
        responseTime: 5.5
      })
    })

    it('should reject answer for wrong question ID', () => {
      // Act
      const result = handleAnswerSubmission(
        gameRoom,
        'player1',
        'wrong-q',
        'A',
        5.5
      )

      // Assert
      expect(result).toBe(false)
      expect(gameRoom.activeAnswers.size).toBe(0)
    })

    it('should reject answer from eliminated player', () => {
      // Arrange
      gameRoom.eliminatedPlayers.add('player1')

      // Act
      const result = handleAnswerSubmission(
        gameRoom,
        'player1',
        'q1',
        'A',
        5.5
      )

      // Assert
      expect(result).toBe(false)
      expect(gameRoom.activeAnswers.size).toBe(0)
    })

    it('should reject duplicate answer from same player', () => {
      // Arrange
      handleAnswerSubmission(gameRoom, 'player1', 'q1', 'A', 5.0)

      // Act
      const result = handleAnswerSubmission(
        gameRoom,
        'player1',
        'q1',
        'B',
        6.0
      )

      // Assert
      expect(result).toBe(false)
      expect(gameRoom.activeAnswers.size).toBe(1)
      expect(gameRoom.activeAnswers.get('player1')?.selectedAnswer).toBe('A')
    })

    it('should clear timers when all active players answer', () => {
      // Arrange
      gameRoom.questionTimer = setTimeout(() => {}, 5000)
      gameRoom.timerInterval = setInterval(() => {}, 1000)

      // Act - All 3 players answer
      handleAnswerSubmission(gameRoom, 'player1', 'q1', 'A', 5.0)
      handleAnswerSubmission(gameRoom, 'player2', 'q1', 'B', 6.0)
      const result = handleAnswerSubmission(gameRoom, 'player3', 'q1', 'C', 7.0)

      // Assert
      expect(result).toBe(true)
      expect(gameRoom.activeAnswers.size).toBe(3)
      expect(gameRoom.questionTimer).toBeNull()
      expect(gameRoom.timerInterval).toBeNull()
    })

    it('should not clear timers when some players have not answered', () => {
      // Arrange
      const timer = setTimeout(() => {}, 5000)
      const interval = setInterval(() => {}, 1000)
      gameRoom.questionTimer = timer
      gameRoom.timerInterval = interval

      // Act - Only 1 out of 3 players answer
      const result = handleAnswerSubmission(gameRoom, 'player1', 'q1', 'A', 5.0)

      // Assert
      expect(result).toBe(true)
      expect(gameRoom.questionTimer).toBe(timer)
      expect(gameRoom.timerInterval).toBe(interval)

      // Cleanup
      clearTimeout(timer)
      clearInterval(interval)
    })

    it('should handle edge case with zero response time', () => {
      // Act
      const result = handleAnswerSubmission(
        gameRoom,
        'player1',
        'q1',
        'A',
        0
      )

      // Assert
      expect(result).toBe(true)
      expect(gameRoom.activeAnswers.get('player1')?.responseTime).toBe(0)
    })

    it('should handle special characters in answers', () => {
      // Act
      const result = handleAnswerSubmission(
        gameRoom,
        'player1',
        'q1',
        'A - 答案',
        5.5
      )

      // Assert
      expect(result).toBe(true)
      expect(gameRoom.activeAnswers.get('player1')?.selectedAnswer).toBe('A - 答案')
    })
  })

  describe('clearQuestionTimers', () => {
    it('should clear question timer', () => {
      // Arrange
      gameRoom.questionTimer = setTimeout(() => {}, 5000)

      // Act
      clearQuestionTimers(gameRoom)

      // Assert
      expect(gameRoom.questionTimer).toBeNull()
      // Timer should be cleared (can't easily test clearTimeout directly)
    })

    it('should clear timer interval', () => {
      // Arrange
      gameRoom.timerInterval = setInterval(() => {}, 1000)

      // Act
      clearQuestionTimers(gameRoom)

      // Assert
      expect(gameRoom.timerInterval).toBeNull()
    })

    it('should handle null timers gracefully', () => {
      // Arrange
      gameRoom.questionTimer = null
      gameRoom.timerInterval = null

      // Act & Assert
      expect(() => clearQuestionTimers(gameRoom)).not.toThrow()
      expect(gameRoom.questionTimer).toBeNull()
      expect(gameRoom.timerInterval).toBeNull()
    })

    it('should clear both timers simultaneously', () => {
      // Arrange
      gameRoom.questionTimer = setTimeout(() => {}, 5000)
      gameRoom.timerInterval = setInterval(() => {}, 1000)

      // Act
      clearQuestionTimers(gameRoom)

      // Assert
      expect(gameRoom.questionTimer).toBeNull()
      expect(gameRoom.timerInterval).toBeNull()
    })
  })

  describe('getActivePlayersCount', () => {
    it('should return total players when none eliminated', () => {
      // Act
      const count = getActivePlayersCount(gameRoom)

      // Assert
      expect(count).toBe(3)
    })

    it('should exclude eliminated players', () => {
      // Arrange
      gameRoom.eliminatedPlayers.add('player1')
      gameRoom.eliminatedPlayers.add('player2')

      // Act
      const count = getActivePlayersCount(gameRoom)

      // Assert
      expect(count).toBe(1)
    })

    it('should return zero when all players eliminated', () => {
      // Arrange
      gameRoom.eliminatedPlayers.add('player1')
      gameRoom.eliminatedPlayers.add('player2')
      gameRoom.eliminatedPlayers.add('player3')

      // Act
      const count = getActivePlayersCount(gameRoom)

      // Assert
      expect(count).toBe(0)
    })

    it('should handle empty player set', () => {
      // Arrange
      gameRoom.players.clear()

      // Act
      const count = getActivePlayersCount(gameRoom)

      // Assert
      expect(count).toBe(0)
    })

    it('should handle player elimination correctly', () => {
      // Arrange
      gameRoom.players.add('player4')
      gameRoom.eliminatedPlayers.add('player1')

      // Act
      const count = getActivePlayersCount(gameRoom)

      // Assert
      expect(count).toBe(3) // player2, player3, player4
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete question cycle', () => {
      // Arrange
      const testQuestion = {
        id: 'q1',
        correctAnswer: 'A',
        explanation: 'Test explanation'
      }

      // Act - Start question
      startQuestionTimer(gameRoom, testQuestion, mockIo, false)

      // Players submit answers
      handleAnswerSubmission(gameRoom, 'player1', 'q1', 'A', 4.0)
      handleAnswerSubmission(gameRoom, 'player2', 'q1', 'B', 5.0)
      handleAnswerSubmission(gameRoom, 'player3', 'q1', 'A', 6.0)

      // Assert - All answers collected, timers cleared
      expect(gameRoom.activeAnswers.size).toBe(3)
      expect(gameRoom.questionTimer).toBeNull()
      expect(gameRoom.timerInterval).toBeNull()
    })

    it('should prevent answers after question changes', () => {
      // Arrange
      const question1 = { id: 'q1', correctAnswer: 'A' }
      const question2 = { id: 'q2', correctAnswer: 'B' }

      startQuestionTimer(gameRoom, question1, mockIo, false)
      handleAnswerSubmission(gameRoom, 'player1', 'q1', 'A', 4.0)

      // Act - Start new question
      startQuestionTimer(gameRoom, question2, mockIo, false)

      // Try to submit answer for old question
      const result = handleAnswerSubmission(gameRoom, 'player2', 'q1', 'B', 5.0)

      // Assert
      expect(result).toBe(false)
      expect(gameRoom.currentQuestionId).toBe('q2')
      expect(gameRoom.activeAnswers.size).toBe(0) // Reset by new question
    })

    it('should handle eliminated players correctly throughout cycle', () => {
      // Arrange
      gameRoom.eliminatedPlayers.add('player1')
      const testQuestion = { id: 'q1', correctAnswer: 'A' }

      startQuestionTimer(gameRoom, testQuestion, mockIo, false)

      // Act
      const result1 = handleAnswerSubmission(gameRoom, 'player1', 'q1', 'A', 4.0) // Eliminated
      const result2 = handleAnswerSubmission(gameRoom, 'player2', 'q1', 'A', 5.0) // Active
      const result3 = handleAnswerSubmission(gameRoom, 'player3', 'q1', 'B', 6.0) // Active

      // Assert
      expect(result1).toBe(false)
      expect(result2).toBe(true)
      expect(result3).toBe(true)
      expect(gameRoom.activeAnswers.size).toBe(2)
      expect(getActivePlayersCount(gameRoom)).toBe(2)
    })

    it('should handle timer expiration with partial answers', () => {
      // Arrange
      const testQuestion = { id: 'q1', correctAnswer: 'A' }
      startQuestionTimer(gameRoom, testQuestion, mockIo, false)

      // Only some players answer
      handleAnswerSubmission(gameRoom, 'player1', 'q1', 'A', 4.0)

      // Act - Timer expires
      vi.advanceTimersByTime(10000)

      // Assert - Timer cleared even with partial answers
      expect(gameRoom.questionTimer).toBeNull()
      expect(gameRoom.timerInterval).toBeNull()
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid player IDs', () => {
      // Arrange
      gameRoom.currentQuestionId = 'q1'

      // Act
      const result = handleAnswerSubmission(
        gameRoom,
        'non-existent-player',
        'q1',
        'A',
        5.0
      )

      // Assert - Should still accept (player existence validated elsewhere)
      expect(result).toBe(true)
      expect(gameRoom.activeAnswers.has('non-existent-player')).toBe(true)
    })

    it('should handle concurrent timer operations', () => {
      // Arrange
      const question1 = { id: 'q1', correctAnswer: 'A' }
      const question2 = { id: 'q2', correctAnswer: 'B' }

      // Act - Rapid fire timer starts
      startQuestionTimer(gameRoom, question1, mockIo, false)
      startQuestionTimer(gameRoom, question2, mockIo, false)
      clearQuestionTimers(gameRoom)

      // Assert - No errors thrown
      expect(gameRoom.currentQuestionId).toBe('q2')
      expect(gameRoom.questionTimer).toBeNull()
      expect(gameRoom.timerInterval).toBeNull()
    })

    it('should maintain answer integrity with rapid submissions', () => {
      // Arrange
      gameRoom.currentQuestionId = 'q1'

      // Act - Rapid answer submissions
      const results = []
      for (let i = 0; i < 5; i++) {
        results.push(handleAnswerSubmission(gameRoom, 'player1', 'q1', 'A', i))
      }

      // Assert - Only first submission accepted
      expect(results).toEqual([true, false, false, false, false])
      expect(gameRoom.activeAnswers.size).toBe(1)
      expect(gameRoom.activeAnswers.get('player1')?.responseTime).toBe(0)
    })
  })
})
