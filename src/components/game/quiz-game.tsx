/**
 * Quiz Game Component
 * 
 * Main quiz interface with questions, timer, and answer buttons
 * Handles real-time quiz gameplay and elimination mechanics
 */

'use client'

import { useState, useEffect, useCallback, type FC } from 'react'
import { useSocket } from '@/lib/socket/context'
// TODO: Socket event handlers will be implemented when socket context is ready
// import { onSocketEvent, offSocketEvent, emitSocketEvent } from '@/lib/socket/context'
import { CountdownTimer } from '@/components/game/countdown-timer'
import { QuizButton } from '@/components/game/quiz-button'
import { Button } from '@/components/ui/button'

type QuizButtonState = 'default' | 'selected' | 'correct' | 'incorrect' | 'disabled'

// TODO: Remove these temporary implementations when socket context is ready
const onSocketEvent = (_event: string, _handler: (...args: any[]) => void) => {
  // Temporary implementation
}
const offSocketEvent = (_event: string, _handler: (...args: any[]) => void) => {
  // Temporary implementation
}
const emitSocketEvent = (_event: string, _data: any) => {
  // Temporary implementation
}

type Props = {
  gameCode: string
  playerId: string
  onLeave: () => void
}

type Question = {
  id: string
  text: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: string
  explanation?: string
}

type QuizState = {
  currentQuestion: Question | null
  questionNumber: number
  totalQuestions: number
  timeLeft: number
  isAnswered: boolean
  selectedAnswer: string | null
  showResults: boolean
  isEliminated: boolean
  playerCount: number
}

