/**
 * Monitor Waiting Room Component
 * 
 * Large display waiting room for All Star Quiz
 * Shows participant list and game status for audience
 */

'use client'

import { type FC } from 'react'
import { type GamePlayer } from '@/types/monitor'
import { Users, Clock, Trophy } from 'lucide-react'

type Props = {
  players: GamePlayer[]
  gameCode: string
  isStarting?: boolean
  startCountdown?: number
}

export const MonitorWaitingRoom: FC<Props> = ({
  players,
  gameCode,
  isStarting = false,
  startCountdown
}) => {
  const activePlayers = players.filter(player => player.status === 'ACTIVE')

  return (
    <div className="h-full flex flex-col">
      {/* Status Section */}
      <div className="flex items-center justify-center mb-12">
        <div className="glass-card rounded-3xl px-12 py-8 text-center">
          {isStarting ? (
            <div className="space-y-4">
              <div className="text-6xl lg:text-7xl font-bold text-white">
                {startCountdown}
              </div>
              <div className="text-3xl lg:text-4xl text-white/90 font-semibold">
                ゲーム開始まで
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-6 text-white/80">
                <Users className="w-12 h-12" />
                <Clock className="w-12 h-12" />
                <Trophy className="w-12 h-12" />
              </div>
              <div className="text-4xl lg:text-5xl text-white font-bold">
                参加者募集中
              </div>
              <div className="text-2xl lg:text-3xl text-white/80">
                ゲームコード: <span className="font-mono text-white font-bold">{gameCode}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Players Grid */}
      <div className="flex-1 flex flex-col">
        <div className="text-center mb-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-2">
            参加者一覧
          </h2>
          <div className="text-2xl lg:text-3xl text-white/70">
            {activePlayers.length} 名参加
          </div>
        </div>

        <div className="flex-1 glass-card rounded-3xl p-8 overflow-hidden">
          {activePlayers.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-white/60">
                <Users className="w-20 h-20 mx-auto mb-6 opacity-50" />
                <div className="text-2xl lg:text-3xl font-semibold">
                  参加者を待機中...
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto">
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {activePlayers.map((player, index) => (
                  <div
                    key={player.userId}
                    className="glass-card rounded-2xl p-6 text-center border-2 border-white/20 hover:border-white/40 transition-all duration-300"
                  >
                    <div className="text-2xl lg:text-3xl font-bold text-white mb-2">
                      #{index + 1}
                    </div>
                    <div className="text-xl lg:text-2xl text-white/90 font-semibold truncate">
                      {player.userName}
                    </div>
                    <div className="text-lg lg:text-xl text-white/60 mt-2">
                      準備完了
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 text-center">
        <div className="glass-card rounded-2xl px-8 py-4 inline-block">
          <div className="text-xl lg:text-2xl text-white/80">
            {isStarting ? (
              '間もなくゲームが開始されます'
            ) : (
              'スマートフォンでゲームコードを入力して参加してください'
            )}
          </div>
        </div>
      </div>
    </div>
  )
}