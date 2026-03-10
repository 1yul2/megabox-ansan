import React, { useCallback } from 'react';

export function usePhoneInput(setValue: (field: 'phone', value: string) => void) {
  return useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
      let formatted = digits;
      if (digits.length > 3) formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
      if (digits.length > 7)
        formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
      setValue('phone', formatted);
    },
    [setValue],
  );
}
