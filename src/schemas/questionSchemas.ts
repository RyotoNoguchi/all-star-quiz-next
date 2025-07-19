/**
 * Question Form Validation Schemas
 * 
 * Zod schemas for question creation and editing forms
 */

import { z } from 'zod'

export const questionFormSchema = z.object({
  text: z
    .string()
    .min(10, '問題文は10文字以上で入力してください')
    .max(500, '問題文は500文字以内で入力してください'),
  
  optionA: z
    .string()
    .min(1, '選択肢Aは必須です')
    .max(100, '選択肢Aは100文字以内で入力してください'),
  
  optionB: z
    .string()
    .min(1, '選択肢Bは必須です')
    .max(100, '選択肢Bは100文字以内で入力してください'),
  
  optionC: z
    .string()
    .min(1, '選択肢Cは必須です')
    .max(100, '選択肢Cは100文字以内で入力してください'),
  
  optionD: z
    .string()
    .min(1, '選択肢Dは必須です')
    .max(100, '選択肢Dは100文字以内で入力してください'),
  
  correctAnswer: z.enum(['A', 'B', 'C', 'D'], {
    message: '正解を選択してください',
  }),
  
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD'], {
    message: '難易度を選択してください',
  }),
  
  category: z
    .string()
    .min(1, 'カテゴリは必須です')
    .max(50, 'カテゴリは50文字以内で入力してください'),
  
  explanation: z
    .string()
    .max(300, '解説は300文字以内で入力してください')
    .optional(),
  
  isActive: z.boolean().optional().default(true),
  
  type: z.enum(['NORMAL', 'FINAL']).optional().default('NORMAL'),
})

export type QuestionFormData = z.infer<typeof questionFormSchema>

// Search and filter schemas
export const questionFilterSchema = z.object({
  search: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
  type: z.enum(['NORMAL', 'FINAL']).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
})

export type QuestionFilterData = z.infer<typeof questionFilterSchema>

// Question preview schema
export const questionPreviewSchema = z.object({
  text: z.string(),
  optionA: z.string(),
  optionB: z.string(),
  optionC: z.string(),
  optionD: z.string(),
  correctAnswer: z.enum(['A', 'B', 'C', 'D']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  type: z.enum(['NORMAL', 'FINAL']),
})

export type QuestionPreviewData = z.infer<typeof questionPreviewSchema>