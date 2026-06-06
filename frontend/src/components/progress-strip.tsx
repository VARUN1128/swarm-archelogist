import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { AgentProgress } from "@/types";

interface ProgressStripProps {
  progress: AgentProgress[];
}

export function ProgressStrip({ progress }: ProgressStripProps) {
  const normalizedAgentCount = new Set(progress.map((item) => item.agent)).size;
  const completed = new Set(progress.filter((item) => item.status === "completed").map((item) => item.agent)).size;
  const percentage = normalizedAgentCount ? Math.round((completed / normalizedAgentCount) * 100) : 0;
  const currentStep = [...progress].reverse().find((item) => item.status === "running" || item.status === "queued");
  const recentActivity = progress.slice(-8).reverse();

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Execution Progress</h3>
            <p className="text-sm text-slate-300">Pipeline visibility across repository ingestion, specialists, and Staff Engineer review.</p>
          </div>
          <div className="text-sm font-semibold text-accent">{percentage}%</div>
        </div>
        <Progress value={percentage} />
        {currentStep && (
          <div className="rounded-2xl border border-accent/20 bg-accent/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Current Step</p>
            <p className="mt-2 text-sm font-semibold text-white">{currentStep.agent}</p>
            <p className="mt-1 text-sm text-slate-200">{currentStep.detail}</p>
          </div>
        )}
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {progress.map((item, index) => (
            <div key={`${item.agent}-${item.status}-${index}`} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{item.agent}</p>
                <span className={`h-2 w-2 rounded-full ${item.status === "completed" ? "bg-success" : item.status === "failed" ? "bg-danger" : "animate-pulse bg-warning"}`} />
              </div>
              <p className="mt-2 text-sm text-white">{item.status}</p>
              <p className="mt-1 text-xs leading-6 text-slate-300">{item.detail}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#02060d] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Activity Feed</p>
          <div className="mt-3 space-y-3">
            {recentActivity.map((item, index) => (
              <div key={`${item.agent}-${index}`} className="flex gap-3 text-sm">
                <span className={`mt-2 h-2 w-2 rounded-full ${item.status === "completed" ? "bg-success" : item.status === "failed" ? "bg-danger" : "bg-accent"}`} />
                <div>
                  <p className="font-medium capitalize text-white">{item.agent}</p>
                  <p className="text-slate-300">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
