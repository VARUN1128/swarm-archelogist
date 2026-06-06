import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, LoaderCircle } from "lucide-react";
import { matchPath, useLocation, useNavigate } from "react-router-dom";

import { AgentRail } from "@/components/agent-rail";
import { ArchitectureGraph } from "@/components/architecture-graph";
import { FindingsBoard } from "@/components/findings-board";
import { Hero } from "@/components/hero";
import { HomeScrollEffects } from "@/components/home-scroll-effects";
import { HomeSections } from "@/components/home-sections";
import { PatchPanel } from "@/components/patch-panel";
import { ProgressStrip } from "@/components/progress-strip";
import { PRPanel } from "@/components/pr-panel";
import { ReviewPanel } from "@/components/review-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WorkspaceOverview } from "@/components/workspace-overview";
import { WorkspaceSidebar, type WorkspaceSection } from "@/components/workspace-sidebar";
import { WorkspaceTopbar } from "@/components/workspace-topbar";
import {
  applyApprovedPatches,
  createAnalysisJob,
  generateFixes,
  generatePR,
  getAnalysisJob,
  getSession,
  getSharedSession,
  listSessions,
  validateApprovedPatches,
} from "@/lib/api";
import { pathToWorkspaceSection, workspaceSectionPath } from "@/lib/routes";
import type {
  ApplyPatchesReport,
  AgentProgress,
  AnalyzeRepositoryResponse,
  AnalysisJobStatusResponse,
  GenerateFixesResponse,
  IncrementalAnalysisOptions,
  PatchExecutionValidationReport,
  PatchProposal,
  PullRequestDraft,
  SessionSummary,
  SpecialistReport,
} from "@/types";

const emptyReport: SpecialistReport = { summary: "", findings: [] };

