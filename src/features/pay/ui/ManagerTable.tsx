import { dataColumns } from '../model/manager/dataColumns';

import type { PayrollData } from '../model/type';
import type { ReactNode } from 'react';

interface Props {
  data: PayrollData[];
}

const formatValue = (value: unknown): ReactNode => {
  if (value == null) return '-';

  if (typeof value === 'number') {
    return value.toLocaleString();
  }

  if (typeof value === 'string') {
    return value;
  }

  return String(value);
};

export default function ManagerTable({ data }: Props) {
  return (
    <div className="bg-white shadow mt-10">
      <div className="overflow-x-auto">
        <table className="min-w-[3200px] w-full text-xs">
          <thead className="bg-gray-100 text-gray-600">
            <tr className="text-center text-sm font-semibold">
              {dataColumns.map((group) => (
                <th
                  key={group.group}
                  colSpan={group.columns.length}
                  className={`p-3 border-r border-gray-200 ${
                    group.highlight === 'primary'
                      ? 'text-mega-secondary'
                      : group.highlight === 'danger'
                        ? 'text-red-500'
                        : 'text-gray-800'
                  }`}
                >
                  {group.group}
                </th>
              ))}
            </tr>

            <tr>
              {dataColumns.flatMap((group) =>
                group.columns.map((col) => (
                  <th
                    key={String(col.key)}
                    className={`p-4 text-center ${
                      col.rightBorder ? 'border-r border-gray-200' : ''
                    } ${
                      col.highlight === 'primary'
                        ? 'text-mega-secondary'
                        : col.highlight === 'danger'
                          ? 'text-red-500'
                          : ''
                    }`}
                  >
                    {col.label}
                  </th>
                )),
              )}
            </tr>
          </thead>

          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50">
                {dataColumns.flatMap((group) =>
                  group.columns.map((col) => {
                    const value = row[col.key];

                    const renderedValue = col.render ? col.render(value, row) : formatValue(value);

                    return (
                      <td
                        key={String(col.key)}
                        className={`p-4 text-center ${
                          col.rightBorder ? 'border-r border-gray-100' : ''
                        } ${
                          col.highlight === 'primary'
                            ? 'text-mega-secondary font-bold'
                            : col.highlight === 'danger'
                              ? 'text-red-500 font-bold'
                              : ''
                        }`}
                      >
                        {renderedValue}
                      </td>
                    );
                  }),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
