import type { UserPayroll } from '../model/user/type';

export const mockUserPayroll: UserPayroll = {
  name: '김하늘',
  position: '크루',
  birth_date: '1998-03-15',
  pay_date: '2025-01-25',
  wage: 9860,

  total_work_days: 22,
  total_work_hours: 176.0,
  avg_daily_hours: 8.0,

  day_hours: 160.0,
  night_hours: 16.0,
  weekly_allowance_hours: 32.0,
  annual_leave_hours: 0,
  holiday_hours: 0,
  labor_day_hours: 0,

  day_wage: 1_577_600,
  night_wage: 236_640,
  weekly_allowance_pay: 315_520,
  annual_leave_pay: 0,
  holiday_pay: 0,
  labor_day_pay: 0,

  gross_pay: 2_129_760,

  insurance_health: 75_800,
  insurance_care: 9_800,
  insurance_employment: 19_100,
  insurance_pension: 95_800,

  total_deduction: 200_500,

  net_pay: 1_929_260,
};
