import type { MeResponseDTO } from './dto';

import { apiClient } from '@/shared/api/apiClients';

export const userService = {
  me: async (): Promise<MeResponseDTO> => {
    return apiClient.get<MeResponseDTO>({
      url: '/api/auth/me',
    });
  },
};
