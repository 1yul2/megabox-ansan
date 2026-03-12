import type { User } from '@/entities/user/model/user';

// ── 로그인 ───────────────────────────────────────────────
export interface LoginRequestDTO {
  username: string;
  password: string;
}

export interface LoginResponseDTO {
  access_token: string;
  token_type: string;
  expires_in: number; // 초 단위 (예: 900)
  user: User;
}

// ── 로그아웃 ─────────────────────────────────────────────
export interface LogOutResponseDTO {
  message: string;
}

// ── 아이디 중복 확인 ──────────────────────────────────────
export interface UsernameCheckResponseDTO {
  available: boolean;
  message: string;
}

// ── 회원가입 ─────────────────────────────────────────────
export interface RegisterRequestDTO {
  // Step 1
  username: string;
  password: string;
  name: string;
  gender: '남' | '여'; // GenderEnum 값
  birth_date: string; // "YYYY-MM-DD"

  // Step 2
  ssn: string; // "XXXXXX-XXXXXXX"
  phone: string;
  email: string;

  // Step 3 (선택)
  bank_name?: string;
  account_number?: string;
  hire_date?: string;
  health_cert_expire?: string;
  unavailable_days?: number[]; // 0=일 ~ 6=토
}

export interface RegisterResponseDTO {
  message: string;
}

// ── Token Refresh 응답 ────────────────────────────────────
export interface RefreshResponseDTO {
  access_token: string;
  token_type: string;
  expires_in: number;
}
