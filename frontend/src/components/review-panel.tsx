import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { StaffEngineerReview } from "@/types";

interface ReviewPanelProps {
  review: StaffEngineerReview;
  selectedFindingIds: string[];
  onToggleFinding: (findingId: string) => void;
  onSelectAllApproved: () => void;
}

export function ReviewPanel({ review, selectedFindingIds, onToggleFinding, onSelectAllApproved }: ReviewPanelProps) {
  return (
    <Card className="border-border bg-card p-4 md:p-5">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Staff Engineer Review</h3>
            <p className="mt-1 text-sm leading-7 text-muted">{review.engineering_reasoning}</p>
          </div>
          <div className="flex flex-col gap-4 border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Finding Approval Workflow</p>
              <p className="mt-1 text-sm text-muted">
                {selectedFindingIds.length} of {review.approved_findings.length} approved findings selected for fix generation.
              </p>
            </div>
            <Button variant="secondary" onClick={onSelectAllApproved} className="w-full sm:w-auto">
              Select All
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {review.approved_findings.map((finding) => (
              <button
                key={finding.id}
                type="button"
                onClick={() => onToggleFinding(finding.id)}
                className={`border p-4 text-left transition-transform duration-700 ease-in-out hover:scale-[1.01] ${selectedFindingIds.includes(finding.id) ? "border-foreground bg-card" : "border-border bg-background"}`}
              >
                <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">{finding.severity}</p>
                <h4 className="mt-2 text-base leading-tight text-foreground">{finding.title}</h4>
                <p className="mt-2 text-sm leading-7 text-muted">{finding.recommendation}</p>
                <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-muted">
                  {selectedFindingIds.includes(finding.id) ? "Selected for Fix Generation" : "Not Selected"}
                </p>
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4">
          <div className="border border-danger/30 bg-danger/10 p-4">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-foreground">Critical Findings</p>
            <div className="mt-3 space-y-3">
              {review.critical_findings.map((finding) => (
                <div key={finding.id}>
                  <p className="font-semibold text-foreground">{finding.title}</p>
                  <p className="text-sm leading-7 text-muted">{finding.explanation}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="border border-border bg-background p-4">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Priority Ranking</p>
            <ol className="mt-3 space-y-2 text-sm leading-7 text-foreground">
              {review.priority_ranking.map((item, index) => (
                <li key={item}>
                  {index + 1}. {item}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </Card>
  );
}
