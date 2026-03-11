import type {
  AdminUserDTO,
  AdminUserDetailDTO,
  AdminUsersResponseDTO,
  CreateAdminUserRequestDTO,
  CreateHolidayRequestDTO,
  HolidayDTO,
  InsuranceRateCreateDTO,
  InsuranceRateResponseDTO,
  PendingUsersResponseDTO,
  RejectUserRequestDTO,
  SuspendUserRequestDTO,
  UpdateAdminUserRequestDTO,
  UpdateHolidayRequestDTO,
} from './dto';

import { apiClient } from '@/shared/api/apiClients';

// 공휴일
export const getHolidays = (year: number) =>
  apiClient.get<HolidayDTO[]>({ url: '/api/admin/holidays', params: { year } });

export const createHoliday = (data: CreateHolidayRequestDTO) =>
  apiClient.post<HolidayDTO>({ url: '/api/admin/holidays', data });

export const updateHoliday = (id: number, data: UpdateHolidayRequestDTO) =>
  apiClient.put<HolidayDTO>({ url: `/api/admin/holidays/${id}`, data });

export const deleteHoliday = (id: number) =>
  apiClient.delete<{ success: boolean }>({ url: `/api/admin/holidays/${id}` });

// 직원 관리
export const getAdminUsers = (params?: { q?: string; limit?: number; offset?: number }) =>
  apiClient.get<AdminUsersResponseDTO>({ url: '/api/admin/users', params });

export const getAdminUserDetail = (memberId: number) =>
  apiClient.get<AdminUserDetailDTO>({ url: `/api/admin/users/${memberId}` });

export const createAdminUser = (data: CreateAdminUserRequestDTO) =>
  apiClient.post<AdminUserDTO>({ url: '/api/admin/users/create', data });

export const updateAdminUser = (memberId: number, data: UpdateAdminUserRequestDTO) =>
  apiClient.patch<AdminUserDTO>({ url: `/api/admin/users/${memberId}`, data });

export const deleteAdminUser = (memberId: number) =>
  apiClient.delete<void>({ url: `/api/admin/users/${memberId}` });

// 가입 승인 관리
export const getPendingUsers = (params?: { limit?: number; offset?: number }) =>
  apiClient.get<PendingUsersResponseDTO>({ url: '/api/admin/pending-users', params });

export const approveUser = (memberId: number) =>
  apiClient.post<AdminUserDTO>({ url: `/api/admin/users/${memberId}/approve` });

export const rejectUser = (memberId: number, data: RejectUserRequestDTO = {}) =>
  apiClient.post<AdminUserDTO>({ url: `/api/admin/users/${memberId}/reject`, data });

export const suspendUser = (memberId: number, data: SuspendUserRequestDTO = {}) =>
  apiClient.post<AdminUserDTO>({ url: `/api/admin/users/${memberId}/suspend`, data });

export const unsuspendUser = (memberId: number) =>
  apiClient.post<AdminUserDTO>({ url: `/api/admin/users/${memberId}/unsuspend` });

// 4대보험 요율
export const getInsuranceRates = () =>
  apiClient.get<InsuranceRateResponseDTO[]>({ url: '/api/admin/insurance-rates' });

export const getInsuranceRateByYear = (year: number) =>
  apiClient.get<InsuranceRateResponseDTO>({ url: `/api/admin/insurance-rates/${year}` });

export const createInsuranceRate = (data: InsuranceRateCreateDTO) =>
  apiClient.post<InsuranceRateResponseDTO>({ url: '/api/admin/insurance-rates', data });

export const updateInsuranceRate = (year: number, data: InsuranceRateCreateDTO) =>
  apiClient.put<InsuranceRateResponseDTO>({ url: `/api/admin/insurance-rates/${year}`, data });

export const deleteInsuranceRate = (year: number) =>
  apiClient.delete<void>({ url: `/api/admin/insurance-rates/${year}` });
