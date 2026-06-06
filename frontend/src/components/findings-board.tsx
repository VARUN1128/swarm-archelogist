import { AlertTriangle, ShieldAlert, TestTubeDiagonal, Zap } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { Finding, SpecialistReport } from "@/types";

const severityClasses: Record<string, string> = {
  critical: "border-danger/40 bg-danger/10 text-red-100",
  high: "border-warning/40 bg-warning/10 text-amber-100",
  medium: "border-accent/40 bg-accent/10 text-cyan-100",
  low: "border-white/10 bg-white/5 text-slate-100",
};

function FindingCard({ finding }: { finding: Finding }) {
  return (
    <div className={`rounded-2xl border p-4 ${severityClasses[finding.severity] ?? severityClasses.low}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em]">{finding.severity}</p>
          <h4 className="mt-2 text-base font-semibold">{finding.title}</h4>
        </div>
        <span className="rounded-full border border-white/10 px-2 py-1 text-[11px] uppercase tracking-[0.2em]">{finding.source_agent}</span>
      </div>
      <p className="mt-3 text-sm leading-7 text-slate-200">{finding.explanation}</p>
      <p className="mt-3 text-sm font-medium text-white">Recommendation: {finding.recommendation}</p>
      <div className="mt-4 grid gap-2">
        {finding.evidence.map((item, index) => (
          <div key={`${finding.id}-${index}`} className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">{item.file_path}</p>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-slate-200">{item.snippet}</pre>
            <p className="mt-2 text-xs text-slate-300">{item.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

interface FindingsBoardProps {
  security: SpecialistReport;
  qa: SpecialistReport;
  performance: SpecialistReport;
}

export function FindingsBoard({ security, qa, performance }: FindingsBoardProps) {
  const groups = [
    { title: "Security", icon: ShieldAlert, report: security },
    { title: "QA", icon: TestTubeDiagonal, report: qa },
    { title: "Performance", icon: Zap, report: performance },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      {groups.map((group) => (
        <Card key={group.title} className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <group.icon className="h-5 w-5 text-accent" />
            <div>
              <h3 className="text-lg font-semibold text-white">{group.title} Findings</h3>
              <p className="text-sm text-slate-300">{group.report.summary}</p>
            </div>
          </div>
          <div className="space-y-4">
            {group.report.findings.length ? (
              group.report.findings.map((finding) => <FindingCard key={finding.id} finding={finding} />)
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-slate-300">
                <AlertTriangle className="mb-2 h-4 w-4 text-slate-400" />
                No findings returned for this specialist.
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
