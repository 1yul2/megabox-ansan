import React from 'react';
import { DayButton, getDefaultClassNames } from 'react-day-picker';

import { Button } from '@/shared/components/ui/button';
import { Calendar } from '@/shared/components/ui/calendar';
import { cn } from '@/shared/lib/utils';

function HomeDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();
  const ref = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      className={cn(
        'data-[selected-single=true]:bg-mega-secondary data-[selected-single=true]:text-white',
        'group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50',
        'flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal',
        'group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px]',
        'dark:hover:text-accent-foreground',
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  );
}

const UserCalendar = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="w-full"
      showOutsideDays={false}
      classNames={{
        today: 'bg-mega-secondary/15 text-mega-secondary rounded-md font-semibold',
      }}
      components={{
        DayButton: HomeDayButton,
      }}
    />
  );
};

export default UserCalendar;
