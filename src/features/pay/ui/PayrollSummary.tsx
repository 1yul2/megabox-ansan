import { SummaryCard } from './SummaryCard';

interface Props {
  totalEmployees: number;
  totalSalary: number;
  totalNetPay: number;
  totalDeduction: number;
}

export default function PayrollSummary({
  totalEmployees,
  totalSalary,
  totalNetPay,
  totalDeduction,
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <SummaryCard title="대상인원" value={`${totalEmployees}명`} />
      <SummaryCard
        title="급여합계"
        value={`${totalSalary.toLocaleString()}원`}
        color="text-mega-secondary"
      />
      <SummaryCard title="지급합계" value={`${totalNetPay.toLocaleString()}원`} />
      <SummaryCard
        title="공제합계"
        value={`${totalDeduction.toLocaleString()}원`}
        color="text-red-500"
      />
    </div>
  );
}
