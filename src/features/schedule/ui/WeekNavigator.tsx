import { ChevronLeft, ChevronRight } from 'lucide-react';

import { formatWeekRangeParts } from '../model/weekUtils';

import { Button } from '@/shared/components/ui/button';

interface WeekNavigatorProps {
  year: number;
  week: number;
  weekDates: Date[];
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

const WeekNavigator = ({ weekDates, onPrev, onNext, onToday }: WeekNavigatorProps) => {
  const { year, range } = formatWeekRangeParts(weekDates);

  return (
    <div className="flex items-center gap-2 ">
      {/* Bordered box: [<] [year / date range] [>] */}
      <div className="flex items-center border border-mega-gray-light rounded-lg overflow-hidden bg-white">
        <button
          type="button"
          onClick={onPrev}
          className="p-2.5 hover:bg-mega-gray-light/60 transition-colors border-r border-mega-gray-light"
          aria-label="이전 주"
        >
          <ChevronLeft className="size-4 text-mega-gray" />
        </button>

        <div className="px-4 py-1.5 text-center min-w-[180px]">
          <p className="text-[11px] text-muted-foreground leading-none mb-0.5">{year}</p>
          <p className="text-sm font-semibold text-foreground leading-tight">{range}</p>
        </div>

        <button
          type="button"
          onClick={onNext}
          className="p-2.5 hover:bg-mega-gray-light/60 transition-colors border-l border-mega-gray-light"
          aria-label="다음 주"
        >
          <ChevronRight className="size-4 text-mega-gray" />
        </button>
      </div>

      <Button variant="outline" size="sm" onClick={onToday} className="text-xs h-9">
        이번주
      </Button>
    </div>
  );
};

export default WeekNavigator;
