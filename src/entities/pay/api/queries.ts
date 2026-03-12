import { payService } from './serviece';

import { QUERY_KEYS } from '@/shared/api/queryKeys';

export const payQueries = {
  payOverview: (year: number, month: number) => ({
    queryKey: QUERY_KEYS.pay.overview(year),
    queryFn: () => payService.getPayOverview(year, month),
  }),
};
