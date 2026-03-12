import { Navigate } from 'react-router';

import { ROUTES } from '../../shared/constants/routes';

import type { PropsWithChildren } from 'react';

import { useUserQuery } from '@/entities/user/api/queries';
import { Loading } from '@/pages/404';
import { useAuthStore } from '@/shared/model/authStore';

interface AuthRouteProps extends PropsWithChildren {
  isPublic?: boolean;
  requireAdmin?: boolean;
  allowSystem?: boolean;
}

export const AuthRoute = ({ isPublic, requireAdmin, allowSystem, children }: AuthRouteProps) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: user, isLoading } = useUserQuery();

  // 토큰은 있으나 user 아직 로딩 중
  if (accessToken && isLoading) {
    return <Loading />;
  }

  // 비인증 → 로그인 페이지
  if (!isPublic && !isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // 로그인 상태인데 Public 페이지 접근 → 분기
  if (isPublic && isAuthenticated && user) {
    if (user.is_system) {
      return <Navigate to={ROUTES.WORK_STATUS} replace />;
    }
    return <Navigate to={ROUTES.ROOT} replace />;
  }

  // 인증된 상태에서 권한 검사
  if (isAuthenticated && user) {
    // 시스템 계정 → work-status만 허용
    if (user.is_system && !allowSystem) {
      return <Navigate to={ROUTES.WORK_STATUS} replace />;
    }

    // 관리자 계정이 시스템 전용 페이지 접근 차단
    if (user.is_admin && !user.is_system && allowSystem) {
      return <Navigate to={ROUTES.ROOT} replace />;
    }

    // 관리자 전용 페이지에 일반 유저 접근 차단
    if (requireAdmin && !user.is_admin) {
      return <Navigate to={ROUTES.ROOT} replace />;
    }
  }

  return <>{children}</>;
};
