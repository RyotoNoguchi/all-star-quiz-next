/**
 * Monitor Quiz Display Component
 * 
 * Large display quiz interface for All Star Quiz
 * Shows current question, options, and real-time player status
 */

'use client'

import { type FC } from 'react'
import { type Question, type GamePlayer } from '@/types/monitor'
import { Clock, Users, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

type Props = {
  question: Question
  currentQuestionNumber: number
  totalQuestions: number
  timeRemaining: number
  players: GamePlayer[]
  playerAnswers?: Record<string, string>
  showAnswers?: boolean
  correctAnswer?: string
}

export const MonitorQuizDisplay: FC<Props> = ({
  question,
  currentQuestionNumber,
  totalQuestions,
  timeRemaining,
  players,
  playerAnswers = {},
  showAnswers = false,
  correctAnswer
}) => {
  const activePlayers = players.filter(player => player.status === 'ACTIVE')
  const answeredCount = Object.keys(playerAnswers).length
  const remainingCount = activePlayers.length - answeredCount

  const getOptionStyle = (option: string) => {
    if (!showAnswers) return 'glass-card border-2 border-white/30'
    
    const isCorrect = option === correctAnswer
    if (isCorrect) {
      return 'glass-card border-4 border-green-400 bg-green-500/30'
    }
    return 'glass-card border-2 border-white/20 opacity-60'
  }

  const getOptionIcon = (option: string) => {
    if (!showAnswers) return null
    
    const isCorrect = option === correctAnswer
    if (isCorrect) {
      return <CheckCircle2 className="w-8 h-8 text-green-400" />
    }
    return <XCircle className="w-8 h-8 text-red-400" />
  }

  return (
    <div className="h-full flex flex-col">
      {/* Question Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="glass-card rounded-2xl px-8 py-4">
          <div className="text-2xl lg:text-3xl font-bold text-white">
            問題 {currentQuestionNumber} / {totalQuestions}
          </div>
          {question.type === 'FINAL' && (
            <div className="text-xl lg:text-2xl text-yellow-300 font-semibold mt-2">
              🔔 最終問題
            </div>
          )}
        </div>

        <div className="flex items-center space-x-6">
          {/* Answer Status */}
          <div className="glass-card rounded-2xl px-6 py-4 text-center">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-white/70" />
              <div className="text-xl lg:text-2xl font-bold text-white">
                {answeredCount} / {activePlayers.length}
              </div>
            </div>
            <div className="text-lg text-white/70">
              回答済み
            </div>
          </div>

          {/* Timer */}
          <div className="glass-card rounded-2xl px-6 py-4 text-center">
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-white/70" />
              <div className={`text-3xl lg:text-4xl font-bold ${
                timeRemaining <= 3 ? 'text-red-400' : 
                timeRemaining <= 5 ? 'text-yellow-400' : 
                'text-white'
              }`}>
                {timeRemaining}
              </div>
            </div>
            <div className="text-lg text-white/70">
              秒
            </div>
          </div>
        </div>
      </div>

      {/* Question Text */}
      <div className="glass-card rounded-3xl p-8 mb-8">
        <div className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white text-center leading-relaxed">
          {question.text}
        </div>
      </div>

      {/* Answer Options */}
      <div className="flex-1 grid grid-cols-2 gap-6 lg:gap-8">
        {(['A', 'B', 'C', 'D'] as const).map((option) => (
          <div
            key={option}
            className={`${getOptionStyle(option)} rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300`}
          >
            <div className="flex items-center justify-between w-full mb-4">
              <div className="text-4xl lg:text-5xl font-bold text-white">
                {option}
              </div>
              {getOptionIcon(option)}
            </div>
            <div className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-white leading-relaxed">
              {question[`option${option}`]}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Status */}
      <div className="mt-8 flex items-center justify-center">
        <div className="glass-card rounded-2xl px-8 py-4">
          {showAnswers ? (
            <div className="flex items-center space-x-4 text-white">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
              <span className="text-xl lg:text-2xl font-semibold">
                正解: {correctAnswer}
              </span>
            </div>
          ) : remainingCount > 0 ? (
            <div className="flex items-center space-x-4 text-white/80">
              <AlertCircle className="w-6 h-6" />
              <span className="text-xl lg:text-2xl">
                {remainingCount} 名の回答を待機中...
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-4 text-white">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
              <span className="text-xl lg:text-2xl font-semibold">
                全員回答完了！結果を集計中...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}