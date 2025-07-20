/**
 * Question Data Table Component
 * 
 * Admin interface for managing quiz questions with CRUD operations
 */

'use client'

import { type FC, useState, useCallback } from 'react'
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
// Badge component not available, using inline styling
import { Input } from '@/components/ui/input'
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Search,
  Filter
} from 'lucide-react'

type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD'
type QuestionType = 'NORMAL' | 'FINAL'

const typeLabels: Record<QuestionType, string> = {
  NORMAL: '通常問題',
  FINAL: '最終問題',
}

const difficultyLabels: Record<QuestionDifficulty, string> = {
  EASY: '易しい',
  MEDIUM: '普通',
  HARD: '難しい',
}

const typeColors: Record<QuestionType, string> = {
  NORMAL: 'bg-blue-100 text-blue-800',
  FINAL: 'bg-purple-100 text-purple-800',
}

const difficultyColors: Record<QuestionDifficulty, string> = {
  EASY: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HARD: 'bg-red-100 text-red-800',
}

type Props = {
  onCreateQuestion?: () => void
  onEditQuestion?: (questionId: string) => void
}

export const QuestionDataTable: FC<Props> = ({ onCreateQuestion, onEditQuestion }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<QuestionDifficulty | undefined>()
  const [typeFilter, setTypeFilter] = useState<QuestionType | undefined>()
  
  const pageSize = 20

  // Fetch questions data with tRPC
  const { data: questionsData, isLoading, refetch } = api.questions.getAll.useQuery({
    page: currentPage,
    limit: pageSize,
    search: searchQuery || undefined,
    difficulty: difficultyFilter,
    type: typeFilter,
  })

  // Mutation for deleting questions
  const deleteQuestionMutation = api.questions.delete.useMutation({
    onSuccess: () => {
      refetch()
    },
    onError: (error) => {
      console.error('Failed to delete question:', error)
      // TODO: Add toast notification
    }
  })

  const handleSearch = useCallback(() => {
    setCurrentPage(1) // Reset to first page when searching
    refetch()
  }, [refetch])

  const handleDeleteQuestion = useCallback((questionId: string) => {
    if (confirm('この問題を削除してもよろしいですか？')) {
      deleteQuestionMutation.mutate({ id: questionId })
    }
  }, [deleteQuestionMutation])

  const handleViewQuestion = useCallback((questionId: string) => {
    console.log('View question details:', questionId)
    // TODO: Navigate to question details or open preview dialog
  }, [])

  const handleEditQuestion = useCallback((questionId: string) => {
    console.log('Edit question:', questionId)
    if (onEditQuestion) {
      onEditQuestion(questionId)
    }
    // TODO: Open edit dialog
  }, [onEditQuestion])

  const questions = questionsData?.questions || []
  const totalPages = questionsData?.pagination.pages || 1
  const total = questionsData?.pagination.total || 0

  return (
    <div className="space-y-4">
      {/* Header with Add Question Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">問題管理</h2>
        <Button 
          onClick={onCreateQuestion}
          className="bg-primary-500 hover:bg-primary-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          新しい問題を追加
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between glass-card rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Button 
            variant={!difficultyFilter && !typeFilter ? "default" : "outline"} 
            size="sm"
            onClick={() => {
              setDifficultyFilter(undefined)
              setTypeFilter(undefined)
              refetch()
            }}
          >
            すべて
          </Button>
          <Button 
            variant={difficultyFilter === 'EASY' ? "default" : "outline"} 
            size="sm"
            onClick={() => {
              setDifficultyFilter(difficultyFilter === 'EASY' ? undefined : 'EASY')
              setCurrentPage(1)
              refetch()
            }}
          >
            易しい
          </Button>
          <Button 
            variant={difficultyFilter === 'MEDIUM' ? "default" : "outline"} 
            size="sm"
            onClick={() => {
              setDifficultyFilter(difficultyFilter === 'MEDIUM' ? undefined : 'MEDIUM')
              setCurrentPage(1)
              refetch()
            }}
          >
            普通
          </Button>
          <Button 
            variant={difficultyFilter === 'HARD' ? "default" : "outline"} 
            size="sm"
            onClick={() => {
              setDifficultyFilter(difficultyFilter === 'HARD' ? undefined : 'HARD')
              setCurrentPage(1)
              refetch()
            }}
          >
            難しい
          </Button>
          <Button 
            variant={typeFilter === 'FINAL' ? "default" : "outline"} 
            size="sm"
            onClick={() => {
              setTypeFilter(typeFilter === 'FINAL' ? undefined : 'FINAL')
              setCurrentPage(1)
              refetch()
            }}
          >
            <Filter className="mr-1 h-3 w-3" />
            最終問題
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="問題文やカテゴリで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-64"
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Questions Table */}
      <div className="glass-card rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10">
              <TableHead className="text-white/70">問題文</TableHead>
              <TableHead className="text-white/70">タイプ</TableHead>
              <TableHead className="text-white/70">難易度</TableHead>
              <TableHead className="text-white/70">カテゴリ</TableHead>
              <TableHead className="text-white/70">タグ</TableHead>
              <TableHead className="text-white/70">作成日</TableHead>
              <TableHead className="w-12 text-white/70">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-white/70">
                  読み込み中...
                </TableCell>
              </TableRow>
            ) : questions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-white/70">
                  問題が見つかりませんでした
                </TableCell>
              </TableRow>
            ) : (
              questions.map((question) => (
                <TableRow key={question.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-medium text-white max-w-md">
                    <div className="truncate" title={question.text}>
                      {question.text}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[question.type]}`}>
                      {typeLabels[question.type]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${difficultyColors[question.difficulty]}`}>
                      {difficultyLabels[question.difficulty]}
                    </span>
                  </TableCell>
                  <TableCell className="text-white/70">
                    {question.category || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {question.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs border border-white/20 text-white/70">
                          {tag}
                        </span>
                      ))}
                      {question.tags.length > 2 && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs border border-white/20 text-white/70">
                          +{question.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-white/70">
                    {new Date(question.createdAt).toLocaleDateString('ja-JP')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                        <DropdownMenuLabel className="text-white">操作</DropdownMenuLabel>
                        <DropdownMenuItem 
                          onClick={() => handleViewQuestion(question.id)}
                          className="text-white hover:bg-slate-700"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          プレビュー
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleEditQuestion(question.id)}
                          className="text-white hover:bg-slate-700"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          編集
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-700" />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-400 hover:bg-red-900/20"
                          disabled={deleteQuestionMutation.isPending}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          削除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between glass-card rounded-lg p-4">
        <p className="text-sm text-white/70">
          {total} 件中 {Math.min((currentPage - 1) * pageSize + 1, total)}-{Math.min(currentPage * pageSize, total)} 件を表示
        </p>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage === 1 || isLoading}
            onClick={() => {
              setCurrentPage(currentPage - 1)
              refetch()
            }}
            className="border-white/20 text-white/70 hover:bg-white/10"
          >
            前へ
          </Button>
          <span className="text-sm text-white/70">
            ページ {currentPage} / {totalPages}
          </span>
          <Button 
            variant="outline" 
            size="sm"
            disabled={currentPage >= totalPages || isLoading}
            onClick={() => {
              setCurrentPage(currentPage + 1)
              refetch()
            }}
            className="border-white/20 text-white/70 hover:bg-white/10"
          >
            次へ
          </Button>
        </div>
      </div>
    </div>
  )
}