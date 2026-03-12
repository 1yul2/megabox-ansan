import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  approveDayOff,
  createSchedule,
  deleteDayOff,
  deleteSchedule,
  getDayOffRequests,
  getScheduleUserList,
  getScheduleWeek,
  getShiftRequests,
  requestDayOff,
  updateSchedule,
} from './service';

import type {
  DayOffDecisionDTO,
  DayOffCreateDTO,
  ScheduleCreateDTO,
  ScheduleUpdateDTO,
} from './dto';
import type { CategoryCountsResponse } from '@/features/community/api/dto';

import { QUERY_KEYS } from '@/shared/api/queryKeys';

const SK = QUERY_KEYS.schedule;

// 특정 주차 스케줄 조회
export function useScheduleWeekQuery(year: number, week: number) {
  return useQuery({
    queryKey: SK.week(year, week),
    queryFn: () => getScheduleWeek(year, week),
  });
}

// 스케줄 생성 (어드민)
export function useCreateScheduleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ScheduleCreateDTO) => createSchedule(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SK.base });
      toast.success('스케줄이 생성되었습니다.');
    },
  });
}

// 스케줄 수정 (어드민)
export function useUpdateScheduleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ScheduleUpdateDTO }) => updateSchedule(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SK.base });
      toast.success('스케줄이 수정되었습니다.');
    },
  });
}

// 스케줄 삭제 (어드민)
export function useDeleteScheduleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteSchedule(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SK.base });
      toast.success('스케줄이 삭제되었습니다.');
    },
  });
}

// 휴무 리스트 조회
export function useDayOffRequestsQuery(status?: string) {
  return useQuery({
    queryKey: SK.dayoffs(status),
    queryFn: () => getDayOffRequests(status),
  });
}

// 휴무 신청 (크루)
export function useRequestDayOffMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DayOffCreateDTO) => requestDayOff(data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: SK.dayoffsBase(),
      });

      // 휴무신청은 커뮤니티 게시글 목록으로 노출됨
      await queryClient.invalidateQueries({
        queryKey: ['communityPosts'],
      });

      // 상단 탭 뱃지 즉시 갱신 (캐시가 없을 때도 반영)
      queryClient.setQueryData<CategoryCountsResponse>(
        ['community', 'category-counts'],
        (prev) => {
          const counts = { ...(prev?.counts ?? {}) };
          counts['휴무신청'] = (counts['휴무신청'] ?? 0) + 1;
          counts['전체'] = (counts['전체'] ?? 0) + 1;
          return { counts };
        },
        { updatedAt: 0 },
      );

      await queryClient.invalidateQueries({
        queryKey: ['community', 'category-counts'],
        refetchType: 'all',
      });

      await queryClient.refetchQueries({
        queryKey: ['community', 'category-counts'],
        type: 'all',
      });

      toast.success('휴무 신청이 완료되었습니다.');
    },
  });
}

// 휴무 승인/거절 (어드민)
export function useApproveDayOffMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DayOffDecisionDTO }) => approveDayOff(id, data),
    onSuccess: (_, { data }) => {
      void queryClient.invalidateQueries({ queryKey: SK.dayoffsBase() });
      toast.success(
        data.status === 'APPROVED' ? '휴무 신청을 승인했습니다.' : '휴무 신청을 거절했습니다.',
      );
    },
  });
}

// 휴무 삭제
export function useDeleteDayOffMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteDayOff(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SK.dayoffsBase() });
      toast.success('휴무 신청이 삭제되었습니다.');
    },
  });
}

// 근무교대 신청 목록 조회
export function useShiftRequestsQuery() {
  return useQuery({
    queryKey: SK.shifts(),
    queryFn: getShiftRequests,
  });
}

// 스케줄 배정용 직원 목록 조회
export function useScheduleUsersQuery() {
  return useQuery({
    queryKey: SK.users(),
    queryFn: async () => {
      const res = await getScheduleUserList();
      return res.items;
    },
  });
}
