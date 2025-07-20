/**
 * Monitor Player List Component
 * 
 * Large display player list for All Star Quiz
 * Shows current participants with status indicators
 */

'use client'

import { type FC } from 'react'
import { type GamePlayer } from '@/types/monitor'
import { Trophy, X, Wifi, WifiOff, Crown, Users } from 'lucide-react'

type Props = {
  players: GamePlayer[]
  highlightPlayer?: string
  showStatus?: boolean
}

export const MonitorPlayerList: FC<Props> = ({
  players,
  highlightPlayer,
  showStatus = true
}) => {
  const activePlayers = players.filter(player => player.status === 'ACTIVE')
  const eliminatedPlayers = players.filter(player => player.status === 'ELIMINATED')
  const winners = players.filter(player => player.status === 'WINNER')

  const getPlayerStatusIcon = (player: GamePlayer) => {
    switch (player.status) {
      case 'WINNER':
        return <Crown className="w-6 h-6 text-yellow-400" />
      case 'ELIMINATED':
        return <X className="w-6 h-6 text-red-400" />
      case 'DISCONNECTED':
        return <WifiOff className="w-6 h-6 text-gray-400" />
      case 'ACTIVE':
      default:
        return <Wifi className="w-6 h-6 text-green-400" />
    }
  }

  const getPlayerStatusColor = (player: GamePlayer) => {
    switch (player.status) {
      case 'WINNER':
        return 'border-yellow-400 bg-yellow-500/20'
      case 'ELIMINATED':
        return 'border-red-400 bg-red-500/20'
      case 'DISCONNECTED':
        return 'border-gray-400 bg-gray-500/20'
      case 'ACTIVE':
      default:
        return 'border-green-400 bg-green-500/20'
    }
  }

  const getStatusLabel = (status: GamePlayer['status']) => {
    switch (status) {
      case 'WINNER':
        return '優勝'
      case 'ELIMINATED':
        return '脱落'
      case 'DISCONNECTED':
        return '切断'
      case 'ACTIVE':
      default:
        return '参加中'
    }
  }

  const PlayerCard: FC<{ player: GamePlayer; index: number; section: string }> = ({ 
    player, 
    index, 
    section 
  }) => (
    <div
      className={`glass-card rounded-xl p-4 border-2 transition-all duration-300 ${
        getPlayerStatusColor(player)
      } ${
        highlightPlayer === player.userId ? 'ring-4 ring-white/50 scale-105' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-xl lg:text-2xl font-bold text-white">
            #{section === 'active' ? index + 1 : player.eliminationOrder || index + 1}
          </div>
          <div className="text-lg lg:text-xl text-white font-semibold truncate">
            {player.userName}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {showStatus && getPlayerStatusIcon(player)}
          {showStatus && (
            <span className="text-sm lg:text-base text-white/80 font-medium">
              {getStatusLabel(player.status)}
            </span>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="h-full space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 text-center border-2 border-green-400">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Trophy className="w-6 h-6 text-green-400" />
            <span className="text-xl lg:text-2xl font-bold text-white">
              {activePlayers.length}
            </span>
          </div>
          <div className="text-lg text-white/80">参加中</div>
        </div>
        
        <div className="glass-card rounded-xl p-4 text-center border-2 border-red-400">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <X className="w-6 h-6 text-red-400" />
            <span className="text-xl lg:text-2xl font-bold text-white">
              {eliminatedPlayers.length}
            </span>
          </div>
          <div className="text-lg text-white/80">脱落</div>
        </div>
        
        <div className="glass-card rounded-xl p-4 text-center border-2 border-yellow-400">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Crown className="w-6 h-6 text-yellow-400" />
            <span className="text-xl lg:text-2xl font-bold text-white">
              {winners.length}
            </span>
          </div>
          <div className="text-lg text-white/80">優勝</div>
        </div>
        
        <div className="glass-card rounded-xl p-4 text-center border-2 border-gray-400">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Users className="w-6 h-6 text-gray-400" />
            <span className="text-xl lg:text-2xl font-bold text-white">
              {players.length}
            </span>
          </div>
          <div className="text-lg text-white/80">総計</div>
        </div>
      </div>

      {/* Player Lists */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
        {/* Active Players */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Trophy className="w-6 h-6 text-green-400" />
            <h3 className="text-2xl lg:text-3xl font-bold text-white">
              参加中 ({activePlayers.length})
            </h3>
          </div>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {activePlayers.length === 0 ? (
              <div className="text-center text-white/60 py-8">
                <div className="text-xl lg:text-2xl">参加者なし</div>
              </div>
            ) : (
              activePlayers.map((player, index) => (
                <PlayerCard
                  key={player.userId}
                  player={player}
                  index={index}
                  section="active"
                />
              ))
            )}
          </div>
        </div>

        {/* Eliminated/Winner Players */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <X className="w-6 h-6 text-red-400" />
            <h3 className="text-2xl lg:text-3xl font-bold text-white">
              脱落・完了 ({eliminatedPlayers.length + winners.length})
            </h3>
          </div>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {[...winners, ...eliminatedPlayers].length === 0 ? (
              <div className="text-center text-white/60 py-8">
                <div className="text-xl lg:text-2xl">まだありません</div>
              </div>
            ) : (
              [...winners, ...eliminatedPlayers]
                .sort((a, b) => (a.eliminationOrder || 0) - (b.eliminationOrder || 0))
                .map((player, index) => (
                  <PlayerCard
                    key={player.userId}
                    player={player}
                    index={index}
                    section="eliminated"
                  />
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}