import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { authService } from './service';

import { queryClient } from '@/shared/api/queryClient';
import { ROUTES } from '@/shared/constants/routes';
import { useAuthStore } from '@/shared/model/authStore';

export const useLoginMutation = () => {
  const { setAccessToken, setRefreshToken, setAuth } = useAuthStore();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
      setAuth();

      void queryClient.invalidateQueries({ queryKey: ['me'] });

      toast.success('로그인 성공!');
      void navigate(ROUTES.ROOT);
    },
  });
};

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
  });
};
