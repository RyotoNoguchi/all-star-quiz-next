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

const AdminQuestionsPage: FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)

  const handleCreateQuestion = () => {
    setEditingQuestionId(null)
    setIsFormOpen(true)
  }

  const handleEditQuestion = (questionId: string) => {
    setEditingQuestionId(questionId)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingQuestionId(null)
  }

  const handleFormSuccess = () => {
    // Form component handles the actual tRPC mutations
    console.log('Form operation successful')
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
          onSuccess={handleFormSuccess}
          questionId={editingQuestionId}
        />
      </div>
    </AdminLayout>
  )
}

export default AdminQuestionsPage