import { Pencil, Trash2 } from 'lucide-react';

import type { HolidayDTO } from '../api/dto';

import { Button } from '@/shared/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';

const formatDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-');
  return `${year}년 ${month}월 ${day}일`;
};

interface HolidayTableProps {
  holidays: HolidayDTO[];
  onEdit: (holiday: HolidayDTO) => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

const HolidayTable = ({ holidays, onEdit, onDelete, isDeleting }: HolidayTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/40">
          <TableHead>날짜</TableHead>
          <TableHead>공휴일 이름</TableHead>
          <TableHead className="text-right">관리</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {holidays.map((holiday) => (
          <TableRow key={holiday.id}>
            <TableCell className="text-muted-foreground">{formatDate(holiday.date)}</TableCell>
            <TableCell className="font-medium">{holiday.label}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={() => onEdit(holiday)}
                  aria-label="수정"
                >
                  <Pencil />
                </Button>
                <Button
                  size="icon-sm"
                  variant="destructive"
                  onClick={() => onDelete(holiday.id)}
                  disabled={isDeleting}
                  aria-label="삭제"
                >
                  <Trash2 />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default HolidayTable;
