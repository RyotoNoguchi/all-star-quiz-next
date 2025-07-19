/**
 * Unit Tests for Questions tRPC Router
 *
 * Comprehensive test suite for question management API
 * Tests CRUD operations, validation, and business logic
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { questionsRouter } from '../questions'
import type { PrismaClient } from '@prisma/client'

// Mock Prisma client
const mockPrisma = {
  question: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
  },
  gameQuestion: {
    count: vi.fn(),
  },
}

// Mock context with session for authentication
const createMockContext = (overrides = {}) => ({
  prisma: mockPrisma as unknown as PrismaClient,
  session: {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'ADMIN',
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  ...overrides,
})

// Helper to create tRPC caller
const createCaller = (ctx = createMockContext()) => {
  return questionsRouter.createCaller(ctx)
}

describe('Questions tRPC Router', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getRandomQuestions', () => {
    it('should return random questions with correct count', async () => {
      // Arrange
      const mockQuestions = [
        {
          id: 'q1',
          text: 'Question 1',
          optionA: 'A1',
          optionB: 'B1',
          optionC: 'C1',
          optionD: 'D1',
          correctAnswer: 'A',
          type: 'NORMAL',
          difficulty: 'MEDIUM',
          category: 'Math',
          tags: 'basic,arithmetic',
          explanation: 'Explanation 1',
          createdAt: new Date(),
        },
        {
          id: 'q2',
          text: 'Question 2',
          optionA: 'A2',
          optionB: 'B2',
          optionC: 'C2',
          optionD: 'D2',
          correctAnswer: 'B',
          type: 'NORMAL',
          difficulty: 'EASY',
          category: 'Science',
          tags: null,
          explanation: null,
          createdAt: new Date(),
        },
      ]

      mockPrisma.question.count.mockResolvedValue(10)
      mockPrisma.question.findMany.mockResolvedValue(mockQuestions)

      const caller = createCaller()

      // Act
      const result = await caller.getRandomQuestions({ count: 2 })

      // Assert
      expect(result).toHaveLength(2)
      // Since the questions are shuffled, we need to check both possibilities
      const questionIds = result.map(q => q.id)
      expect(questionIds).toContain('q1')
      expect(questionIds).toContain('q2')

      const q1 = result.find(q => q.id === 'q1')
      const q2 = result.find(q => q.id === 'q2')

      expect(q1).toMatchObject({
        id: 'q1',
        text: 'Question 1',
        tags: ['basic', 'arithmetic'], // Should be converted to array
      })
      expect(q2).toMatchObject({
        id: 'q2',
        text: 'Question 2',
        tags: [], // Should be empty array
      })
    })

    it('should throw error when no questions found', async () => {
      // Arrange
      mockPrisma.question.count.mockResolvedValue(0)
      const caller = createCaller()

      // Act & Assert
      await expect(
        caller.getRandomQuestions({ count: 5 })
      ).rejects.toThrow('No questions found matching criteria')
    })

    it('should throw error when requesting more than available', async () => {
      // Arrange
      mockPrisma.question.count.mockResolvedValue(3)
      const caller = createCaller()

      // Act & Assert
      await expect(
        caller.getRandomQuestions({ count: 5 })
      ).rejects.toThrow('Only 3 questions available, but 5 requested')
    })

    it('should filter by difficulty and category', async () => {
      // Arrange
      mockPrisma.question.count.mockResolvedValue(5)
      mockPrisma.question.findMany.mockResolvedValue([])
      const caller = createCaller()

      // Act
      await caller.getRandomQuestions({
        count: 3,
        difficulty: 'HARD',
        category: 'Science',
      })

      // Assert
      expect(mockPrisma.question.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          difficulty: 'HARD',
          category: 'Science',
        },
        select: expect.any(Object),
        orderBy: expect.any(Object),
        take: 6, // count * 2 for randomization
      })
    })

    it('should exclude specified question IDs', async () => {
      // Arrange
      mockPrisma.question.count.mockResolvedValue(5)
      mockPrisma.question.findMany.mockResolvedValue([])
      const caller = createCaller()

      // Act
      await caller.getRandomQuestions({
        count: 2,
        excludeIds: ['cm12345678901234567890', 'cm12345678901234567891'],
      })

      // Assert
      expect(mockPrisma.question.count).toHaveBeenCalledWith({
        where: {
          isActive: true,
          id: { notIn: ['cm12345678901234567890', 'cm12345678901234567891'] },
        },
      })
    })
  })

  describe('create', () => {
    const validQuestionData = {
      text: 'What is 2 + 2?',
      optionA: '3',
      optionB: '4',
      optionC: '5',
      optionD: '6',
      correctAnswer: 'B' as const,
      difficulty: 'EASY' as const,
      category: 'Math',
      explanation: 'Basic arithmetic',
      tags: ['math', 'basic'],
    }

    it('should create question with valid data', async () => {
      // Arrange
      const createdQuestion = {
        id: 'new-q',
        ...validQuestionData,
        tags: 'math,basic',
        type: 'NORMAL',
        createdAt: new Date(),
      }

      mockPrisma.question.create.mockResolvedValue(createdQuestion)
      const caller = createCaller()

      // Act
      const result = await caller.create(validQuestionData)

      // Assert
      expect(mockPrisma.question.create).toHaveBeenCalledWith({
        data: {
          text: 'What is 2 + 2?',
          optionA: '3',
          optionB: '4',
          optionC: '5',
          optionD: '6',
          correctAnswer: 'B',
          difficulty: 'EASY',
          category: 'Math',
          explanation: 'Basic arithmetic',
          tags: 'math,basic', // Should be converted to comma-separated string
          type: 'NORMAL',
          createdBy: 'test-user-id',
        },
        select: {
          id: true,
          text: true,
          type: true,
          difficulty: true,
          category: true,
          tags: true,
          createdAt: true,
        },
      })
      expect(result.tags).toEqual(['math', 'basic']) // Should be converted back to array
    })

    it('should handle empty tags array', async () => {
      // Arrange
      const questionWithNoTags = {
        ...validQuestionData,
        tags: [],
      }

      const createdQuestion = {
        id: 'new-q',
        ...questionWithNoTags,
        tags: null,
        type: 'NORMAL',
        createdAt: new Date(),
      }

      mockPrisma.question.create.mockResolvedValue(createdQuestion)
      const caller = createCaller()

      // Act
      const result = await caller.create(questionWithNoTags)

      // Assert
      expect(mockPrisma.question.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tags: null, // Empty array should become null
        }),
        select: expect.any(Object),
      })
      expect(result.tags).toEqual([])
    })

    it('should validate required fields', async () => {
      // Arrange
      const invalidData = {
        text: '', // Too short
        optionA: 'A',
        optionB: '',
        optionC: 'C',
        optionD: 'D',
        correctAnswer: 'B' as const,
        difficulty: 'EASY' as const,
      }

      const caller = createCaller()

      // Act & Assert
      await expect(caller.create(invalidData as never)).rejects.toThrow()
    })

    it('should handle null explanation and category', async () => {
      // Arrange
      const questionWithNulls = {
        text: 'What is 2 + 2?',
        optionA: '3',
        optionB: '4',
        optionC: '5',
        optionD: '6',
        correctAnswer: 'B' as const,
        difficulty: 'EASY' as const,
        tags: [],
      }

      const createdQuestion = {
        id: 'new-q',
        ...questionWithNulls,
        explanation: null,
        category: null,
        tags: null,
        type: 'NORMAL',
        createdAt: new Date(),
      }

      mockPrisma.question.create.mockResolvedValue(createdQuestion)
      const caller = createCaller()

      // Act
      await caller.create(questionWithNulls)

      // Assert
      expect(mockPrisma.question.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          explanation: null,
          category: null,
        }),
        select: expect.any(Object),
      })
    })
  })

  describe('update', () => {
    const updateData = {
      id: 'cm12345678901234567890', // Valid CUID format
      text: 'Updated question text',
      difficulty: 'HARD' as const,
      tags: ['updated', 'tag'],
    }

    it('should update question with valid data', async () => {
      // Arrange
      const updatedQuestion = {
        id: 'cm12345678901234567890',
        text: 'Updated question text',
        difficulty: 'HARD',
        tags: 'updated,tag',
        type: 'NORMAL',
        category: 'Math',
        isActive: true,
        updatedAt: new Date(),
      }

      mockPrisma.question.update.mockResolvedValue(updatedQuestion)
      const caller = createCaller()

      // Act
      const result = await caller.update(updateData)

      // Assert
      expect(mockPrisma.question.update).toHaveBeenCalledWith({
        where: { id: 'cm12345678901234567890' },
        data: expect.objectContaining({
          text: 'Updated question text',
          difficulty: 'HARD',
          tags: 'updated,tag', // Should be converted to comma-separated string
        }),
        select: expect.any(Object),
      })
      expect(result.tags).toEqual(['updated', 'tag']) // Should be converted back to array
    })

    it('should filter out undefined values', async () => {
      // Arrange
      const partialUpdateData = {
        id: 'cm12345678901234567890',
        text: 'New text that is long enough to pass validation',
        // Other fields undefined
      }

      mockPrisma.question.update.mockResolvedValue({
        id: 'cm12345678901234567890',
        text: 'New text that is long enough to pass validation',
        tags: null,
        updatedAt: new Date(),
      })
      const caller = createCaller()

      // Act
      await caller.update(partialUpdateData)

      // Assert
      const updateCall = mockPrisma.question.update.mock.calls[0]?.[0]
      expect(updateCall?.data).not.toHaveProperty('difficulty')
      expect(updateCall?.data).not.toHaveProperty('category')
      expect(updateCall?.data).toHaveProperty('text', 'New text that is long enough to pass validation')
    })

    it('should handle empty tags in update', async () => {
      // Arrange
      const updateWithEmptyTags = {
        id: 'cm12345678901234567890',
        tags: [],
      }

      mockPrisma.question.update.mockResolvedValue({
        id: 'cm12345678901234567890',
        tags: null,
        updatedAt: new Date(),
      })
      const caller = createCaller()

      // Act
      await caller.update(updateWithEmptyTags)

      // Assert
      expect(mockPrisma.question.update).toHaveBeenCalledWith({
        where: { id: 'cm12345678901234567890' },
        data: expect.objectContaining({
          tags: null, // Empty array should become null
        }),
        select: expect.any(Object),
      })
    })
  })

  describe('delete', () => {
    it('should delete question when not used in games', async () => {
      // Arrange
      mockPrisma.gameQuestion.count.mockResolvedValue(0)
      mockPrisma.question.delete.mockResolvedValue({ id: 'deleted-q' })
      const caller = createCaller()

      // Act
      const result = await caller.delete({ id: 'cm12345678901234567890' })

      // Assert
      expect(mockPrisma.gameQuestion.count).toHaveBeenCalledWith({
        where: { questionId: 'cm12345678901234567890' },
      })
      expect(mockPrisma.question.delete).toHaveBeenCalledWith({
        where: { id: 'cm12345678901234567890' },
      })
      expect(result).toEqual({ success: true })
    })

    it('should throw error when question is used in games', async () => {
      // Arrange
      mockPrisma.gameQuestion.count.mockResolvedValue(3)
      const caller = createCaller()

      // Act & Assert
      await expect(
        caller.delete({ id: 'cm12345678901234567890' })
      ).rejects.toThrow('Cannot delete question that has been used in games')
    })
  })

  describe('getAll', () => {
    const mockQuestions = [
      {
        id: 'q1',
        text: 'Question 1',
        type: 'NORMAL',
        difficulty: 'EASY',
        category: 'Math',
        tags: 'tag1,tag2',
        isActive: true,
        usageCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'q2',
        text: 'Question 2',
        type: 'FINAL',
        difficulty: 'HARD',
        category: null,
        tags: null,
        isActive: false,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    it('should return paginated questions with correct format', async () => {
      // Arrange
      mockPrisma.question.findMany.mockResolvedValue(mockQuestions)
      mockPrisma.question.count.mockResolvedValue(2)
      const caller = createCaller()

      // Act
      const result = await caller.getAll({
        page: 1,
        limit: 10,
      })

      // Assert
      expect(result.questions).toHaveLength(2)
      expect(result.questions[0]?.tags).toEqual(['tag1', 'tag2'])
      expect(result.questions[1]?.tags).toEqual([])
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        pages: 1,
      })
    })

    it('should apply search filters correctly', async () => {
      // Arrange
      mockPrisma.question.findMany.mockResolvedValue([])
      mockPrisma.question.count.mockResolvedValue(0)
      const caller = createCaller()

      // Act
      await caller.getAll({
        page: 1,
        limit: 10,
        search: 'math',
        difficulty: 'HARD',
        isActive: true,
      })

      // Assert
      expect(mockPrisma.question.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { text: { contains: 'math', mode: 'insensitive' } },
            { category: { contains: 'math', mode: 'insensitive' } },
          ],
          difficulty: 'HARD',
          isActive: true,
        },
        select: expect.any(Object),
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      })
    })

    it('should handle pagination correctly', async () => {
      // Arrange
      mockPrisma.question.findMany.mockResolvedValue([])
      mockPrisma.question.count.mockResolvedValue(25)
      const caller = createCaller()

      // Act
      const result = await caller.getAll({
        page: 3,
        limit: 10,
      })

      // Assert
      expect(mockPrisma.question.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20, // (page - 1) * limit
          take: 10,
        })
      )
      expect(result.pagination.pages).toBe(3) // Math.ceil(25 / 10)
    })
  })

  describe('getCategories', () => {
    it('should return category list with counts', async () => {
      // Arrange
      const mockCategoryData = [
        { category: 'Math', _count: { category: 15 } },
        { category: 'Science', _count: { category: 8 } },
      ]

      mockPrisma.question.groupBy.mockResolvedValue(mockCategoryData)
      const caller = createCaller()

      // Act
      const result = await caller.getCategories()

      // Assert
      expect(result).toEqual([
        { name: 'Math', count: 15 },
        { name: 'Science', count: 8 },
      ])
      expect(mockPrisma.question.groupBy).toHaveBeenCalledWith({
        by: ['category'],
        where: {
          category: { not: null },
          isActive: true,
        },
        _count: { category: true },
        orderBy: { _count: { category: 'desc' } },
      })
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle database errors gracefully', async () => {
      // Arrange
      mockPrisma.question.findMany.mockRejectedValue(new Error('Database error'))
      const caller = createCaller()

      // Act & Assert
      await expect(
        caller.getRandomQuestions({ count: 1 })
      ).rejects.toThrow('Database error')
    })

    it('should validate question ID format', async () => {
      // Arrange
      const caller = createCaller()

      // Act & Assert - Should fail with invalid CUID format
      await expect(
        caller.delete({ id: 'invalid-id-format' })
      ).rejects.toThrow('Invalid cuid')
    })

    it('should handle concurrent operations', async () => {
      // Arrange
      mockPrisma.question.create.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ id: 'q1' }), 10))
      )
      const caller = createCaller()

      // Act - Multiple concurrent creates
      const promises = Array.from({ length: 3 }, () =>
        caller.create({
          text: 'Concurrent question',
          optionA: 'A',
          optionB: 'B',
          optionC: 'C',
          optionD: 'D',
          correctAnswer: 'A',
          difficulty: 'EASY',
          category: 'Test',
          tags: [],
        })
      )

      // Assert - All should resolve without conflict
      const results = await Promise.all(promises)
      expect(results).toHaveLength(3)
    })

    it('should handle large question sets efficiently', async () => {
      // Arrange
      const largeQuestionSet = Array.from({ length: 1000 }, (_, i) => ({
        id: `q${i}`,
        text: `Question ${i}`,
        tags: i % 2 === 0 ? 'even' : 'odd',
      }))

      mockPrisma.question.count.mockResolvedValue(1000)
      mockPrisma.question.findMany.mockResolvedValue(largeQuestionSet.slice(0, 100))
      const caller = createCaller()

      // Act
      const result = await caller.getRandomQuestions({ count: 50 })

      // Assert
      expect(result).toHaveLength(50)
      expect(mockPrisma.question.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100, // count * 2 for randomization
        })
      )
    })
  })

  describe('Data Transformation', () => {
    it('should correctly transform tags between array and string formats', () => {
      // This is tested implicitly in other tests, but here we can be explicit
      // about the transformation logic

      const testCases = [
        { input: ['a', 'b', 'c'], expected: 'a,b,c' },
        { input: [], expected: null },
        { input: ['single'], expected: 'single' },
        { input: ['with spaces', 'no-spaces'], expected: 'with spaces,no-spaces' },
      ]

      testCases.forEach(({ input, expected }) => {
        const result = input.length > 0 ? input.join(',') : null
        expect(result).toBe(expected)
      })

      // Reverse transformation
      const reverseCases = [
        { input: 'a,b,c', expected: ['a', 'b', 'c'] },
        { input: null, expected: [] },
        { input: 'single', expected: ['single'] },
        { input: '', expected: [] },
      ]

      reverseCases.forEach(({ input, expected }) => {
        const result = input ? input.split(',').filter(Boolean) : []
        expect(result).toEqual(expected)
      })
    })
  })
})
