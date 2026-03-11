import { useMemo, useState } from 'react';

import { calculateTotals } from '../index';

import ManagerTable from './ManagerTable';
import PayrollSummary from './PayrollSummary';

import type { ManagerPositionsProps } from '../model/manager/type';

import SearchInput from '@/shared/components/ui/SearchInput';

export default function ManagerPositions({ filteredData }: ManagerPositionsProps) {
  const totals = useMemo(() => calculateTotals(filteredData), [filteredData]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredList = useMemo(
    () =>
      !searchTerm
        ? filteredData
        : filteredData.filter((item) =>
            Object.values(item).some(
              (value) =>
                value != null && String(value).toLowerCase().includes(searchTerm.toLowerCase()),
            ),
          ),
    [searchTerm, filteredData],
  );

  return (
    <div className="space-y-6 mb-20">
      {/* 권한 추가 해주기 */}
      <div className="bg-white rounded-xl shadow border border-gray-200 space-y-6">
        <div className="flex flex-col gap-4 px-6 pt-6">
          <div className="flex flex-col gap-4">
            <div className="text-xl font-bold"> 전 직원 급여 내역 </div>
            <SearchInput onSearch={setSearchTerm} placeholder="검색어를 입력하세요" />
          </div>

          <PayrollSummary
            totalEmployees={filteredData.length}
            totalSalary={totals.gross_pay ?? 0}
            totalNetPay={totals.net_pay ?? 0}
            totalDeduction={totals.total_deduction ?? 0}
          />
        </div>

        <ManagerTable data={filteredList} />
      </div>
    </div>
  );
}
