import { Card } from "@/components/ui/card";
import type { AgentProgress } from "@/types";

interface AgentRailProps {
  progress: AgentProgress[];
  hasFixes: boolean;
  hasPRDraft: boolean;
  isGeneratingFixes: boolean;
  isGeneratingPR: boolean;
}

const labels: Array<{ key: string; label: string }> = [
  { key: "context_builder", label: "Context Builder" },
  { key: "architect", label: "Architect Agent" },
  { key: "security", label: "Security Agent" },
  { key: "qa", label: "QA Agent" },
  { key: "performance", label: "Performance Agent" },
  { key: "staff_engineer", label: "Staff Engineer" },
];

export function AgentRail({
  progress,
  hasFixes,
  hasPRDraft,
  isGeneratingFixes,
  isGeneratingPR,
}: AgentRailProps) {
  const latestByAgent = new Map<string, AgentProgress>();
  for (const item of progress) latestByAgent.set(item.agent, item);

  const extraStates = [
    {
      label: "Patch Generator",
      status: isGeneratingFixes ? "running" : hasFixes ? "completed" : "idle",
      detail: isGeneratingFixes ? "Synthesizing review-ready patch proposals." : hasFixes ? "Patch proposals generated." : "Waiting for Generate Fixes.",
    },
    {
      label: "PR Generator",
      status: isGeneratingPR ? "running" : hasPRDraft ? "completed" : "idle",
      detail: isGeneratingPR ? "Drafting markdown PR package." : hasPRDraft ? "PR package generated." : "Waiting for approved patches.",
    },
  ];

  return (
    <Card className="border-border bg-card p-4">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Agent Activity</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Execution Rail</h3>
        </div>
        <div className="space-y-3">
          {labels.map((item) => {
            const state = latestByAgent.get(item.key);
            const status = state?.status ?? "idle";
            return (
              <div key={item.key} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <span className={`h-2.5 w-2.5 rounded-full ${status === "completed" ? "bg-success" : status === "running" ? "animate-pulse bg-accent" : status === "failed" ? "bg-danger" : "bg-slate-600"}`} />
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">{status}</p>
                <p className="mt-1 text-xs leading-6 text-slate-300">{state?.detail ?? "Waiting to start."}</p>
              </div>
            );
          })}
          {extraStates.map((item) => (
            <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">{item.label}</p>
                <span className={`h-2.5 w-2.5 rounded-full ${item.status === "completed" ? "bg-success" : item.status === "running" ? "animate-pulse bg-accent" : "bg-slate-600"}`} />
              </div>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">{item.status}</p>
              <p className="mt-1 text-xs leading-6 text-slate-300">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
