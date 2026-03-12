import type { PayrollResponseDTO } from '../../../features/pay/api/dto';

export const normalizePayOverview = (data?: PayrollResponseDTO) => ({
  net_pay: data?.net_pay ?? 0,
  gross_pay: data?.gross_pay ?? 0,
  total_deduction: data?.total_deduction ?? 0,
  total_work_days: data?.total_work_days ?? 0,
  total_work_hours: data?.total_work_hours ?? 0,
});
