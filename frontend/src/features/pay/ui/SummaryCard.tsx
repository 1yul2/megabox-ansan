export function SummaryCard({
  title,
  value,
  color = 'text-black',
}: {
  title: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <p className="text-xs text-gray-500 mb-1">{title}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}
