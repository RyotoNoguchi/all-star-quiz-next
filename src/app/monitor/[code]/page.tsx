/**
 * Monitor Display Page
 * 
 * Large display page for All Star Quiz games
 * Shows game status, questions, and results on large screens/projectors
 */

'use client'

import { type FC, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { z } from 'zod'
import { MonitorLayout } from '@/components/layout/monitor-layout'
import { MonitorWaitingRoom } from '@/components/monitor/monitor-waiting-room'
import { useSocket } from '@/lib/socket/context'
import { type GameStatusSchema } from '@/schemas/gameSchemas'

type GameState = z.infer<typeof GameStatusSchema>

const MonitorPage: FC = () => {
  const params = useParams()
  const router = useRouter()
  const gameCode = params.code as string
  const [showPlayerList, setShowPlayerList] = useState(false)
  
  // TODO: Implement proper game state management for monitor
  const { socket, isConnected, connectionError } = useSocket()
  const [gameState] = useState<GameState>('WAITING')

  useEffect(() => {
    // TODO: Implement monitor-specific socket connection
    if (gameCode && gameCode.length === 6 && socket) {
      console.log('Monitor connecting to game:', gameCode)
      // socket.emit('join-monitor', { gameCode })
    }
  }, [gameCode, socket])

  useEffect(() => {
    if (connectionError) {
      console.error('Monitor connection error:', connectionError)
    }
  }, [connectionError])

  // Handle keyboard shortcuts for monitor control
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'p':
        case 'P':
          setShowPlayerList(!showPlayerList)
          break
        case 'f':
        case 'F':
          if (document.fullscreenElement) {
            document.exitFullscreen()
          } else {
            document.documentElement.requestFullscreen()
          }
          break
        case 'Escape':
          setShowPlayerList(false)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showPlayerList])

  const getGameTitle = (state: GameState) => {
    switch (state) {
      case 'WAITING':
        return '参加者募集中'
      case 'STARTING':
        return 'ゲーム開始中'
      case 'IN_PROGRESS':
        return 'ゲーム進行中'
      case 'PAUSED':
        return 'ゲーム一時停止'
      case 'FINISHED':
        return 'ゲーム終了'
      case 'CANCELLED':
        return 'ゲームキャンセル'
      default:
        return 'オールスタークイズ'
    }
  }

  const renderGameContent = () => {
    if (!isConnected) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="glass-card rounded-3xl p-12 text-center">
            <div className="text-4xl lg:text-5xl font-bold text-white mb-4">
              接続中...
            </div>
            <div className="text-2xl lg:text-3xl text-white/70">
              ゲームに接続しています
            </div>
          </div>
        </div>
      )
    }

    if (connectionError) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="glass-card rounded-3xl p-12 text-center border-2 border-red-400">
            <div className="text-4xl lg:text-5xl font-bold text-red-400 mb-4">
              接続エラー
            </div>
            <div className="text-2xl lg:text-3xl text-white/70 mb-6">
              ゲームが見つかりません
            </div>
            <button
              onClick={() => router.push('/')}
              className="glass-card px-8 py-4 rounded-xl text-xl text-white font-semibold hover:bg-white/10 transition-all"
            >
              ホームに戻る
            </button>
          </div>
        </div>
      )
    }

    // Render based on game state
    switch (gameState) {
      case 'WAITING':
        return (
          <MonitorWaitingRoom
            players={[]}
            gameCode={gameCode}
            isStarting={false}
          />
        )

      case 'STARTING':
        return (
          <MonitorWaitingRoom
            players={[]}
            gameCode={gameCode}
            isStarting={true}
            startCountdown={5}
          />
        )

      case 'IN_PROGRESS':
        return (
          <div className="h-full flex items-center justify-center">
            <div className="glass-card rounded-3xl p-12 text-center">
              <div className="text-4xl lg:text-5xl font-bold text-white mb-4">
                ゲーム進行中
              </div>
              <div className="text-2xl lg:text-3xl text-white/70">
                問題が表示されています
              </div>
            </div>
          </div>
        )

      case 'FINISHED':
        return (
          <div className="h-full flex items-center justify-center">
            <div className="glass-card rounded-3xl p-12 text-center border-4 border-yellow-400">
              <div className="text-6xl lg:text-7xl font-bold text-yellow-300 mb-6">
                🏆 ゲーム終了 🏆
              </div>
              <div className="text-2xl lg:text-3xl text-white/80">
                お疲れ様でした！
              </div>
            </div>
          </div>
        )

      case 'PAUSED':
        return (
          <div className="h-full flex items-center justify-center">
            <div className="glass-card rounded-3xl p-12 text-center">
              <div className="text-4xl lg:text-5xl font-bold text-white mb-4">
                ⏸️ ゲーム一時停止
              </div>
              <div className="text-2xl lg:text-3xl text-white/70">
                管理者が再開するまでお待ちください
              </div>
            </div>
          </div>
        )

      case 'CANCELLED':
        return (
          <div className="h-full flex items-center justify-center">
            <div className="glass-card rounded-3xl p-12 text-center border-2 border-red-400">
              <div className="text-4xl lg:text-5xl font-bold text-red-400 mb-4">
                ゲームキャンセル
              </div>
              <div className="text-2xl lg:text-3xl text-white/70">
                ゲームが中止されました
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="h-full flex items-center justify-center">
            <div className="glass-card rounded-3xl p-12 text-center">
              <div className="text-4xl lg:text-5xl font-bold text-white mb-4">
                準備中...
              </div>
              <div className="text-2xl lg:text-3xl text-white/70">
                ゲームの準備をしています
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <MonitorLayout
      title={getGameTitle(gameState)}
      gameCode={gameCode.toUpperCase()}
    >
      {renderGameContent()}
      
      {/* Control Help */}
      <div className="absolute bottom-4 right-4 glass-card rounded-lg p-3 text-sm text-white/60">
        <div>P: プレイヤー一覧 | F: フルスクリーン | ESC: 閉じる</div>
      </div>
    </MonitorLayout>
  )
}

export default MonitorPage