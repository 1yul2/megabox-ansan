import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { holidaySchema } from '../model/holiday.schema';

import type { HolidayDTO } from '../api/dto';
import type { HolidayFormValues } from '../model/holiday.schema';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Spinner } from '@/shared/components/ui/spinner';

interface HolidayFormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  defaultValues?: HolidayDTO;
  onSubmit: (values: HolidayFormValues) => void;
  isPending: boolean;
  readonlyDate?: boolean;
}

const HolidayFormDialog = ({
  open,
  onClose,
  title,
  defaultValues,
  onSubmit,
  isPending,
  readonlyDate = false,
}: HolidayFormDialogProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HolidayFormValues>({
    resolver: zodResolver(holidaySchema),
    values: defaultValues ? { label: defaultValues.label, date: defaultValues.date } : undefined,
    defaultValues: { label: '', date: '' },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="holiday-name">공휴일 이름</Label>
            <Input
              id="holiday-name"
              placeholder="예: 설날"
              aria-invalid={!!errors.label}
              {...register('label')}
            />
            {errors.label && <p className="text-destructive text-xs">{errors.label.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="holiday-date">날짜</Label>
            <Input
              id="holiday-date"
              type="date"
              aria-invalid={!!errors.date}
              disabled={readonlyDate}
              {...register('date')}
            />
            {errors.date && <p className="text-destructive text-xs">{errors.date.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
              취소
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Spinner className="size-4" /> : '저장'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default HolidayFormDialog;
