export const USER_ROLES = {
  CREW: '크루',
  ADMIN: '점장',
  SYSTEM: '시스템',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// 역할별 권한 체크
export const hasAdminAccess = (position: string): boolean => {
  return position === USER_ROLES.ADMIN;
};

export const hasCrewAccess = (position: string): boolean => {
  return position === USER_ROLES.CREW || position === USER_ROLES.ADMIN;
};

export const isSystemAccount = (position: string): boolean => {
  return position === USER_ROLES.SYSTEM;
};

export const ROLE_STYLES: Record<UserRole, string> = {
  크루: 'bg-gray-200 text-gray-800',
  점장: 'bg-green-100 text-green-600',
  시스템: 'bg-blue-100 text-blue-600',
};
