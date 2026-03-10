import { apiClient } from '../../../shared/api/apiClients';

import type { PayrollResponseDTO } from './dto';

interface GetPayrollParams {
  year: number;
  month?: number;
}

export async function getPayroll(
  params: GetPayrollParams,
): Promise<PayrollResponseDTO | PayrollResponseDTO[]> {
  return apiClient.get({
    url: '/api/payroll',
    params,
  });
}
