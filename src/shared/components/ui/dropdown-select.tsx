import { ChevronDown } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/components/ui/dropdown-menu';

interface DropdownSelectProps<T> {
  label: string;
  items: T[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function DropdownSelect<T extends string | number>({
  label,
  items,
  value,
  onChange,
}: DropdownSelectProps<T>) {
  return (
    <div className="flex items-center gap-3">
      <div className="font-bold min-w-15">{label}</div>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <div
            className="
              flex items-center justify-between 
              w-full min-w-28 px-4 py-2
              border rounded-md bg-white
            "
          >
            {value}
            <ChevronDown className="size-4" />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-40 max-h-40 overflow-y-auto bg-white p-1 rounded-md shadow-md">
          {items.map((item) => (
            <DropdownMenuItem key={item} onClick={() => onChange(item)} className="cursor-pointer">
              {item}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
