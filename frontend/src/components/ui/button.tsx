import * as React from "react";

import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-accent text-slate-950 shadow-glow hover:brightness-110",
        variant === "secondary" && "border border-border bg-white/5 text-foreground hover:bg-white/10",
        variant === "ghost" && "text-slate-300 hover:text-white",
        className,
      )}
      {...props}
    />
  );
}
