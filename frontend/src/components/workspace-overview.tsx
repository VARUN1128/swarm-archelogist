import { Card } from "@/components/ui/card";
import type { AnalyzeRepositoryResponse } from "@/types";

interface WorkspaceOverviewProps {
  analysis: AnalyzeRepositoryResponse;
}

export function WorkspaceOverview({ analysis }: WorkspaceOverviewProps) {
  const allFindings = [
    ...analysis.security_report.findings,
    ...analysis.qa_report.findings,
    ...analysis.performance_report.findings,
  ];
  const severityCounts = {
    critical: allFindings.filter((item) => item.severity === "critical").length,
    high: allFindings.filter((item) => item.severity === "high").length,
    medium: allFindings.filter((item) => item.severity === "medium").length,
    low: allFindings.filter((item) => item.severity === "low").length,
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-4">
        {[
          ["Critical", severityCounts.critical],
          ["High", severityCounts.high],
          ["Medium", severityCounts.medium],
          ["Low", severityCounts.low],
        ].map(([label, value]) => (
          <Card key={label} className="rounded-none border-0 bg-background p-4 md:p-6">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-muted">{label}</p>
            <p className="mt-4 text-3xl leading-none tracking-tight text-foreground md:text-5xl">{value}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border bg-background p-5 md:p-8">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-muted">Repository Summary</p>
          <p className="mt-5 font-mono text-sm leading-8 text-muted">{analysis.repository_context.condensed_summary}</p>
          <div className="mt-8 grid gap-0 border border-border md:grid-cols-2">
            <div className="border-b border-border p-5 md:border-b-0 md:border-r">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-muted">Detected Stack</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {analysis.architecture_report.detected_stack.map((item) => (
                  <span key={item} className="border border-border px-3 py-1 font-mono text-xs text-foreground">{item}</span>
                ))}
              </div>
            </div>
            <div className="p-5">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-muted">Architecture Snapshot</p>
              <div className="mt-4 space-y-3 font-mono text-sm text-foreground">
                {analysis.architecture_report.key_components.slice(0, 5).map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>
          </div>
        </Card>
        <Card className="border-border bg-background p-5 md:p-8">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-muted">Risk Summary</p>
          <div className="mt-3 space-y-3">
            {analysis.staff_engineer_review.priority_ranking.slice(0, 5).map((item, index) => (
              <div key={item} className="border-t border-border py-4 first:border-t-0 first:pt-0">
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">Priority {index + 1}</p>
                <p className="mt-3 text-lg leading-tight text-foreground">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 border-t border-border pt-5">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-muted">Findings Summary</p>
            <p className="mt-4 font-mono text-sm leading-8 text-muted">{analysis.staff_engineer_review.engineering_reasoning}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
