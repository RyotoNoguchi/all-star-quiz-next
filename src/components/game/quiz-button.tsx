import { type FC, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type QuizChoice = 'A' | 'B' | 'C' | 'D'

type QuizButtonState = 'default' | 'selected' | 'correct' | 'incorrect' | 'disabled'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  choice: QuizChoice
  text: string
  state?: QuizButtonState
  showResult?: boolean
}

const getButtonStateClasses = (state: QuizButtonState): string => {
  switch (state) {
    case 'selected':
      return 'bg-blue-500 text-white border-blue-600 shadow-lg scale-105'
    case 'correct':
      return 'bg-green-500 text-white border-green-600 animate-quiz-bounce'
    case 'incorrect':
      return 'bg-red-500 text-white border-red-600 animate-quiz-shake'
    case 'disabled':
      return 'opacity-50 cursor-not-allowed'
    default:
      return 'bg-white/10 text-white border-white/20 hover:bg-white/20 hover:scale-105'
  }
}

export const QuizButton: FC<Props> = ({ 
  choice, 
  text, 
  state = 'default',
  showResult = false,
  className,
  disabled,
  ...props 
}) => {
  const isDisabled = disabled || state === 'disabled'
  
  return (
    <button
      className={cn(
        // Base styles
        'w-full p-4 rounded-lg border-2 transition-all duration-200 ease-in-out',
        'flex items-center gap-4 text-left font-medium backdrop-blur-sm',
        'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2',
        // State-specific styles
        getButtonStateClasses(state),
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {/* Choice letter (A, B, C, D) */}
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold',
        state === 'correct' && 'bg-green-600 border-green-700',
        state === 'incorrect' && 'bg-red-600 border-red-700',
        state === 'selected' && 'bg-blue-600 border-blue-700',
        state === 'default' && 'border-current'
      )}>
        {choice}
      </div>
      
      {/* Answer text */}
      <span className="flex-1 text-sm sm:text-base">
        {text}
      </span>
      
      {/* Result indicator */}
      {showResult && (state === 'correct' || state === 'incorrect') && (
        <div className="flex-shrink-0">
          {state === 'correct' ? (
            <span className="text-green-200 text-lg">✓</span>
          ) : (
            <span className="text-red-200 text-lg">✗</span>
          )}
        </div>
      )}
    </button>
  )
}