/**
 * Socket.io API Route
 * 
 * Real-time communication server for All Star Quiz multiplayer functionality
 * Handles game rooms, player connections, and real-time quiz events
 */

import { NextRequest } from 'next/server'
import { Server } from 'socket.io'
import { createServer } from 'node:http'
import { 
  gameRooms, 
  playerSessions, 
  updatePlayerSession, 
  removePlayerSession, 
  getPlayerSession 
} from '@/lib/socket/game-rooms'
import {
  startQuestionTimer,
  handleAnswerSubmission,
  clearQuestionTimers,
  getActivePlayersCount,
  processQuestionResults
} from '@/lib/socket/elimination-handler'
import type { PlayerAnswerSubmission } from '@/lib/socket/types'

// Socket.io server instance
let io: Server | undefined

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
            updatePlayerSession(socket.id, {
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
            removePlayerSession(socket.id)
            
            console.log(`👤 Player ${playerId} left game ${gameCode}`)
          } catch (error) {
            console.error('Error leaving game:', error)
          }
        })

        // Handle quiz answer submission with elimination logic
        socket.on('submit-answer', async (data: PlayerAnswerSubmission) => {
          const { gameCode, playerId, questionId, selectedAnswer, responseTime } = data
          
          try {
            const gameRoom = gameRooms.get(gameCode)
            if (!gameRoom) {
              socket.emit('error', { message: 'Game room not found' })
              return
            }

            // Validate that game is in progress
            if (gameRoom.status !== 'in_progress') {
              socket.emit('error', { message: 'Game is not in progress' })
              return
            }

            // Handle answer submission through elimination system
            const success = handleAnswerSubmission(
              gameRoom,
              playerId,
              questionId,
              selectedAnswer,
              responseTime
            )

            if (!success) {
              socket.emit('error', { 
                message: 'Invalid answer submission' 
              })
              return
            }

            // Broadcast that answer was received (without revealing the answer)
            io?.to(gameCode).emit('answer-received', {
              playerId,
              questionId,
              timestamp: new Date().toISOString(),
              activeAnswersCount: gameRoom.activeAnswers.size,
              totalActivePlayers: getActivePlayersCount(gameRoom)
            })

            // Check if all active players have answered
            const activePlayersCount = getActivePlayersCount(gameRoom)
            if (gameRoom.activeAnswers.size >= activePlayersCount && gameRoom.currentQuestionData) {
              // All players have answered - trigger immediate processing
              processQuestionResults(
                gameRoom,
                gameRoom.currentQuestionData,
                io!,
                gameRoom.currentQuestionData.isFinalQuestion
              ).catch(error => {
                console.error('Error processing immediate question results:', error)
              })
            }

            console.log(`📝 Answer submitted: Player ${playerId} in game ${gameCode}`)
          } catch (error) {
            console.error('Error submitting answer:', error)
            socket.emit('error', { message: 'Failed to submit answer' })
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
                
                // Start elimination timer for the new question
                if (payload?.question && typeof payload.question === 'object') {
                  const question = payload.question as {
                    id: string
                    text: string
                    optionA: string
                    optionB: string
                    optionC: string
                    optionD: string
                    correctAnswer: string
                    explanation?: string
                  }
                  
                  const isFinalQuestion = gameRoom.currentQuestion >= gameRoom.totalQuestions
                  
                  // Send question to players
                  io?.to(gameCode).emit('next-question', {
                    questionNumber: gameRoom.currentQuestion,
                    question: {
                      id: question.id,
                      text: question.text,
                      optionA: question.optionA,
                      optionB: question.optionB,
                      optionC: question.optionC,
                      optionD: question.optionD
                    },
                    timeLimit: 10,
                    isFinalQuestion,
                    activePlayersCount: getActivePlayersCount(gameRoom)
                  })
                  
                  // Start the elimination timer
                  startQuestionTimer(gameRoom, question, io!, isFinalQuestion)
                }
                break

              case 'end-game':
                // Clear any active timers
                clearQuestionTimers(gameRoom)
                gameRoom.status = 'finished'
                io?.to(gameCode).emit('game-ended', {
                  winner: payload?.winner,
                  finalScores: payload?.finalScores,
                  reason: payload?.reason || 'Game ended by admin'
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
          const playerSession = getPlayerSession(socket.id)
          if (playerSession && playerSession.gameCode) {
            const gameRoom = gameRooms.get(playerSession.gameCode)
            if (gameRoom) {
              gameRoom.players.delete(playerSession.playerId)
              
              // Mark player as eliminated due to disconnection
              gameRoom.eliminatedPlayers.add(playerSession.playerId)
              
              // Notify remaining players about disconnection
              io?.to(playerSession.gameCode).emit('player-disconnected', {
                playerId: playerSession.playerId,
                playerCount: gameRoom.players.size,
                activePlayersCount: getActivePlayersCount(gameRoom)
              })
            }
          }
          
          removePlayerSession(socket.id)
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

