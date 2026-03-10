import type { UseFormRegister, FieldErrors } from 'react-hook-form';

// eslint-disable-next-line fsd-import/layer-imports
import {
  INSURANCE_RATE_FIELDS,
  type InsuranceRateFormValues,
} from '@/features/admin/model/insurance.schema';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

interface InsuranceRateFieldsProps {
  register: UseFormRegister<InsuranceRateFormValues>;
  errors: FieldErrors<InsuranceRateFormValues>;
}

const InsuranceRateFields = ({ register, errors }: InsuranceRateFieldsProps) => {
  return (
    <div>
      <p className="text-sm font-semibold mb-4">요율 수정</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        {INSURANCE_RATE_FIELDS.map(({ key, label, hint }) => (
          <div key={key} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor={`rate-${key}`} className="text-sm font-medium">
                {label}
              </Label>
              <span className="text-xs text-muted-foreground">{hint}</span>
            </div>
            <div className="flex items-center border border-input rounded-md bg-background focus-within:ring-2 focus-within:ring-ring/50">
              <Input
                id={`rate-${key}`}
                type="number"
                step="0.0001"
                className="border-0 shadow-none focus-visible:ring-0 flex-1"
                aria-invalid={!!errors[key]}
                {...register(key, { valueAsNumber: true })}
              />
              <span className="px-3 text-sm text-muted-foreground select-none">%</span>
            </div>
            {errors[key] && <p className="text-destructive text-xs">{errors[key]?.message}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsuranceRateFields;
