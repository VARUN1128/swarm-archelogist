import { Copy, Download, FileText, History } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface WorkspaceTopbarProps {
  repositoryName: string;
  findingsCount: number;
  approvedFixesCount: number;
  criticalCount: number;
  hasPRDraft: boolean;
  sessionId: string;
  shareUrl: string;
  onGeneratePR: () => void;
  onExportMarkdown: () => void;
  onCopyShare: () => void;
  onOpenHistory: () => void;
  isGeneratingPR: boolean;
  canGeneratePR: boolean;
}

export function WorkspaceTopbar({
  repositoryName,
  findingsCount,
  approvedFixesCount,
  criticalCount,
  hasPRDraft,
  sessionId,
  shareUrl,
  onGeneratePR,
  onExportMarkdown,
  onCopyShare,
  onOpenHistory,
  isGeneratingPR,
  canGeneratePR,
}: WorkspaceTopbarProps) {
  return (
    <Card className="border-border bg-background px-4 py-4 transition-colors duration-500 ease-in-out md:px-6 md:py-5">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-muted">Repository</p>
            <h2 className="mt-2 break-words text-2xl leading-none tracking-tight text-foreground md:text-3xl">{repositoryName}</h2>
            <p className="mt-2 font-mono text-xs text-muted">Session {sessionId.slice(0, 8)}</p>
          </div>
          <div className="flex flex-col gap-3 lg:border-l lg:border-border lg:pl-6">
            <span className="w-fit rounded-sm border border-border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.24em] text-foreground">
              Analysis Complete
            </span>
            <div className="flex flex-wrap gap-2 font-mono text-xs text-muted">
              <span className="border border-border px-3 py-1">{findingsCount} Findings</span>
              <span className="border border-border px-3 py-1">{approvedFixesCount} Approved Fixes</span>
              <span className="border border-border px-3 py-1">{criticalCount} Critical</span>
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:flex xl:flex-wrap">
          <Button variant="secondary" onClick={onOpenHistory} className="w-full xl:w-auto">
            <History className="mr-2 h-4 w-4" />
            History
          </Button>
          <Button variant="secondary" onClick={onCopyShare} title={shareUrl} className="w-full xl:w-auto">
            <Copy className="mr-2 h-4 w-4" />
            Copy Share Link
          </Button>
          <Button variant="secondary" onClick={onExportMarkdown} disabled={!hasPRDraft} className="w-full xl:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export Markdown
          </Button>
          <Button onClick={onGeneratePR} disabled={!canGeneratePR || isGeneratingPR} className="w-full xl:w-auto">
            <FileText className="mr-2 h-4 w-4" />
            {isGeneratingPR ? "Generating PR..." : "Generate PR Package"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
