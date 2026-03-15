import { Calendar, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';

interface DayoffModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { request_date: string; reason: string }) => void;
  isPending?: boolean;
  remainingDays?: number;
}

const DayoffModal = ({
  open,
  onClose,
  onSubmit,
  isPending = false,
  remainingDays = 15,
}: DayoffModalProps) => {
  const [requestDate, setRequestDate] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (!requestDate || !reason.trim()) return;
    onSubmit({ request_date: requestDate, reason: reason.trim() });
  };

  const handleClose = () => {
    setRequestDate('');
    setReason('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent showCloseButton={false} className="p-0 overflow-hidden max-w-md">
        {/* Header */}
        <div className="bg-green px-6 py-4 flex items-center gap-3">
          <Calendar className="text-white size-5 shrink-0" />
          <DialogTitle className="text-white">휴무 신청</DialogTitle>
          <DialogClose className="ml-auto text-white/80 hover:text-white" onClick={handleClose}>
            <X className="size-5" />
          </DialogClose>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Info alert */}
          <div className="bg-green/10 border border-green/20 rounded-lg p-3 text-sm">
            <p className="font-medium text-green mb-1">💬 휴무 신청 안내</p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              승인은 관리자가 검토 후 처리됩니다. 긴급한 경우 관리자에게 직접 연락해주세요.
            </p>
          </div>

          {/* Request date */}
          <div className="space-y-1.5">
            <Label htmlFor="dayoff-date">신청일</Label>
            <Input
              id="dayoff-date"
              type="date"
              value={requestDate}
              onChange={(e) => setRequestDate(e.target.value)}
            />
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <Label htmlFor="dayoff-reason">사유</Label>
            <Textarea
              id="dayoff-reason"
              placeholder="휴무 신청 사유를 상세히 입력해주세요"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          {/* Remaining days */}
          <div className="flex items-center justify-between bg-mega-blue/10 border border-mega-blue/20 rounded-lg px-4 py-3">
            <span className="text-sm text-muted-foreground">잔여 주말</span>
            <span className="text-xl font-bold text-mega-blue">{remainingDays}일</span>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 pb-6 gap-2 sm:flex-row">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            취소
          </Button>
          <Button
            className="flex-1 bg-green hover:bg-green/90 text-white"
            onClick={handleSubmit}
            disabled={isPending || !requestDate || !reason.trim()}
          >
            {isPending ? '신청 중...' : '신청하기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DayoffModal;
