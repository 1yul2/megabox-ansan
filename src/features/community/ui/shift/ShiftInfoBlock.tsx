interface ShiftInfoBlockProps {
  label: string;
  name: string;
  time: string;
}

export function ShiftInfoBlock({ label, name, time }: ShiftInfoBlockProps) {
  return (
    <div>
      <p className="font-semibold mb-1">{label}</p>
      <div className="flex gap-4 text-gray-700">
        <p> {name} </p>
        <p className="font-bold"> | </p>
        <p> {time} </p>
      </div>
    </div>
  );
}
