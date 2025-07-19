/**
 * Question Form Component
 * 
 * Modal form for creating and editing quiz questions
 */

'use client'

import { type FC, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { type QuestionFormData, questionFormSchema } from '@/schemas/questionSchemas'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: QuestionFormData) => void
  initialData?: QuestionFormData | null
  isPending: boolean
}

export const QuestionForm: FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isPending,
}) => {
  const isEditMode = !!initialData

  const form = useForm({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      text: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      difficulty: 'MEDIUM',
      category: '',
      explanation: '',
      isActive: true,
      type: 'NORMAL',
    },
  })

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset(initialData)
    } else {
      form.reset({
        text: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
        difficulty: 'MEDIUM',
        category: '',
        explanation: '',
        isActive: true,
        type: 'NORMAL',
      })
    }
  }, [initialData, form])

  const handleSubmit = (data: QuestionFormData) => {
    onSubmit(data)
  }

  const handleClose = () => {
    if (!isPending) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? '問題を編集' : '新しい問題を作成'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? '問題の情報を編集してください。' 
              : 'クイズ問題の詳細を入力してください。'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* 問題文 */}
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>問題文 *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="問題文を入力してください（10文字以上500文字以内）"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    文字数: {field.value?.length || 0}/500
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 選択肢 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">選択肢</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="optionA"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>選択肢 A *</FormLabel>
                      <FormControl>
                        <Input placeholder="選択肢Aを入力" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="optionB"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>選択肢 B *</FormLabel>
                      <FormControl>
                        <Input placeholder="選択肢Bを入力" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="optionC"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>選択肢 C *</FormLabel>
                      <FormControl>
                        <Input placeholder="選択肢Cを入力" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="optionD"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>選択肢 D *</FormLabel>
                      <FormControl>
                        <Input placeholder="選択肢Dを入力" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 正解 */}
            <FormField
              control={form.control}
              name="correctAnswer"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>正解 *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-row space-x-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="A" id="correct-a" />
                        <Label htmlFor="correct-a">A</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="B" id="correct-b" />
                        <Label htmlFor="correct-b">B</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="C" id="correct-c" />
                        <Label htmlFor="correct-c">C</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="D" id="correct-d" />
                        <Label htmlFor="correct-d">D</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 難易度とカテゴリ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>難易度 *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'NORMAL'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="難易度を選択" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EASY">簡単</SelectItem>
                        <SelectItem value="MEDIUM">普通</SelectItem>
                        <SelectItem value="HARD">難しい</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>カテゴリ *</FormLabel>
                    <FormControl>
                      <Input placeholder="例: 地理、歴史、スポーツ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 問題種類 */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>問題種類</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || 'NORMAL'}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="問題種類を選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="NORMAL">通常問題</SelectItem>
                      <SelectItem value="FINAL">最終問題</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    最終問題は正解者の中で最も早い回答者が勝者となります
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 解説 */}
            <FormField
              control={form.control}
              name="explanation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>解説（任意）</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="問題の解説を入力してください（300文字以内）"
                      className="min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    文字数: {field.value?.length || 0}/300
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 有効/無効 */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">問題の状態</FormLabel>
                    <FormDescription>
                      有効な問題のみゲームで使用されます
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isPending}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? '保存中...' : (isEditMode ? '更新' : '作成')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}