import { DollarSign } from 'lucide-react';
import { useState } from 'react';

import UserPosition from '../../features/pay/ui/UserPosition';

import { EmptyBox } from './ui/EmptyBox';

import { USER_ROLES } from '@/entities/user/model/role';
import { ManagerPositions } from '@/features/pay';
import { usePayrollQuery } from '@/features/pay/api/queries';
import { mapToManagerPayroll } from '@/features/pay/model/manager/mapper';
import { mapToUserPayroll } from '@/features/pay/model/user/mapper';
import PeriodSelector from '@/features/pay/ui/PeriodSelector';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { useAuthStore } from '@/shared/model/authStore';

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
      <PageHeader
        icon={<DollarSign className="size-5 text-[#351f66]" />}
        iconBg="bg-[#351f66]/10"
        title="급여 현황"
        description={`${selectedYear}년 ${selectedMonth}월 급여 내역`}
      >
        <div className={isUser ? 'w-full sm:w-auto' : 'w-full'}>
          <PeriodSelector
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onChangeYear={setSelectedYear}
            onChangeMonth={setSelectedMonth}
          />
        </div>
      </PageHeader>

      {/* ── 콘텐츠 ── */}
      {isUser ? (
        <div className="flex justify-center w-full">
          <div className="w-full max-w-2xl">
            {isEmptyPayroll ? (
              <EmptyBox selectedYear={selectedYear} selectedMonth={selectedMonth} />
            ) : (
              payrollList &&
              !Array.isArray(payrollList) && <UserPosition data={mapToUserPayroll(payrollList)} />
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
