import type { ReactNode } from "react";

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 text-[11px] font-medium uppercase tracking-[0.18em] text-foreground-faint">
      {children}
    </div>
  );
}
