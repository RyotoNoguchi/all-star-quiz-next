import { type FC, useEffect, useState } from 'react'
import { cn, formatTime, getTimeUrgencyClass, getProgressBarColor } from '@/lib/utils'

type Props = {
  totalTime: number
  onTimeUp: () => void
  isActive?: boolean
  className?: string
}

export const CountdownTimer: FC<Props> = ({ 
  totalTime, 
  onTimeUp, 
  isActive = true,
  className 
}) => {
  const [timeLeft, setTimeLeft] = useState(totalTime)

  useEffect(() => {
    if (!isActive) return

    if (timeLeft <= 0) {
      onTimeUp()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, onTimeUp, isActive])

  // Reset timer when totalTime changes
  useEffect(() => {
    setTimeLeft(totalTime)
  }, [totalTime])

  const progress = (timeLeft / totalTime) * 100
  const isUrgent = timeLeft <= totalTime * 0.2 // Last 20% of time

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      {/* Timer display */}
      <div className="text-center mb-4">
        <div className={cn(
          'text-6xl font-bold transition-colors duration-300',
          getTimeUrgencyClass(timeLeft, totalTime),
          isUrgent && 'animate-quiz-pulse'
        )}>
          {formatTime(timeLeft)}
        </div>
        <div className="text-white/70 text-sm mt-1">
          seconds remaining
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-white/20 rounded-full h-3 backdrop-blur-sm border border-white/30">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300 ease-linear',
            getProgressBarColor(timeLeft, totalTime),
            progress <= 20 && 'animate-quiz-pulse'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Warning message for urgent state */}
      {isUrgent && timeLeft > 0 && (
        <div className="text-center mt-3">
          <span className="text-red-300 text-sm font-medium animate-quiz-pulse">
            Time running out!
          </span>
        </div>
      )}
    </div>
  )
}