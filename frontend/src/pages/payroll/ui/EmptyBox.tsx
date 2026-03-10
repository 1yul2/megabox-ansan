import { CalendarX } from "lucide-react";

export function EmptyBox({
  selectedYear,
  selectedMonth,
}: {
  selectedYear: number;
  selectedMonth: number;
}) {
  return (
    <div className="bg-white shadow rounded-2xl py-16 flex flex-col items-center justify-center gap-4 border border-gray-100">
      <div className="bg-mega-secondary/10 p-5 rounded-full">
        <CalendarX className="w-10 h-10 text-mega-secondary" />
      </div>

      <div className="text-lg font-semibold text-gray-800">
        급여 데이터가 없습니다
      </div>

      <div className="text-sm text-gray-500 text-center">
        {selectedYear}년 {selectedMonth}월에 등록된 급여 정보가 없습니다.
        <br />
        다른 기간을 선택해 주세요.
      </div>
    </div>
  );
}