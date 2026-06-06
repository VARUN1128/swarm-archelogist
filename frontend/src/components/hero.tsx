import { ArrowRight, BrainCircuit, GitBranch, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HeroProps {
  themeToggle?: ReactNode;
  repositoryUrl: string;
  localRootPath: string;
  incrementalMode: "full" | "diff" | "pull_request";
  baseRef: string;
  headRef: string;
  pullRequestNumber: string;
  onRepositoryUrlChange: (value: string) => void;
  onLocalRootPathChange: (value: string) => void;
  onIncrementalModeChange: (value: "full" | "diff" | "pull_request") => void;
  onBaseRefChange: (value: string) => void;
  onHeadRefChange: (value: string) => void;
  onPullRequestNumberChange: (value: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export function Hero({
  themeToggle,
  repositoryUrl,
  localRootPath,
  incrementalMode,
  baseRef,
  headRef,
  pullRequestNumber,
  onRepositoryUrlChange,
  onLocalRootPathChange,
  onIncrementalModeChange,
  onBaseRefChange,
  onHeadRefChange,
  onPullRequestNumberChange,
  onAnalyze,
  isAnalyzing,
}: HeroProps) {
  return (
    <section className="home-hero-shell overflow-hidden border border-border bg-background transition-colors duration-500 ease-in-out">
      <div className="relative min-h-[620px] overflow-hidden md:min-h-[720px]">
        <img
          src="/images/editorial-landscape.png"
          alt=""
          aria-hidden="true"
          data-parallax
          data-speed="0.12"
          className="home-hero-image home-parallax-layer absolute inset-0 h-full w-full scale-[1.06] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/20 to-white dark:from-black/20 dark:via-black/40 dark:to-[#0b0b0b]" />
        <div className="absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-white via-white/85 to-transparent dark:from-[#0b0b0b] dark:via-[#0b0b0b]/85" />
        <div className="home-light-sweep absolute -left-[10%] top-[14%] h-24 w-[55%] rotate-[-7deg] bg-white/25 blur-3xl dark:bg-white/10" />
        <div className="home-light-sweep-delayed absolute right-[-8%] top-[42%] h-20 w-[46%] rotate-[4deg] bg-[#ffe0c2]/35 blur-3xl dark:bg-[#f3b57c]/12" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-end px-5 py-5 md:px-10">
          {themeToggle}
        </div>

        <div className="relative z-10 mx-auto flex min-h-[620px] max-w-5xl flex-col items-center justify-end px-5 pb-16 text-center md:min-h-[720px] md:pb-20">
          <Badge
            data-reveal="rise"
            className="home-hero-badge w-fit border-[#4b2f28]/20 bg-[#5a372f]/85 text-[#fff4e8] backdrop-blur-md dark:border-[#f5d0a9]/25 dark:bg-[#f0b77f]/20 dark:text-[#fff4e8]"
          >
            Multi-Agent Engineering Review Board
          </Badge>
          <div className="mt-8 space-y-8">
            <h1 data-reveal="rise" data-reveal-delay="120" className="text-5xl leading-none text-[#111111] dark:text-[#f5f5f5] md:text-7xl">
              Inspect architecture, detect risks, and ship PR-ready fixes with a Staff Engineer validation pass.
            </h1>
            <p data-reveal="rise" data-reveal-delay="220" className="mx-auto max-w-3xl font-mono text-sm leading-8 text-[#4b5563] dark:text-[#d4d4d4] md:text-base">
              Swarm Archaeologist fans out architecture, security, QA, and performance specialists in parallel, then routes everything through a Staff Engineer validation pass before proposing patches and PR-ready output.
            </p>
          </div>
        </div>
      </div>

      <div data-reveal="rise" data-reveal-delay="280" className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-5 py-6 md:px-8 md:py-8">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
            <input
              value={repositoryUrl}
              onChange={(event) => onRepositoryUrlChange(event.target.value)}
              placeholder="https://github.com/openai/openai-python"
              className="home-hover-input min-h-14 rounded-sm border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors duration-500 ease-in-out focus:border-foreground"
            />
            <input
              value={localRootPath}
              onChange={(event) => onLocalRootPathChange(event.target.value)}
              placeholder="D:\\Projects\\your-local-repo"
              className="home-hover-input min-h-14 rounded-sm border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors duration-500 ease-in-out focus:border-foreground"
            />
            <Button className="home-hover-button min-h-14 px-6" onClick={onAnalyze} disabled={isAnalyzing || !repositoryUrl.trim()}>
              {isAnalyzing ? "Analyzing..." : "Analyze Repository"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-[220px_1fr_1fr]">
            <select
              value={incrementalMode}
              onChange={(event) => onIncrementalModeChange(event.target.value as "full" | "diff" | "pull_request")}
              className="home-hover-input min-h-12 rounded-sm border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors duration-500 ease-in-out focus:border-foreground"
            >
              <option value="full">Full Analysis</option>
              <option value="diff">Diff Analysis</option>
              <option value="pull_request">PR Analysis</option>
            </select>

            {incrementalMode === "diff" && (
              <>
                <input
                  value={baseRef}
                  onChange={(event) => onBaseRefChange(event.target.value)}
                  placeholder="base ref (main)"
                  className="home-hover-input min-h-12 rounded-sm border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors duration-500 ease-in-out focus:border-foreground"
                />
                <input
                  value={headRef}
                  onChange={(event) => onHeadRefChange(event.target.value)}
                  placeholder="head ref (feature-branch)"
                  className="home-hover-input min-h-12 rounded-sm border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors duration-500 ease-in-out focus:border-foreground"
                />
              </>
            )}

            {incrementalMode === "pull_request" && (
              <input
                value={pullRequestNumber}
                onChange={(event) => onPullRequestNumberChange(event.target.value)}
                placeholder="pull request number"
                className="home-hover-input min-h-12 rounded-sm border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors duration-500 ease-in-out focus:border-foreground lg:col-span-2"
              />
            )}

            {incrementalMode === "full" && (
              <div className="flex min-h-12 items-center border border-border bg-background px-4 lg:col-span-2">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                  Full repository baseline review
                </p>
              </div>
            )}
          </div>

          <p className="mt-6 border-t border-border pt-4 font-mono text-xs leading-7 text-muted">
            Add the local repository path now if you want approved patches to be applied later without re-entering it. Use diff or PR mode to analyze only changed code and cut token usage.
          </p>
        </div>
      </div>

      <div className="grid gap-px border-t border-border bg-border md:grid-cols-3">
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
        ].map((item, index) => (
          <div
            key={item.title}
            data-reveal="rise"
            data-reveal-delay={String(120 + index * 120)}
            className="home-hover-card bg-card px-6 py-7 md:px-8"
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-4 w-4 text-foreground" />
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-foreground">{item.title}</h3>
            </div>
            <p className="mt-4 text-sm leading-8 text-muted">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
