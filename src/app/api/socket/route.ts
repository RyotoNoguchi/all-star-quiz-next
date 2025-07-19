/**
 * Socket.io API Route
 * 
 * Real-time communication server for All Star Quiz multiplayer functionality
 * Handles game rooms, player connections, and real-time quiz events
 */

import { NextRequest } from 'next/server'
import { Server } from 'socket.io'
import { createServer } from 'node:http'

// Socket.io server instance
let io: Server | undefined

// Game room management
const gameRooms = new Map<string, {
  code: string
  adminId: string
  players: Set<string>
  status: 'waiting' | 'starting' | 'in_progress' | 'finished'
  currentQuestion: number
  maxPlayers: number
}>()

// Player management
const playerSessions = new Map<string, {
  playerId: string
  gameCode: string | null
  socketId: string
  isActive: boolean
}>()

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  if (action === 'status') {
    return Response.json({
      status: 'active',
      activeRooms: gameRooms.size,
      activePlayers: playerSessions.size,
      timestamp: new Date().toISOString()
    })
  }

  return Response.json({ message: 'Socket.io server endpoint' })
}

export const POST = async (_request: NextRequest) => {
  try {
    // Initialize Socket.io server if not already done
    if (!io) {
      const httpServer = createServer()
      io = new Server(httpServer, {
        cors: {
          origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
          methods: ['GET', 'POST'],
          credentials: true
        },
        transports: ['websocket', 'polling']
      })

      // Socket.io event handlers
      io.on('connection', (socket) => {
        console.log(`🔌 User connected: ${socket.id}`)

        // Handle player joining a game room
        socket.on('join-game', async (data: { gameCode: string; playerId: string; playerName: string }) => {
          const { gameCode, playerId, playerName } = data
          
          try {
            // Check if game room exists
            const gameRoom = gameRooms.get(gameCode)
            if (!gameRoom) {
              socket.emit('error', { message: 'Game room not found' })
              return
            }

            // Check if room is full
            if (gameRoom.players.size >= gameRoom.maxPlayers) {
              socket.emit('error', { message: 'Game room is full' })
              return
            }

            // Check if game has already started
            if (gameRoom.status !== 'waiting') {
              socket.emit('error', { message: 'Game has already started' })
              return
            }

            // Add player to room
            await socket.join(gameCode)
            gameRoom.players.add(playerId)
            
            // Update player session
            playerSessions.set(socket.id, {
              playerId,
              gameCode,
              socketId: socket.id,
              isActive: true
            })

            // Notify all players in the room
            io?.to(gameCode).emit('player-joined', {
              playerId,
              playerName,
              playerCount: gameRoom.players.size,
              maxPlayers: gameRoom.maxPlayers
            })

            // Send room info to the joining player
            socket.emit('joined-game', {
              gameCode,
              playerCount: gameRoom.players.size,
              maxPlayers: gameRoom.maxPlayers,
              status: gameRoom.status
            })

            console.log(`👤 Player ${playerName} joined game ${gameCode}`)
          } catch (error) {
            console.error('Error joining game:', error)
            socket.emit('error', { message: 'Failed to join game' })
          }
        })

        // Handle player leaving a game room
        socket.on('leave-game', async (data: { gameCode: string; playerId: string }) => {
          const { gameCode, playerId } = data
          
          try {
            const gameRoom = gameRooms.get(gameCode)
            if (gameRoom) {
              await socket.leave(gameCode)
              gameRoom.players.delete(playerId)
              
              // Notify remaining players
              io?.to(gameCode).emit('player-left', {
                playerId,
                playerCount: gameRoom.players.size
              })
            }

            // Clean up player session
            playerSessions.delete(socket.id)
            
            console.log(`👤 Player ${playerId} left game ${gameCode}`)
          } catch (error) {
            console.error('Error leaving game:', error)
          }
        })

        // Handle quiz answer submission
        socket.on('submit-answer', async (data: { 
          gameCode: string; 
          playerId: string; 
          questionId: string;
          selectedAnswer: string;
          responseTime: number;
        }) => {
          const { gameCode, playerId, questionId, selectedAnswer, responseTime } = data
          
          try {
            // Broadcast answer to game admin for processing
            io?.to(gameCode).emit('answer-submitted', {
              playerId,
              questionId,
              selectedAnswer,
              responseTime,
              timestamp: new Date().toISOString()
            })

            console.log(`📝 Answer submitted: Player ${playerId} in game ${gameCode}`)
          } catch (error) {
            console.error('Error submitting answer:', error)
          }
        })

        // Handle game admin actions
        socket.on('admin-action', async (data: {
          action: 'start-game' | 'next-question' | 'end-game' | 'pause-game';
          gameCode: string;
          adminId: string;
          payload?: {
            totalQuestions?: number;
            question?: unknown;
            timeLimit?: number;
            winner?: unknown;
            finalScores?: unknown;
            reason?: string;
          };
        }) => {
          const { action, gameCode, adminId, payload } = data
          
          try {
            const gameRoom = gameRooms.get(gameCode)
            if (!gameRoom || gameRoom.adminId !== adminId) {
              socket.emit('error', { message: 'Unauthorized admin action' })
              return
            }

            switch (action) {
              case 'start-game':
                gameRoom.status = 'starting'
                io?.to(gameCode).emit('game-starting', {
                  countdown: 5,
                  message: 'Game starting in 5 seconds!'
                })
                
                // Start the game after countdown
                setTimeout(() => {
                  gameRoom.status = 'in_progress'
                  gameRoom.currentQuestion = 1
                  io?.to(gameCode).emit('game-started', {
                    currentQuestion: 1,
                    totalQuestions: payload?.totalQuestions || 10
                  })
                }, 5000)
                break

              case 'next-question':
                gameRoom.currentQuestion += 1
                io?.to(gameCode).emit('next-question', {
                  questionNumber: gameRoom.currentQuestion,
                  question: payload?.question,
                  timeLimit: payload?.timeLimit || 10
                })
                break

              case 'end-game':
                gameRoom.status = 'finished'
                io?.to(gameCode).emit('game-ended', {
                  winner: payload?.winner,
                  finalScores: payload?.finalScores
                })
                break

              case 'pause-game':
                io?.to(gameCode).emit('game-paused', {
                  reason: payload?.reason || 'Game paused by admin'
                })
                break
            }

            console.log(`🎮 Admin action: ${action} in game ${gameCode}`)
          } catch (error) {
            console.error('Error handling admin action:', error)
          }
        })

        // Handle disconnection
        socket.on('disconnect', () => {
          const playerSession = playerSessions.get(socket.id)
          if (playerSession && playerSession.gameCode) {
            const gameRoom = gameRooms.get(playerSession.gameCode)
            if (gameRoom) {
              gameRoom.players.delete(playerSession.playerId)
              
              // Notify remaining players about disconnection
              io?.to(playerSession.gameCode).emit('player-disconnected', {
                playerId: playerSession.playerId,
                playerCount: gameRoom.players.size
              })
            }
          }
          
          playerSessions.delete(socket.id)
          console.log(`🔌 User disconnected: ${socket.id}`)
        })
      })

      // Start the HTTP server for Socket.io
      const port = parseInt(process.env.SOCKET_PORT || '3002')
      httpServer.listen(port, () => {
        console.log(`🚀 Socket.io server running on port ${port}`)
      })
    }

    return Response.json({ 
      message: 'Socket.io server initialized successfully',
      status: 'active'
    })

  } catch (error) {
    console.error('Error initializing Socket.io server:', error)
    return Response.json({ 
      error: 'Failed to initialize Socket.io server' 
    }, { status: 500 })
  }
}

// Export game room management functions for tRPC integration
export const createGameRoom = (code: string, adminId: string, maxPlayers: number = 20) => {
  gameRooms.set(code, {
    code,
    adminId,
    players: new Set(),
    status: 'waiting',
    currentQuestion: 0,
    maxPlayers
  })
  
  return { success: true, gameCode: code }
}

export const getGameRoom = (code: string) => {
  return gameRooms.get(code)
}

export const deleteGameRoom = (code: string) => {
  const gameRoom = gameRooms.get(code)
  if (gameRoom) {
    // Notify all players that the game room is being deleted
    io?.to(code).emit('game-room-deleted', {
      message: 'Game room has been closed by the administrator'
    })
    
    // Remove all players from the room
    gameRoom.players.clear()
    gameRooms.delete(code)
    
    return { success: true }
  }
  
  return { success: false, error: 'Game room not found' }
}