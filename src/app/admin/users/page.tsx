/**
 * Admin Users Management Page
 * 
 * User administration interface with role management
 */

import { type FC } from 'react'
import { AdminLayout } from '@/components/admin/layout/admin-layout'

const AdminUsersPage: FC = () => {
  return (
    <AdminLayout 
      title="ユーザー管理" 
      description="ユーザーアカウントとロールの管理"
    >
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">ユーザー一覧</h2>
            <div className="flex space-x-3">
              <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                エクスポート
              </button>
              <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                ユーザー招待
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-500">ユーザー管理テーブルを実装中...</p>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminUsersPage