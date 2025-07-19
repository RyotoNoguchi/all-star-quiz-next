/**
 * Game Results Component
 *
 * Shows final game results, winner, and player rankings
 * Provides options to start a new game or return to home
 */

'use client'

import { type FC } from 'react'
import { Button } from '@/components/ui/button'

type Props = {
  gameCode: string
  onNewGame: () => void
  onLeave: () => void
}

export const GameResults: FC<Props> = ({ gameCode: _gameCode, onNewGame, onLeave }) => {
  // Mock data for demonstration
  // In a real implementation, this would come from the game state
  const mockResults = {
    winner: {
      id: 'player1',
      name: 'Player 1',
      score: 100,
      correctAnswers: 8,
      averageResponseTime: 3.5
    },
    rankings: [
      { id: 'player1', name: 'Player 1', rank: 1, score: 100, correctAnswers: 8 },
      { id: 'player2', name: 'Player 2', rank: 2, score: 80, correctAnswers: 6 },
      { id: 'player3', name: 'Player 3', rank: 3, score: 60, correctAnswers: 4 },
      { id: 'player4', name: 'Player 4', rank: 4, score: 40, correctAnswers: 2 }
    ],
    gameStats: {
      totalQuestions: 10,
      totalPlayers: 8,
      gameDuration: '5分30秒',
      averageResponseTime: 4.2
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      {/* Winner Announcement */}
      <div className="glass-card rounded-lg p-8 text-center max-w-2xl w-full mb-6">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="text-4xl font-bold gradient-text mb-4">
          優勝！
        </h1>
        <h2 className="text-2xl font-bold text-white mb-2">
          {mockResults.winner.name}
        </h2>
        <p className="text-white/70 mb-6">
          おめでとうございます！見事に最後まで生き残りました！
        </p>

        {/* Winner Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="glass-card rounded-lg p-4 bg-white/5">
            <div className="text-2xl font-bold text-yellow-400">
              {mockResults.winner.score}
            </div>
            <div className="text-white/70 text-sm">スコア</div>
          </div>
          <div className="glass-card rounded-lg p-4 bg-white/5">
            <div className="text-2xl font-bold text-green-400">
              {mockResults.winner.correctAnswers}
            </div>
            <div className="text-white/70 text-sm">正解数</div>
          </div>
          <div className="glass-card rounded-lg p-4 bg-white/5">
            <div className="text-2xl font-bold text-blue-400">
              {mockResults.winner.averageResponseTime}s
            </div>
            <div className="text-white/70 text-sm">平均回答時間</div>
          </div>
        </div>
      </div>

      {/* Rankings */}
      <div className="glass-card rounded-lg p-6 max-w-2xl w-full mb-6">
        <h3 className="text-xl font-bold text-white mb-4 text-center">
          最終順位
        </h3>
        <div className="space-y-3">
          {mockResults.rankings.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                index === 0 ? 'bg-yellow-500/20' :
                index === 1 ? 'bg-gray-400/20' :
                index === 2 ? 'bg-amber-600/20' :
                'bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  index === 0 ? 'bg-yellow-500 text-black' :
                  index === 1 ? 'bg-gray-400 text-black' :
                  index === 2 ? 'bg-amber-600 text-black' :
                  'bg-white/20 text-white'
                }`}>
                  {player.rank}
                </div>
                <span className="text-white font-medium">{player.name}</span>
              </div>
              <div className="text-right">
                <div className="text-white font-bold">{player.score}pt</div>
                <div className="text-white/70 text-sm">{player.correctAnswers}問正解</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Game Statistics */}
      <div className="glass-card rounded-lg p-6 max-w-2xl w-full mb-6">
        <h3 className="text-xl font-bold text-white mb-4 text-center">
          ゲーム統計
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{mockResults.gameStats.totalQuestions}</div>
            <div className="text-white/70 text-sm">出題数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{mockResults.gameStats.totalPlayers}</div>
            <div className="text-white/70 text-sm">参加者数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{mockResults.gameStats.gameDuration}</div>
            <div className="text-white/70 text-sm">ゲーム時間</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{mockResults.gameStats.averageResponseTime}s</div>
            <div className="text-white/70 text-sm">平均回答時間</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={onNewGame}
          variant="quiz"
          size="lg"
          className="font-bold"
        >
          新しいゲーム
        </Button>
        <Button
          onClick={onLeave}
          variant="outline"
          size="lg"
          className="bg-white/10 text-white border-white/30 hover:bg-white/20"
        >
          ホームに戻る
        </Button>
      </div>
    </div>
  )
}
