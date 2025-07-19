import { type FC } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { UserButton } from '@/components/auth/user-button'
import { SocketStatus } from '@/components/debug/socket-status'
import { ActionButtons } from '@/components/home/action-buttons'

const HomePage: FC = () => {
  return (
    <MainLayout>
      {/* Authentication section */}
      <div className="absolute top-4 right-4 z-10">
        <UserButton />
      </div>
      
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
        {/* Main title */}
        <h1 className="text-6xl md:text-8xl font-bold gradient-text mb-8">
          All Star Quiz
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl">
          The ultimate survival quiz game inspired by Japanese variety shows. 
          Compete in real-time multiplayer elimination-style questions!
        </p>

        {/* Game features */}
        <div className="glass-card rounded-lg p-8 mb-12 max-w-4xl">
          <h2 className="text-2xl font-bold text-white mb-6">Game Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white/80">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⏱️</span>
              <div>
                <h3 className="font-semibold">10-Second Time Limit</h3>
                <p className="text-sm">Quick thinking required for each question</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h3 className="font-semibold">Multiple Choice</h3>
                <p className="text-sm">Choose from A, B, C, or D options</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="font-semibold">Elimination Style</h3>
                <p className="text-sm">Wrong answers or timeouts eliminate players</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <h3 className="font-semibold">Last Player Wins</h3>
                <p className="text-sm">Survive all questions to claim victory</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <ActionButtons />

        {/* Development note */}
        <div className="mt-16 glass-card rounded-lg p-6 max-w-2xl">
          <p className="text-white/70 text-sm">
            🚧 This is the foundation for the All Star Quiz game. 
            The multiplayer backend, question system, and real-time features are coming soon!
          </p>
        </div>
      </div>
      
      {/* Development Socket Status */}
      <SocketStatus />
    </MainLayout>
  )
}

export default HomePage