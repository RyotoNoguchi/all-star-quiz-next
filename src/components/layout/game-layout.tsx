import { type FC, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  showHeader?: boolean
  headerContent?: ReactNode
  className?: string
}

export const GameLayout: FC<Props> = ({ 
  children, 
  showHeader = false, 
  headerContent,
  className = '' 
}) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-primary-500 via-secondary-500 to-primary-600 ${className}`}>
      {showHeader && (
        <header className="glass-card border-b border-white/20 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            {headerContent || (
              <h1 className="text-2xl font-bold gradient-text text-center">
                All Star Quiz
              </h1>
            )}
          </div>
        </header>
      )}
      
      <main className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-4xl">
          {children}
        </div>
      </main>
    </div>
  )
}