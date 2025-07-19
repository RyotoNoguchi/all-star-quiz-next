/**
 * Admin Questions Management Page
 * 
 * Question administration interface with CRUD operations
 */

'use client'

import { type FC, useState } from 'react'
import { AdminLayout } from '@/components/admin/layout/admin-layout'
import { QuestionDataTable } from '@/components/admin/questions/question-data-table'
import { QuestionForm } from '@/components/admin/questions/question-form'
import { type QuestionFormData } from '@/schemas/questionSchemas'

const AdminQuestionsPage: FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<QuestionFormData | null>(null)

  const handleCreateQuestion = () => {
    setEditingQuestion(null)
    setIsFormOpen(true)
  }

  const handleEditQuestion = (questionId: string) => {
    // TODO: Fetch question data by ID and set to editingQuestion
    // For now, use mock data
    const mockQuestion: QuestionFormData = {
      text: '日本の首都はどこですか？',
      optionA: '東京',
      optionB: '大阪',
      optionC: '京都',
      optionD: '名古屋',
      correctAnswer: 'A',
      difficulty: 'EASY',
      category: '地理',
      explanation: '東京は日本の首都で、政治・経済の中心地です。',
      isActive: true,
      type: 'NORMAL',
    }
    setEditingQuestion(mockQuestion)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingQuestion(null)
  }

  const handleSubmitForm = (data: QuestionFormData) => {
    console.log('Form submitted:', data)
    // TODO: Implement tRPC mutation for create/update
    
    if (editingQuestion) {
      console.log('Updating question...')
      // TODO: updateQuestion.mutate({ id: questionId, ...data })
    } else {
      console.log('Creating question...')
      // TODO: createQuestion.mutate(data)
    }
    
    // For now, just close the form
    setIsFormOpen(false)
    setEditingQuestion(null)
  }

  return (
    <AdminLayout 
      title="問題管理" 
      description="クイズ問題の作成・編集・削除"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">問題一覧</h2>
            <p className="text-gray-600 mt-1">全クイズ問題の管理</p>
          </div>
        </div>

        {/* Questions Data Table */}
        <QuestionDataTable 
          onCreateQuestion={handleCreateQuestion}
          onEditQuestion={handleEditQuestion}
        />

        {/* Question Form Dialog */}
        <QuestionForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={handleSubmitForm}
          initialData={editingQuestion}
          isPending={false}
        />
      </div>
    </AdminLayout>
  )
}

export default AdminQuestionsPage