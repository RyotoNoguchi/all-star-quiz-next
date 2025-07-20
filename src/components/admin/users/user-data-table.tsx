/**
 * User Data Table Component
 * 
 * Admin interface for managing users with role management and filtering
 */

'use client'

import { type FC, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Shield, User, Crown } from 'lucide-react'

type UserRole = 'PLAYER' | 'ADMIN' | 'SUPER_ADMIN'

const roleLabels: Record<UserRole, string> = {
  PLAYER: 'プレイヤー',
  ADMIN: '管理者',
  SUPER_ADMIN: 'スーパー管理者',
}

const roleColors: Record<UserRole, string> = {
  PLAYER: 'bg-blue-100 text-blue-800',
  ADMIN: 'bg-green-100 text-green-800',
  SUPER_ADMIN: 'bg-purple-100 text-purple-800',
}

const roleIcons: Record<UserRole, typeof User> = {
  PLAYER: User,
  ADMIN: Shield,
  SUPER_ADMIN: Crown,
}

export const UserDataTable: FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // URL state management
  const currentPage = Number(searchParams.get('page')) || 1
  const searchQuery = searchParams.get('q') || ''
  const roleFilter = (searchParams.get('role') as UserRole) || undefined
  
  const [localSearch, setLocalSearch] = useState(searchQuery)

  // Fetch users data
  const {
    data,
    isLoading,
    error,
    refetch
  } = api.users.getAllUsers.useQuery({
    page: currentPage,
    limit: 20,
    search: searchQuery || undefined,
    role: roleFilter,
  })

  // Role update mutation
  const updateUserRoleMutation = api.users.updateUserRole.useMutation({
    onSuccess: () => {
      refetch()
    },
    onError: (error) => {
      console.error('Failed to update user role:', error)
    },
  })

  const updateURLParams = (params: Record<string, string | undefined>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value)
      } else {
        newSearchParams.delete(key)
      }
    })

    router.push(`/admin/users?${newSearchParams.toString()}`)
  }

  const handleSearch = () => {
    updateURLParams({ q: localSearch || undefined, page: undefined })
  }

  const handleRoleFilter = (role: string) => {
    const newRole = role === 'all' ? undefined : role
    updateURLParams({ role: newRole, page: undefined })
  }

  const handlePageChange = (page: number) => {
    updateURLParams({ page: page.toString() })
  }

  const handleUpdateRole = (userId: string, newRole: UserRole) => {
    updateUserRoleMutation.mutate({ userId, role: newRole })
  }

  const handleViewUser = (userId: string) => {
    console.log('View user details:', userId)
    // TODO: Navigate to user details page
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-600 mb-4">ユーザーデータの取得に失敗しました</p>
        <Button onClick={() => refetch()} variant="outline">
          再試行
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="ユーザー名またはメールで検索"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-64"
            />
            <Button onClick={handleSearch} variant="outline">
              検索
            </Button>
          </div>
          
          <Select
            value={roleFilter || 'all'}
            onValueChange={handleRoleFilter}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="ロール" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのロール</SelectItem>
              <SelectItem value="PLAYER">プレイヤー</SelectItem>
              <SelectItem value="ADMIN">管理者</SelectItem>
              <SelectItem value="SUPER_ADMIN">スーパー管理者</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-gray-500">
          {data && `${data.pagination.total} 件中 ${(data.pagination.page - 1) * data.pagination.limit + 1}-${Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} 件を表示`}
        </div>
      </div>

      {/* Users Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ユーザー</TableHead>
              <TableHead>ロール</TableHead>
              <TableHead>ゲーム統計</TableHead>
              <TableHead>登録日</TableHead>
              <TableHead className="w-[70px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                      <div className="space-y-2">
                        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="w-32 h-3 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-16 h-6 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                </TableRow>
              ))
            ) : data?.users.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="text-gray-500">
                    {searchQuery || roleFilter
                      ? '検索条件に一致するユーザーが見つかりません'
                      : 'ユーザーが登録されていません'
                    }
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // User data
              data?.users.map((user) => {
                const IconComponent = roleIcons[user.role]
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <img
                          src={user.image || '/default-avatar.png'}
                          alt={user.name || 'User'}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.name || '名前未設定'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                        <IconComponent className="w-3 h-3 mr-1" />
                        {roleLabels[user.role]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>プレイ: {user.gamesPlayed} 回</div>
                        <div className="text-gray-500">勝利: {user.gamesWon} 回</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">
                        {user.createdAt.toLocaleDateString('ja-JP')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">メニューを開く</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>操作</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewUser(user.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            詳細を見る
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>ロール変更</DropdownMenuLabel>
                          {user.role !== 'PLAYER' && (
                            <DropdownMenuItem
                              onClick={() => handleUpdateRole(user.id, 'PLAYER')}
                              disabled={updateUserRoleMutation.isPending}
                            >
                              <User className="mr-2 h-4 w-4" />
                              プレイヤーに変更
                            </DropdownMenuItem>
                          )}
                          {user.role !== 'ADMIN' && (
                            <DropdownMenuItem
                              onClick={() => handleUpdateRole(user.id, 'ADMIN')}
                              disabled={updateUserRoleMutation.isPending}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              管理者に変更
                            </DropdownMenuItem>
                          )}
                          {user.role !== 'SUPER_ADMIN' && (
                            <DropdownMenuItem
                              onClick={() => handleUpdateRole(user.id, 'SUPER_ADMIN')}
                              disabled={updateUserRoleMutation.isPending}
                            >
                              <Crown className="mr-2 h-4 w-4" />
                              スーパー管理者に変更
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data && data.pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            前のページ
          </Button>
          <span className="text-sm text-gray-500">
            ページ {currentPage} / {data.pagination.pages}
          </span>
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= data.pagination.pages}
          >
            次のページ
          </Button>
        </div>
      )}
    </div>
  )
}