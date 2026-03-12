import { Pencil, Trash2 } from 'lucide-react';

import type { AdminUserDTO } from '../api/dto';

import { getPositionBadgeStyle } from '@/entities/user/model/position';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';

interface UserTableProps {
  users: AdminUserDTO[];
  onEdit: (user: AdminUserDTO) => void;
  onDelete: (user: AdminUserDTO) => void;
  isDeletePending?: boolean;
}

const maskSsn = (ssn?: string) => {
  if (!ssn) return '-';
  return ssn.length > 6 ? `${ssn.slice(0, 6)}-개인정보입니다` : ssn;
};

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

const formatUnavailableDays = (days?: number[]) => {
  if (!days || days.length === 0) return '-';
  return days.map((d) => DAY_LABELS[d]).join(', ');
};

const UserTable = ({ users, onEdit, onDelete, isDeletePending }: UserTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table className="text-sm min-w-[1800px]">
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead className="whitespace-nowrap">계정</TableHead>
            <TableHead className="whitespace-nowrap">비밀번호</TableHead>
            <TableHead className="whitespace-nowrap">이름</TableHead>
            <TableHead className="whitespace-nowrap">직급</TableHead>
            <TableHead className="whitespace-nowrap">성별</TableHead>
            <TableHead className="whitespace-nowrap">생년월일</TableHead>
            <TableHead className="whitespace-nowrap">주민번호</TableHead>
            <TableHead className="whitespace-nowrap">연락처</TableHead>
            <TableHead className="whitespace-nowrap">이메일</TableHead>
            <TableHead className="whitespace-nowrap">은행명</TableHead>
            <TableHead className="whitespace-nowrap">계좌번호</TableHead>
            <TableHead className="whitespace-nowrap">입사일</TableHead>
            <TableHead className="whitespace-nowrap">퇴사일</TableHead>
            <TableHead className="whitespace-nowrap">고정 불가 요일</TableHead>
            <TableHead className="whitespace-nowrap">보건증 만료일</TableHead>
            <TableHead className="whitespace-nowrap">재직상태</TableHead>
            <TableHead className="whitespace-nowrap">관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.username}</TableCell>
              <TableCell className="text-muted-foreground">••••••</TableCell>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>
                <Badge variant="outline" className={getPositionBadgeStyle(user.position)}>
                  {user.position}
                </Badge>
              </TableCell>
              <TableCell>{user.gender ?? '-'}</TableCell>
              <TableCell className="whitespace-nowrap">{user.birth_date ?? '-'}</TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {maskSsn(user.ssn)}
              </TableCell>
              <TableCell className="whitespace-nowrap">{user.phone ?? '-'}</TableCell>
              <TableCell>{user.email ?? '-'}</TableCell>
              <TableCell>{user.bank_name ?? '-'}</TableCell>
              <TableCell>{user.account_number ?? '-'}</TableCell>
              <TableCell className="whitespace-nowrap">{user.hire_date ?? '-'}</TableCell>
              <TableCell className="whitespace-nowrap">{user.retire_date ?? '-'}</TableCell>
              <TableCell className="whitespace-nowrap">
                {formatUnavailableDays(user.unavailable_days)}
              </TableCell>
              <TableCell className="whitespace-nowrap">{user.health_cert_expire ?? '-'}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    user.is_active
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : 'bg-red-100 text-red-700 border-red-200'
                  }
                >
                  {user.is_active ? '재직중' : '퇴사'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7"
                    onClick={() => onEdit(user)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 text-destructive hover:text-destructive"
                    onClick={() => onDelete(user)}
                    disabled={isDeletePending}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
