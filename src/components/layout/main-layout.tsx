import { type FC, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
}

export const MainLayout: FC<Props> = ({ children, className = '' }) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-primary-500 via-secondary-500 to-primary-600 ${className}`}>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}