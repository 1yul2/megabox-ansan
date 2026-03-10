// 공휴일
export interface HolidayDTO {
  id: number;
  label: string;
  date: string; // "YYYY-MM-DD"
}

export interface CreateHolidayRequestDTO {
  label: string;
  date: string;
}

export interface UpdateHolidayRequestDTO {
  label?: string | null;
}

// 직원
export interface AdminUserDTO {
  id: number;
  username: string;
  name: string;
  position: string;
  gender?: string;
  birth_date?: string;
  ssn?: string;
  phone?: string;
  email?: string;
  bank_name?: string;
  account_number?: string;
  hire_date?: string;
  retire_date?: string;
  is_active: boolean;
  wage?: number;
  unavailable_days?: number[];
  health_cert_expire?: string;
}

export type AdminUserDetailDTO = AdminUserDTO;

export interface AdminUsersResponseDTO {
  items: AdminUserDTO[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateAdminUserRequestDTO {
  username: string;
  password: string;
  name: string;
  position: string;
  gender?: string;
  birth_date?: string;
  ssn?: string;
  phone?: string;
  email?: string;
  bank_name?: string;
  account_number?: string;
  hire_date?: string;
  retire_date?: string;
  wage?: number;
  unavailable_days?: number[];
  health_cert_expire?: string;
}

export interface UpdateAdminUserRequestDTO {
  name?: string;
  position?: string;
  gender?: string;
  birth_date?: string;
  ssn?: string;
  phone?: string;
  email?: string;
  bank_name?: string;
  account_number?: string;
  hire_date?: string;
  retire_date?: string;
  is_active?: boolean;
  wage?: number;
  unavailable_days?: number[];
  health_cert_expire?: string;
}

// 4대보험 요율
export interface InsuranceRateResponseDTO {
  id: number;
  year: number;
  national_pension_rate?: number | null;
  health_insurance_rate?: number | null;
  long_term_care_rate?: number | null;
  employment_insurance_rate?: number | null;
}

export interface InsuranceRateCreateDTO {
  year: number;
  national_pension_rate: number;
  health_insurance_rate: number;
  long_term_care_rate: number;
  employment_insurance_rate: number;
}
