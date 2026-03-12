import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { authService } from './service';

import type { RegisterRequestDTO } from './dto';

import { queryClient } from '@/shared/api/queryClient';
import { ROUTES } from '@/shared/constants/routes';
import { useAuthStore } from '@/shared/model/authStore';

// ── 로그인 ────────────────────────────────────────────────────────────────
export const useLoginMutation = () => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // Access Token + User → Zustand 메모리 저장 (localStorage 없음)
      setAuth(data.access_token, data.user, data.expires_in);
      void queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success('로그인 성공!');

      // 시스템 계정은 work-status로 분기
      if (data.user.is_system) {
        void navigate(ROUTES.WORK_STATUS);
      } else {
        void navigate(ROUTES.ROOT);
      }
    },
  });
};

// ── 로그아웃 ──────────────────────────────────────────────────────────────
export const useLogoutMutation = () => {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      toast.success('로그아웃 성공!');
      void navigate(ROUTES.LOGIN);
    },
    onError: () => {
      // 서버 에러여도 클라이언트는 로그아웃 처리
      clearAuth();
      queryClient.clear();
      void navigate(ROUTES.LOGIN);
    },
  });
};

// ── 아이디 중복 확인 ──────────────────────────────────────────────────────
export const useCheckUsernameQuery = (username: string) =>
  useQuery({
    queryKey: ['checkUsername', username],
    queryFn: () => authService.checkUsername(username),
    enabled: username.length >= 3,
    staleTime: 10_000, // 10초간 캐시 유지
  });

// ── 회원가입 신청 ─────────────────────────────────────────────────────────
export const useRegisterMutation = () =>
  useMutation({
    mutationFn: (data: RegisterRequestDTO) => authService.register(data),
  });
