import type { PayrollData } from '../type';

interface Column<T> {
  key: keyof T;
  label: string;
  format?: (val: T[keyof T]) => string | number;
}

export function formatNumberOrDash(value: unknown): string {
  if (typeof value !== 'number') return '-';
  if (value === 0) return '-';
  return value.toLocaleString();
}

export interface ColumnSection<T> {
  key: string;
  title: string;
  columns: Column<T>[];
}

export interface ManagerPositionsProps {
  filteredData: PayrollData[];
}
