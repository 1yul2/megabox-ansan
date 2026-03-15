import { AlertTriangle, CheckCircle, X } from 'lucide-react';

type ScheduleStatus = 'DRAFT' | 'CONFIRMED';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from '@/shared/components/ui/dialog';

interface StatusChangeModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending?: boolean;
  currentStatus: ScheduleStatus | null | undefined;
  year: number;
  week: number;
}

const StatusChangeModal = ({
  open,
  onClose,
  onConfirm,
  isPending = false,
  currentStatus,
  year,
  week,
}: StatusChangeModalProps) => {
  const isConfirming = currentStatus === 'DRAFT' || currentStatus == null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent showCloseButton={false} className="p-0 overflow-hidden max-w-sm rounded-2xl">
        {/* Header with gradient */}
        <div
          className={
            isConfirming
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-5 flex items-center gap-3'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-5 flex items-center gap-3'
          }
        >
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            {isConfirming ? (
              <CheckCircle className="text-white size-5" />
            ) : (
              <AlertTriangle className="text-white size-5" />
            )}
          </div>
          <DialogTitle className="text-white font-bold">
            {isConfirming ? '스케줄 확정' : '초안으로 변경'}
          </DialogTitle>
          <DialogClose
            className="ml-auto text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10 p-1"
            onClick={onClose}
          >
            <X className="size-5" />
          </DialogClose>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Week info */}
          <div className="flex items-center gap-2">
            <div className="w-1 h-8 rounded-full bg-mega-secondary" />
            <div>
              <p className="text-xs text-muted-foreground">대상 주차</p>
              <p className="text-sm font-semibold text-gray-800">
                {year}년 {week}주차 스케줄
              </p>
            </div>
          </div>

          {/* Info message */}
          <div
            className={
              isConfirming
                ? 'bg-emerald-50 border border-emerald-200 rounded-xl p-4'
                : 'bg-amber-50 border border-amber-200 rounded-xl p-4'
            }
          >
            {isConfirming ? (
              <p className="text-sm text-emerald-700 leading-relaxed">
                확정 후 직원들이 스케줄을 확인할 수 있습니다.
              </p>
            ) : (
              <p className="text-sm text-amber-700 leading-relaxed">
                초안으로 변경하면 직원들이 미래 스케줄을 볼 수 없게 됩니다.
              </p>
            )}
          </div>

          <p className="text-sm text-gray-600 font-medium">변경하시겠습니까?</p>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 pb-6 gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl h-10"
            disabled={isPending}
          >
            취소
          </Button>
          <Button
            className={
              isConfirming
                ? 'flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-10 shadow-sm'
                : 'flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-10 shadow-sm'
            }
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? '처리 중...' : isConfirming ? '확정하기' : '초안으로 변경'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StatusChangeModal;
