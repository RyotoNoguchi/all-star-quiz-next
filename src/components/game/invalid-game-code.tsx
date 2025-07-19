/**
 * Invalid Game Code Component
 * 
 * Shows error message for invalid game codes
 * Client component to handle navigation
 */

'use client'

import { type FC } from 'react'
import { useRouter } from 'next/navigation'

export const InvalidGameCode: FC = () => {
  const router = useRouter()

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-500 via-secondary-500 to-primary-600">
      <div className="glass-card rounded-lg p-8 text-center max-w-md">
        <h1 className="text-2xl font-bold text-red-400 mb-4">無効なゲームコード</h1>
        <p className="text-white/70 mb-6">
          ゲームコードは4-8文字の英数字である必要があります。
        </p>
        <button 
          onClick={() => router.push('/')}
          className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          ホームに戻る
        </button>
      </div>
    </div>
  )
}