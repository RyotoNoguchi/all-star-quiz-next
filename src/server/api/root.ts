/**
 * Root tRPC Router
 * 
 * This is the primary router for the tRPC server. All routers
 * are imported and merged here to create the main API surface.
 */

import { createTRPCRouter } from '@/server/api/trpc'
import { usersRouter } from '@/server/api/routers/users'
import { questionsRouter } from '@/server/api/routers/questions'
import { gamesRouter } from '@/server/api/routers/games'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  users: usersRouter,
  questions: questionsRouter,
  games: gamesRouter,
})

// Export type definition of API
export type AppRouter = typeof appRouter