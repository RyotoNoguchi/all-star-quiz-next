/**
 * Monitor Countdown Component
 * 
 * Large display countdown timer for All Star Quiz
 * Shows countdown with visual effects for urgency
 */

'use client'

import { type FC } from 'react'
import { Clock, Zap } from 'lucide-react'

type Props = {
  timeRemaining: number
  totalTime?: number
  isActive?: boolean
  showProgress?: boolean
  size?: 'small' | 'medium' | 'large'
}

export const MonitorCountdown: FC<Props> = ({
  timeRemaining,
  totalTime = 10,
  isActive = true,
  showProgress = true,
  size = 'large'
}) => {
  const progress = totalTime > 0 ? (timeRemaining / totalTime) * 100 : 0
  const isUrgent = timeRemaining <= 3
  const isWarning = timeRemaining <= 5 && timeRemaining > 3

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'w-24 h-24',
          text: 'text-2xl',
          icon: 'w-6 h-6'
        }
      case 'medium':
        return {
          container: 'w-32 h-32',
          text: 'text-4xl',
          icon: 'w-8 h-8'
        }
      case 'large':
      default:
        return {
          container: 'w-48 h-48 lg:w-64 lg:h-64',
          text: 'text-6xl lg:text-8xl',
          icon: 'w-12 h-12 lg:w-16 lg:h-16'
        }
    }
  }

  const getColorClasses = () => {
    if (!isActive) {
      return {
        border: 'border-gray-400',
        text: 'text-gray-400',
        bg: 'bg-gray-500/20',
        progress: 'stroke-gray-400'
      }
    }

    if (isUrgent) {
      return {
        border: 'border-red-400',
        text: 'text-red-400',
        bg: 'bg-red-500/30',
        progress: 'stroke-red-400'
      }
    }

    if (isWarning) {
      return {
        border: 'border-yellow-400',
        text: 'text-yellow-400',
        bg: 'bg-yellow-500/30',
        progress: 'stroke-yellow-400'
      }
    }

    return {
      border: 'border-green-400',
      text: 'text-white',
      bg: 'bg-green-500/20',
      progress: 'stroke-green-400'
    }
  }

  const sizeClasses = getSizeClasses()
  const colorClasses = getColorClasses()

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Timer Circle */}
      <div className="relative">
        <div
          className={`
            ${sizeClasses.container} 
            rounded-full 
            glass-card 
            border-4 
            ${colorClasses.border} 
            ${colorClasses.bg}
            flex 
            items-center 
            justify-center 
            transition-all 
            duration-300
            ${isUrgent && isActive ? 'animate-pulse' : ''}
          `}
        >
          {/* Progress Ring */}
          {showProgress && (
            <svg
              className="absolute inset-0 -rotate-90 transform"
              width="100%"
              height="100%"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="3"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                strokeWidth="3"
                strokeDasharray={`${progress * 2.827} ${283 - progress * 2.827}`}
                strokeLinecap="round"
                className={`${colorClasses.progress} transition-all duration-1000`}
              />
            </svg>
          )}

          {/* Timer Text */}
          <div
            className={`
              ${sizeClasses.text} 
              font-bold 
              ${colorClasses.text}
              ${isUrgent && isActive ? 'animate-bounce' : ''}
            `}
          >
            {timeRemaining}
          </div>

          {/* Urgent Effect */}
          {isUrgent && isActive && (
            <div className="absolute inset-0 rounded-full animate-ping border-4 border-red-400 opacity-75" />
          )}
        </div>
      </div>

      {/* Status Text */}
      <div className="text-center">
        <div className="flex items-center space-x-2 text-white/80">
          {isActive ? (
            <>
              {isUrgent ? (
                <Zap className={`${sizeClasses.icon} text-red-400`} />
              ) : (
                <Clock className={`${sizeClasses.icon} text-white/80`} />
              )}
              <span className="text-xl lg:text-2xl font-semibold">
                {isUrgent ? '急げ！' : isWarning ? '残り少ない！' : '時間内に回答してください'}
              </span>
            </>
          ) : (
            <>
              <Clock className={`${sizeClasses.icon} text-gray-400`} />
              <span className="text-xl lg:text-2xl font-semibold text-gray-400">
                待機中
              </span>
            </>
          )}
        </div>
      </div>

      {/* Progress Bar (optional) */}
      {showProgress && size === 'large' && (
        <div className="w-full max-w-md">
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className={`
                h-full 
                transition-all 
                duration-1000 
                rounded-full
                ${isUrgent ? 'bg-red-400' : isWarning ? 'bg-yellow-400' : 'bg-green-400'}
              `}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}