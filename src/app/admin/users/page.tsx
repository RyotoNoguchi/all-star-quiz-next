/**
 * Admin Users Management Page
 * 
 * User administration interface with role management
 */

import { type FC, Suspense } from 'react'
import { AdminLayout } from '@/components/admin/layout/admin-layout'
import { UserDataTable } from '@/components/admin/users/user-data-table'
import { Button } from '@/components/ui/button'

const AdminUsersPage: FC = () => {
  return (
    <AdminLayout 
      title="ユーザー管理" 
      description="ユーザーアカウントとロールの管理"
    >
      <div className="space-y-6">
        {/* Header with Action Buttons */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">ユーザー一覧</h2>
            <p className="text-gray-600 mt-1">全ユーザーのロール管理と統計</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="bg-gray-50 hover:bg-gray-100">
              エクスポート
            </Button>
            <Button className="bg-primary-600 hover:bg-primary-700">
              ユーザー招待
            </Button>
          </div>
        </div>

        {/* Users Data Table */}
        <Suspense fallback={<div>Loading...</div>}>
          <UserDataTable />
        </Suspense>
      </div>
    </AdminLayout>
  )
}

export default AdminUsersPage