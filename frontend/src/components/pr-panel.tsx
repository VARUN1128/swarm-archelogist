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
    <Card className="border-border bg-card p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-accent" />
          <div>
            <h3 className="text-lg font-semibold text-white">{prDraft.title}</h3>
            <p className="text-sm text-slate-300">{prDraft.summary}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigator.clipboard.writeText(prDraft.markdown)}>
            Copy
          </Button>
          <Button onClick={download}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Modified Files</p>
          <div className="mt-3 space-y-2 text-sm text-white">
            {prDraft.modified_files.map((file) => (
              <p key={file}>{file}</p>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Impact</p>
          <p className="mt-3 text-sm text-slate-200">{prDraft.impact}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Risk</p>
          <p className="mt-3 text-sm text-slate-200">{prDraft.risk_assessment}</p>
        </div>
      </div>
      <pre className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-[#02060d] p-4 text-xs leading-6 text-slate-200">
        {prDraft.markdown}
      </pre>
    </Card>
  );
}