export const QuizGame: FC<Props> = ({ gameCode, playerId, onLeave }) => {
  const { socket } = useSocket()
  
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: null,
    questionNumber: 0,
    totalQuestions: 10,
    timeLeft: 10,
    isAnswered: false,
    selectedAnswer: null,
    showResults: false,
    isEliminated: false,
    playerCount: 0
  })

  const [answerStartTime, setAnswerStartTime] = useState<number>(0)

  // Handle new question from server
  const handleNewQuestion = useCallback((data: {
    questionNumber: number
    question: Question
    timeLimit: number
  }) => {
    setQuizState(prev => ({
      ...prev,
      currentQuestion: data.question,
      questionNumber: data.questionNumber,
      timeLeft: data.timeLimit,
      isAnswered: false,
      selectedAnswer: null,
      showResults: false
    }))
    setAnswerStartTime(Date.now())
  }, [])

  // Handle answer submission
  const handleAnswerSelect = useCallback((answer: string) => {
    if (quizState.isAnswered || quizState.isEliminated) return

    const responseTime = (Date.now() - answerStartTime) / 1000
    
    setQuizState(prev => ({
      ...prev,
      isAnswered: true,
      selectedAnswer: answer
    }))

    // Send answer to server
    if (quizState.currentQuestion) {
      emitSocketEvent('submit-answer', {
        gameCode,
        playerId,
        questionId: quizState.currentQuestion.id,
        selectedAnswer: answer,
        responseTime
      })
    }
  }, [gameCode, playerId, quizState.isAnswered, quizState.isEliminated, quizState.currentQuestion, answerStartTime])

  // Handle timer expiration
  const handleTimeExpired = useCallback(() => {
    if (!quizState.isAnswered && !quizState.isEliminated) {
      const responseTime = 10 // Max time
      
      setQuizState(prev => ({
        ...prev,
        isAnswered: true,
        selectedAnswer: null
      }))

      // Send timeout to server
      if (quizState.currentQuestion) {
        emitSocketEvent('submit-answer', {
          gameCode,
          playerId,
          questionId: quizState.currentQuestion.id,
          selectedAnswer: '',
          responseTime
        })
      }
    }
  }, [gameCode, playerId, quizState.isAnswered, quizState.isEliminated, quizState.currentQuestion])

  // Determine button state based on quiz state
  const getButtonState = (choice: string): QuizButtonState => {
    if (quizState.isEliminated || quizState.isAnswered) {
      if (quizState.showResults) {
        // Show correct/incorrect results
        if (choice === quizState.currentQuestion?.correctAnswer) {
          return 'correct'
        } else if (choice === quizState.selectedAnswer) {
          return 'incorrect'
        } else {
          return 'disabled'
        }
      } else if (choice === quizState.selectedAnswer) {
        return 'selected'
      } else {
        return 'disabled'
      }
    }
    return 'default'
  }

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return

    // Question events
    onSocketEvent('next-question', handleNewQuestion)

    // Player elimination
    const handlePlayerEliminated = (data: { playerId: string; reason: string }) => {
      if (data.playerId === playerId) {
        setQuizState(prev => ({
          ...prev,
          isEliminated: true
        }))
      }
    }

    // Game ended
    const handleGameEnded = (_data: { winner: any; finalScores: any[] }) => {
      setQuizState(prev => ({
        ...prev,
        showResults: true
      }))
    }

    // Player count updates
    const handlePlayerLeft = (data: { playerCount: number }) => {
      setQuizState(prev => ({
        ...prev,
        playerCount: data.playerCount
      }))
    }

    onSocketEvent('player-eliminated', handlePlayerEliminated)
    onSocketEvent('game-ended', handleGameEnded)
    onSocketEvent('player-left', handlePlayerLeft)

    return () => {
      offSocketEvent('next-question', handleNewQuestion)
      offSocketEvent('player-eliminated', handlePlayerEliminated)
      offSocketEvent('game-ended', handleGameEnded)
      offSocketEvent('player-left', handlePlayerLeft)
    }
  }, [socket, handleNewQuestion, playerId])

  // Timer countdown effect
  useEffect(() => {
    if (quizState.timeLeft > 0 && !quizState.isAnswered && !quizState.isEliminated) {
      const timer = setTimeout(() => {
        setQuizState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }))
      }, 1000)

      return () => clearTimeout(timer)
    } else if (quizState.timeLeft === 0 && !quizState.isAnswered) {
      handleTimeExpired()
    }
    
    // Return cleanup function for all code paths
    return () => {}
  }, [quizState.timeLeft, quizState.isAnswered, quizState.isEliminated, handleTimeExpired])

  // Show elimination screen
  if (quizState.isEliminated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="glass-card rounded-lg p-8 text-center max-w-md">
          <div className="text-6xl mb-4">😵</div>
          <h2 className="text-3xl font-bold text-red-400 mb-4">脱落しました</h2>
          <p className="text-white/70 mb-6">
            お疲れ様でした！ゲームは続行中です。
          </p>
          <div className="space-y-3">
            <Button onClick={onLeave} variant="outline" className="w-full">
              ホームに戻る
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Show loading if no question
  if (!quizState.currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="glass-card rounded-lg p-8 text-center">
          <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">問題を準備中...</h2>
          <p className="text-white/70">しばらくお待ちください</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      {/* Question Header */}
      <div className="w-full max-w-4xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="glass-card rounded-lg px-4 py-2">
            <span className="text-white/70 text-sm">問題 </span>
            <span className="text-white font-bold">
              {quizState.questionNumber} / {quizState.totalQuestions}
            </span>
          </div>
          
          <div className="glass-card rounded-lg px-4 py-2">
            <span className="text-white/70 text-sm">残り </span>
            <span className="text-white font-bold">
              {quizState.playerCount} 人
            </span>
          </div>
        </div>

        {/* Timer */}
        <CountdownTimer
          timeLeft={quizState.timeLeft}
          totalTime={10}
          isActive={!quizState.isAnswered}
        />
      </div>

      {/* Question Card */}
      <div className="w-full max-w-4xl mb-8">
        <div className="glass-card rounded-lg p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center leading-relaxed">
            {quizState.currentQuestion.text}
          </h2>
        </div>
      </div>

      {/* Answer Options */}
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuizButton
            choice="A"
            text={quizState.currentQuestion.optionA}
            state={getButtonState('A')}
            showResult={quizState.showResults}
            onClick={() => handleAnswerSelect('A')}
          />
          <QuizButton
            choice="B"
            text={quizState.currentQuestion.optionB}
            state={getButtonState('B')}
            showResult={quizState.showResults}
            onClick={() => handleAnswerSelect('B')}
          />
          <QuizButton
            choice="C"
            text={quizState.currentQuestion.optionC}
            state={getButtonState('C')}
            showResult={quizState.showResults}
            onClick={() => handleAnswerSelect('C')}
          />
          <QuizButton
            choice="D"
            text={quizState.currentQuestion.optionD}
            state={getButtonState('D')}
            showResult={quizState.showResults}
            onClick={() => handleAnswerSelect('D')}
          />
        </div>
      </div>

      {/* Answer Status */}
      {quizState.isAnswered && (
        <div className="mt-6 glass-card rounded-lg p-4 text-center">
          <p className="text-white/70">
            {quizState.selectedAnswer 
              ? `回答: ${quizState.selectedAnswer}` 
              : '時間切れ'
            }
          </p>
          <p className="text-white/50 text-sm mt-1">
            次の問題をお待ちください...
          </p>
        </div>
      )}
    </div>
  )
}