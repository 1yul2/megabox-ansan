import { useQuery } from '@tanstack/react-query';

import { userService } from './service';

import { useAuthStore } from '@/shared/model/authStore';

export const useUserQuery = () => {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['me'],
    queryFn: userService.me,
    enabled: !!accessToken,
  });
};

/** 프로필 카드 조회 — 카드가 열렸을 때만 요청 */
export const useUserCardQuery = (userId: number | null, enabled = true) => {
  return useQuery({
    queryKey: ['user-card', userId],
    queryFn: () => userService.card(userId as number),
    enabled: enabled && userId != null && userId > 0,
    staleTime: 60 * 1000,
  });
};
