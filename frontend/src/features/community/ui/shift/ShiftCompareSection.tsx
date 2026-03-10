import { ShiftInfoBlock } from './ShiftInfoBlock';

interface ShiftCompareSectionProps {
  title: string;
  badgeClassName: string;
  requesterName: string;
  requesterTime: string;
  targetName: string;
  targetTime: string;
}

export function ShiftCompareSection({
  title,
  badgeClassName,
  requesterName,
  requesterTime,
  targetName,
  targetTime,
}: ShiftCompareSectionProps) {
  return (
    <section>
      <span className={`inline-block mb-4 px-3 py-1 rounded font-semibold ${badgeClassName}`}>
        {title}
      </span>

      <div className="flex flex-col gap-6">
        <ShiftInfoBlock label="신청인 정보" name={requesterName} time={requesterTime} />
        <ShiftInfoBlock label="대상자 정보" name={targetName} time={targetTime} />
      </div>
    </section>
  );
}
