import * as React from "react";

import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-sm border px-4 py-2.5 text-sm font-medium transition-transform transition-colors duration-700 ease-in-out hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "border-[#111111] bg-[#111111] text-white dark:border-[#f5f5f5] dark:bg-[#f5f5f5] dark:text-[#111111]",
        variant === "secondary" && "border-border bg-transparent text-foreground hover:bg-card",
        variant === "ghost" && "border-transparent bg-transparent text-muted hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}
