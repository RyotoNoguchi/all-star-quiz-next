import { Inter } from 'next/font/google'
import { type Metadata } from 'next'
import { TRPCProvider } from '@/lib/trpc/provider'
import '@/styles/globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'All Star Quiz - Survival Quiz Game',
  description: 'A thrilling survival quiz game inspired by Japanese variety shows. Compete in real-time multiplayer elimination-style questions.',
  keywords: ['quiz', 'game', 'multiplayer', 'elimination', 'trivia', 'competition'],
  authors: [{ name: 'All Star Quiz Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

type Props = {
  children: React.ReactNode
}

const RootLayout = ({ children }: Props) => {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <TRPCProvider>
          {children}
        </TRPCProvider>
      </body>
    </html>
  )
}

export default RootLayout