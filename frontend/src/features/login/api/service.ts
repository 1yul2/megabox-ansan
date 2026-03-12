import type {
  LoginRequestDTO,
  LoginResponseDTO,
  LogOutResponseDTO,
  RegisterRequestDTO,
  RegisterResponseDTO,
  UsernameCheckResponseDTO,
} from './dto';

import { apiClient } from '@/shared/api/apiClients';

export const authService = {
  login: (data: LoginRequestDTO) =>
    apiClient.post<LoginResponseDTO>({ url: '/api/auth/login', data }),

  /** 로그아웃 — Refresh Token은 httpOnly Cookie로 자동 전송 */
  logout: () => apiClient.post<LogOutResponseDTO>({ url: '/api/auth/logout' }),

  /** 아이디 중복 확인 */
  checkUsername: (username: string) =>
    apiClient.get<UsernameCheckResponseDTO>({
      url: '/api/auth/check-username',
      params: { username },
    }),

  /** 회원가입 신청 */
  register: (data: RegisterRequestDTO) =>
    apiClient.post<RegisterResponseDTO>({ url: '/api/auth/register', data }),
};
