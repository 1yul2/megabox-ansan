import type { PayrollResponseDTO } from '../../../features/pay/api/dto';

import { apiClient } from '@/shared/api/apiClients';

export const payService = {
  getPayOverview: async (year: number, month: number): Promise<PayrollResponseDTO> => {
    const response = await apiClient.get<PayrollResponseDTO>({
      url: `/api/payroll/`,
      params: { year, month },
    });

    return response;
  },
};
