import { Navigate } from 'react-router';

import { ROUTES } from '../../shared/constants/routes';

import type { PropsWithChildren } from 'react';

import { useUserQuery } from '@/entities/user/api/queries';
import { isSystemAccount, USER_ROLES } from '@/entities/user/model/role';
import { Loading } from '@/pages/404';
import { useAuthStore } from '@/shared/model/authStore';

interface AuthRouteProps extends PropsWithChildren {
  isPublic?: boolean;
  requireAdmin?: boolean; // 관리자 전용 페이지
  allowSystem?: boolean; // 시스템 계정 접근 허용
}

export const AuthRoute = ({ isPublic, requireAdmin, allowSystem, children }: AuthRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data: user, isLoading } = useUserQuery();
  console.log('AuthRoute - user:', user);

  // 토큰은 있는데 user 아직 로딩 중
  if (accessToken && isLoading) {
    return <Loading />; // TODO: 로딩 스피너 등으로 대체
  }

  if (!isPublic && !isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Public 페이지인데 로그인 상태
  if (isPublic && isAuthenticated && user) {
    // 시스템 계정은 work-status로 리다이렉트
    if (isSystemAccount(user.position)) {
      return <Navigate to={ROUTES.WORK_STATUS} replace />;
    }
    // 일반 유저는 메인으로
    return <Navigate to={ROUTES.ROOT} replace />;
  }

  // 인증된 상태에서 권한 체크
  if (isAuthenticated && user) {
    const userIsSystem = isSystemAccount(user.position);

    // 시스템 계정은 work-status만 접근 가능
    if (userIsSystem && !allowSystem) {
      return <Navigate to={ROUTES.WORK_STATUS} replace />;
    }

    // 관리자 계정 시스템 페이지 접근시 차단
    if (user.position === USER_ROLES.ADMIN && allowSystem) {
      return <Navigate to={ROUTES.ROOT} replace />;
    }

    // 관리자 전용 페이지에 일반 유저 접근 시
    if (requireAdmin && user.position !== USER_ROLES.ADMIN) {
      return <Navigate to={ROUTES.ROOT} replace />;
    }
  }

  return <>{children}</>;
};
