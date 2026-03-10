import { useQuery } from '@tanstack/react-query';

import { mapPayroll } from '../model/mapper';

import { getPayroll } from './service';

import type { PayrollResponse } from './dto';
import type { PayrollData } from '../model/type';

interface UsePayrollQueryParams {
  year: number;
  month?: number;
}

export const usePayrollQuery = ({ year, month }: UsePayrollQueryParams) => {
  return useQuery<PayrollResponse, Error, PayrollData | PayrollData[]>({
    queryKey: ['payroll', year, month],
    queryFn: () => getPayroll({ year, month }),
    select: (data) => {
      if (Array.isArray(data)) {
        return data.map(mapPayroll);
      }
      return mapPayroll(data);
    },
    staleTime: 0,
  });
};
