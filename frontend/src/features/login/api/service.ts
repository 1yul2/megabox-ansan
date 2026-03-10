import type { LoginRequestDTO, LoginResponseDTO, LogOutResponseDTO } from './dto';

import { apiClient } from '@/shared/api/apiClients';
import { useAuthStore } from '@/shared/model/authStore';

export const authService = {
  login: (data: LoginRequestDTO) =>
    apiClient.post<LoginResponseDTO>({ url: '/api/auth/login', data }),

  logout: async () => {
    const { refreshToken } = useAuthStore.getState();
    const response = await apiClient.post<LogOutResponseDTO>({
      url: '/api/auth/logout',
      params: {
        refresh_token: refreshToken,
      },
    });

    return response;
  },
};
