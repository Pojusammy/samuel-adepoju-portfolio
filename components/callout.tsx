import type { ReactNode } from "react";

export function Callout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="my-10 rounded-[1.4rem] border border-line bg-background-soft px-5 py-5 shadow-soft">
      <p className="text-xs uppercase tracking-[0.22em] text-foreground-muted">{title}</p>
      <div className="mt-3 text-sm leading-7 text-foreground-soft">{children}</div>
    </div>
  );
}
