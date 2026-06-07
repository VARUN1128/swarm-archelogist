import { ArrowRight, BrainCircuit, GitBranch, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

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
          src="/images/hero-scenic.png"
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

        <div className="relative z-10 mx-auto flex min-h-[620px] w-full max-w-6xl flex-col items-start justify-end px-5 pb-12 text-left md:min-h-[720px] md:px-8 md:pb-16">
          <div className="mt-8 w-full max-w-4xl space-y-6">
            <h1 data-reveal="rise" data-reveal-delay="120" className="max-w-4xl text-5xl leading-none text-[#111111] dark:text-[#f5f5f5] md:text-7xl">
              Turn repository risk into pull request-ready fixes.
            </h1>
            <p data-reveal="rise" data-reveal-delay="220" className="max-w-3xl font-mono text-sm leading-8 text-[#4b5563] dark:text-[#d4d4d4] md:text-base">
              Architecture, security, QA, and performance review, consolidated through a Staff Engineer validation pass.
            </p>
          </div>
          <div
            data-reveal="rise"
            data-reveal-delay="280"
            className="mt-10 w-full bg-[#fff8ef]/70 p-2 shadow-[0_30px_80px_rgba(0,0,0,0.18)] backdrop-blur-xl dark:bg-[#111111]/72 md:mt-12 md:p-3"
          >
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-start">
              <input
                value={repositoryUrl}
                onChange={(event) => onRepositoryUrlChange(event.target.value)}
                placeholder="Paste repo link"
                className="home-hover-input min-h-14 w-full rounded-sm border border-[#111111]/12 bg-white px-4 text-sm text-[#111111] caret-[#111111] outline-none transition-colors duration-500 ease-in-out placeholder:text-[#6b7280] focus:border-foreground dark:border-white/10 dark:bg-[#0b0b0b]/90 dark:text-[#f5f5f5] dark:caret-[#f5f5f5] dark:placeholder:text-[#a3a3a3]"
              />
              <input
                value={localRootPath}
                onChange={(event) => onLocalRootPathChange(event.target.value)}
                placeholder="Paste local path"
                className="home-hover-input min-h-14 rounded-sm border border-[#111111]/12 bg-white px-4 text-sm text-[#111111] caret-[#111111] outline-none transition-colors duration-500 ease-in-out placeholder:text-[#6b7280] focus:border-foreground dark:border-white/10 dark:bg-[#0b0b0b]/90 dark:text-[#f5f5f5] dark:caret-[#f5f5f5] dark:placeholder:text-[#a3a3a3]"
              />
              <Button
                className="home-hover-button min-h-14 px-6"
                onClick={onAnalyze}
                disabled={isAnalyzing || (!repositoryUrl.trim() && !localRootPath.trim())}
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Repository"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

          </div>
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
