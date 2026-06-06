import { useEffect, useMemo, useRef, useState } from "react";
import { LoaderCircle, Sparkles } from "lucide-react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import { AgentRail } from "@/components/agent-rail";
import { ArchitectureGraph } from "@/components/architecture-graph";
import { FindingsBoard } from "@/components/findings-board";
import { Hero } from "@/components/hero";
import { PatchPanel } from "@/components/patch-panel";
import { ProgressStrip } from "@/components/progress-strip";
import { PRPanel } from "@/components/pr-panel";
import { ReviewPanel } from "@/components/review-panel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WorkspaceOverview } from "@/components/workspace-overview";
import { WorkspaceSidebar, type WorkspaceSection } from "@/components/workspace-sidebar";
import { WorkspaceTopbar } from "@/components/workspace-topbar";
import { applyApprovedPatches, createAnalysisJob, generateFixes, generatePR, getAnalysisJob } from "@/lib/api";
import { pathToWorkspaceSection, workspaceSectionPaths } from "@/lib/routes";
import type {
  ApplyPatchesReport,
  AgentProgress,
  AnalyzeRepositoryResponse,
  AnalysisJobStatusResponse,
  GenerateFixesResponse,
  PatchProposal,
  PullRequestDraft,
  SpecialistReport,
} from "@/types";

const emptyReport: SpecialistReport = { summary: "", findings: [] };

