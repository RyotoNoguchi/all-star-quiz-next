import { type FC } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  timeLeft: number
  totalTime: number
  isActive?: boolean
  className?: string
}

export const CountdownTimer: FC<Props> = ({ 
  timeLeft,
  totalTime, 
  isActive = true,
  className 
}) => {

  const progress = (timeLeft / totalTime) * 100
  const isUrgent = timeLeft <= totalTime * 0.2 // Last 20% of time
  
  // Format time display
  const formatTime = (seconds: number) => seconds.toString()
  
  // Get urgency-based styling
  const getTimeUrgencyClass = (time: number, total: number) => {
    const ratio = time / total
    if (ratio <= 0.2) return 'text-red-400'
    if (ratio <= 0.5) return 'text-yellow-400'
    return 'text-white'
  }
  
  // Get progress bar color
  const getProgressBarColor = (time: number, total: number) => {
    const ratio = time / total
    if (ratio <= 0.2) return 'bg-red-500'
    if (ratio <= 0.5) return 'bg-yellow-500'
    return 'bg-green-500'
  }

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
          秒
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
            時間が足りません！
          </span>
        </div>
      )}
    </div>
  )
}