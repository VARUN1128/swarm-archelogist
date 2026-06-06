import { Download, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface WorkspaceTopbarProps {
  repositoryName: string;
  findingsCount: number;
  approvedFixesCount: number;
  criticalCount: number;
  hasPRDraft: boolean;
  onGeneratePR: () => void;
  onExportMarkdown: () => void;
  isGeneratingPR: boolean;
  canGeneratePR: boolean;
}

export function WorkspaceTopbar({
  repositoryName,
  findingsCount,
  approvedFixesCount,
  criticalCount,
  hasPRDraft,
  onGeneratePR,
  onExportMarkdown,
  isGeneratingPR,
  canGeneratePR,
}: WorkspaceTopbarProps) {
  return (
    <Card className="border-border bg-card px-5 py-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Repository</p>
            <h2 className="mt-1 text-xl font-semibold text-white">{repositoryName}</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
              Analysis Complete
            </span>
            <div className="flex flex-wrap gap-2 text-xs text-slate-300">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{findingsCount} Findings</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{approvedFixesCount} Approved Fixes</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{criticalCount} Critical</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={onExportMarkdown} disabled={!hasPRDraft}>
            <Download className="mr-2 h-4 w-4" />
            Export Markdown
          </Button>
          <Button onClick={onGeneratePR} disabled={!canGeneratePR || isGeneratingPR}>
            <FileText className="mr-2 h-4 w-4" />
            {isGeneratingPR ? "Generating PR..." : "Generate PR Package"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
