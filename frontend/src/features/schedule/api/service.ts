import type {
  DayOffDecisionDTO,
  DayOffCreateDTO,
  ScheduleCreateDTO,
  ScheduleUpdateDTO,
} from './dto';
import type { DayOffResponse, ScheduleResponse, ShiftResponse } from '../model/type';

import { apiClient } from '@/shared/api/apiClients';

// 특정 주차 스케줄 조회
export const getScheduleWeek = (year: number, weekNumber: number) =>
  apiClient.get<ScheduleResponse[]>({
    url: `/api/schedule/week/${year}/${weekNumber}`,
  });

// 스케줄 생성 (어드민)
export const createSchedule = (data: ScheduleCreateDTO) =>
  apiClient.post<ScheduleResponse>({
    url: '/api/schedule/create',
    data,
  });

// 스케줄 수정 (어드민)
export const updateSchedule = (scheduleId: number, data: ScheduleUpdateDTO) =>
  apiClient.patch<ScheduleResponse>({
    url: `/api/schedule/${scheduleId}`,
    data,
  });

// 스케줄 삭제 (어드민)
export const deleteSchedule = (scheduleId: number) =>
  apiClient.delete<void>({
    url: `/api/schedule/${scheduleId}`,
  });

// 휴무 신청 (크루)
export const requestDayOff = (data: DayOffCreateDTO) =>
  apiClient.post<DayOffResponse>({
    url: '/api/schedule/dayoff/apply',
    data,
  });

// 휴무 리스트 조회
export const getDayOffRequests = (status?: string) =>
  apiClient.get<DayOffResponse[]>({
    url: '/api/schedule/dayoff',
    params: status ? { status } : undefined,
  });

// 휴무 승인/거절 (어드민)
export const approveDayOff = (dayOffId: number, data: DayOffDecisionDTO) =>
  apiClient.patch<DayOffResponse>({
    url: `/api/schedule/dayoff/${dayOffId}`,
    data,
  });

// 휴무 삭제
export const deleteDayOff = (dayOffId: number) =>
  apiClient.delete<void>({
    url: `/api/schedule/dayoff/${dayOffId}`,
  });

// 근무교대 신청 목록 조회
export const getShiftRequests = () =>
  apiClient.get<ShiftResponse[]>({
    url: '/api/schedule/shift/',
  });

// 스케줄 배정용 직원 목록 항목 타입 (id, username, name만 사용)
interface ScheduleUserListItem {
  id: number;
  username: string;
  name: string;
}

// 스케줄 배정용 직원 목록 조회 (admin endpoint 직접 호출, features 간 import 금지로 인해)
export const getScheduleUserList = () =>
  apiClient.get<{ items: ScheduleUserListItem[]; total: number }>({
    url: '/api/admin/users',
    params: { limit: 100 },
  });
