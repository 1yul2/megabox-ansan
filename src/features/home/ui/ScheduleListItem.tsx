import { cn } from '@/shared/lib/utils';

export interface HomeScheduleItem {
  id: number;
  position: string;
  work_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
}

interface ScheduleListItemProps {
  schedule: HomeScheduleItem;
}

function getShiftMeta(startTime: string): { color: string; label: string } {
  const hour = parseInt(startTime.split(':')[0], 10);
  if (hour < 12) return { color: 'bg-sky-400', label: '오전 근무' };
  if (hour < 18) return { color: 'bg-orange', label: '오후 근무' };
  return { color: 'bg-mega-secondary', label: '야간 근무' };
}

const ScheduleListItem = ({ schedule }: ScheduleListItemProps) => {
  const date = new Date(schedule.work_date + 'T00:00:00');
  const dayLabel = date.toLocaleDateString('ko-KR', { weekday: 'short' });
  const monthNum = date.getMonth() + 1;
  const dateNum = date.getDate();
  const { color, label } = getShiftMeta(schedule.start_time);

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors">
      <div className={cn('w-1 self-stretch rounded-full shrink-0', color)} />
      <div className="flex flex-col items-center w-8 shrink-0 text-center">
        <span className="text-[10px] text-muted-foreground leading-tight">
          {monthNum}/{dateNum}
        </span>
        <span className="text-xs font-bold">{dayLabel}</span>
      </div>
      <div className="w-px h-7 bg-border shrink-0" />
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-xs font-semibold truncate">{label}</span>
        <span className="text-[11px] text-muted-foreground">
          {schedule.start_time} - {schedule.end_time}
        </span>
      </div>
    </div>
  );
};

export default ScheduleListItem;
