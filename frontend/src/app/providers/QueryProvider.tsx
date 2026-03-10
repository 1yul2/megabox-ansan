import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '@/shared/api/queryClient';

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export default QueryProvider;
