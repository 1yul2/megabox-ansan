import type { UserPayroll } from '../model/user/type';

export const mockUserPayroll: UserPayroll = {
  name: '김하늘',
  birth_date: '1998-03-15',
  pay_date: '2025-01-25',

  day_wage: 1_200_000,
  night_wage: 250_000,
  weekly_allowance_pay: 180_000,
  annual_leave_pay: 90_000,
  holiday_pay: 60_000,
  extra_pay: 40_000,

  gross_pay: 1_820_000,

  insurance_health: 70_000,
  insurance_care: 9_000,
  insurance_employment: 18_000,
  insurance_pension: 82_000,

  total_deduction: 179_000,

  net_pay: 1_641_000,
};
