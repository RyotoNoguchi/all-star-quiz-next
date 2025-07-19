/**
 * Socket Status Debug Component
 * 
 * Development tool for monitoring Socket.io connection status
 */

'use client'

import { type FC } from 'react'
import { useSocket } from '@/lib/socket/context'
import { Button } from '@/components/ui/button'

export const SocketStatus: FC = () => {
  const { socket, isConnected, connectionError, connect, disconnect } = useSocket()

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 glass-card rounded-lg p-4 max-w-sm">
      <h3 className="text-sm font-semibold text-white mb-2">🔌 Socket.io Status</h3>
      
      <div className="space-y-2 text-xs text-white/80">
        <div className="flex items-center gap-2">
          <div 
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`} 
          />
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        
        {socket && (
          <div>Socket ID: {socket.id || 'N/A'}</div>
        )}
        
        {connectionError && (
          <div className="text-red-400">Error: {connectionError}</div>
        )}
      </div>

      <div className="flex gap-2 mt-3">
        <Button
          onClick={connect}
          disabled={isConnected}
          size="sm"
          variant="outline"
          className="text-xs"
        >
          Connect
        </Button>
        <Button
          onClick={disconnect}
          disabled={!isConnected}
          size="sm"
          variant="outline"
          className="text-xs"
        >
          Disconnect
        </Button>
      </div>
    </div>
  )
}