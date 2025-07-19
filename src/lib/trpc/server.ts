import 'server-only'

import { createHydrationHelpers } from '@trpc/react-query/rsc'
import { cache } from 'react'
import { appRouter } from '@/server/api/root'
import { createTRPCContext } from '@/server/api/trpc'
import { createQueryClient } from './query-client'

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  // Create a dummy NextRequest for SSR context
  const url = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const request = new Request(url) as any
  
  return createTRPCContext({
    req: request,
  })
})

const getQueryClient = cache(createQueryClient)

// Create caller using the router and context
const createCaller = appRouter.createCaller

export const { trpc: api, HydrateClient } = createHydrationHelpers<typeof appRouter>(
  createCaller,
  getQueryClient
)