function RecentSessions({
  sessions,
  onOpenSession,
  onCopyShare,
}: {
  sessions: SessionSummary[];
  onOpenSession: (sessionId: string) => void;
  onCopyShare: (shareId: string) => void;
}) {
  if (!sessions.length) return null;
  return (
    <Card className="home-hover-panel border-border bg-card p-6 md:p-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">Session History</p>
          <h3 className="mt-3 text-3xl leading-none tracking-tight text-foreground">Recent Sessions</h3>
          <p className="mt-3 max-w-2xl text-sm leading-8 text-muted">Persistent history for previous analyses and shared review workspaces.</p>
        </div>
      </div>
      <div className="space-y-3">
        {sessions.slice(0, 6).map((session) => (
          <div key={session.session_id} className="home-hover-card flex flex-col gap-4 border border-border bg-background p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-lg leading-tight text-foreground">{session.repository_name}</p>
              <p className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-muted">Updated {new Date(session.updated_at).toLocaleString()}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted">
              <span className="rounded-sm border border-border px-3 py-1 font-mono uppercase tracking-[0.18em]">{session.approved_findings_count} selected findings</span>
              <span className="rounded-sm border border-border px-3 py-1 font-mono uppercase tracking-[0.18em]">{session.patch_count} patches</span>
              <span className="rounded-sm border border-border px-3 py-1 font-mono uppercase tracking-[0.18em]">{session.has_pr_draft ? "PR Ready" : "Analysis Only"}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => onCopyShare(session.share_id)} className="home-hover-button">
                <Copy className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button onClick={() => onOpenSession(session.session_id)} className="home-hover-button">Open Session</Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const pollIntervalRef = useRef<number | null>(null);

  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [localRootPath, setLocalRootPath] = useState("");
  const [incrementalMode, setIncrementalMode] = useState<"full" | "diff" | "pull_request">("full");
  const [baseRef, setBaseRef] = useState("main");
  const [headRef, setHeadRef] = useState("");
  const [pullRequestNumber, setPullRequestNumber] = useState("");

  const [analysis, setAnalysis] = useState<AnalyzeRepositoryResponse | null>(null);
  const [fixes, setFixes] = useState<GenerateFixesResponse | null>(null);
  const [prDraft, setPrDraft] = useState<PullRequestDraft | null>(null);
  const [selectedFindingIds, setSelectedFindingIds] = useState<string[]>([]);
  const [approvedPatchKeys, setApprovedPatchKeys] = useState<string[]>([]);
  const [applyReport, setApplyReport] = useState<ApplyPatchesReport | null>(null);
  const [executionValidationReport, setExecutionValidationReport] = useState<PatchExecutionValidationReport | null>(null);
  const [lintCommand, setLintCommand] = useState("npm run lint");
  const [testCommand, setTestCommand] = useState("npm test");
  const [savedSessions, setSavedSessions] = useState<SessionSummary[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const [isSharedView, setIsSharedView] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<AgentProgress[]>([]);
  const [analysisJobId, setAnalysisJobId] = useState<string | null>(null);
  const [isGeneratingFixes, setIsGeneratingFixes] = useState(false);
  const [isGeneratingPR, setIsGeneratingPR] = useState(false);
  const [isApplyingApproved, setIsApplyingApproved] = useState(false);
  const [isValidatingApproved, setIsValidatingApproved] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionRouteMatch = matchPath("/sessions/:sessionId/:section", location.pathname);
  const sharedRouteMatch = matchPath("/shared/:shareId/:section", location.pathname);
  const activeSection = useMemo<WorkspaceSection>(() => pathToWorkspaceSection(location.pathname) ?? "overview", [location.pathname]);

  useEffect(() => {
    void refreshSessions();
    const savedTheme = window.localStorage.getItem("swarm-archaeologist-theme");
    const initialTheme = savedTheme === "dark" ? "dark" : "light";
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
    return () => {
      if (pollIntervalRef.current !== null) {
        window.clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    window.localStorage.setItem("swarm-archaeologist-theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  useEffect(() => {
    if (sessionRouteMatch?.params.sessionId) {
      void loadSession(sessionRouteMatch.params.sessionId, false);
      return;
    }
    if (sharedRouteMatch?.params.shareId) {
      void loadSharedSession(sharedRouteMatch.params.shareId);
      return;
    }
    if (!location.pathname.startsWith("/workspace") && !isAnalyzing) {
      setIsSharedView(false);
    }
  }, [location.pathname]);

  const refreshSessions = async () => {
    try {
      const response = await listSessions();
      setSavedSessions(response.sessions);
    } catch {
      // Keep the workspace usable even if history cannot be loaded.
    }
  };

  const stopPolling = () => {
    if (pollIntervalRef.current !== null) {
      window.clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const openWorkspaceSection = (section: WorkspaceSection) => {
    if (isSharedView && shareId) {
      navigate(workspaceSectionPath(section, "shared", shareId));
      return;
    }
    if (sessionId) {
      navigate(workspaceSectionPath(section, "session", sessionId));
      return;
    }
    navigate(workspaceSectionPath(section));
  };

  const hydrateSessionState = (
    nextAnalysis: AnalyzeRepositoryResponse,
    nextFixes: GenerateFixesResponse | null,
    nextPr: PullRequestDraft | null,
    nextSelectedFindingIds: string[],
    nextSessionId: string,
    nextShareId: string,
    shared: boolean,
  ) => {
    setAnalysis(nextAnalysis);
    setFixes(nextFixes);
    setPrDraft(nextPr);
    setSelectedFindingIds(
      nextSelectedFindingIds.length
        ? nextSelectedFindingIds
        : nextAnalysis.staff_engineer_review.approved_findings.map((finding) => finding.id),
    );
    setSessionId(nextSessionId);
    setShareId(nextShareId);
    setIsSharedView(shared);
    setApprovedPatchKeys(nextFixes ? nextFixes.patches.map((patch) => `${patch.file}::${patch.issue}`) : []);
  };

  const loadSession = async (targetSessionId: string, shared: boolean) => {
    if (sessionId === targetSessionId && analysis) return;
    setIsLoadingSession(true);
    setError(null);
    try {
      const response = shared ? await getSharedSession(targetSessionId) : await getSession(targetSessionId);
      const record = response.session;
      hydrateSessionState(
        record.analysis,
        record.fixes ?? null,
        record.pr?.pr_draft ?? null,
        record.selected_finding_ids,
        record.summary.session_id,
        record.summary.share_id,
        shared,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load saved session.");
      navigate("/home", { replace: true });
    } finally {
      setIsLoadingSession(false);
    }
  };

  const loadSharedSession = async (targetShareId: string) => {
    if (shareId === targetShareId && analysis && isSharedView) return;
    setIsLoadingSession(true);
    setError(null);
    try {
      const response = await getSharedSession(targetShareId);
      const record = response.session;
      hydrateSessionState(
        record.analysis,
        record.fixes ?? null,
        record.pr?.pr_draft ?? null,
        record.selected_finding_ids,
        record.summary.session_id,
        record.summary.share_id,
        true,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load shared session.");
      navigate("/home", { replace: true });
    } finally {
      setIsLoadingSession(false);
    }
  };

  const syncAnalysisJob = async (jobId: string) => {
    const job = await getAnalysisJob(jobId);
    setAnalysisProgress(job.progress);
    if (job.status === "completed" && job.result) {
      stopPolling();
      setAnalysis(job.result);
      setSessionId(job.result.session_id);
      setShareId(job.result.share_id);
      setSelectedFindingIds(job.result.staff_engineer_review.approved_findings.map((finding) => finding.id));
      setIsAnalyzing(false);
      setAnalysisJobId(null);
      setIsSharedView(false);
      openWorkspaceSection("overview");
      void refreshSessions();
      return;
    }
    if (job.status === "failed") {
      stopPolling();
      setIsAnalyzing(false);
      setAnalysisJobId(null);
      setError(job.error ?? "Analysis failed.");
      navigate("/home", { replace: true });
    }
  };

  const buildIncrementalOptions = (): IncrementalAnalysisOptions | undefined => {
    if (incrementalMode === "full") return undefined;
    if (incrementalMode === "diff") {
      return { mode: "diff", base_ref: baseRef || "main", head_ref: headRef, changed_files: [] };
    }
    return {
      mode: "pull_request",
      pull_request_number: pullRequestNumber ? Number(pullRequestNumber) : null,
      changed_files: [],
    };
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    setFixes(null);
    setPrDraft(null);
    setSelectedFindingIds([]);
    setApprovedPatchKeys([]);
    setApplyReport(null);
    setExecutionValidationReport(null);
    setAnalysis(null);
    setAnalysisProgress([]);
    setSessionId(null);
    setShareId(null);
    navigate(workspaceSectionPath("overview"));
    try {
      const job = await createAnalysisJob(repositoryUrl, buildIncrementalOptions());
      setAnalysisJobId(job.job_id);
      setAnalysisProgress(job.progress);
      stopPolling();
      pollIntervalRef.current = window.setInterval(() => {
        void syncAnalysisJob(job.job_id);
      }, 1500);
      void syncAnalysisJob(job.job_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
      setIsAnalyzing(false);
      navigate("/home", { replace: true });
    }
  };

  const handleGenerateFixes = async () => {
    if (!analysis) return;
    setIsGeneratingFixes(true);
    setError(null);
    try {
      const response = await generateFixes(
        analysis.repository_context,
        analysis.staff_engineer_review,
        sessionId ?? undefined,
        selectedFindingIds,
      );
      setFixes(response);
      setApprovedPatchKeys([]);
      setApplyReport(null);
      setExecutionValidationReport(null);
      openWorkspaceSection("patches");
      void refreshSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fix generation failed.");
    } finally {
      setIsGeneratingFixes(false);
    }
  };

  const getPatchKey = (patch: PatchProposal) => `${patch.file}::${patch.issue}`;

  const handleGeneratePR = async () => {
    if (!analysis || !fixes) return;
    const approvedPatches = fixes.patches.filter((patch) => approvedPatchKeys.includes(getPatchKey(patch)));
    if (!approvedPatches.length) {
      setError("Approve at least one patch before generating the PR package.");
      return;
    }
    setIsGeneratingPR(true);
    setError(null);
    try {
      const response = await generatePR(
        analysis.repository_context,
        analysis.staff_engineer_review,
        approvedPatches,
        fixes.validation_report,
        sessionId ?? undefined,
      );
      setPrDraft(response.pr_draft);
      openWorkspaceSection("pr");
      void refreshSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "PR generation failed.");
    } finally {
      setIsGeneratingPR(false);
    }
  };

  const handleToggleFinding = (findingId: string) => {
    setSelectedFindingIds((current) =>
      current.includes(findingId) ? current.filter((item) => item !== findingId) : [...current, findingId],
    );
  };

  const handleSelectAllFindings = () => {
    if (!analysis) return;
    setSelectedFindingIds(analysis.staff_engineer_review.approved_findings.map((finding) => finding.id));
  };

  const handleApprovePatch = (patch: PatchProposal) => {
    const key = getPatchKey(patch);
    setApprovedPatchKeys((current) => (current.includes(key) ? current.filter((item) => item !== key) : [...current, key]));
  };

  const handleApproveAllPatches = () => {
    if (!fixes) return;
    setApprovedPatchKeys(fixes.patches.map(getPatchKey));
  };

  const handleValidateApprovedPatches = async () => {
    if (!fixes) return;
    const approvedPatches = fixes.patches.filter((patch) => approvedPatchKeys.includes(getPatchKey(patch)));
    if (!approvedPatches.length || !localRootPath.trim()) {
      setError("Approve patches and set a local repository path before execution validation.");
      return;
    }
    setIsValidatingApproved(true);
    setError(null);
    try {
      const response = await validateApprovedPatches(localRootPath, approvedPatches, lintCommand || undefined, testCommand || undefined);
      setExecutionValidationReport(response.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Execution validation failed.");
    } finally {
      setIsValidatingApproved(false);
    }
  };

  const handleApplyApprovedPatches = async (forceOverwrite: boolean) => {
    if (!fixes) return;
    const approvedPatches = fixes.patches.filter((patch) => approvedPatchKeys.includes(getPatchKey(patch)));
    if (!approvedPatches.length) {
      setError("Approve at least one patch before applying changes.");
      return;
    }
    if (!localRootPath.trim()) {
      setError("Enter a local repository path before applying approved patches.");
      return;
    }

    setIsApplyingApproved(true);
    setError(null);
    try {
      const response = await applyApprovedPatches(localRootPath, approvedPatches, true, forceOverwrite);
      setApplyReport(response.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Applying approved patches failed.");
    } finally {
      setIsApplyingApproved(false);
    }
  };

  const exportMarkdown = () => {
    if (!prDraft) return;
    const blob = new Blob([prDraft.markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "swarm-archaeologist-review-package.md";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const copyShareLink = async (targetShareId?: string) => {
    const id = targetShareId ?? shareId;
    if (!id) return;
    const link = `${window.location.origin}/shared/${id}/overview`;
    await navigator.clipboard.writeText(link);
  };

  const findingsCount = analysis
    ? analysis.security_report.findings.length + analysis.qa_report.findings.length + analysis.performance_report.findings.length
    : 0;
  const approvedFixesCount = fixes ? approvedPatchKeys.length : 0;
  const criticalCount = analysis ? analysis.staff_engineer_review.critical_findings.length : 0;
  const railProgress = analysis ? analysis.progress : analysisProgress;

  const renderWorkspaceSection = () => {
    if (!analysis) return null;
    switch (activeSection) {
      case "overview":
        return <WorkspaceOverview analysis={analysis} />;
      case "architecture":
        return <ArchitectureGraph report={analysis.architecture_report} />;
      case "security":
        return <FindingsBoard security={analysis.security_report} qa={emptyReport} performance={emptyReport} />;
      case "qa":
        return <FindingsBoard security={emptyReport} qa={analysis.qa_report} performance={emptyReport} />;
      case "performance":
        return <FindingsBoard security={emptyReport} qa={emptyReport} performance={analysis.performance_report} />;
      case "staff":
        return (
          <ReviewPanel
            review={analysis.staff_engineer_review}
            selectedFindingIds={selectedFindingIds}
            onToggleFinding={handleToggleFinding}
            onSelectAllApproved={handleSelectAllFindings}
          />
        );
      case "patches":
        return fixes ? (
          <PatchPanel
            fixes={fixes}
            approvedPatchKeys={approvedPatchKeys}
            onApprovePatch={handleApprovePatch}
            onApproveAll={handleApproveAllPatches}
            localRootPath={localRootPath}
            onLocalRootPathChange={setLocalRootPath}
            onApplyApproved={handleApplyApprovedPatches}
            onValidateApproved={handleValidateApprovedPatches}
            isApplyingApproved={isApplyingApproved}
            isValidatingApproved={isValidatingApproved}
            applyReport={applyReport}
            executionValidationReport={executionValidationReport}
            lintCommand={lintCommand}
            testCommand={testCommand}
            onLintCommandChange={setLintCommand}
            onTestCommandChange={setTestCommand}
          />
        ) : (
          <Card className="border-border bg-card p-6 text-slate-300">Generate fixes to open the engineering patch workspace.</Card>
        );
      case "pr":
        return prDraft ? (
          <PRPanel prDraft={prDraft} />
        ) : (
          <Card className="border-border bg-card p-6 text-slate-300">Generate a PR package after approving patches.</Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 ease-in-out">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-4 py-5 md:px-8 md:py-6">

        {!analysis && !isAnalyzing && !isLoadingSession && (location.pathname === "/home" || location.pathname === "/") && (
          <>
            <HomeScrollEffects />
            <Hero
              repositoryUrl={repositoryUrl}
              localRootPath={localRootPath}
              incrementalMode={incrementalMode}
              baseRef={baseRef}
              headRef={headRef}
              pullRequestNumber={pullRequestNumber}
              onRepositoryUrlChange={setRepositoryUrl}
              onLocalRootPathChange={setLocalRootPath}
              onIncrementalModeChange={setIncrementalMode}
              onBaseRefChange={setBaseRef}
              onHeadRefChange={setHeadRef}
              onPullRequestNumberChange={setPullRequestNumber}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
              themeToggle={<ThemeToggle theme={theme} onToggle={toggleTheme} />}
            />
            <div data-reveal="rise" data-reveal-delay="140">
              <RecentSessions
                sessions={savedSessions}
                onOpenSession={(id) => navigate(workspaceSectionPath("overview", "session", id))}
                onCopyShare={(id) => void copyShareLink(id)}
              />
            </div>
            <HomeSections />
          </>
        )}

        {error && <Card className="border-danger/40 bg-danger/10 p-4 text-red-100">{error}</Card>}

        {(isAnalyzing || isLoadingSession) && (
          <div className="grid gap-5 xl:grid-cols-[220px_minmax(0,1fr)_280px]">
            <WorkspaceSidebar activeSection={activeSection} onSectionChange={openWorkspaceSection} />
            <div className="space-y-4">
              <Card className="border-border bg-card flex items-center gap-3 p-4 text-slate-200">
                <LoaderCircle className="h-5 w-5 animate-spin text-accent" />
                {isLoadingSession
                  ? "Loading persistent session workspace..."
                  : `Analysis job ${analysisJobId ? analysisJobId.slice(0, 8) : ""} is running. Repository ingestion and specialist execution updates will appear below.`}
              </Card>
              <ProgressStrip progress={analysisProgress} />
            </div>
            <AgentRail
              progress={analysisProgress}
              hasFixes={Boolean(fixes)}
              hasPRDraft={Boolean(prDraft)}
              isGeneratingFixes={isGeneratingFixes}
              isGeneratingPR={isGeneratingPR}
            />
          </div>
        )}

        {analysis && (
          <>
            <div className="flex justify-end">
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
            </div>
            <WorkspaceTopbar
              repositoryName={analysis.repository_context.metadata.full_name}
              findingsCount={findingsCount}
              approvedFixesCount={approvedFixesCount}
              criticalCount={criticalCount}
              hasPRDraft={Boolean(prDraft)}
              sessionId={sessionId ?? analysis.session_id}
              shareUrl={`${window.location.origin}/shared/${shareId ?? analysis.share_id}/overview`}
              onGeneratePR={handleGeneratePR}
              onExportMarkdown={exportMarkdown}
              onCopyShare={() => void copyShareLink()}
              onOpenHistory={() => navigate("/home")}
              isGeneratingPR={isGeneratingPR}
              canGeneratePR={Boolean(fixes && approvedPatchKeys.length)}
            />
            <div className="grid gap-5 xl:grid-cols-[220px_minmax(0,1fr)_280px]">
              <WorkspaceSidebar activeSection={activeSection} onSectionChange={openWorkspaceSection} />
              <div className="space-y-5">
                <div className="flex flex-wrap gap-3">
                  {!isSharedView && (
                    <Button onClick={handleGenerateFixes} disabled={isGeneratingFixes || !selectedFindingIds.length}>
                      {isGeneratingFixes ? "Generating fixes..." : "Generate Fixes"}
                    </Button>
                  )}
                  <Button variant="secondary" onClick={() => openWorkspaceSection("staff")}>
                    Findings Approval
                  </Button>
                </div>
                {renderWorkspaceSection()}
              </div>
              <AgentRail
                progress={railProgress}
                hasFixes={Boolean(fixes)}
                hasPRDraft={Boolean(prDraft)}
                isGeneratingFixes={isGeneratingFixes}
                isGeneratingPR={isGeneratingPR}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
