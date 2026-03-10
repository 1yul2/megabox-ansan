import { postServices } from './services';

import { QUERY_KEYS } from '@/shared/api/queryKeys';

export const postQueries = {
  allPosts: () => ({
    queryKey: QUERY_KEYS.community.base,
    queryFn: () => postServices.getAlPosts(),
  }),
};
