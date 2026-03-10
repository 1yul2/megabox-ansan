import { ArrowLeftRight, Calendar, CalendarPlus, Check, User, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import type { ScheduleResponse } from '@/features/schedule';
import type { ScheduleCreateDTO } from '@/features/schedule/api/dto';

import { useUserQuery } from '@/entities/user/api/queries';
import { getPositionBadgeStyle } from '@/entities/user/model/position';
import { hasAdminAccess } from '@/entities/user/model/role';
import {
  DayoffModal,
  ScheduleCard,
  ScheduleFormModal,
  ShiftModal,
  WeekNavigator,
  WEEKDAY_KO,
  addWeeks,
  formatDate,
  getISOWeek,
  getWeekDates,
  useCreateScheduleMutation,
  useDeleteScheduleMutation,
  useRequestDayOffMutation,
  useScheduleUsersQuery,
  useScheduleWeekQuery,
  useUpdateScheduleMutation,
} from '@/features/schedule';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

const SchedulePage = () => {
  const today = new Date();
  const [{ year, week }, setYearWeek] = useState(() => getISOWeek(today));
  const weekDates = getWeekDates(year, week);

  const [viewMode, setViewMode] = useState<'my' | 'all'>('all');
  const [dayoffOpen, setDayoffOpen] = useState(false);
  const [shiftOpen, setShiftOpen] = useState(false);
  const [scheduleFormOpen, setScheduleFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleResponse | null>(null);

  const { data: user } = useUserQuery();
  const isAdmin = !!user && hasAdminAccess(user.position);

  // 주차 기반 스케줄 조회
  const { data: allSchedules = [], isLoading } = useScheduleWeekQuery(year, week);

  // 스케줄 배정용 직원 목록 조회 (admin endpoint 기반)
  const { data: employees = [] } = useScheduleUsersQuery();

  // 개인 뷰: 현재 사용자 스케줄만 클라이언트 필터링
  const schedules =
    viewMode === 'my' ? allSchedules.filter((s) => s.user_id === user?.id) : allSchedules;

  const { mutate: createSchedule, isPending: isCreating } = useCreateScheduleMutation();
  const { mutate: updateSchedule, isPending: isUpdating } = useUpdateScheduleMutation();
  const { mutate: deleteSchedule } = useDeleteScheduleMutation();
  const { mutate: requestDayOff, isPending: isDayOffPending } = useRequestDayOffMutation();

  const schedulesByDate = weekDates.reduce<Record<string, ScheduleResponse[]>>((acc, date) => {
    const key = formatDate(date);
    acc[key] = schedules.filter((s) => s.work_date === key);
    return acc;
  }, {});

  const todayStr = formatDate(today);
  const isToday = (date: Date) => formatDate(date) === todayStr;

  const handlePrev = () => setYearWeek(addWeeks(year, week, -1));
  const handleNext = () => setYearWeek(addWeeks(year, week, 1));
  const handleToday = () => setYearWeek(getISOWeek(today));

  const handleEditSchedule = (schedule: ScheduleResponse) => {
    setEditingSchedule(schedule);
    setScheduleFormOpen(true);
  };

  const handleScheduleFormSubmit = (data: ScheduleCreateDTO) => {
    if (editingSchedule) {
      // 수정 모드: start_date/end_date에서 work_date, start_time, end_time 추출
      const work_date = data.start_date.split('T')[0];
      const start_time = data.start_date.split('T')[1].slice(0, 5);
      const end_time = data.end_date.split('T')[1].slice(0, 5);

      updateSchedule(
        { id: editingSchedule.id, data: { work_date, start_time, end_time } },
        {
          onSuccess: () => {
            setScheduleFormOpen(false);
            setEditingSchedule(null);
          },
        },
      );
    } else {
      createSchedule(data, { onSuccess: () => setScheduleFormOpen(false) });
    }
  };

  return (
    <div className="p-6 space-y-4">
      {/* 헤더: 주차 네비게이터 + 액션 버튼 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <WeekNavigator
          year={year}
          week={week}
          weekDates={weekDates}
          onPrev={handlePrev}
          onNext={handleNext}
          onToday={handleToday}
        />

        <div className="flex items-center gap-2 flex-wrap">
          {/* 개인/전체 토글 */}
          <div className="flex rounded-lg border border-mega-gray-light overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode('my')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors',
                viewMode === 'my'
                  ? 'bg-mega-secondary text-white'
                  : 'bg-white text-mega-gray hover:bg-mega-gray-light/60',
              )}
            >
              <User className="size-4" />
              개인
            </button>
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors border-l border-mega-gray-light',
                viewMode === 'all'
                  ? 'bg-mega-secondary text-white'
                  : 'bg-white text-mega-gray hover:bg-mega-gray-light/60',
              )}
            >
              <Users className="size-4" />
              전체
            </button>
          </div>

          {/* 크루 전용: 근무교대 + 휴무신청 */}
          {!isAdmin && (
            <>
              <Button
                size="sm"
                className="bg-sky-500 hover:bg-sky-500/90 text-white gap-1.5"
                onClick={() => setShiftOpen(true)}
              >
                <ArrowLeftRight className="size-4" />
                근무교대
              </Button>
              <Button
                size="sm"
                className="bg-green hover:bg-green/90 text-white gap-1.5"
                onClick={() => setDayoffOpen(true)}
              >
                <Calendar className="size-4" />
                휴무신청
              </Button>
            </>
          )}

          {/* 어드민 전용: 스케줄 생성 */}
          {isAdmin && (
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => {
                setEditingSchedule(null);
                setScheduleFormOpen(true);
              }}
            >
              <CalendarPlus className="size-4" />
              스케줄 생성
            </Button>
          )}
        </div>
      </div>

      {/* 현재 권한 표시 */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>현재 권한:</span>
        <span
          className={cn(
            'px-2 py-0.5 rounded-full text-xs font-medium border',
            user?.position
              ? getPositionBadgeStyle(user.position)
              : 'bg-mega-gray-light text-mega-gray border-transparent',
          )}
        >
          {user?.position ?? '-'}
        </span>
        {isAdmin && (
          <span className="flex items-center gap-1 text-xs text-green font-medium">
            <Check className="size-3.5" />
            스케줄 생성/편집/삭제 가능
          </span>
        )}
      </div>

      {/* 주간 캘린더 그리드 */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-2 min-h-[500px] min-w-[560px]">
          {weekDates.map((date, idx) => {
            const key = formatDate(date);
            const isCurrentDay = isToday(date);
            const daySchedules = schedulesByDate[key] ?? [];
            const isSat = idx === 5;
            const isSun = idx === 6;

            return (
              <div key={key} className="flex flex-col">
                {/* 요일 헤더 */}
                <div
                  className={cn(
                    'flex flex-col items-center py-2 px-1 rounded-t-lg mb-2',
                    isCurrentDay
                      ? 'bg-mega-secondary text-white'
                      : 'bg-mega-gray-light/40 text-mega-gray',
                  )}
                >
                  <span
                    className={cn(
                      'text-[11px] font-medium',
                      !isCurrentDay && isSat && 'text-blue-500',
                      !isCurrentDay && isSun && 'text-red-500',
                    )}
                  >
                    {WEEKDAY_KO[idx]}
                  </span>
                  <span
                    className={cn(
                      'text-lg font-bold leading-tight',
                      !isCurrentDay && isSat && 'text-blue-500',
                      !isCurrentDay && isSun && 'text-red-500',
                    )}
                  >
                    {date.getDate()}
                  </span>
                </div>

                {/* 스케줄 카드 / 로딩 / 빈 상태 */}
                <div className="flex flex-col gap-1.5 flex-1">
                  {isLoading ? (
                    // 로딩 스켈레톤
                    Array.from({ length: 2 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-mega-gray-light/40 rounded-lg h-[58px] animate-pulse"
                      />
                    ))
                  ) : daySchedules.length > 0 ? (
                    daySchedules.map((schedule) => (
                      <ScheduleCard
                        key={schedule.id}
                        schedule={schedule}
                        isAdmin={isAdmin}
                        onEdit={handleEditSchedule}
                        onDelete={(id) => deleteSchedule(id)}
                      />
                    ))
                  ) : (
                    // 빈 상태
                    <div className="flex-1 flex items-center justify-center min-h-20 rounded-lg border border-dashed border-mega-gray-light/60">
                      <span className="text-[11px] text-muted-foreground/50">-</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 휴무 신청 모달 */}
      <DayoffModal
        open={dayoffOpen}
        onClose={() => setDayoffOpen(false)}
        onSubmit={(data) => requestDayOff(data, { onSuccess: () => setDayoffOpen(false) })}
        isPending={isDayOffPending}
      />

      {/* 근무교대 신청 모달 */}
      <ShiftModal
        open={shiftOpen}
        onClose={() => setShiftOpen(false)}
        onSubmit={() => {
          toast.info('근무교대 신청 기능은 준비 중입니다.');
          setShiftOpen(false);
        }}
        employees={employees}
      />

      {/* 스케줄 생성/수정 모달 (어드민) */}
      {isAdmin && (
        <ScheduleFormModal
          open={scheduleFormOpen}
          onClose={() => {
            setScheduleFormOpen(false);
            setEditingSchedule(null);
          }}
          onSubmit={handleScheduleFormSubmit}
          employees={employees}
          initialData={
            editingSchedule
              ? {
                  id: editingSchedule.id,
                  target_id: editingSchedule.user_id,
                  work_date: editingSchedule.work_date,
                  start_time: editingSchedule.start_time,
                  end_time: editingSchedule.end_time,
                }
              : undefined
          }
          isPending={isCreating || isUpdating}
        />
      )}
    </div>
  );
};

export default SchedulePage;
