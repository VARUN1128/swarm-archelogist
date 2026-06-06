import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-300",
        className,
      )}
      {...props}
    />
  );
}
