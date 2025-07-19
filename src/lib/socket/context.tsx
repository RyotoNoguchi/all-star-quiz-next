/**
 * Socket.io Context Provider
 * 
 * React context for managing Socket.io connection state and events
 */

'use client'

import { createContext, useContext, useEffect, useState, type FC, type ReactNode } from 'react'
import { Socket } from 'socket.io-client'
import { initializeSocket, connectSocket, disconnectSocket, cleanupSocket } from './client'
import type { AdminPayload, GameStatus, JoinedGameData, PlayerJoinedData, PlayerLeftData } from './types'

// Socket context type
interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  connectionError: string | null
  connect: () => void
  disconnect: () => void
}

// Create context
const SocketContext = createContext<SocketContextType | undefined>(undefined)

// Provider props
interface SocketProviderProps {
  children: ReactNode
}

// Socket provider component
export const SocketProvider: FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Initialize socket on mount
  useEffect(() => {
    const socketInstance = initializeSocket()
    setSocket(socketInstance)

    // Set up event listeners
    const handleConnect = () => {
      setIsConnected(true)
      setConnectionError(null)
    }

    const handleDisconnect = () => {
      setIsConnected(false)
    }

    const handleConnectError = (error: Error) => {
      setConnectionError(error.message)
      setIsConnected(false)
    }

    const handleReconnect = () => {
      setIsConnected(true)
      setConnectionError(null)
    }

    socketInstance.on('connect', handleConnect)
    socketInstance.on('disconnect', handleDisconnect)
    socketInstance.on('connect_error', handleConnectError)
    socketInstance.on('reconnect', handleReconnect)

    // Cleanup on unmount
    return () => {
      socketInstance.off('connect', handleConnect)
      socketInstance.off('disconnect', handleDisconnect)
      socketInstance.off('connect_error', handleConnectError)
      socketInstance.off('reconnect', handleReconnect)
      cleanupSocket()
    }
  }, [])

  // Connect function
  const connect = () => {
    if (socket && !isConnected) {
      connectSocket()
    }
  }

  // Disconnect function
  const disconnect = () => {
    if (socket && isConnected) {
      disconnectSocket()
    }
  }

  const value: SocketContextType = {
    socket,
    isConnected,
    connectionError,
    connect,
    disconnect
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

// Hook to use socket context
export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

// Custom hooks for specific socket functionality

/**
 * Hook for managing game room connections
 */
export const useGameRoom = () => {
  const { socket, isConnected } = useSocket()
  const [gameState, setGameState] = useState({
    gameCode: null as string | null,
    playerCount: 0,
    maxPlayers: 20,
    status: 'waiting' as GameStatus,
    isJoined: false
  })

  // Join game function
  const joinGame = (gameCode: string, playerId: string, playerName: string) => {
    if (socket && isConnected) {
      socket.emit('join-game', { gameCode, playerId, playerName })
    }
  }

  // Leave game function
  const leaveGame = (gameCode: string, playerId: string) => {
    if (socket && isConnected) {
      socket.emit('leave-game', { gameCode, playerId })
    }
  }

  // Submit answer function
  const submitAnswer = (data: {
    gameCode: string
    playerId: string
    questionId: string
    selectedAnswer: string
    responseTime: number
  }) => {
    if (socket && isConnected) {
      socket.emit('submit-answer', data)
    }
  }

  // Set up event listeners
  useEffect(() => {
    if (!socket) return

    const handleJoinedGame = (data: JoinedGameData) => {
      setGameState(prev => ({
        ...prev,
        gameCode: data.gameCode,
        playerCount: data.playerCount,
        maxPlayers: data.maxPlayers,
        status: data.status,
        isJoined: true
      }))
    }

    const handlePlayerJoined = (data: PlayerJoinedData) => {
      setGameState(prev => ({
        ...prev,
        playerCount: data.playerCount
      }))
    }

    const handlePlayerLeft = (data: PlayerLeftData) => {
      setGameState(prev => ({
        ...prev,
        playerCount: data.playerCount
      }))
    }

    const handleGameStarting = () => {
      setGameState(prev => ({
        ...prev,
        status: 'starting'
      }))
    }

    const handleGameStarted = () => {
      setGameState(prev => ({
        ...prev,
        status: 'in_progress'
      }))
    }

    const handleGameEnded = () => {
      setGameState(prev => ({
        ...prev,
        status: 'finished'
      }))
    }

    socket.on('joined-game', handleJoinedGame)
    socket.on('player-joined', handlePlayerJoined)
    socket.on('player-left', handlePlayerLeft)
    socket.on('game-starting', handleGameStarting)
    socket.on('game-started', handleGameStarted)
    socket.on('game-ended', handleGameEnded)

    return () => {
      socket.off('joined-game', handleJoinedGame)
      socket.off('player-joined', handlePlayerJoined)
      socket.off('player-left', handlePlayerLeft)
      socket.off('game-starting', handleGameStarting)
      socket.off('game-started', handleGameStarted)
      socket.off('game-ended', handleGameEnded)
    }
  }, [socket])

  return {
    gameState,
    joinGame,
    leaveGame,
    submitAnswer
  }
}

/**
 * Hook for admin game controls
 */
export const useGameAdmin = () => {
  const { socket, isConnected } = useSocket()

  const adminAction = (data: {
    action: 'start-game' | 'next-question' | 'end-game' | 'pause-game'
    gameCode: string
    adminId: string
    payload?: AdminPayload
  }) => {
    if (socket && isConnected) {
      socket.emit('admin-action', data)
    }
  }

  return {
    adminAction
  }
}