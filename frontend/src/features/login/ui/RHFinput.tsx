import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';

export interface RHFInputProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  type?: string;
  className?: string;
  disabled?: boolean;
}

const RHFInput = <T extends FieldValues>({
  form,
  name,
  label,
  placeholder = '',
  type = 'text',
  className = '',
  disabled = false,
}: RHFInputProps<T>) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col gap-0 relative">
          {label && <FormLabel className="mb-1 font-semibold">{label}</FormLabel>}
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              {...field}
              data-testid={`input-${name}`} // 테스트 식별자 추가
              className={className}
            />
          </FormControl>
          <FormMessage className="text-end mt-1" />
        </FormItem>
      )}
    />
  );
};

export default RHFInput;
