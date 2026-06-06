import { ArrowUpRight, CheckCircle2, Linkedin, Mail, Radar, ScanSearch, Sparkles, Workflow } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const valuePoints = [
  {
    label: "Specialist coverage",
    value: "Architecture, security, QA, and performance are separated into focused evidence tracks.",
  },
  {
    label: "Focused analysis",
    value: "Diff and PR review modes keep attention on changed code instead of re-reading the whole repository.",
  },
  {
    label: "Review to output",
    value: "Approved findings flow into patch proposals, validation, and a PR-ready package.",
  },
];

const workflow = [
  {
    step: "01",
    title: "Map the repository",
    body: "The intake layer builds the repository context, triages files, and creates specialist-specific evidence slices before any deep review begins.",
    icon: Radar,
  },
  {
    step: "02",
    title: "Run parallel review agents",
    body: "Architecture, Security, QA, and Performance agents inspect the same repository from different senior engineering perspectives.",
    icon: Workflow,
  },
  {
    step: "03",
    title: "Adjudicate findings",
    body: "A Staff Engineer layer deduplicates, prioritizes, and turns the strongest signals into an approval queue instead of an unfiltered dump.",
    icon: ScanSearch,
  },
  {
    step: "04",
    title: "Validate what ships",
    body: "Approved fixes can be validated with lint and test commands, then packaged as reviewed patches and a shareable PR narrative.",
    icon: CheckCircle2,
  },
];

const workspaceHighlights = [
  {
    title: "Full repository scans",
    body: "Use the full analysis mode when a team needs the first architecture pass on a new codebase or inherited monorepo.",
  },
  {
    title: "Diff and PR analysis",
    body: "Route attention to changed files, impacted modules, and regression risk when speed and token efficiency matter more than exhaustive breadth.",
  },
  {
    title: "Patch review workspace",
    body: "Approve findings first, then approve suggested code changes second, so the review loop stays deliberate and inspectable.",
  },
  {
    title: "Persistent sessions",
    body: "Reopen past analyses, share review sessions with teammates, and carry forward context instead of restarting from a blank page.",
  },
];

const footerLinks = [
  "Repository analysis",
  "Incremental review",
  "Patch validation",
  "Session sharing",
];

