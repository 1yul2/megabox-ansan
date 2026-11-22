import type { User } from '../model/user';

export type MeResponseDTO = User;

/** GET /api/auth/users/{id}/card — 프로필 카드 */
export interface UserCardDTO {
  id: number;
  name: string;
  position: string;
  gender?: string | null;
  profile_image?: string | null;
  phone?: string | null;
  birth_date?: string | null; // YYYY-MM-DD
}
