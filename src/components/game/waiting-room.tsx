/**
 * Waiting Room Component
 * 
 * Pre-game lobby where players wait for the game to start
 * Shows player count, game settings, and start button for admin
 */

'use client'

import { type FC } from 'react'
import { useSession } from 'next-auth/react'
import { useGameAdmin } from '@/lib/socket/context'
import { Button } from '@/components/ui/button'

type Props = {
  gameCode: string
  playerCount: number
  maxPlayers: number
  onLeave: () => void
}

export const WaitingRoom: FC<Props> = ({ 
  gameCode, 
  playerCount, 
  maxPlayers, 
  onLeave 
}) => {
  const { data: session } = useSession()
  const { adminAction } = useGameAdmin()

  // Check if current user is admin (simplified for demo)
  // In a real app, this would be checked against the game session data
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN'

  const handleStartGame = () => {
    if (isAdmin && session?.user?.id) {
      adminAction({
        action: 'start-game',
        gameCode,
        adminId: session.user.id,
        payload: {
          totalQuestions: 10
        }
      })
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      {/* Main Waiting Card */}
      <div className="glass-card rounded-lg p-8 text-center max-w-2xl w-full">
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
          All Star Quiz
        </h1>
        
        {/* Game Status */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            プレイヤーを待っています...
          </h2>
          <p className="text-white/70">
            ゲームが開始されるまでお待ちください
          </p>
        </div>

        {/* Player Count */}
        <div className="mb-8">
          <div className="glass-card rounded-lg p-6 bg-white/5">
            <div className="text-4xl font-bold text-white mb-2">
              {playerCount} / {maxPlayers}
            </div>
            <div className="text-white/70 text-sm">
              参加プレイヤー数
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-white/10 rounded-full h-2 mt-4">
              <div 
                className="bg-gradient-to-r from-primary-400 to-secondary-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(playerCount / maxPlayers) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Game Rules */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-white mb-4">ゲームルール</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <span className="text-lg">⏱️</span>
              <span>制限時間10秒</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <span>4択クイズ</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <span>間違い・時間切れで脱落</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🏆</span>
              <span>最後の1人が勝者</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isAdmin ? (
            <Button
              onClick={handleStartGame}
              disabled={playerCount < 2}
              variant="quiz"
              size="lg"
              className="font-bold"
            >
              {playerCount < 2 ? '参加者が不足しています' : 'ゲーム開始！'}
            </Button>
          ) : (
            <div className="glass-card rounded-lg p-4 bg-white/5">
              <p className="text-white/70 text-sm">
                管理者がゲームを開始するまでお待ちください
              </p>
            </div>
          )}
          
          <Button
            onClick={onLeave}
            variant="outline"
            size="lg"
            className="bg-white/10 text-white border-white/30 hover:bg-white/20"
          >
            退出する
          </Button>
        </div>

        {/* Share Game Code */}
        <div className="mt-8 p-4 glass-card rounded-lg bg-white/5">
          <p className="text-white/70 text-sm mb-2">
            友達を招待しよう！
          </p>
          <div className="font-mono text-lg font-bold text-white">
            ゲームコード: {gameCode}
          </div>
        </div>
      </div>

      {/* Player List (Optional Enhancement) */}
      {playerCount > 0 && (
        <div className="mt-6 glass-card rounded-lg p-4 max-w-md w-full">
          <h4 className="text-white font-semibold mb-2 text-center">
            参加者一覧 ({playerCount}人)
          </h4>
          <div className="space-y-2">
            {/* Placeholder for actual player list */}
            {Array.from({ length: Math.min(playerCount, 5) }, (_, i) => (
              <div key={i} className="flex items-center gap-2 text-white/70 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>プレイヤー {i + 1}</span>
              </div>
            ))}
            {playerCount > 5 && (
              <div className="text-center text-white/50 text-xs">
                ...他 {playerCount - 5} 人
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}