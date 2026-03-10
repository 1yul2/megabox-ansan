import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5분
      gcTime: 10 * 60 * 1000, // 10분
      refetchOnWindowFocus: false,
    },
  },

  queryCache: new QueryCache({}),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, _mutation) => {
      if (error instanceof AxiosError) {
        console.error(`Mutation failed`);
        return;
      }
    },
  }),
});
