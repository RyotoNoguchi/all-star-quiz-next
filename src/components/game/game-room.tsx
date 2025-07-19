/**
 * Game Room Component
 *
 * Main game interface for All Star Quiz multiplayer sessions
 * Manages game states, player interactions, and real-time updates
 */

'use client'

import { useState, useEffect, type FC } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useSocket, useGameRoom } from '@/lib/socket/context'
import { GameLayout } from '@/components/layout/game-layout'
import { WaitingRoom } from './waiting-room'
import { QuizGame } from './quiz-game'
import { GameResults } from './game-results'
import { Button } from '@/components/ui/button'

type Props = {
  gameCode: string
}

export const GameRoom: FC<Props> = ({ gameCode }) => {
  const router = useRouter()
  const { data: session } = useSession()
  const { isConnected, connect } = useSocket()
  const { gameState, joinGame, leaveGame } = useGameRoom()

  const [playerName, setPlayerName] = useState('')
  const [hasJoined, setHasJoined] = useState(false)
  const [error, _setError] = useState<string | null>(null)

  // Auto-connect socket when component mounts
  useEffect(() => {
    if (!isConnected) {
      connect()
    }
  }, [isConnected, connect])

  // Set player name from session
  useEffect(() => {
    if (session?.user?.name) {
      setPlayerName(session.user.name)
    } else {
      setPlayerName(`Player_${Math.random().toString(36).substr(2, 4)}`)
    }
  }, [session])

  // Auto-join game when connected and player name is set
  useEffect(() => {
    if (isConnected && playerName && !hasJoined && !gameState.isJoined) {
      const playerId = session?.user?.id || `guest_${Date.now()}`
      joinGame(gameCode, playerId, playerName)
      setHasJoined(true)
    }
  }, [isConnected, playerName, hasJoined, gameState.isJoined, gameCode, joinGame, session?.user?.id])

  // Handle leaving game
  const handleLeaveGame = () => {
    const playerId = session?.user?.id || `guest_${Date.now()}`
    leaveGame(gameCode, playerId)
    router.push('/')
  }

  // Show connection status
  if (!isConnected) {
    return (
      <GameLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="glass-card rounded-lg p-8 text-center">
            <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">接続中...</h2>
            <p className="text-white/70">ゲームサーバーに接続しています</p>
          </div>
        </div>
      </GameLayout>
    )
  }

  // Show error if any
  if (error) {
    return (
      <GameLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="glass-card rounded-lg p-8 text-center max-w-md">
            <h2 className="text-xl font-bold text-red-400 mb-4">エラー</h2>
            <p className="text-white/70 mb-6">{error}</p>
            <Button onClick={() => router.push('/')} variant="outline">
              ホームに戻る
            </Button>
          </div>
        </div>
      </GameLayout>
    )
  }

  // Render game state
  const renderGameContent = () => {
    switch (gameState.status) {
      case 'waiting':
        return (
          <WaitingRoom
            gameCode={gameCode}
            playerCount={gameState.playerCount}
            maxPlayers={gameState.maxPlayers}
            onLeave={handleLeaveGame}
          />
        )

      case 'starting':
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="glass-card rounded-lg p-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">ゲーム開始！</h2>
              <div className="text-6xl font-bold gradient-text mb-4">3</div>
              <p className="text-white/70">準備はいいですか？</p>
            </div>
          </div>
        )

      case 'in_progress':
        return (
          <QuizGame
            gameCode={gameCode}
            playerId={session?.user?.id || `guest_${Date.now()}`}
            onLeave={handleLeaveGame}
          />
        )

      case 'finished':
        return (
          <GameResults
            gameCode={gameCode}
            onNewGame={() => router.push('/')}
            onLeave={handleLeaveGame}
          />
        )

      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="glass-card rounded-lg p-8 text-center">
              <h2 className="text-xl font-bold text-white mb-4">ゲーム情報を読み込み中...</h2>
              <div className="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          </div>
        )
    }
  }

  return (
    <GameLayout>
      {/* Game Code Header */}
      <div className="fixed top-4 left-4 z-10">
        <div className="glass-card rounded-lg px-4 py-2">
          <span className="text-white/70 text-sm">ゲームコード: </span>
          <span className="text-white font-mono font-bold text-lg">{gameCode}</span>
        </div>
      </div>

      {/* Leave Game Button */}
      <div className="fixed top-4 right-4 z-10">
        <Button
          onClick={handleLeaveGame}
          variant="outline"
          size="sm"
          className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"
        >
          退出
        </Button>
      </div>

      {/* Main Game Content */}
      {renderGameContent()}
    </GameLayout>
  )
}
