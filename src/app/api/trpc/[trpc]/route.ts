/**
 * tRPC API Route Handler
 * 
 * Next.js 15 App Router compatible tRPC endpoint
 * Handles all tRPC requests and provides type-safe API access
 */

import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { type NextRequest } from 'next/server'

import { appRouter } from '@/server/api/root'
import { createTRPCContext } from '@/server/api/trpc'

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ req }),
    ...(process.env.NODE_ENV === 'development' && {
      onError: ({ path, error }) => {
        console.error(
          `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`,
        )
      },
    }),
  })

export { handler as GET, handler as POST }