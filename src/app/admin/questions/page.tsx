/**
 * Admin Questions Management Page
 * 
 * Question administration interface with CRUD operations
 */

import { type FC } from 'react'
import { AdminLayout } from '@/components/admin/layout/admin-layout'

const AdminQuestionsPage: FC = () => {
  return (
    <AdminLayout 
      title="問題管理" 
      description="クイズ問題の作成・編集・削除"
    >
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">問題一覧</h2>
            <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              新規問題作成
            </button>
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-500">問題管理テーブルを実装中...</p>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminQuestionsPage