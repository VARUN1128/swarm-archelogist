import { ArrowRight, BrainCircuit, GitBranch, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface HeroProps {
  repositoryUrl: string;
  localRootPath: string;
  onRepositoryUrlChange: (value: string) => void;
  onLocalRootPathChange: (value: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export function Hero({
  repositoryUrl,
  localRootPath,
  onRepositoryUrlChange,
  onLocalRootPathChange,
  onAnalyze,
  isAnalyzing,
}: HeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(121,208,255,0.25),_transparent_32%),linear-gradient(135deg,rgba(9,16,29,0.96),rgba(3,8,17,0.98))] p-8 md:p-12">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] opacity-30" />
      <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-7">
          <Badge>Multi-Agent Engineering Review Board</Badge>
          <div className="space-y-4">
            <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-white md:text-6xl">
              Inspect repository architecture, risks, and fix proposals in one engineering workspace.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
              Swarm Archaeologist fans out architecture, security, QA, and performance specialists in parallel, then routes everything through a Staff Engineer validation pass before proposing patches and PR-ready output.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur">
            <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
              <input
                value={repositoryUrl}
                onChange={(event) => onRepositoryUrlChange(event.target.value)}
                placeholder="https://github.com/owner/repository"
                className="min-h-14 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-accent"
              />
              <input
                value={localRootPath}
                onChange={(event) => onLocalRootPathChange(event.target.value)}
                placeholder="D:\\Projects\\your-local-repo"
                className="min-h-14 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-accent"
              />
              <Button className="min-h-14 px-6" onClick={onAnalyze} disabled={isAnalyzing || !repositoryUrl.trim()}>
                {isAnalyzing ? "Analyzing..." : "Analyze Repository"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <p className="mt-3 text-xs leading-6 text-slate-400">
              Add the local repository path now if you want approved patches to be applied later without re-entering it.
            </p>
          </div>
        </div>
        <Card className="grid gap-4 bg-white/5 p-5">
          {[
            {
              icon: BrainCircuit,
              title: "Parallel specialists",
              body: "Architect, Security, QA, and Performance agents operate concurrently to cover the repo from multiple senior engineering angles.",
            },
            {
              icon: ShieldCheck,
              title: "Staff Engineer adjudication",
              body: "Weak or duplicated findings are filtered out and the strongest risks are prioritized with explicit rationale.",
            },
            {
              icon: GitBranch,
              title: "Patch-ready output",
              body: "Generate fix diffs, validation results, and a clean markdown PR package without touching your git history.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <item.icon className="mb-3 h-5 w-5 text-accent" />
              <h3 className="text-sm font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-300">{item.body}</p>
            </div>
          ))}
        </Card>
      </div>
    </section>
  );
}
