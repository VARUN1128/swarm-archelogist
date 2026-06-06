import { Card } from "@/components/ui/card";
import type { StaffEngineerReview } from "@/types";

interface ReviewPanelProps {
  review: StaffEngineerReview;
}

export function ReviewPanel({ review }: ReviewPanelProps) {
  return (
    <Card className="p-5">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Staff Engineer Review</h3>
            <p className="mt-1 text-sm leading-7 text-slate-300">{review.engineering_reasoning}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {review.approved_findings.map((finding) => (
              <div key={finding.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">{finding.severity}</p>
                <h4 className="mt-2 font-semibold text-white">{finding.title}</h4>
                <p className="mt-2 text-sm text-slate-300">{finding.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-4">
          <div className="rounded-2xl border border-danger/30 bg-danger/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-red-200">Critical Findings</p>
            <div className="mt-3 space-y-3">
              {review.critical_findings.map((finding) => (
                <div key={finding.id}>
                  <p className="font-semibold text-white">{finding.title}</p>
                  <p className="text-sm text-slate-300">{finding.explanation}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Priority Ranking</p>
            <ol className="mt-3 space-y-2 text-sm text-white">
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
