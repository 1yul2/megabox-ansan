import { useState } from 'react';

import UserPosition from '../../features/pay/ui/UserPosition';
import { ManagerPositions } from '@/features/pay';
import { usePayrollQuery } from '@/features/pay/api/queries';
import { mapToManagerPayroll } from '@/features/pay/model/manager/mapper';
import { mapToUserPayroll } from '@/features/pay/model/user/mapper';
import PeriodSelector from '@/features/pay/ui/PeriodSelector';
import { EmptyBox } from './ui/EmptyBox';
import { useAuthStore } from '@/shared/model/authStore';
import { USER_ROLES } from '@/entities/user/model/role';
import { DollarSign } from 'lucide-react';

export default function PayPage() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);

  const { data: payrollList } = usePayrollQuery({
    year: selectedYear,
    month: selectedMonth,
  });

  const isEmptyPayroll =
    !payrollList ||
    (Array.isArray(payrollList) && payrollList.length === 0) ||
    (!Array.isArray(payrollList) && payrollList.name === '');

  const { user } = useAuthStore();
  const isUser = user?.position === USER_ROLES.CREW;

  return (
    <div className="flex flex-col gap-6">
      {/* ── 페이지 헤더 ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#5b31a5]/10">
            <DollarSign className="size-5 text-[#5b31a5]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">급여 현황</h1>
            <p className="text-sm text-gray-500">
              {selectedYear}년 {selectedMonth}월 급여 내역
            </p>
          </div>
        </div>

        {/* 기간 선택 */}
        <div className={isUser ? 'w-full sm:w-auto' : 'w-full'}>
          <PeriodSelector
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onChangeYear={setSelectedYear}
            onChangeMonth={setSelectedMonth}
          />
        </div>
      </div>

      {/* ── 콘텐츠 ── */}
      {isUser ? (
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            {isEmptyPayroll ? (
              <EmptyBox selectedYear={selectedYear} selectedMonth={selectedMonth} />
            ) : (
              payrollList && !Array.isArray(payrollList) && (
                <UserPosition data={mapToUserPayroll(payrollList)} />
              )
            )}
          </div>
        </div>
      ) : (
        <>
          {isEmptyPayroll ? (
            <EmptyBox selectedYear={selectedYear} selectedMonth={selectedMonth} />
          ) : (
            <>
              {payrollList && !Array.isArray(payrollList) && (
                <UserPosition data={mapToUserPayroll(payrollList)} />
              )}
              {payrollList && Array.isArray(payrollList) && (
                <ManagerPositions filteredData={mapToManagerPayroll(payrollList)} />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
