import 'server-only'

import { createHydrationHelpers } from '@trpc/react-query/rsc'
import { cache } from 'react'
import { NextRequest } from 'next/server'
import { appRouter } from '@/server/api/root'
import { createTRPCContext } from '@/server/api/trpc'
import { createQueryClient } from './query-client'

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const __createContext = cache(async () => {
  // Create a dummy NextRequest for SSR context
  const url = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const request = new NextRequest(url)

  return createTRPCContext({
    req: request,
  })
})

const getQueryClient = cache(createQueryClient)

// Create a server-side caller for direct use
export const serverTrpc = cache(async () => {
  const context = await __createContext()
  return appRouter.createCaller(context)
})

export const { trpc: api, HydrateClient } = createHydrationHelpers<typeof appRouter>(
  appRouter as unknown as Parameters<typeof createHydrationHelpers<typeof appRouter>>[0],
  getQueryClient
)
