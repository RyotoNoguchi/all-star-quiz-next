/**
 * Monitor Layout Component
 * 
 * Full-screen layout optimized for large displays (monitors/projectors)
 * Used for All Star Quiz game display system
 */

'use client'

import { type FC, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  title?: string
  gameCode?: string
}

export const MonitorLayout: FC<Props> = ({ children, title, gameCode }) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-600 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.1'%3E%3Ccircle cx='20' cy='20' r='2'/%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-8 glass-card border-0 border-b border-white/20">
        <div className="flex items-center space-x-6">
          <h1 className="text-4xl lg:text-5xl font-bold text-white gradient-text">
            オールスタークイズ
          </h1>
          {title && (
            <div className="text-2xl lg:text-3xl font-semibold text-white/90">
              {title}
            </div>
          )}
        </div>
        
        {gameCode && (
          <div className="text-right">
            <div className="text-xl lg:text-2xl text-white/70 font-medium">
              ゲームコード
            </div>
            <div className="text-3xl lg:text-4xl font-bold text-white tracking-wider">
              {gameCode}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 p-8 h-[calc(100vh-140px)]">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 border-t border-white/20">
        <div className="text-white/60 text-lg lg:text-xl font-medium">
          オールスター感謝祭風サバイバルクイズ
        </div>
      </footer>
    </div>
  )
}