export function HomeSections() {
  return (
    <div className="space-y-24 pb-10 md:space-y-32 md:pb-16">
      <section data-reveal="rise" className="grid gap-px border border-border bg-border md:grid-cols-[1.1fr_0.9fr]">
        <div className="bg-background px-8 py-14 md:px-12 md:py-20">
          <Badge>Why Teams Use It</Badge>
          <h2 className="mt-6 max-w-4xl text-4xl leading-none tracking-tight text-foreground md:text-6xl">
            A calmer review workspace for architecture, risk, and code change decisions.
          </h2>
          <p className="mt-8 max-w-3xl font-mono text-sm leading-8 text-muted md:text-base">
            Senior-level review structure without the usual wall of output.
          </p>
        </div>
        <div className="grid gap-px bg-border">
          {valuePoints.map((point, index) => (
            <div
              key={point.label}
              data-reveal="rise"
              data-reveal-delay={String(120 + index * 110)}
              className="home-hover-card bg-card px-8 py-10 md:px-10"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">{point.label}</p>
              <p className="mt-4 max-w-xl text-base leading-8 text-foreground">{point.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section data-reveal="rise" className="space-y-10">
        <div className="flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge>How It Works</Badge>
            <h2 className="mt-6 max-w-4xl text-4xl leading-none tracking-tight text-foreground md:text-6xl">
              Structured review that stays readable as complexity grows.
            </h2>
          </div>
          <p className="max-w-2xl font-mono text-sm leading-8 text-muted">
            Each step is visible, from repository mapping to final patch output.
          </p>
        </div>
        <div className="grid gap-px border border-border bg-border lg:grid-cols-2 xl:grid-cols-4">
          {workflow.map((item, index) => (
            <Card
              key={item.step}
              data-reveal="rise"
              data-reveal-delay={String(120 + index * 110)}
              className="home-hover-card rounded-none border-0 bg-background px-8 py-10"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">{item.step}</span>
                <item.icon className="h-4 w-4 text-foreground" />
              </div>
              <h3 className="mt-10 text-2xl leading-tight tracking-tight text-foreground md:text-3xl">{item.title}</h3>
              <p className="mt-6 text-sm leading-8 text-muted">{item.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-10 xl:grid-cols-[0.9fr_1.1fr]">
        <div data-reveal="rise" className="home-hover-panel border border-border px-8 py-12 md:px-10 md:py-16">
          <Badge>Operating Modes</Badge>
          <h2 className="mt-6 text-4xl leading-none tracking-tight text-foreground md:text-5xl">
            Use full scans when you need context. Use targeted review when you need speed.
          </h2>
          <p className="mt-8 font-mono text-sm leading-8 text-muted">
            The analysis path changes how much context is read and how much effort is spent on each run.
          </p>
          <div className="mt-10 space-y-6 border-t border-border pt-8">
            {[
              "Full Analysis for first-pass understanding across unfamiliar repositories",
              "Diff Analysis for branch-to-branch engineering review",
              "PR Analysis for targeted pull request risk assessment and approval routing",
            ].map((line) => (
              <div key={line} className="flex items-start gap-3">
                <Sparkles className="mt-1 h-4 w-4 shrink-0 text-foreground" />
                <p className="text-sm leading-8 text-foreground">{line}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-px border border-border bg-border md:grid-cols-2">
          {workspaceHighlights.map((item, index) => (
            <div
              key={item.title}
              data-reveal="rise"
              data-reveal-delay={String(120 + index * 90)}
              className="home-hover-card bg-card px-8 py-10"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl leading-tight tracking-tight text-foreground">{item.title}</h3>
                <ArrowUpRight className="h-4 w-4 text-muted" />
              </div>
              <p className="mt-5 text-sm leading-8 text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer data-reveal="rise" className="home-hover-panel relative min-h-[460px] overflow-hidden border border-border">
        <img
          src="/images/editorial-landscape.png"
          alt=""
          aria-hidden="true"
          data-parallax
          data-speed="0.08"
          className="home-parallax-layer absolute inset-0 h-full w-full scale-[1.04] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-white/25 dark:from-[#0b0b0b] dark:via-[#0b0b0b]/90 dark:to-black/25" />
        <div className="absolute inset-x-0 bottom-0 h-[62%] bg-white/65 backdrop-blur-[1px] dark:bg-[#0b0b0b]/70" />
        <div className="home-light-sweep absolute left-[-12%] top-[8%] h-24 w-[52%] rotate-[5deg] bg-white/20 blur-3xl dark:bg-white/10" />
        <div className="relative z-10 flex min-h-[460px] flex-col justify-end px-8 py-10 md:px-12 md:py-12">
          <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.38em] text-[#111111] dark:text-[#f5f5f5]">Swarm Archaeologist</p>
              <h2 className="mt-5 max-w-3xl text-3xl leading-none text-[#111111] dark:text-[#f5f5f5] md:text-5xl">
                Review repositories with more signal, calmer judgment, and a cleaner path to approved code changes.
              </h2>
            </div>
            <div className="grid gap-3 text-left md:text-right">
              {footerLinks.map((item) => (
                <p key={item} className="home-hover-link font-mono text-xs uppercase tracking-[0.28em] text-[#4b5563] dark:text-[#d4d4d4]">
                  {item}
                </p>
              ))}
            </div>
          </div>
          <div className="mt-10 flex flex-col gap-4 border-t border-[#111111]/15 pt-6 text-sm text-[#4b5563] dark:border-white/15 dark:text-[#d4d4d4] md:flex-row md:items-center md:justify-between">
            <p>Repository intelligence workspace for architecture, risk review, and patch packaging.</p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.linkedin.com/in/varun-haridas"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn profile"
                className="home-hover-link inline-flex h-10 w-10 items-center justify-center border border-[#111111]/15 text-[#111111] transition-transform duration-700 hover:scale-[1.02] dark:border-white/15 dark:text-[#f5f5f5]"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="mailto:varunharidas.in@gmail.com"
                aria-label="Send email"
                className="home-hover-link inline-flex h-10 w-10 items-center justify-center border border-[#111111]/15 text-[#111111] transition-transform duration-700 hover:scale-[1.02] dark:border-white/15 dark:text-[#f5f5f5]"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
