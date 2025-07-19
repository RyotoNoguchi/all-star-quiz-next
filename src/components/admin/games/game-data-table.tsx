/**
 * Game Data Table Component
 * 
 * Admin interface for managing game sessions with CRUD operations
 */

'use client'

import { type FC, useState } from 'react'
import { api } from '@/lib/trpc/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Edit, Trash2, Play, Pause, Square } from 'lucide-react'

type GameStatus = 'WAITING' | 'STARTING' | 'IN_PROGRESS' | 'PAUSED' | 'FINISHED' | 'CANCELLED'

const statusLabels: Record<GameStatus, string> = {
  WAITING: '待機中',
  STARTING: '開始中',
  IN_PROGRESS: '進行中',
  PAUSED: '一時停止',
  FINISHED: '終了',
  CANCELLED: 'キャンセル',
}

const statusColors: Record<GameStatus, string> = {
  WAITING: 'bg-yellow-100 text-yellow-800',
  STARTING: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-green-100 text-green-800',
  PAUSED: 'bg-orange-100 text-orange-800',
  FINISHED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export const GameDataTable: FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Fetch games data (with mock data for now)
  const mockGames = [
    {
      id: 'game1',
      name: 'テストゲーム1',
      code: 'ABC123',
      status: 'WAITING' as GameStatus,
      maxPlayers: 20,
      createdAt: new Date(),
      admin: { name: 'Admin User' },
      _count: { participants: 5, gameQuestions: 0, playerAnswers: 0 },
    },
    {
      id: 'game2', 
      name: '本格クイズ大会',
      code: 'XYZ789',
      status: 'IN_PROGRESS' as GameStatus,
      maxPlayers: 30,
      createdAt: new Date(),
      admin: { name: 'Quiz Master' },
      _count: { participants: 12, gameQuestions: 5, playerAnswers: 45 },
    },
  ]

  const handleUpdateStatus = (gameId: string, newStatus: GameStatus) => {
    console.log('Update game status:', gameId, newStatus)
    // TODO: Implement status update with tRPC
  }

  const handleDeleteGame = (gameId: string) => {
    console.log('Delete game:', gameId)
    // TODO: Implement game deletion with tRPC
  }

  const handleViewGame = (gameId: string) => {
    console.log('View game details:', gameId)
    // TODO: Navigate to game details page
  }

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            すべて
          </Button>
          <Button variant="outline" size="sm">
            進行中
          </Button>
          <Button variant="outline" size="sm">
            終了済み
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="ゲーム名で検索..."
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <Button>検索</Button>
        </div>
      </div>

      {/* Games Table */}
      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ゲーム名</TableHead>
              <TableHead>コード</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead>参加者数</TableHead>
              <TableHead>管理者</TableHead>
              <TableHead>作成日時</TableHead>
              <TableHead className="w-12">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockGames.map((game) => (
              <TableRow key={game.id}>
                <TableCell className="font-medium">{game.name}</TableCell>
                <TableCell>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                    {game.code}
                  </code>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      statusColors[game.status]
                    }`}
                  >
                    {statusLabels[game.status]}
                  </span>
                </TableCell>
                <TableCell>
                  {game._count.participants} / {game.maxPlayers}
                </TableCell>
                <TableCell>{game.admin.name}</TableCell>
                <TableCell>
                  {game.createdAt.toLocaleDateString('ja-JP')}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>操作</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleViewGame(game.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        詳細表示
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      
                      {game.status === 'WAITING' && (
                        <DropdownMenuItem onClick={() => handleUpdateStatus(game.id, 'IN_PROGRESS')}>
                          <Play className="mr-2 h-4 w-4" />
                          開始
                        </DropdownMenuItem>
                      )}
                      
                      {game.status === 'IN_PROGRESS' && (
                        <DropdownMenuItem onClick={() => handleUpdateStatus(game.id, 'PAUSED')}>
                          <Pause className="mr-2 h-4 w-4" />
                          一時停止
                        </DropdownMenuItem>
                      )}
                      
                      {(game.status === 'WAITING' || game.status === 'PAUSED') && (
                        <DropdownMenuItem onClick={() => handleUpdateStatus(game.id, 'CANCELLED')}>
                          <Square className="mr-2 h-4 w-4" />
                          キャンセル
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteGame(game.id)}
                        className="text-red-600"
                        disabled={game.status === 'IN_PROGRESS'}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        削除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-700">
          {mockGames.length} 件中 1-{mockGames.length} 件を表示
        </p>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            前へ
          </Button>
          <span className="text-sm text-gray-600">
            ページ {currentPage}
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            次へ
          </Button>
        </div>
      </div>
    </div>
  )
}