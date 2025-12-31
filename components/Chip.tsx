import type { ReactNode } from "react";

export function LabelChip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
      {children}
    </span>
  );
}

export function ValueChip({ children }: { children: ReactNode }) {
  return (
    <span className="max-w-full whitespace-normal break-words rounded-md border border-gray-200 px-2 py-0.5 text-[11px]">
      {children}
    </span>
  );
}
