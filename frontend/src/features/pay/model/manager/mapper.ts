import type { PayrollData as BasePayrollData } from '../type';
import type { PayrollData } from '../type';

export function mapToManagerPayroll(data: BasePayrollData[]): PayrollData[] {
  return data.map((item) => ({
    ...item,
    name: item.name ?? '',
    rrn: item.rrn ?? '',
    labor_day_hours: item.labor_day_hours ?? 0,
    labor_day_pay: item.labor_day_pay ?? 0,
  }));
}
