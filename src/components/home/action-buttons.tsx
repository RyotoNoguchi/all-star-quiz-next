/**
 * Action Buttons Component
 * 
 * Interactive buttons for home page actions
 * Separated as Client Component to handle onClick events
 */

'use client'

import { type FC } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export const ActionButtons: FC = () => {
  const router = useRouter()

  const handleDemoGame = () => {
    router.push('/game/DEMO01')
  }

  const handleHowToPlay = () => {
    alert('遊び方ページは準備中です')
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Button 
        variant="quiz" 
        size="xl" 
        className="font-bold"
        onClick={handleDemoGame}
      >
        デモゲームに参加
      </Button>
      <Button 
        variant="outline" 
        size="xl" 
        className="bg-white/10 text-white border-white/30 hover:bg-white/20"
        onClick={handleHowToPlay}
      >
        遊び方
      </Button>
    </div>
  )
}