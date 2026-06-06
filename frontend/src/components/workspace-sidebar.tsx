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
    <aside className="border border-border bg-background p-4 transition-colors duration-500 ease-in-out">
      <p className="px-2 pb-4 font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-muted">Repository</p>
      <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:block lg:space-y-0 lg:overflow-visible lg:px-0 lg:pb-0">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onSectionChange(item.key)}
            className={cn(
              "flex shrink-0 items-center gap-3 border border-border px-3 py-3 text-left text-sm transition-transform transition-colors duration-700 ease-in-out hover:scale-[1.02] lg:w-full lg:border-x-0 lg:border-b-0 lg:border-t lg:px-2 lg:py-4",
              activeSection === item.key ? "bg-card text-foreground" : "text-muted hover:bg-card hover:text-foreground",
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
