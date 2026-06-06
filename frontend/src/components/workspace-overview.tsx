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
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Critical", severityCounts.critical],
          ["High", severityCounts.high],
          ["Medium", severityCounts.medium],
          ["Low", severityCounts.low],
        ].map(([label, value]) => (
          <Card key={label} className="border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Repository Summary</p>
          <p className="mt-3 text-sm leading-7 text-slate-200">{analysis.repository_context.condensed_summary}</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Detected Stack</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {analysis.architecture_report.detected_stack.map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-[#050816] px-3 py-1 text-xs text-slate-200">{item}</span>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Architecture Snapshot</p>
              <div className="mt-3 space-y-2 text-sm text-slate-200">
                {analysis.architecture_report.key_components.slice(0, 5).map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>
          </div>
        </Card>
        <Card className="border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Risk Summary</p>
          <div className="mt-3 space-y-3">
            {analysis.staff_engineer_review.priority_ranking.slice(0, 5).map((item, index) => (
              <div key={item} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Priority {index + 1}</p>
                <p className="mt-2 text-sm font-medium text-white">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Findings Summary</p>
            <p className="mt-3 text-sm leading-7 text-slate-200">{analysis.staff_engineer_review.engineering_reasoning}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
