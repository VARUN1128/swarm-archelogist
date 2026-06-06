import { Download, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { PullRequestDraft } from "@/types";

interface PRPanelProps {
  prDraft: PullRequestDraft;
}

export function PRPanel({ prDraft }: PRPanelProps) {
  const download = () => {
    const blob = new Blob([prDraft.markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "swarm-archaeologist-review-package.md";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-border bg-card p-4 md:p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-foreground" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">{prDraft.title}</h3>
            <p className="text-sm leading-7 text-muted">{prDraft.summary}</p>
          </div>
        </div>
        <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2">
          <Button variant="secondary" onClick={() => navigator.clipboard.writeText(prDraft.markdown)} className="w-full">
            Copy
          </Button>
          <Button onClick={download} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="border border-border bg-background p-4">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Modified Files</p>
          <div className="mt-3 space-y-2 text-sm text-foreground">
            {prDraft.modified_files.map((file) => (
              <p key={file} className="break-all">{file}</p>
            ))}
          </div>
        </div>
        <div className="border border-border bg-background p-4">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Impact</p>
          <p className="mt-3 text-sm leading-7 text-foreground">{prDraft.impact}</p>
        </div>
        <div className="border border-border bg-background p-4">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Risk</p>
          <p className="mt-3 text-sm leading-7 text-foreground">{prDraft.risk_assessment}</p>
        </div>
      </div>
      <pre className="mt-5 overflow-x-auto border border-border bg-background p-4 text-xs leading-6 text-foreground">
        {prDraft.markdown}
      </pre>
    </Card>
  );
}
