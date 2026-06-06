import { AlertTriangle, ShieldAlert, TestTubeDiagonal, Zap } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { Finding, SpecialistReport } from "@/types";

const severityClasses: Record<string, string> = {
  critical: "border-danger/40 bg-danger/10 text-foreground",
  high: "border-warning/40 bg-warning/10 text-foreground",
  medium: "border-border bg-card text-foreground",
  low: "border-border bg-background text-foreground",
};

function FindingCard({ finding }: { finding: Finding }) {
  return (
    <div className={`border p-4 ${severityClasses[finding.severity] ?? severityClasses.low}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em]">{finding.severity}</p>
          <h4 className="mt-2 text-base font-semibold leading-tight">{finding.title}</h4>
        </div>
        <span className="w-fit rounded-sm border border-border px-2 py-1 font-mono text-[11px] uppercase tracking-[0.2em]">{finding.source_agent}</span>
      </div>
      <p className="mt-3 text-sm leading-7 text-muted">{finding.explanation}</p>
      <p className="mt-3 text-sm font-medium text-foreground">Recommendation: {finding.recommendation}</p>
      <div className="mt-4 grid gap-2">
        {finding.evidence.map((item, index) => (
          <div key={`${finding.id}-${index}`} className="border border-border bg-background p-3">
            <p className="break-all font-mono text-xs uppercase tracking-[0.24em] text-muted">{item.file_path}</p>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words text-xs leading-6 text-foreground">{item.snippet}</pre>
            <p className="mt-2 text-xs leading-6 text-muted">{item.reason}</p>
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
        <Card key={group.title} className="border-border bg-card p-4 md:p-5">
          <div className="mb-4 flex items-center gap-3">
            <group.icon className="h-5 w-5 text-foreground" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">{group.title} Findings</h3>
              <p className="text-sm leading-7 text-muted">{group.report.summary}</p>
            </div>
          </div>
          <div className="space-y-4">
            {group.report.findings.length ? (
              group.report.findings.map((finding) => <FindingCard key={finding.id} finding={finding} />)
            ) : (
              <div className="border border-dashed border-border p-6 text-sm text-muted">
                <AlertTriangle className="mb-2 h-4 w-4 text-muted" />
                No findings returned for this specialist.
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
