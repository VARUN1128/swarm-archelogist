import type { ComponentType } from "react";
import { Bot, Gauge, GitPullRequest, LayoutDashboard, Network, ScanSearch, ShieldAlert, Wrench } from "lucide-react";

import { cn } from "@/lib/utils";

export type WorkspaceSection =
  | "overview"
  | "architecture"
  | "security"
  | "qa"
  | "performance"
  | "staff"
  | "patches"
  | "pr";

const items: Array<{ key: WorkspaceSection; label: string; icon: ComponentType<{ className?: string }> }> = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "architecture", label: "Architecture", icon: Network },
  { key: "security", label: "Security Review", icon: ShieldAlert },
  { key: "qa", label: "QA Review", icon: ScanSearch },
  { key: "performance", label: "Performance Review", icon: Gauge },
  { key: "staff", label: "Staff Engineer", icon: Bot },
  { key: "patches", label: "Generated Patches", icon: Wrench },
  { key: "pr", label: "PR Package", icon: GitPullRequest },
];

interface WorkspaceSidebarProps {
  activeSection: WorkspaceSection;
  onSectionChange: (section: WorkspaceSection) => void;
}

export function WorkspaceSidebar({ activeSection, onSectionChange }: WorkspaceSidebarProps) {
  return (
    <aside className="rounded-2xl border border-border bg-card p-3">
      <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Repository</p>
      <nav className="space-y-1">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onSectionChange(item.key)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition",
              activeSection === item.key
                ? "border border-accent/30 bg-accent/10 text-white"
                : "border border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
