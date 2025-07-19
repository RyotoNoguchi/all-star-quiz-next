/**
 * Game Room Page
 * 
 * Main game interface for All Star Quiz multiplayer sessions
 * Handles real-time quiz gameplay with elimination mechanics
 */

import { type FC } from 'react'
import { GameRoom } from '@/components/game/game-room'
import { InvalidGameCode } from '@/components/game/invalid-game-code'

type Props = {
  params: {
    code: string
  }
}

const GameRoomPage: FC<Props> = ({ params }) => {
  const gameCode = params.code.toUpperCase()

  // Basic validation for game code format
  if (!/^[A-Z0-9]{4,8}$/.test(gameCode)) {
    return <InvalidGameCode />
  }

  return <GameRoom gameCode={gameCode} />
}

export default GameRoomPage