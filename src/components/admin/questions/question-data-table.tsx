/**
 * Question Data Table Component
 * 
 * Admin interface for managing quiz questions with CRUD operations
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
import { MoreHorizontal, Eye, Edit, Trash2, Plus } from 'lucide-react'

type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD'
type QuestionType = 'NORMAL' | 'FINAL'

const difficultyLabels: Record<QuestionDifficulty, string> = {
  EASY: '簡単',
  MEDIUM: '普通',
  HARD: '難しい',
}

const difficultyColors: Record<QuestionDifficulty, string> = {
  EASY: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HARD: 'bg-red-100 text-red-800',
}

const typeLabels: Record<QuestionType, string> = {
  NORMAL: '通常',
  FINAL: '最終問題',
}

type Props = {
  onCreateQuestion: () => void
  onEditQuestion: (questionId: string) => void
}

export const QuestionDataTable: FC<Props> = ({ onCreateQuestion, onEditQuestion }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchText, setSearchText] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuestionDifficulty | ''>('')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all')
  
  const pageSize = 10

  // Mock data for now - will be replaced with tRPC call
  const mockQuestions = [
    {
      id: 'q1',
      text: '日本の首都はどこですか？',
      category: '地理',
      difficulty: 'EASY' as QuestionDifficulty,
      type: 'NORMAL' as QuestionType,
      isActive: true,
      usageCount: 15,
      createdAt: new Date(),
      optionA: '東京',
      optionB: '大阪',
      optionC: '京都',
      optionD: '名古屋',
      correctAnswer: 'A',
    },
    {
      id: 'q2',
      text: '2024年のオリンピック開催地はどこですか？',
      category: 'スポーツ',
      difficulty: 'MEDIUM' as QuestionDifficulty,
      type: 'NORMAL' as QuestionType,
      isActive: true,
      usageCount: 8,
      createdAt: new Date(),
      optionA: '東京',
      optionB: 'パリ',
      optionC: 'ロサンゼルス',
      optionD: 'ブリスベン',
      correctAnswer: 'B',
    },
    {
      id: 'q3',
      text: '最終問題：All Star Quizで最も重要なルールは？',
      category: '最終問題',
      difficulty: 'HARD' as QuestionDifficulty,
      type: 'FINAL' as QuestionType,
      isActive: true,
      usageCount: 3,
      createdAt: new Date(),
      optionA: '正解者の中で最も早い回答者が優勝',
      optionB: '正解者の中で最も遅い回答者が脱落',
      optionC: '制限時間は10秒',
      optionD: '全て重要',
      correctAnswer: 'A',
    },
  ]

  // Filter questions based on current filters
  const filteredQuestions = mockQuestions.filter((question) => {
    const matchesSearch = searchText === '' || 
      question.text.toLowerCase().includes(searchText.toLowerCase()) ||
      question.category.toLowerCase().includes(searchText.toLowerCase())
    
    const matchesDifficulty = selectedDifficulty === '' || question.difficulty === selectedDifficulty
    
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'active' && question.isActive) ||
      (selectedStatus === 'inactive' && !question.isActive)
    
    return matchesSearch && matchesDifficulty && matchesStatus
  })

  const handleDeleteQuestion = (questionId: string) => {
    console.log('Delete question:', questionId)
    // TODO: Implement question deletion with tRPC
  }

  const handleViewQuestion = (questionId: string) => {
    console.log('View question details:', questionId)
    // TODO: Implement question preview
  }

  const handleToggleActive = (questionId: string) => {
    console.log('Toggle question active status:', questionId)
    // TODO: Implement status toggle with tRPC
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Button 
            variant={selectedStatus === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSelectedStatus('all')}
          >
            すべて
          </Button>
          <Button 
            variant={selectedStatus === 'active' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSelectedStatus('active')}
          >
            有効
          </Button>
          <Button 
            variant={selectedStatus === 'inactive' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSelectedStatus('inactive')}
          >
            無効
          </Button>
          
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value as QuestionDifficulty | '')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">全難易度</option>
            <option value="EASY">簡単</option>
            <option value="MEDIUM">普通</option>
            <option value="HARD">難しい</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="問題文やカテゴリで検索..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-64"
          />
          <Button onClick={onCreateQuestion} className="bg-primary-600 hover:bg-primary-700">
            <Plus className="mr-2 h-4 w-4" />
            新規作成
          </Button>
        </div>
      </div>

      {/* Questions Table */}
      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>問題文</TableHead>
              <TableHead>カテゴリ</TableHead>
              <TableHead>難易度</TableHead>
              <TableHead>種類</TableHead>
              <TableHead>状態</TableHead>
              <TableHead>使用回数</TableHead>
              <TableHead>作成日時</TableHead>
              <TableHead className="w-12">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuestions.map((question) => (
              <TableRow key={question.id}>
                <TableCell className="font-medium max-w-xs">
                  <div className="truncate" title={question.text}>
                    {question.text}
                  </div>
                </TableCell>
                <TableCell>{question.category}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      difficultyColors[question.difficulty]
                    }`}
                  >
                    {difficultyLabels[question.difficulty]}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      question.type === 'FINAL' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {typeLabels[question.type]}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      question.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {question.isActive ? '有効' : '無効'}
                  </span>
                </TableCell>
                <TableCell>{question.usageCount}回</TableCell>
                <TableCell>
                  {question.createdAt.toLocaleDateString('ja-JP')}
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
                      <DropdownMenuItem onClick={() => handleViewQuestion(question.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        プレビュー
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditQuestion(question.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        編集
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleToggleActive(question.id)}>
                        {question.isActive ? '無効にする' : '有効にする'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-red-600"
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
          {filteredQuestions.length} 件中 1-{filteredQuestions.length} 件を表示
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