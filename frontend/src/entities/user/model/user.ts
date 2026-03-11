import type { UserRole } from './role';

export type UserStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface User {
  id: number;
  username: string;
  name: string;
  position: UserRole;
  is_active: boolean;
  is_system: boolean;
  is_admin: boolean;
  status: UserStatus;
}
