export interface UserPayroll {
  name: string | null;
  birth_date: string | null;
  pay_date: string | null;

  day_wage: number | null;
  night_wage: number | null;
  weekly_allowance_pay: number | null;
  annual_leave_pay: number | null;
  holiday_pay: number | null;
  extra_pay: number | null;

  gross_pay: number | null;

  insurance_health: number | null;
  insurance_care: number | null;
  insurance_employment: number | null;
  insurance_pension: number | null;

  total_deduction: number | null;

  net_pay: number | null;
}

export interface UserPositionProps {
  data: UserPayroll;
}

export type UserPayrollNumberKeys =
  | 'day_wage'
  | 'night_wage'
  | 'weekly_allowance_pay'
  | 'annual_leave_pay'
  | 'holiday_pay'
  | 'extra_pay'
  | 'gross_pay'
  | 'insurance_health'
  | 'insurance_care'
  | 'insurance_employment'
  | 'insurance_pension'
  | 'total_deduction'
  | 'net_pay';
