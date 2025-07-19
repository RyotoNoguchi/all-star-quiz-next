import { QueryClient } from '@tanstack/react-query'

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
        retry: (failureCount, error) => {
          // Don't retry on client errors (4xx)
          const errorWithData = error as Error & { data?: { httpStatus?: number } }
          const httpStatus = errorWithData?.data?.httpStatus
          if (typeof httpStatus === 'number' && httpStatus >= 400 && httpStatus < 500) {
            return false
          }
          return failureCount < 3
        },
      },
      mutations: {
        retry: false,
      },
    },
  })