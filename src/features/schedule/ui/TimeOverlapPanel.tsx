import { Users } from 'lucide-react';

import { formatDate, WEEKDAY_KO } from '../model/weekUtils';

interface TimeSlotOverlap {
  start_time: string;
  end_time: string;
  count: number;
  employees: { id: number; name: string }[];
}

interface DayOverlapResponse {
  work_date: string;
  slots: TimeSlotOverlap[];
}

interface WeekOverlapResponse {
  year: number;
  week_number: number;
  days: DayOverlapResponse[];
}

import { cn } from '@/shared/lib/utils';

const TIMELINE_START = 6 * 60;
const TIMELINE_TOTAL = 18 * 60;

function parseMinutes(t: string): number {
  const parts = t.split(':');
  return Number(parts[0]) * 60 + Number(parts[1] ?? 0);
}

function getSegmentColor(count: number): string {
  if (count === 0) return '';
  if (count === 1) return 'bg-emerald-400/80';
  if (count <= 3) return 'bg-blue-400/80';
  return 'bg-orange-400/80';
}

interface DensityBarProps {
  dayData: DayOverlapResponse | undefined;
  maxCount: number;
}

const DensityBar = ({ dayData }: DensityBarProps) => {
  const slots = dayData?.slots ?? [];

  if (slots.length === 0) {
    return <div className="flex-1 h-5 bg-gray-100/80 rounded" />;
  }

  return (
    <div className="relative flex-1 h-5 bg-gray-100/80 rounded overflow-hidden">
      {slots.map((slot: TimeSlotOverlap, i: number) => {
        const startMin = parseMinutes(slot.start_time);
        const endMin = parseMinutes(slot.end_time);
        const clampedStart = Math.max(startMin, TIMELINE_START);
        const clampedEnd = Math.min(endMin, TIMELINE_START + TIMELINE_TOTAL);
        if (clampedStart >= clampedEnd) return null;
        const left = ((clampedStart - TIMELINE_START) / TIMELINE_TOTAL) * 100;
        const width = ((clampedEnd - clampedStart) / TIMELINE_TOTAL) * 100;
        const color = getSegmentColor(slot.count);
        const employeeNames = slot.employees.map((e) => e.name).join(', ');

        return (
          <div
            key={i}
            className={cn('absolute h-full transition-opacity group', color)}
            style={{ left: `${left}%`, width: `${width}%` }}
            title={`${slot.start_time}~${slot.end_time}: ${slot.count}명 (${employeeNames})`}
          >
            {/* Hover count badge */}
            <div className="hidden group-hover:flex absolute inset-0 items-center justify-center">
              <span className="text-[8px] text-white font-bold">{slot.count}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface TimeOverlapPanelProps {
  overlapData: WeekOverlapResponse | null | undefined;
  weekDates: Date[];
  isLoading?: boolean;
}

const TimeOverlapPanel = ({ overlapData, weekDates, isLoading }: TimeOverlapPanelProps) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="h-4 w-40 bg-gray-100 rounded animate-pulse mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-3 bg-gray-100 rounded animate-pulse" />
              <div className="flex-1 h-5 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!overlapData || overlapData.days.length === 0) return null;

  const dayMap = Object.fromEntries(overlapData.days.map((d) => [d.work_date, d]));
  const maxCount = overlapData.days.reduce((max, d) => {
    const dayMax = d.slots.reduce((m, s) => Math.max(m, s.count), 0);
    return Math.max(max, dayMax);
  }, 0);

  // Time axis hour labels (6, 8, 10, ... 24)
  const axisHours = [6, 8, 10, 12, 14, 16, 18, 20, 22, 24];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-mega-secondary" />
          <p className="text-sm font-semibold text-gray-700">시간대별 근무 밀도</p>
          <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
            최대 {maxCount}명
          </span>
        </div>
        <div className="flex items-center gap-3">
          {[
            { label: '1명', className: 'bg-emerald-400/80' },
            { label: '2-3명', className: 'bg-blue-400/80' },
            { label: '4명+', className: 'bg-orange-400/80' },
          ].map(({ label, className }) => (
            <div key={label} className="flex items-center gap-1">
              <div className={cn('w-4 h-2.5 rounded', className)} />
              <span className="text-[10px] text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Time axis */}
      <div className="flex ml-12 mb-1">
        <div className="relative flex-1 h-3">
          {axisHours.map((h) => (
            <span
              key={h}
              className="absolute text-[9px] text-gray-400 font-medium -translate-x-1/2"
              style={{ left: `${((h - 6) / 18) * 100}%` }}
            >
              {h === 24 ? '' : `${h}`}
            </span>
          ))}
        </div>
      </div>

      {/* Day rows */}
      <div className="space-y-1.5">
        {weekDates.map((date, idx) => {
          const key = formatDate(date);
          const dayData = dayMap[key];
          const isSat = idx === 5;
          const isSun = idx === 6;

          return (
            <div key={key} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-12 shrink-0 justify-end">
                <span
                  className={cn(
                    'text-[10px] font-semibold',
                    isSat ? 'text-blue-500' : isSun ? 'text-red-500' : 'text-gray-500',
                  )}
                >
                  {WEEKDAY_KO[idx]}
                </span>
              </div>
              <DensityBar dayData={dayData} maxCount={maxCount} />
            </div>
          );
        })}
      </div>

      {/* Note */}
      <p className="mt-3 text-[10px] text-gray-400 flex items-center gap-1">
        <Users className="size-3" />
        각 블록 위에 마우스를 올리면 근무 직원 정보를 확인할 수 있습니다.
      </p>
    </div>
  );
};

export default TimeOverlapPanel;
