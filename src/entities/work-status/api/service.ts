import type {
  WorkAction,
  WorkStatusEmployeesResponseDTO,
  WorkStatusKioskRequestDTO,
  WorkStatusRequestDTO,
  WorkStatusResponseDTO,
} from './dto';

import { apiClient } from '@/shared/api/apiClients';

export const workStatusService = {
  // ── 레거시: username + password 방식 ─────────────────────────────────
  changeStatus: async (
    action: WorkAction,
    data?: WorkStatusRequestDTO,
  ): Promise<WorkStatusResponseDTO> => {
    return apiClient.post<WorkStatusResponseDTO>({
      url: `/api/workstatus/${action.toLowerCase().replace('_', '-')}`,
      data,
    });
  },

  // ── 키오스크: user_id 방식 (시스템 계정 대리 기록) ───────────────────

  /** 근태 가능 직원 목록 조회 (approved + 크루/리더/미화) */
  getEligibleEmployees: async (): Promise<WorkStatusEmployeesResponseDTO> => {
    return apiClient.get<WorkStatusEmployeesResponseDTO>({
      url: '/api/workstatus/employees',
    });
  },

  /** 특정 직원의 오늘 근태 기록 조회 */
  getTodayRecord: async (userId: number): Promise<WorkStatusResponseDTO | null> => {
    return apiClient.get<WorkStatusResponseDTO | null>({
      url: `/api/workstatus/today/${userId}`,
    });
  },

  /** user_id 기반 근태 기록 (비밀번호 없음) */
  changeStatusByUserId: async (
    action: WorkAction,
    data: WorkStatusKioskRequestDTO,
  ): Promise<WorkStatusResponseDTO> => {
    return apiClient.post<WorkStatusResponseDTO>({
      url: `/api/workstatus/kiosk/${action.toLowerCase().replace('_', '-')}`,
      data,
    });
  },
};
