import type { UserRole } from './role';

export interface User {
  id: number;
  username: string;
  name: string;
  position: UserRole;
  is_active: boolean;
}
