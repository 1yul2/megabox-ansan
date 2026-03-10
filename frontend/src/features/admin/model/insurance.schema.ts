import { z } from 'zod';

export const insuranceRateSchema = z.object({
  health_insurance_rate: z.number().min(0).max(100),
  long_term_care_rate: z.number().min(0).max(100),
  employment_insurance_rate: z.number().min(0).max(100),
  national_pension_rate: z.number().min(0).max(100),
});

export type InsuranceRateFormValues = z.infer<typeof insuranceRateSchema>;

export interface InsuranceRateFieldConfig {
  key: keyof InsuranceRateFormValues;
  label: string;
  hint: string;
}

export const INSURANCE_RATE_FIELDS: InsuranceRateFieldConfig[] = [
  { key: 'health_insurance_rate', label: '건강보험', hint: '근로자 부담률' },
  { key: 'long_term_care_rate', label: '장기요양보험', hint: '건강보험료의 %' },
  { key: 'employment_insurance_rate', label: '고용보험', hint: '근로자 부담률' },
  { key: 'national_pension_rate', label: '국민연금', hint: '근로자 부담률' },
];
