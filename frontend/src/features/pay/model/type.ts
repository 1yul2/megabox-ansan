export interface PayrollData {
  name: string;
  position: string | null;
  wage: number;

  join_date: string;
  resign_date: string | null;
  last_work_day: string | null;

  bank_name: string;
  bank_account: string;
  email: string;

  total_work_days: number;
  total_work_hours: number;
  avg_daily_hours: number;
  day_hours: number;
  night_hours: number;
  weekly_allowance_hours: number;
  annual_leave_hours: number;
  holiday_hours: number;

  day_wage: number;
  night_wage: number;
  weekly_allowance_pay: number;
  annual_leave_pay: number;
  holiday_pay: number;
  gross_pay: number;

  insurance_health: number;
  insurance_care: number;
  insurance_employment: number;
  insurance_pension: number;

  rrn: string;
  labor_day_hours?: number;
  labor_day_pay?: number;

  total_deduction: number;
  net_pay: number;
}
