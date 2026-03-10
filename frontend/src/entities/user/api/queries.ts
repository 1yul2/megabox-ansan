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
