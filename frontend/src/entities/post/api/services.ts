import type { PostResponseDTO } from './dto';

import { apiClient } from '@/shared/api/apiClients';

export const postServices = {
  getAlPosts: async (): Promise<PostResponseDTO> => {
    const response = await apiClient.get<PostResponseDTO>({
      url: 'api/community/posts',
    });
    return response;
  },
};