function WorkspaceRoutes({
  analysis,
  fixes,
  prDraft,
  approvedPatchKeys,
  handleApprovePatch,
  handleApproveAllPatches,
  localRootPath,
  setLocalRootPath,
  handleApplyApprovedPatches,
  isApplyingApproved,
  applyReport,
}: {
  analysis: AnalyzeRepositoryResponse;
  fixes: GenerateFixesResponse | null;
  prDraft: PullRequestDraft | null;
  approvedPatchKeys: string[];
  handleApprovePatch: (patch: PatchProposal) => void;
  handleApproveAllPatches: () => void;
  localRootPath: string;
  setLocalRootPath: (value: string) => void;
  handleApplyApprovedPatches: (forceOverwrite: boolean) => void;
  isApplyingApproved: boolean;
  applyReport: ApplyPatchesReport | null;
}) {
  return (
    <Routes>
      <Route path="/workspace/overview" element={<WorkspaceOverview analysis={analysis} />} />
      <Route path="/workspace/architecture" element={<ArchitectureGraph report={analysis.architecture_report} />} />
      <Route path="/workspace/security" element={<FindingsBoard security={analysis.security_report} qa={emptyReport} performance={emptyReport} />} />
      <Route path="/workspace/qa" element={<FindingsBoard security={emptyReport} qa={analysis.qa_report} performance={emptyReport} />} />
      <Route path="/workspace/performance" element={<FindingsBoard security={emptyReport} qa={emptyReport} performance={analysis.performance_report} />} />
      <Route path="/workspace/staff" element={<ReviewPanel review={analysis.staff_engineer_review} />} />
      <Route
        path="/workspace/patches"
        element={
          fixes ? (
            <PatchPanel
              fixes={fixes}
              approvedPatchKeys={approvedPatchKeys}
              onApprovePatch={handleApprovePatch}
              onApproveAll={handleApproveAllPatches}
              localRootPath={localRootPath}
              onLocalRootPathChange={setLocalRootPath}
              onApplyApproved={handleApplyApprovedPatches}
              isApplyingApproved={isApplyingApproved}
              applyReport={applyReport}
            />
          ) : (
            <Card className="border-border bg-card p-6 text-slate-300">Generate fixes to open the engineering patch workspace.</Card>
          )
        }
      />
      <Route
        path="/workspace/pr"
        element={
          prDraft ? (
            <PRPanel prDraft={prDraft} />
          ) : (
            <Card className="border-border bg-card p-6 text-slate-300">Generate a PR package after approving patches.</Card>
          )
        }
      />
      <Route path="*" element={<Navigate to="/workspace/overview" replace />} />
    </Routes>
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [repositoryUrl, setRepositoryUrl] = useState("https://github.com/vercel/next.js");
  const [analysis, setAnalysis] = useState<AnalyzeRepositoryResponse | null>(null);
  const [fixes, setFixes] = useState<GenerateFixesResponse | null>(null);
  const [prDraft, setPrDraft] = useState<PullRequestDraft | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<AgentProgress[]>([]);
  const [analysisJobId, setAnalysisJobId] = useState<string | null>(null);
  const [isGeneratingFixes, setIsGeneratingFixes] = useState(false);
  const [isGeneratingPR, setIsGeneratingPR] = useState(false);
  const [isApplyingApproved, setIsApplyingApproved] = useState(false);
  const [approvedPatchKeys, setApprovedPatchKeys] = useState<string[]>([]);
  const [localRootPath, setLocalRootPath] = useState("");
  const [applyReport, setApplyReport] = useState<ApplyPatchesReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollIntervalRef = useRef<number | null>(null);

  const activeSection = useMemo<WorkspaceSection>(() => {
    return pathToWorkspaceSection(location.pathname) ?? "overview";
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current !== null) {
        window.clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const isWorkspacePath = location.pathname.startsWith("/workspace");
    if (!analysis && !isAnalyzing && isWorkspacePath) {
      navigate("/", { replace: true });
    }
  }, [analysis, isAnalyzing, location.pathname, navigate]);

  const stopPolling = () => {
    if (pollIntervalRef.current !== null) {
      window.clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const syncAnalysisJob = async (jobId: string) => {
    const job = await getAnalysisJob(jobId);
    setAnalysisProgress(job.progress);
    finalizeJobIfNeeded(job);
  };

  const finalizeJobIfNeeded = (job: AnalysisJobStatusResponse) => {
    if (job.status === "completed" && job.result) {
      stopPolling();
      setAnalysis(job.result);
      setIsAnalyzing(false);
      setAnalysisJobId(null);
      navigate(workspaceSectionPaths.overview, { replace: true });
      return;
    }
    if (job.status === "failed") {
      stopPolling();
      setIsAnalyzing(false);
      setAnalysisJobId(null);
      setError(job.error ?? "Analysis failed.");
      navigate("/", { replace: true });
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    setFixes(null);
    setPrDraft(null);
    setApprovedPatchKeys([]);
    setApplyReport(null);
    setAnalysis(null);
    setAnalysisProgress([]);
    navigate(workspaceSectionPaths.overview);
    try {
      const job = await createAnalysisJob(repositoryUrl);
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
      navigate("/", { replace: true });
    }
  };

  const handleGenerateFixes = async () => {
    if (!analysis) return;
    setIsGeneratingFixes(true);
    setError(null);
    try {
      const response = await generateFixes(analysis.repository_context, analysis.staff_engineer_review);
      setFixes(response);
      setApprovedPatchKeys([]);
      setApplyReport(null);
      navigate(workspaceSectionPaths.patches);
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
      );
      setPrDraft(response.pr_draft);
      navigate(workspaceSectionPaths.pr);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PR generation failed.");
    } finally {
      setIsGeneratingPR(false);
    }
  };

  const handleApprovePatch = (patch: PatchProposal) => {
    const key = getPatchKey(patch);
    setApprovedPatchKeys((current) => (current.includes(key) ? current.filter((item) => item !== key) : [...current, key]));
  };

  const handleApproveAllPatches = () => {
    if (!fixes) return;
    setApprovedPatchKeys(fixes.patches.map(getPatchKey));
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

  const findingsCount = analysis
    ? analysis.security_report.findings.length + analysis.qa_report.findings.length + analysis.performance_report.findings.length
    : 0;
  const approvedFixesCount = fixes ? approvedPatchKeys.length : 0;
  const criticalCount = analysis ? analysis.staff_engineer_review.critical_findings.length : 0;
  const railProgress = analysis ? analysis.progress : analysisProgress;

  return (
    <div className="min-h-screen bg-[#050816] text-foreground">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-6 md:px-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">Swarm Archaeologist</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Repository Intelligence Workspace</h1>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-[#0b1220] px-4 py-2 text-sm text-slate-300 md:flex">
            <Sparkles className="h-4 w-4 text-accent" />
            GPT-5 powered orchestration
          </div>
        </header>

        {!analysis && !isAnalyzing && location.pathname === "/" && (
          <Hero
            repositoryUrl={repositoryUrl}
            localRootPath={localRootPath}
            onRepositoryUrlChange={setRepositoryUrl}
            onLocalRootPathChange={setLocalRootPath}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
          />
        )}

        {error && <Card className="border-danger/40 bg-danger/10 p-4 text-red-100">{error}</Card>}

        {isAnalyzing && (
          <div className="grid gap-5 xl:grid-cols-[220px_minmax(0,1fr)_280px]">
            <WorkspaceSidebar activeSection={activeSection} onSectionChange={(section) => navigate(workspaceSectionPaths[section])} />
            <div className="space-y-4">
              <Card className="border-border bg-card flex items-center gap-3 p-4 text-slate-200">
                <LoaderCircle className="h-5 w-5 animate-spin text-accent" />
                Analysis job {analysisJobId ? analysisJobId.slice(0, 8) : ""} is running. Repository ingestion and specialist execution updates will appear below.
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
            <WorkspaceTopbar
              repositoryName={analysis.repository_context.metadata.full_name}
              findingsCount={findingsCount}
              approvedFixesCount={approvedFixesCount}
              criticalCount={criticalCount}
              hasPRDraft={Boolean(prDraft)}
              onGeneratePR={handleGeneratePR}
              onExportMarkdown={exportMarkdown}
              isGeneratingPR={isGeneratingPR}
              canGeneratePR={Boolean(fixes && approvedPatchKeys.length)}
            />
            <div className="grid gap-5 xl:grid-cols-[220px_minmax(0,1fr)_280px]">
              <WorkspaceSidebar activeSection={activeSection} onSectionChange={(section) => navigate(workspaceSectionPaths[section])} />
              <div className="space-y-5">
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleGenerateFixes} disabled={isGeneratingFixes}>
                    {isGeneratingFixes ? "Generating fixes..." : "Generate Fixes"}
                  </Button>
                  <Button variant="secondary" onClick={() => navigate(workspaceSectionPaths.overview)}>
                    Overview
                  </Button>
                </div>
                <WorkspaceRoutes
                  analysis={analysis}
                  fixes={fixes}
                  prDraft={prDraft}
                  approvedPatchKeys={approvedPatchKeys}
                  handleApprovePatch={handleApprovePatch}
                  handleApproveAllPatches={handleApproveAllPatches}
                  localRootPath={localRootPath}
                  setLocalRootPath={setLocalRootPath}
                  handleApplyApprovedPatches={handleApplyApprovedPatches}
                  isApplyingApproved={isApplyingApproved}
                  applyReport={applyReport}
                />
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
