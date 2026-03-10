import type { PayrollData } from '../type';
import type { UserPayroll } from './type';

export function mapToUserPayroll(data: PayrollData): UserPayroll {
  return {
    name: data.name,
    birth_date: '',
    pay_date: '',

    day_wage: data.day_wage,
    night_wage: data.night_wage,
    weekly_allowance_pay: data.weekly_allowance_pay,
    annual_leave_pay: data.annual_leave_pay,
    holiday_pay: data.holiday_pay,
    extra_pay: 0,

    gross_pay: data.gross_pay,

    insurance_health: data.insurance_health,
    insurance_care: data.insurance_care,
    insurance_employment: data.insurance_employment,
    insurance_pension: data.insurance_pension,

    total_deduction: data.total_deduction,
    net_pay: data.net_pay,
  };
}
