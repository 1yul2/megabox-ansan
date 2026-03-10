import { useState } from 'react';

import UserPosition from '../../features/pay/ui/UserPosition';
import logo from '../../shared/assets/logo/Megabox_Logo_Indigo.png';

import { ManagerPositions } from '@/features/pay';
import { usePayrollQuery } from '@/features/pay/api/queries';
import { mapToManagerPayroll } from '@/features/pay/model/manager/mapper';
import { mapToUserPayroll } from '@/features/pay/model/user/mapper';
import PeriodSelector from '@/features/pay/ui/PeriodSelector';
import { EmptyBox } from './ui/EmptyBox';
import { useAuthStore } from '@/shared/model/authStore';
import { USER_ROLES } from '@/entities/user/model/role';

export default function PayPage() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);

  const { data: payrollList } = usePayrollQuery({
    year: selectedYear,
    month: selectedMonth,
  });

  // 데이터 없을 때 응답값: 유저 - null / 매니저 - 빈 배열
  const isEmptyPayroll =
    !payrollList ||
    (Array.isArray(payrollList) && payrollList.length === 0) ||
    (!Array.isArray(payrollList) && payrollList.name === '');

  const { user } = useAuthStore(); // 예시

const isUser = user?.position === USER_ROLES.CREW;
  
  const selector = (
    <PeriodSelector
      selectedYear={selectedYear}
      selectedMonth={selectedMonth}
      onChangeYear={setSelectedYear}
      onChangeMonth={setSelectedMonth}
    />
  );

  return (
    <div className="flex flex-col gap-5 w-full">
      <img src={logo} alt="logo" className="w-50 self-center mb-4" />


    {isUser ? (
      <div className="flex justify-center px-4">
        <div className="w-full max-w-3xl">{selector}</div>
      </div>
    ) : (
      selector
    )}

      
      {isEmptyPayroll && (
        isUser ? (
          <div className="flex justify-center px-4">
            <div className="w-full max-w-3xl">
              <EmptyBox
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
              />
            </div>
          </div>
        ) : (
          <EmptyBox
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
          />
        )
      )}

      {!isEmptyPayroll && payrollList && !Array.isArray(payrollList) && (
        <UserPosition data={mapToUserPayroll(payrollList)} />
      )}

      {!isEmptyPayroll && payrollList && Array.isArray(payrollList) && (
        <ManagerPositions filteredData={mapToManagerPayroll(payrollList)} />
      )}
    </div>
  );
}
