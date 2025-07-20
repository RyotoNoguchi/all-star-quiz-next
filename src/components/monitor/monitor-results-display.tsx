/**
 * Monitor Results Display Component
 * 
 * Large display results interface for All Star Quiz
 * Shows question results, eliminations, and game status
 */

'use client'

import { type FC } from 'react'
import { type Question, type GamePlayer, type QuestionResult, type PlayerResult } from '@/types/monitor'
import { Trophy, X, CheckCircle2, Clock, Crown } from 'lucide-react'

type Props = {
  question: Question
  questionNumber: number
  result: QuestionResult
  players: GamePlayer[]
  eliminatedPlayers?: GamePlayer[]
  isGameFinished?: boolean
  winner?: GamePlayer
}

export const MonitorResultsDisplay: FC<Props> = ({
  question,
  questionNumber,
  result,
  players,
  eliminatedPlayers = [],
  isGameFinished = false,
  winner
}) => {
  const correctPlayers = result.results.filter((r: PlayerResult) => r.isCorrect)
  const incorrectPlayers = result.results.filter((r: PlayerResult) => !r.isCorrect)
  const survivingPlayers = players.filter(p => p.status === 'ACTIVE')
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="glass-card rounded-2xl px-8 py-4">
          <div className="text-2xl lg:text-3xl font-bold text-white">
            問題 {questionNumber} 結果
          </div>
          {question.type === 'FINAL' && (
            <div className="text-xl lg:text-2xl text-yellow-300 font-semibold mt-2">
              🔔 最終問題
            </div>
          )}
        </div>

        {isGameFinished && winner ? (
          <div className="glass-card rounded-2xl px-8 py-6 text-center border-4 border-yellow-400">
            <div className="flex items-center space-x-4 text-yellow-300">
              <Crown className="w-8 h-8" />
              <div className="text-3xl lg:text-4xl font-bold">
                優勝者
              </div>
            </div>
            <div className="text-2xl lg:text-3xl text-white font-bold mt-2">
              {winner.userName}
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-2xl px-6 py-4 text-center">
            <div className="flex items-center space-x-3">
              <Trophy className="w-6 h-6 text-white/70" />
              <div className="text-xl lg:text-2xl font-bold text-white">
                {survivingPlayers.length}
              </div>
            </div>
            <div className="text-lg text-white/70">
              残り参加者
            </div>
          </div>
        )}
      </div>

      {/* Correct Answer */}
      <div className="glass-card rounded-2xl p-6 mb-8 border-2 border-green-400">
        <div className="flex items-center space-x-4 mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-400" />
          <div className="text-2xl lg:text-3xl font-bold text-white">
            正解: {result.correctAnswer}
          </div>
        </div>
        <div className="text-xl lg:text-2xl text-white/90">
          {question[`option${result.correctAnswer}`]}
        </div>
        {question.explanation && (
          <div className="mt-4 text-lg lg:text-xl text-white/70 border-t border-white/20 pt-4">
            {question.explanation}
          </div>
        )}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Correct Players */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
            <h3 className="text-2xl lg:text-3xl font-bold text-white">
              正解者 ({correctPlayers.length}名)
            </h3>
          </div>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {correctPlayers.length === 0 ? (
              <div className="text-center text-white/60 py-8">
                <div className="text-xl lg:text-2xl">正解者なし</div>
              </div>
            ) : (
              correctPlayers
                .sort((a: PlayerResult, b: PlayerResult) => a.responseTime - b.responseTime)
                .map((playerResult: PlayerResult, index: number) => {
                  const player = players.find(p => p.userId === playerResult.userId)
                  const isEliminated = eliminatedPlayers.some(p => p.userId === playerResult.userId)
                  const isWinner = winner?.userId === playerResult.userId
                  
                  return (
                    <div
                      key={playerResult.userId}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                        isWinner ? 'border-yellow-400 bg-yellow-500/20' :
                        isEliminated ? 'border-red-400 bg-red-500/20' : 
                        'border-green-400 bg-green-500/20'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-xl lg:text-2xl font-bold text-white">
                          #{index + 1}
                        </div>
                        <div className="text-lg lg:text-xl text-white font-semibold">
                          {player?.userName || 'Unknown'}
                        </div>
                        {isWinner && <Crown className="w-5 h-5 text-yellow-400" />}
                        {isEliminated && <X className="w-5 h-5 text-red-400" />}
                      </div>
                      <div className="flex items-center space-x-2 text-white/80">
                        <Clock className="w-4 h-4" />
                        <span className="text-lg font-mono">
                          {(playerResult.responseTime / 1000).toFixed(1)}s
                        </span>
                      </div>
                    </div>
                  )
                })
            )}
          </div>
        </div>

        {/* Incorrect/Eliminated Players */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <X className="w-6 h-6 text-red-400" />
            <h3 className="text-2xl lg:text-3xl font-bold text-white">
              脱落者 ({incorrectPlayers.length}名)
            </h3>
          </div>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {incorrectPlayers.length === 0 ? (
              <div className="text-center text-white/60 py-8">
                <div className="text-xl lg:text-2xl">脱落者なし</div>
              </div>
            ) : (
              incorrectPlayers.map((playerResult: PlayerResult) => {
                const player = players.find(p => p.userId === playerResult.userId)
                
                return (
                  <div
                    key={playerResult.userId}
                    className="flex items-center justify-between p-4 rounded-xl border-2 border-red-400 bg-red-500/20"
                  >
                    <div className="flex items-center space-x-4">
                      <X className="w-5 h-5 text-red-400" />
                      <div className="text-lg lg:text-xl text-white font-semibold">
                        {player?.userName || 'Unknown'}
                      </div>
                    </div>
                    <div className="text-lg text-red-300 font-semibold">
                      {playerResult.selectedAnswer || 'タイムアウト'}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Next Action */}
      <div className="mt-8 text-center">
        <div className="glass-card rounded-2xl px-8 py-4 inline-block">
          <div className="text-xl lg:text-2xl text-white/80">
            {isGameFinished ? (
              '🎉 ゲーム終了！お疲れ様でした！'
            ) : (
              '次の問題の準備をしています...'
            )}
          </div>
        </div>
      </div>
    </div>
  )
}