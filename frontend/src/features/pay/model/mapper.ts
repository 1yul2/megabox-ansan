import type { PayrollData } from './type';
import type { PayrollResponseDTO } from '../api/dto';

export function mapPayroll(dto: PayrollResponseDTO): PayrollData {
  return {
    name: dto.name ?? '',
    position: dto.position ?? '',
    wage: dto.wage ?? 0,
    rrn: dto.rrn ?? '',
    join_date: dto.join_date ?? '',
    resign_date: dto.resign_date ?? '',
    last_work_day: dto.last_work_day ?? '',

    bank_name: dto.bank_name ?? '',
    bank_account: dto.bank_account ?? '',
    email: dto.email ?? '',

    total_work_days: dto.total_work_days ?? 0,
    total_work_hours: dto.total_work_hours ?? 0,
    avg_daily_hours: dto.avg_daily_hours ?? 0,

    day_hours: dto.day_hours ?? 0,
    night_hours: dto.night_hours ?? 0,
    weekly_allowance_hours: dto.weekly_allowance_hours ?? 0,
    annual_leave_hours: dto.annual_leave_hours ?? 0,
    holiday_hours: dto.holiday_hours ?? 0,
    labor_day_hours: dto.labor_day_hours ?? 0,

    day_wage: dto.day_wage ?? 0,
    night_wage: dto.night_wage ?? 0,
    weekly_allowance_pay: dto.weekly_allowance_pay ?? 0,
    annual_leave_pay: dto.annual_leave_pay ?? 0,
    holiday_pay: dto.holiday_pay ?? 0,
    labor_day_pay: dto.labor_day_pay ?? 0,

    gross_pay: dto.gross_pay ?? 0,

    insurance_health: dto.insurance_health ?? 0,
    insurance_care: dto.insurance_care ?? 0,
    insurance_employment: dto.insurance_employment ?? 0,
    insurance_pension: dto.insurance_pension ?? 0,

    total_deduction: dto.total_deduction ?? 0,
    net_pay: dto.net_pay ?? 0,
  };
}
