import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

// Quiz game utility functions
export const formatTime = (seconds: number): string => {
  return seconds.toString().padStart(2, '0')
}

export const getTimeUrgencyClass = (timeLeft: number, totalTime: number): string => {
  const percentage = (timeLeft / totalTime) * 100
  
  if (percentage <= 20) return 'text-red-500'
  if (percentage <= 50) return 'text-yellow-500'
  return 'text-green-500'
}

export const getProgressBarColor = (timeLeft: number, totalTime: number): string => {
  const percentage = (timeLeft / totalTime) * 100
  
  if (percentage <= 20) return 'bg-red-500'
  if (percentage <= 50) return 'bg-yellow-500'
  return 'bg-green-500'
}