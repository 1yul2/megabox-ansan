import type { MeResponseDTO, UserCardDTO } from './dto';

import { apiClient } from '@/shared/api/apiClients';

export const userService = {
  me: async (): Promise<MeResponseDTO> => {
    return apiClient.get<MeResponseDTO>({
      url: '/api/auth/me',
    });
  },
  card: async (userId: number): Promise<UserCardDTO> => {
    return apiClient.get<UserCardDTO>({
      url: `/api/auth/users/${userId}/card`,
    });
  },
};
