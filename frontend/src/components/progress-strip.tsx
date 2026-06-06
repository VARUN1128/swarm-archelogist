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
    <Card className="border-border bg-background p-4 transition-colors duration-500 ease-in-out md:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-2xl leading-none tracking-tight text-foreground">Execution Progress</h3>
            <p className="mt-3 font-mono text-sm text-muted">Pipeline visibility across repository ingestion, specialists, and Staff Engineer review.</p>
          </div>
          <div className="font-mono text-sm font-medium text-foreground">{percentage}%</div>
        </div>
        <Progress value={percentage} />
        {currentStep && (
          <div className="border border-border p-5">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-muted">Current Step</p>
            <p className="mt-3 text-lg leading-tight text-foreground">{currentStep.agent}</p>
            <p className="mt-2 break-words font-mono text-sm leading-8 text-muted">{currentStep.detail}</p>
          </div>
        )}
        <div className="grid gap-px bg-border sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {progress.map((item, index) => (
            <div key={`${item.agent}-${item.status}-${index}`} className="bg-background p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-muted">{item.agent}</p>
                <span className={`h-2 w-2 rounded-full ${item.status === "completed" ? "bg-success" : item.status === "failed" ? "bg-danger" : "animate-pulse bg-warning"}`} />
              </div>
              <p className="mt-3 text-sm text-foreground">{item.status}</p>
              <p className="mt-2 break-words font-mono text-xs leading-7 text-muted">{item.detail}</p>
            </div>
          ))}
        </div>
        <div className="border border-border p-5">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-muted">Activity Feed</p>
          <div className="mt-3 space-y-3">
            {recentActivity.map((item, index) => (
              <div key={`${item.agent}-${index}`} className="flex gap-3 text-sm">
                <span className={`mt-2 h-2 w-2 rounded-full ${item.status === "completed" ? "bg-success" : item.status === "failed" ? "bg-danger" : "bg-accent"}`} />
                <div>
                  <p className="font-medium capitalize text-foreground">{item.agent}</p>
                  <p className="break-words font-mono text-xs leading-7 text-muted">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
