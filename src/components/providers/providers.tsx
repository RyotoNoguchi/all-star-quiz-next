/**
 * Providers Component
 * 
 * Client-side providers for the application
 * Separates client-side context from server components
 */

'use client'

import { type FC, type ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'
import { TRPCProvider } from '@/lib/trpc/provider'
import { SocketProvider } from '@/lib/socket/context'

type Props = {
  children: ReactNode
}

export const Providers: FC<Props> = ({ children }) => {
  return (
    <SessionProvider>
      <TRPCProvider>
        <SocketProvider>
          {children}
        </SocketProvider>
      </TRPCProvider>
    </SessionProvider>
  )
}