/**
 * Admin Games Management Page
 * 
 * Game administration interface with CRUD operations
 */

import { type FC } from 'react'
import { AdminLayout } from '@/components/admin/layout/admin-layout'
import { GameDataTable } from '@/components/admin/games/game-data-table'
import { Button } from '@/components/ui/button'

const AdminGamesPage: FC = () => {
  return (
    <AdminLayout 
      title="ゲーム管理" 
      description="ゲームセッションの管理と監視"
    >
      <div className="space-y-6">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">ゲーム一覧</h2>
            <p className="text-gray-600 mt-1">全ゲームセッションの管理</p>
          </div>
          <Button className="bg-primary-600 hover:bg-primary-700">
            新規ゲーム作成
          </Button>
        </div>

        {/* Games Data Table */}
        <GameDataTable />
      </div>
    </AdminLayout>
  )
}

export default AdminGamesPage