import type { ReactNode } from "react";

export function LabelChip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
      {children}
    </span>
  );
}

export function ValueChip({ children }: { children: ReactNode }) {
  return (
    <span className="max-w-full whitespace-normal wrap-break-word rounded-md border border-gray-200 px-2.5 py-1 text-xs">
      {children}
    </span>
  );
}
