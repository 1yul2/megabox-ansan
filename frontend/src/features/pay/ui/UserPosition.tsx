import { payColumns, insuranceColumns } from '../model/user/dataColumns';

import { Item } from './userItem';
import { Section } from './userSection';

import type { UserPositionProps } from '../model/user/type';

export default function UserPosition({ data }: UserPositionProps) {
  return (
    <div className="flex justify-center pb-16 px-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-mega text-white px-6 py-6">
          <div className="text-2xl font-bold text-center mb-3">급여 명세서</div>

          <div className="flex justify-between items-center text-sm opacity-90">
            <div>
              <span className="font-semibold">{data.name}</span>
              <span className="mx-2">|</span>
              {data.birth_date}
            </div>
            <div>지급일 {data.pay_date}</div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <Section title="급여">
            {payColumns.map((c) => (
              <Item
                key={c.key}
                label={c.label}
                value={data[c.key] ?? undefined}
                highlight={c.key === 'gross_pay'}
              />
            ))}
          </Section>

          <Section title="공제">
            {insuranceColumns.map((c) => (
              <Item
                key={c.key}
                label={c.label}
                value={data[c.key] ?? undefined}
                highlight={c.key === 'total_deduction'}
                danger
              />
            ))}
          </Section>

          <div className="bg-mega rounded-xl p-6 text-center">
            <div className="text-sm text-gray-200 mb-2">실지급액</div>
            <div className="text-3xl font-extrabold text-white tracking-wide">
              {data.net_pay?.toLocaleString()} 원
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
