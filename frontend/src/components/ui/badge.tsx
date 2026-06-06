import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-sm border border-border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.28em] text-muted",
        className,
      )}
      {...props}
    />
  );
}
