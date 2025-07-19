/**
 * Admin Dashboard Page
 * 
 * Main dashboard showing system overview and statistics
 */

import { type FC } from 'react'
import { AdminLayout } from '@/components/admin/layout/admin-layout'

const AdminDashboardPage: FC = () => {
  return (
    <AdminLayout 
      title="ダッシュボード" 
      description="システム全体の概要と統計情報"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Statistics Cards */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">総ゲーム数</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">--</p>
          <p className="text-sm text-gray-600 mt-1">統計データ読み込み中</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">アクティブユーザー</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">--</p>
          <p className="text-sm text-gray-600 mt-1">統計データ読み込み中</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">問題数</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">--</p>
          <p className="text-sm text-gray-600 mt-1">統計データ読み込み中</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">今日のゲーム</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">--</p>
          <p className="text-sm text-gray-600 mt-1">統計データ読み込み中</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">最近のアクティビティ</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-500">アクティビティデータを実装中...</p>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboardPage